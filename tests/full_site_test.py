import os; os.makedirs("tests/shots", exist_ok=True)
from playwright.sync_api import sync_playwright
B="http://localhost:8123/index.html"; res=[]
def ck(n,ok,d=""): res.append(ok); print(("PASS " if ok else "FAIL ")+n+(f" [{d}]" if d else ""))
blk=lambda r:r.abort()
ORDER=["home","about","projects","education","experience","skills","contact"]
content=open("js/config/content.js",encoding="utf-8").read()
patched=content.replace('email: "[Add email address]"','email: "firstname.middlename.lastname@example-university.edu.in"').replace('url: "[Add GitHub URL]"','url: "https://github.com/example"').replace('url: "[Add LinkedIn URL]"','url: "https://www.linkedin.com/in/example"')
def rects(pg,a,b): return pg.evaluate(f"(()=>{{const A=document.querySelector('{a}').getBoundingClientRect(),B=document.querySelector('{b}').getBoundingClientRect();return [Math.round(A.left),Math.round(A.top),Math.round(A.right),Math.round(A.bottom),Math.round(B.left),Math.round(B.top),Math.round(B.right),Math.round(B.bottom)]}})()")
def overlap(r): return not (r[2]<=r[4] or r[6]<=r[0] or r[3]<=r[5] or r[7]<=r[1])
with sync_playwright() as p:
    b=p.chromium.launch()
    # ---------- ORDER ----------
    c=b.new_context(viewport={"width":1440,"height":900}); c.route("**/fonts.g*/**",blk); pg=c.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append(m.text) if m.type=="error" and "ERR_FAILED" not in m.text else None)
    pg.goto(B); pg.wait_for_timeout(900)
    ck("section order: Hero, About, Projects, Education, Internship, Skills, Contact",pg.evaluate("[...document.querySelectorAll('main > section')].map(s=>s.id)")==ORDER,str(pg.evaluate("[...document.querySelectorAll('main > section')].map(s=>s.id)")))
    ck("nav order matches sections",pg.evaluate("[...document.querySelectorAll('[data-nav-link]')].map(a=>a.hash.slice(1))")==ORDER)
    ck("nav labels",pg.evaluate("[...document.querySelectorAll('[data-nav-link]')].map(a=>a.textContent)")==["Home","About","Projects","Education","Internship","Skills","Contact"])
    ck("About is immediately after Hero",pg.evaluate("document.getElementById('home').nextElementSibling.id")=="about")
    ck("skills section rendered from content.js (3 groups)",pg.locator("#skills .skills__group").count()==3)
    ck("no page/console errors on full load",not errs,str(errs))
    # scroll through each section; nav active follows
    seq=[]
    for s in ORDER:
        pg.click(f'[data-nav-link][href="#{s}"]'); pg.wait_for_timeout(1300)
        seq.append(pg.evaluate("(document.querySelector('[data-nav-link][aria-current]')||{}).hash"))
    ck("clicking each nav link activates it (7/7)",seq==["#"+s for s in ORDER],str(seq))
    # ---------- COMPOSITION screenshots + checks at widths ----------
    for w,h,mob in [(360,740,True),(390,844,True),(768,1024,False),(1024,768,False),(1440,900,False)]:
        c2=b.new_context(viewport={"width":w,"height":h},is_mobile=mob,has_touch=mob); c2.route("**/fonts.g*/**",blk); q=c2.new_page(); q.goto(B); q.wait_for_timeout(900)
        ov=q.evaluate("[document.documentElement.scrollWidth,innerWidth]"); ck(f"@{w}: no horizontal overflow (whole page)",ov[0]<=ov[1],str(ov))
        if w>=900:
            fits=q.evaluate("(()=>{const l=document.querySelector('.site-nav__list').getBoundingClientRect();const hs=[...document.querySelectorAll('.site-nav__link')].map(a=>a.getBoundingClientRect().height);return [Math.round(l.right),innerWidth,Math.max(...hs)]})()")
            ck(f"@{w}: 7 nav links fit on one line",fits[0]<=fits[1] and fits[2]<42,str(fits))
        # hero
        hr=rects(q,".hero__intro",".hero__portrait img"); nm=q.evaluate("(()=>{const r=document.querySelector('.hero__name').getBoundingClientRect();return [Math.round(r.left),Math.round(r.right),innerWidth]})()")
        ck(f"@{w}: hero name inside viewport",nm[0]>=0 and nm[1]<=nm[2]+2,str(nm))
        if w>=900: ck(f"@{w}: hero intro does not collide with portrait",not overlap(hr),str(hr))
        else:
            gap=hr[5]-hr[3]; ck(f"@{w}: hero has no dead space between intro and portrait (gap<=120px)",-5<=gap<=120,f"gap={gap}px")
        q.screenshot(path=f"tests/shots/f_{w}_hero.png")
        # about
        q.evaluate("document.getElementById('about').scrollIntoView()"); q.wait_for_timeout(500)
        ab=q.evaluate("(()=>{const s=document.querySelector('.about__stage').getBoundingClientRect();const n=document.querySelector('.about__name').getBoundingClientRect();const f=document.querySelector('.about__figure img').getBoundingClientRect();return [Math.round(s.left),Math.round(s.right),Math.round(n.left),Math.round(n.right),Math.round(f.left),Math.round(f.right),Math.round(s.height),innerHeight]})()")
        ck(f"@{w}: about name + portrait stay inside the stage/viewport",ab[2]>=ab[0]-2 and ab[3]<=ab[1]+2 and ab[4]>=-2 and ab[5]<=w+2,str(ab))
        q.locator("#about").screenshot(path=f"tests/shots/f_{w}_about.png")
        # education: no overlap between marker and card, all inside viewport
        q.evaluate("document.querySelector('.roadmap').scrollIntoView({block:'end'})"); q.wait_for_timeout(700)
        bad=q.evaluate("""(()=>{const out=[];document.querySelectorAll('.milestone').forEach((li,i)=>{const m=li.querySelector('.milestone__marker').getBoundingClientRect(),c=li.querySelector('.milestone__card').getBoundingClientRect();
          const ov=!(m.right<=c.left||c.right<=m.left||m.bottom<=c.top||c.bottom<=m.top);if(ov)out.push('overlap@'+i);if(c.left<0||c.right>innerWidth+1)out.push('offscreen@'+i);if(Math.min(m.left,c.left)<0)out.push('neg@'+i)});return out})()""")
        ck(f"@{w}: education markers/cards never overlap or leave the screen",not bad,str(bad))
        q.locator(".roadmap").screenshot(path=f"tests/shots/f_{w}_edu.png")
        # book fit
        q.evaluate("document.getElementById('projects').scrollIntoView()"); q.wait_for_timeout(500); q.evaluate("Portfolio.book.open()"); q.wait_for_timeout(1500)
        mode=q.evaluate("document.querySelector('.book-stage').dataset.mode"); q.wait_for_timeout(5500)
        fit=q.evaluate("(()=>{const o=[];document.querySelectorAll('.stf__item .page__inner').forEach(i=>{if(i.offsetParent&&i.scrollHeight>i.clientHeight+1)o.push([i.scrollHeight,i.clientHeight])});return o})()")
        ck(f"@{w}: book ({mode}) page text fits the visible pages",not fit,str(fit))
        q.screenshot(path=f"tests/shots/f_{w}_book.png")
        if w<=390:
            tg=q.evaluate("['[data-book-prev]','[data-book-next]','[data-book-toggle]'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),r.left>=0&&r.right<=innerWidth]})")
            ck(f"@{w}: book controls are >=44px touch targets and on-screen",all(x[0]>=44 and x[1]>=44 and x[2] for x in tg),str(tg))
        c2.close()
    c.close()
    # ---------- CERTIFICATE (phone + desktop) ----------
    for w,h,mob in [(390,844,True),(1440,900,False)]:
        c2=b.new_context(viewport={"width":w,"height":h},is_mobile=mob,has_touch=mob,device_scale_factor=2 if mob else 1); c2.route("**/fonts.g*/**",blk); q=c2.new_page(); q.goto(B); q.wait_for_timeout(800)
        q.evaluate("document.getElementById('experience').scrollIntoView()"); q.wait_for_timeout(600)
        q.locator(".cert__open").click(); q.wait_for_timeout(500)
        iw=q.evaluate("(()=>{const i=document.querySelector('.cert-viewer__stage img').getBoundingClientRect();return [Math.round(i.width),innerWidth,document.querySelector('.cert-viewer').open]})()")
        ck(f"cert @{w}: opens as a large modal; image uses >=88% of width",iw[2] and iw[0]>=0.88*(iw[1]-32 if mob else min(iw[1]-32,1754*0.7)) ,str(iw))
        q.screenshot(path=f"tests/shots/f_{w}_cert.png")
        q.click("[data-zoom]"); q.wait_for_timeout(300)
        zz=q.evaluate("(()=>{const s=document.querySelector('.cert-viewer__stage'),i=s.querySelector('img');return [Math.round(i.getBoundingClientRect().width),s.scrollWidth>s.clientWidth,innerWidth]})()")
        ck(f"cert @{w}: zoom enlarges image and it scrolls (readable detail)",zz[0]>=1.5*zz[2] and zz[1],str(zz))
        q.click("[data-close]"); q.wait_for_timeout(300)
        ck(f"cert @{w}: close returns focus to the framed certificate",q.evaluate("document.activeElement.classList.contains('cert__open')") and not q.evaluate("document.body.classList.contains('is-locked')"))
        c2.close()
    # ---------- CONTACT (long email + real links) ----------
    for w,h,mob in [(320,640,True),(390,844,True),(1440,900,False)]:
        c2=b.new_context(viewport={"width":w,"height":h},is_mobile=mob,has_touch=mob); c2.route("**/fonts.g*/**",blk); c2.route("**/js/config/content.js",lambda r:r.fulfill(body=patched,content_type="application/javascript"))
        q=c2.new_page(); q.goto(B); q.wait_for_timeout(800); q.evaluate("document.getElementById('contact').scrollIntoView()"); q.wait_for_timeout(500)
        m=q.evaluate("(()=>{const a=document.querySelector('a.contact__mail');const r=a.getBoundingClientRect();return [a.getAttribute('href'),Math.round(r.right),innerWidth,document.documentElement.scrollWidth]})()")
        ck(f"contact @{w}: long email wraps inside the screen, no overflow",m[1]<=m[2] and m[3]<=m[2],str(m))
        ck(f"contact @{w}: email is a working mailto link",m[0]=="mailto:firstname.middlename.lastname@example-university.edu.in")
        L=q.evaluate("[...document.querySelectorAll('.contact__links a')].map(a=>[a.href,a.target,a.rel,Math.round(a.getBoundingClientRect().height)])")
        ck(f"contact @{w}: social links open in new tab safely, >=44px tall",len(L)==2 and all(x[1]=="_blank" and "noopener" in x[2] and x[3]>=44 for x in L),str(L))
        if w==390: q.locator("#contact").screenshot(path="tests/shots/f_390_contact.png")
        c2.close()
    # ---------- CURSOR LABELS + TYPING on the real page ----------
    c3=b.new_context(viewport={"width":1440,"height":900}); c3.route("**/fonts.g*/**",blk); q=c3.new_page(); q.goto(B); q.wait_for_timeout(900)
    q.evaluate("document.getElementById('projects').scrollIntoView()"); q.wait_for_timeout(800)
    cv=q.locator(".page--cover").first.bounding_box(); q.mouse.move(cv["x"]+cv["width"]/2,cv["y"]+cv["height"]/2); q.wait_for_timeout(800)
    ck("real page: hovering the closed cover shows 'OPEN BOOK'",q.evaluate("Portfolio.cursor.state")=="label" and q.evaluate("Portfolio.cursor.label")=="OPEN BOOK")
    q.mouse.click(cv["x"]+cv["width"]/2,cv["y"]+cv["height"]/2); q.wait_for_timeout(1700)
    ck("real page: clicking the cover opens the book (orb does not block the click)",q.evaluate("Portfolio.book.index")==1)
    q.wait_for_timeout(5500)
    lk=q.locator(".page--right:visible .page__link").first.bounding_box(); q.mouse.move(lk["x"]+lk["width"]/2,lk["y"]+lk["height"]/2); q.wait_for_timeout(800)
    ck("real page: hovering the case-study link shows 'VIEW PROJECT'",q.evaluate("Portfolio.cursor.state")=="label" and q.evaluate("Portfolio.cursor.label")=="VIEW PROJECT")
    q.screenshot(path="tests/shots/f_1440_view_project.png")
    ck("real page: typing played once for project 1",q.evaluate("Portfolio.book.played()")["right"]==["1"])
    c3.close(); b.close()
print(f"\nTOTAL {len(res)} PASS {sum(res)} FAIL {len(res)-sum(res)}")
