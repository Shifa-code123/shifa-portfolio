import os; os.makedirs("tests/shots", exist_ok=True)
from playwright.sync_api import sync_playwright
B="http://localhost:8123/index.html"; res=[]
def ck(n,ok,d=""): res.append(ok); print(("PASS " if ok else "FAIL ")+n+(f" [{d}]" if d else ""))
blk=lambda r:r.abort()
src=open("js/config/content.js",encoding="utf-8").read()
filled=(src.replace('email: "[Add email address]"','email: "firstname.lastname@example-university.edu.in"')
 .replace('url: "[Add GitHub URL]"','url: "https://github.com/example"').replace('url: "[Add LinkedIn URL]"','url: "https://www.linkedin.com/in/example"').replace('url: "[Add Instagram URL]"','url: "https://www.instagram.com/example"')
 .replace('location: "[Add city, country]"','location: "Example City, Country"').replace('closing: "[Add a short closing statement]"','closing: "Thank you for stopping by."')
 .replace('status: "[Add availability, e.g. your internship or collaboration status]"','status: "Open to internships"').replace('note: "[Add details such as timing or the roles you are open to]"','note: "Example availability note"'))
def ctx(b,w,h,mob=False,js=None,**kw):
    c=b.new_context(viewport={"width":w,"height":h},is_mobile=mob,has_touch=mob,**kw); c.route("**/fonts.g*/**",blk)
    if js: c.route("**/js/config/content.js",lambda r:r.fulfill(body=js,content_type="application/javascript"))
    return c
def lum(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]; c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]; return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def cr(a,b): la,lb=lum(a),lum(b); return (max(la,lb)+0.05)/(min(la,lb)+0.05)
mix=lambda a,b,t: '#%02x%02x%02x'%tuple(round(int(a[i:i+2],16)*t+int(b[i:i+2],16)*(1-t)) for i in (1,3,5))
with sync_playwright() as p:
    b=p.chromium.launch()
    # ---------- PLACEHOLDER STATE ----------
    c=ctx(b,1440,900); pg=c.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append(m.text) if m.type=="error" and "ERR_FAILED" not in m.text else None)
    pg.goto(B); pg.wait_for_timeout(800)
    ck("footer comes right after Contact, no errors",pg.evaluate("document.getElementById('contact').parentElement.nextElementSibling.id")=="footer" and not errs,str(errs))
    ck("footer has closing statement, identity, role, description",all(pg.locator(s).count()==1 for s in [".footer__closing",".footer__name",".footer__role",".footer__desc"]) and pg.inner_text(".footer__name")=="Shifa")
    ck("placeholders are marked (closing, role, description)",all(pg.evaluate(f"document.querySelector('{s}').classList.contains('is-placeholder')") for s in [".footer__closing",".footer__role",".footer__desc"]))
    names=pg.evaluate("[...document.querySelectorAll('.footer__link')].map(a=>a.textContent+'|'+a.hash)")
    ck("Explore: Home, About, Projects, Education, Experience, Skills, Contact",names==["Home|#home","About|#about","Projects|#projects","Education|#education","Experience|#experience","Skills|#skills","Contact|#contact"],str(names))
    soc=pg.evaluate("[...document.querySelectorAll('.footer__connect li > *')].map(e=>[e.tagName,e.querySelector('.footer__item-label').textContent,!!e.querySelector('svg.lucide'),e.classList.contains('is-placeholder')])")
    ck("Connect order GitHub, LinkedIn, Email, Instagram, each with a Lucide icon",[x[1] for x in soc]==["GitHub","LinkedIn","Email","Instagram"] and all(x[2] for x in soc),str(soc))
    ck("placeholder socials are clearly marked and NOT fake links (no href)",all(x[0]=="SPAN" and x[3] for x in soc))
    ck("contact column: email + location placeholders shown",pg.locator(".footer__detail").count()==2 and pg.locator(".footer__detail .is-placeholder").count()==2)
    ck("availability block shown (placeholder text marked)",pg.locator(".footer__avail").count()==1 and pg.locator(".footer__avail .is-placeholder").count()==2)
    yr=pg.inner_text(".footer__bar p:first-child"); des=pg.inner_text(".footer__bar p:nth-child(2)")
    ck("bottom bar: © year Shifa + 'Designed and developed by Shifa'","©" in yr and "Shifa" in yr and str(__import__('datetime').date.today().year) in yr and des=="Designed and developed by Shifa",f"{yr!r} / {des!r}")
    ck("back-to-top has an arrow icon and an accessible name",pg.locator(".footer__top svg.lucide").count()==1 and pg.inner_text(".footer__top").strip()=="Back to top")
    pg.screenshot(path="tests/shots/foot_placeholder_1440.png",clip={"x":0,"y":0,"width":1440,"height":900}) if False else None
    pg.locator("#footer").screenshot(path="tests/shots/foot_placeholder_1440.png")
    # quick-nav functionality
    ok=[]
    for h in ["about","projects","education","experience","skills","contact","home"]:
        pg.evaluate("document.getElementById('footer').scrollIntoView()"); pg.wait_for_timeout(1300)
        pg.click(f'.footer__link[href="#{h}"]'); pg.wait_for_timeout(1700)
        top=pg.evaluate(f"Math.round(document.getElementById('{h}').getBoundingClientRect().top)"); sy=pg.evaluate("scrollY"); mx=pg.evaluate("document.documentElement.scrollHeight-innerHeight")
        ok.append(abs(top)<=6 or sy>=mx-4 or (h=="home" and sy==0))
    ck("every Explore link scrolls to its section (7/7)",all(ok),str(ok))
    pg.evaluate("document.getElementById('footer').scrollIntoView()"); pg.wait_for_timeout(1500)
    pg.click(".footer__top"); pg.wait_for_timeout(2500)
    ck("Back to top returns to the top of the page",pg.evaluate("scrollY")<=2,f"scrollY={pg.evaluate('scrollY')}")
    # keyboard + focus
    pg.evaluate("document.getElementById('footer').scrollIntoView()"); pg.wait_for_timeout(1200)
    pg.focus('.footer__link[href="#projects"]'); pg.keyboard.press("Tab"); pg.keyboard.press("Shift+Tab"); ol=pg.evaluate("getComputedStyle(document.activeElement).outlineStyle+' '+getComputedStyle(document.activeElement).outlineWidth")
    ck("keyboard: focus ring visible on footer links",ol.startswith("solid 2px"),ol)
    # orb cursor works in footer
    bx=pg.locator(".footer__link").first.bounding_box(); pg.mouse.move(bx["x"]+10,bx["y"]+10); pg.wait_for_timeout(700)
    ck("glass cursor hover state works over footer links",pg.evaluate("Portfolio.cursor.state")=="hover")
    # contrast on forest
    forest="#263B32"; ivory="#F4F0E7"; muted=mix(ivory,forest,0.76)
    ck("contrast: muted text on forest >= 4.5:1",cr(muted,forest)>=4.5,f"{cr(muted,forest):.2f}:1"); ck("contrast: ivory on forest >= 4.5:1",cr(ivory,forest)>=4.5,f"{cr(ivory,forest):.2f}:1")
    c.close()
    # ---------- FILLED STATE ----------
    c=ctx(b,1440,900,js=filled); pg=c.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e))); pg.goto(B); pg.wait_for_timeout(800)
    L=pg.evaluate("[...document.querySelectorAll('.footer__connect a')].map(a=>[a.href,a.target,a.rel,a.getAttribute('aria-label'),!!a.querySelector('svg.lucide'),Math.round(a.getBoundingClientRect().height)])")
    ck("real values become working links: GitHub, LinkedIn, mailto, Instagram",[x[0] for x in L]==["https://github.com/example","https://www.linkedin.com/in/example","mailto:firstname.lastname@example-university.edu.in","https://www.instagram.com/example"],str([x[0] for x in L]))
    ck("external links open safely in a new tab (noopener noreferrer) with accessible names",all(x[1]=="_blank" and "noopener" in x[2] and "noreferrer" in x[2] and "opens in a new tab" in x[3] for x in L if x[0].startswith("http")))
    ck("every icon link has an icon and a >=44px target",all(x[4] and x[5]>=44 for x in L),str([x[5] for x in L]))
    ck("contact column: working mailto + location text",pg.get_attribute("a.footer__mail","href")=="mailto:firstname.lastname@example-university.edu.in" and "Example City" in pg.inner_text(".footer__details"))
    ck("closing statement + availability render real text (no placeholder marks)",pg.inner_text(".footer__closing")=="Thank you for stopping by." and "Open to internships" in pg.inner_text(".footer__avail") and pg.locator(".footer__avail .is-placeholder").count()==0)
    hov=pg.locator(".footer__connect a").first; hov.scroll_into_view_if_needed(); pg.wait_for_timeout(300); before=pg.evaluate("getComputedStyle(document.querySelector('.footer__connect a .footer__ico')).borderTopColor"); hov.hover(); pg.wait_for_timeout(600)
    after=pg.evaluate("getComputedStyle(document.querySelector('.footer__connect a .footer__ico')).borderTopColor")
    ck("hover animation: icon chip changes (border colour)",before!=after,f"{before} -> {after}")
    pg.locator("#footer").screenshot(path="tests/shots/foot_filled_1440.png")
    c.close()
    # optional parts can be hidden
    hidden=filled.replace('url: "https://www.instagram.com/example"','url: ""').replace('show: true','show: false').replace('location: "Example City, Country"','location: ""')
    c=ctx(b,1440,900,js=hidden); pg=c.new_page(); pg.goto(B); pg.wait_for_timeout(700)
    ck("optional Instagram hidden when url is empty",pg.locator(".footer__connect li").count()==3 and "Instagram" not in pg.inner_text(".footer__connect"))
    ck("availability hidden when show:false",pg.locator(".footer__avail").count()==0)
    ck("location hidden when empty",pg.locator(".footer__detail").count()==1); c.close()
    # ---------- RESPONSIVE ----------
    for w,h,mob in [(320,640,True),(390,844,True),(768,1024,False),(1024,768,False),(1440,900,False),(1920,1080,False)]:
        c=ctx(b,w,h,mob=mob,js=filled); pg=c.new_page(); pg.goto(B); pg.wait_for_timeout(800); pg.evaluate("document.getElementById('footer').scrollIntoView()"); pg.wait_for_timeout(500)
        ov=pg.evaluate("[document.documentElement.scrollWidth,innerWidth]"); ck(f"@{w}: no horizontal overflow",ov[0]<=ov[1],str(ov))
        cols=pg.evaluate("[...document.querySelectorAll('.footer__col')].map(c=>{const r=c.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.right)]})")
        if w>=1100: ck(f"@{w}: 4 columns in one row",len({x[1] for x in cols})==1 and len({x[0] for x in cols})==4,str(cols))
        elif w>=680: ck(f"@{w}: 2x2 grid",len({x[0] for x in cols})==2 and len({x[1] for x in cols})==2,str(cols))
        else: ck(f"@{w}: single stacked column inside the screen",len({x[0] for x in cols})==1 and all(x[2]<=w for x in cols) and [x[1] for x in cols]==sorted(x[1] for x in cols),str(cols))
        inside=pg.evaluate("[...document.querySelectorAll('#footer *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left<-1)}).map(e=>e.className).slice(0,5)")
        ck(f"@{w}: nothing inside the footer leaves the screen (long email wraps)",not inside,str(inside))
        small=pg.evaluate("[...document.querySelectorAll('#footer a')].filter(a=>a.getBoundingClientRect().height<43).map(a=>a.textContent.trim().slice(0,20))")
        if w<=768: ck(f"@{w}: all footer links are >=44px touch targets",not small,str(small))
        pg.locator("#footer").screenshot(path=f"tests/shots/foot_{w}.png"); c.close()
    # reduced motion
    c=ctx(b,1440,900,js=filled,reduced_motion="reduce"); pg=c.new_page(); pg.goto(B); pg.wait_for_timeout(700)
    pg.locator(".footer__link").first.scroll_into_view_if_needed(); pg.locator(".footer__link").nth(1).hover(); pg.wait_for_timeout(300)
    ck("reduced-motion: no hover movement on footer links",pg.evaluate("getComputedStyle(document.querySelectorAll('.footer__link')[1]).transform")in("none","matrix(1, 0, 0, 1, 0, 0)"))
    c.close(); b.close()
print(f"\nTOTAL {len(res)} PASS {sum(res)} FAIL {len(res)-sum(res)}")
