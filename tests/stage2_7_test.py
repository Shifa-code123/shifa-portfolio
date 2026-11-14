import os; os.makedirs("tests/shots", exist_ok=True)
from playwright.sync_api import sync_playwright
B="http://localhost:8123"
res=[]
def ck(n,ok,d=""): res.append(ok); print(("PASS " if ok else "FAIL ")+n+(f" [{d}]" if d else ""))
blk=lambda r:r.abort()
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={"width":1440,"height":900}); ctx.route("**/fonts.g*/**",blk)
    pg=ctx.new_page(); errs=[]; bad=[]
    pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m: errs.append(m.text) if m.type=="error" and "ERR_FAILED" not in m.text else None)
    pg.on("response",lambda r: bad.append((r.url,r.status)) if r.status>=400 else None)
    pg.goto(B+"/index.html"); pg.wait_for_timeout(1000)
    ck("no console/page errors, no broken assets",not errs and not bad,str(errs)+str(bad))
    pg.screenshot(path="tests/shots/v_hero.png")
    # ---- BOOK ----
    pg.evaluate("document.getElementById('projects').scrollIntoView()"); pg.wait_for_timeout(900)
    bk=lambda: pg.evaluate("Portfolio.book.pf.getCurrentPageIndex()")
    ck("book starts closed",bk()==0 and pg.inner_text("[data-book-count]")=="Closed")
    pg.screenshot(path="tests/shots/v_book_closed.png")
    r=pg.locator(".book").bounding_box()
    pg.mouse.click(r["x"]+r["width"]*0.75, r["y"]+r["height"]*0.5)           # click the cover
    pg.wait_for_timeout(250); pg.screenshot(path="tests/shots/v_book_midflip.png")
    pg.wait_for_timeout(1500)
    ck("click cover opens book (real flip)",bk()==1 and pg.inner_text("[data-book-count]")=="Project 1 of 3",f"idx={bk()}")
    ck("book re-centres when open",pg.evaluate("getComputedStyle(document.querySelector('.book-stage')).transform")in("none","matrix(1, 0, 0, 1, 0, 0)"))
    pg.screenshot(path="tests/shots/v_book_open.png")
    pg.click("[data-book-next]"); pg.wait_for_timeout(1500); ck("next → project 2",bk()==3 and "Project 2" in pg.inner_text("[data-book-count]"),f"idx={bk()}")
    pg.click("[data-book-prev]"); pg.wait_for_timeout(1500); ck("prev → project 1",bk()==1,f"idx={bk()}")
    # drag corner
    r=pg.locator(".book").bounding_box()
    pg.mouse.move(r["x"]+r["width"]-8, r["y"]+r["height"]-8); pg.mouse.down(); pg.mouse.move(r["x"]+r["width"]*0.3, r["y"]+r["height"]-60, steps=8)
    pg.wait_for_timeout(100); pg.mouse.up(); pg.wait_for_timeout(1500)
    ck("drag page corner flips forward",bk()==3,f"idx={bk()}")
    pg.focus(".book-stage"); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(1500); ck("ArrowRight flips",bk()==5,f"idx={bk()}")
    pg.keyboard.press("ArrowLeft"); pg.wait_for_timeout(1500); ck("ArrowLeft flips back",bk()==3,f"idx={bk()}")
    href=pg.evaluate("[...document.querySelectorAll('.page__link')].map(a=>a.getAttribute('href'))")
    ck("3 case-study links on pages",href==["case-studies/project-1.html","case-studies/project-2.html","case-studies/project-3.html"],str(href))
    pg.click("[data-book-toggle]"); pg.wait_for_timeout(2200); ck("Close book → cover",bk()==0 and pg.inner_text("[data-book-toggle]")=="Open book",f"idx={bk()}")
    pg.click("[data-book-toggle]"); pg.wait_for_timeout(1500); ck("Open book button works",bk()==1)
    # project link navigates
    pg.evaluate("document.querySelector('.stf__item[style*=\"display: block\"] .page__link, .page__link').scrollIntoView()")
    pg.locator(".page--right:visible .page__link").first.click(force=True); pg.wait_for_timeout(800)
    ck("'Explore Full Case Study' opens dedicated page",pg.url.endswith("case-studies/project-1.html"),pg.url)
    cs=[ (pg.inner_text("h1"), len(pg.locator(".cs-sec").all())) ]
    ck("case-study renders 11 sections",cs[0][1]==11,str(cs))
    pg.screenshot(path="tests/shots/v_case.png",full_page=False)
    pg.click(".cs-nav__back"); pg.wait_for_timeout(600); ck("case-study → back to portfolio #projects",pg.url.endswith("index.html#projects"),pg.url)
    # ---- ROADMAP ----
    pg.evaluate("window.scrollTo({top:0,behavior:'instant'})"); pg.evaluate("document.getElementById('education').scrollIntoView()"); pg.wait_for_timeout(900)
    reached0=pg.evaluate("document.querySelectorAll('.milestone.is-reached').length")
    pg.evaluate("document.querySelector('.roadmap').scrollIntoView({block:'end'})"); pg.wait_for_timeout(900)
    reached1=pg.evaluate("document.querySelectorAll('.milestone.is-reached').length")
    ck("roadmap: 4 milestones rendered",pg.locator(".milestone").count()==4)
    ck("roadmap: road draws with scroll (milestones get reached)",reached1>reached0 and reached1>=3,f"{reached0}→{reached1}")
    pg.screenshot(path="tests/shots/v_roadmap.png")
    # ---- CERTIFICATE ----
    pg.evaluate("document.getElementById('experience').scrollIntoView()"); pg.wait_for_timeout(700)
    pg.screenshot(path="tests/shots/v_experience.png")
    pg.click(".cert__open"); pg.wait_for_timeout(500)
    ck("certificate opens large viewer",pg.evaluate("document.querySelector('.cert-viewer').open"))
    pg.click(".cert-viewer [data-zoom]"); ck("certificate zoom toggles",pg.evaluate("document.querySelector('.cert-viewer__stage').classList.contains('is-zoomed')"))
    pg.screenshot(path="tests/shots/v_cert_open.png")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    ck("Esc closes viewer & unlocks scroll",not pg.evaluate("document.querySelector('.cert-viewer').open") and not pg.evaluate("document.body.classList.contains('is-locked')"))
    # ---- ABOUT / CONTACT ----
    pg.evaluate("document.getElementById('about').scrollIntoView()"); pg.wait_for_timeout(700); pg.screenshot(path="tests/shots/v_about.png")
    pg.evaluate("document.getElementById('contact').scrollIntoView()"); pg.wait_for_timeout(1800)
    ck("contact placeholders rendered & marked",pg.locator("#contact .is-placeholder").count()>=3)
    # nav still ok
    ck("nav marks Contact active at bottom",pg.get_attribute('[data-nav-link][href="#contact"]',"aria-current")=="true")
    # case-study pages 2,3
    for n in (2,3):
        c=ctx.new_page(); e=[]; c.on("pageerror",lambda x:e.append(str(x))); c.goto(f"{B}/case-studies/project-{n}.html"); c.wait_for_timeout(500)
        ck(f"case-study {n} loads, no errors",c.locator(".cs-sec").count()==11 and not e,str(e)); c.close()
    # overflow
    for w in (320,390,768,1024,1440):
        pg.set_viewport_size({"width":w,"height":900}); pg.wait_for_timeout(500)
        ov=pg.evaluate("[document.documentElement.scrollWidth,innerWidth]"); ck(f"no horizontal overflow @{w}",ov[0]<=ov[1],str(ov))
    c=ctx.new_page(); c.set_viewport_size({'width':360,'height':800}); c.goto(B+'/case-studies/project-2.html'); c.wait_for_timeout(500); ov=c.evaluate('[document.documentElement.scrollWidth,innerWidth]'); ck('case-study: no horizontal overflow @360',ov[0]<=ov[1],str(ov)); c.screenshot(path='tests/shots/v_m_case.png'); c.close()
    ctx.close()
    # ---- MOBILE ----
    mc=b.new_context(viewport={"width":390,"height":844},is_mobile=True,has_touch=True,device_scale_factor=2); mc.route("**/fonts.g*/**",blk)
    m=mc.new_page(); me=[]; m.on("pageerror",lambda e:me.append(str(e))); m.goto(B+"/index.html"); m.wait_for_timeout(1000)
    m.screenshot(path="tests/shots/v_m_hero.png")
    m.evaluate("document.getElementById('projects').scrollIntoView()"); m.wait_for_timeout(900)
    ck("mobile: book in portrait (single page) mode",m.evaluate("Portfolio.book.pf.getOrientation()")=="portrait" and m.evaluate("document.querySelector('.book-stage').dataset.mode")=="portrait",m.evaluate("Portfolio.book.pf.getOrientation()"))
    m.screenshot(path="tests/shots/v_m_book_closed.png")
    m.tap("[data-book-toggle]"); m.wait_for_timeout(1500); mi=lambda:m.evaluate("Portfolio.book.pf.getCurrentPageIndex()")
    ck("mobile: open via button",mi()==1,f"idx={mi()}")
    m.tap("[data-book-next]"); m.wait_for_timeout(1500); ck("mobile: next page",mi()==2,f"idx={mi()}")
    m.screenshot(path="tests/shots/v_m_book_open.png")
    # swipe
    box=m.locator(".book").bounding_box(); y=box["y"]+box["height"]/2
    m.evaluate("""([x1,x2,y])=>{const el=document.querySelector('.book .stf__block')||document.querySelector('.book');
      const mk=(t,x)=>new TouchEvent(t,{bubbles:true,cancelable:true,touches:t==='touchend'?[]:[new Touch({identifier:1,target:el,clientX:x,clientY:y})],changedTouches:[new Touch({identifier:1,target:el,clientX:x,clientY:y})]});
      el.dispatchEvent(mk('touchstart',x1)); for(let i=1;i<=8;i++) el.dispatchEvent(mk('touchmove',x1+(x2-x1)*i/8)); el.dispatchEvent(mk('touchend',x2));}""",[box["x"]+box["width"]-20, box["x"]+30, y])
    m.wait_for_timeout(1500); ck("mobile: swipe turns page",mi()==3,f"idx={mi()}")
    m.evaluate("document.getElementById('education').scrollIntoView()"); m.wait_for_timeout(600); m.evaluate("document.querySelector('.roadmap').scrollIntoView({block:'end'})"); m.wait_for_timeout(700)
    m.screenshot(path="tests/shots/v_m_roadmap.png")
    ck("mobile: roadmap milestones reached",m.evaluate("document.querySelectorAll('.milestone.is-reached').length")>=3)
    m.evaluate("document.getElementById('experience').scrollIntoView()"); m.wait_for_timeout(500); m.screenshot(path="tests/shots/v_m_experience.png")
    m.evaluate("document.getElementById('about').scrollIntoView()"); m.wait_for_timeout(500); m.screenshot(path="tests/shots/v_m_about.png")
    ck("mobile: no JS errors",not me,str(me))
    rc=b.new_context(viewport={"width":1440,"height":900},reduced_motion="reduce"); rc.route("**/fonts.g*/**",blk)
    r=rc.new_page(); re_=[]; r.on("pageerror",lambda e:re_.append(str(e))); r.goto(B+"/index.html"); r.wait_for_timeout(800)
    r.evaluate("document.getElementById('education').scrollIntoView()"); r.wait_for_timeout(400)
    ck("reduced-motion: roadmap fully drawn, no errors",r.evaluate("document.querySelectorAll('.milestone.is-reached').length")==4 and not re_,str(re_))
    b.close()
print(f"\nTOTAL {len(res)} PASS {sum(res)} FAIL {len(res)-sum(res)}")
