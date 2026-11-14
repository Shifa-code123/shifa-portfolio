import os; os.makedirs("tests/shots", exist_ok=True)
import json, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8123"
results = []
def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""))

def block_fonts(route):
    route.abort()

with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------- DESKTOP ----------
    ctx = b.new_context(viewport={"width":1440,"height":900})
    ctx.route("**/fonts.googleapis.com/**", block_fonts)
    ctx.route("**/fonts.gstatic.com/**", block_fonts)
    page = ctx.new_page()
    console_errors, page_errors, bad_local = [], [], []
    external_failed = []
    page.on("console", lambda m: console_errors.append(m.text) if m.type=="error" else None)
    page.on("pageerror", lambda e: page_errors.append(str(e)))
    page.on("response", lambda r: bad_local.append((r.url, r.status)) if r.url.startswith(BASE) and r.status>=400 else None)
    page.on("requestfailed", lambda r: external_failed.append(r.url) if not r.url.startswith(BASE) else bad_local.append((r.url,"failed")))
    page.goto(BASE+"/index.html"); page.wait_for_load_state("load")
    page.wait_for_timeout(500)

    real_console = [e for e in console_errors if "fonts.g" not in e and "ERR_FAILED" not in e]
    check("desktop: no page (JS) errors", not page_errors, str(page_errors))
    check("desktop: no console errors besides intentionally-blocked fonts", not real_console, str(real_console))
    check("desktop: all local assets load (no 4xx/5xx/failed)", not bad_local, str(bad_local))
    check("fonts blocked as intended (external requests failed)", len(external_failed)>0, f"{len(external_failed)} blocked")

    # content binding
    check("content.js binding: brand + footer name", page.inner_text(".site-nav__brand")=="Shifa" and "Shifa" in page.inner_text(".footer"))
    check("content.js binding: hero role placeholder shown", page.inner_text(".hero__role").startswith("["))
    check("document.title from content.js", page.title()=="Shifa — Portfolio")

    # font fallback
    fam = page.evaluate("getComputedStyle(document.querySelector('h1')).fontFamily")
    body_fam = page.evaluate("getComputedStyle(document.body).fontFamily")
    loaded = page.evaluate("[...document.fonts].filter(f=>f.status==='loaded').length")
    check("font fallback: headings still render (no fonts loaded, text visible)", loaded==0 and page.is_visible("h1"), f"h1 stack starts {fam[:30]}; loaded faces={loaded}")
    h1w = page.evaluate("document.querySelector('h1').getBoundingClientRect().width")
    check("font fallback: heading has real size (no layout collapse)", h1w>100, f"h1 width {h1w:.0f}px")
    page.screenshot(path="tests/shots/desktop_home.png")

    # nav at top
    check("nav: 7 links present", page.locator("[data-nav-link]").count()==7)
    check("nav: toggle hidden on desktop", not page.is_visible("[data-nav-toggle]"))
    check("nav: Home active at top", page.get_attribute('[data-nav-link][href="#home"]',"aria-current")=="true")
    check("nav: not scrolled at top", "is-scrolled" not in page.get_attribute("[data-nav]","class"))

    # click every link
    for name in ["about","projects","education","experience","skills","contact","home"]:
        page.click(f'[data-nav-link][href="#{name}"]')
        page.wait_for_timeout(1300)
        cur = page.evaluate("[...document.querySelectorAll('[data-nav-link]')].filter(a=>a.getAttribute('aria-current')==='true').map(a=>a.hash)")
        top = page.evaluate(f"Math.round(document.getElementById('{name}').getBoundingClientRect().top)")
        maxscroll = page.evaluate("document.documentElement.scrollHeight - innerHeight")
        sy = page.evaluate("Math.round(scrollY)")
        landed = abs(top)<=6 or (name=="home" and sy==0) or (sy>=maxscroll-4)
        check(f"nav click #{name}: lands on section", landed, f"top={top}px scrollY={sy}")
        check(f"nav click #{name}: exactly one active link = #{name}", cur==[f"#{name}"], str(cur))

    # nav theme + scrolled
    page.click('[data-nav-link][href="#projects"]'); page.wait_for_timeout(1300)
    check("nav: adopts dark theme over forest section", page.get_attribute("[data-nav]","data-theme")=="dark")
    check("nav: is-scrolled after scrolling", "is-scrolled" in page.get_attribute("[data-nav]","class"))
    page.screenshot(path="tests/shots/desktop_projects.png")
    page.click('[data-nav-link][href="#experience"]'); page.wait_for_timeout(1300)
    check("nav: sage theme over experience", page.get_attribute("[data-nav]","data-theme")=="sage")
    page.screenshot(path="tests/shots/desktop_experience.png")

    # scroll-driven active state (mouse wheel, not click)
    page.evaluate("window.scrollTo({top:0,behavior:'instant'})"); page.wait_for_timeout(200)
    seen=[]
    for i in range(14):
        page.mouse.wheel(0,500); page.wait_for_timeout(120)
        c = page.evaluate("(document.querySelector('[data-nav-link][aria-current]')||{}).hash")
        if not seen or seen[-1]!=c: seen.append(c)
    check("nav: active link follows wheel scrolling in order", seen[:1]==["#home"] and seen[-1]=="#contact" and all(x in ["#home","#about","#projects","#education","#experience","#skills","#contact"] for x in seen), str(seen))

    # ---------- KEYBOARD (desktop) ----------
    kp = ctx.new_page(); kp.goto(BASE+"/index.html"); kp.wait_for_timeout(400)
    kp.keyboard.press("Tab"); kp.wait_for_timeout(400)
    focused = kp.evaluate("document.activeElement.className")
    sl_top = kp.evaluate("Math.round(document.querySelector('.skip-link').getBoundingClientRect().top)")
    check("keyboard: first Tab focuses skip link and reveals it", "skip-link" in focused and sl_top>=0, f"top={sl_top}")
    kp.keyboard.press("Enter"); kp.wait_for_timeout(300)
    check("keyboard: skip link jumps to #main", kp.evaluate("location.hash")=="#main")
    kp.close()
    order=[]
    page.evaluate("window.scrollTo({top:0,behavior:'instant'}); document.activeElement.blur(); history.replaceState(null,'','/index.html')")
    page.focus(".site-nav__brand")
    for i in range(7):
        order.append(page.evaluate("document.activeElement.textContent.trim()"))
        page.keyboard.press("Tab")
    check("keyboard: tab order brand→Home→About→…→Skills", order[:7]==["Shifa","Home","About","Projects","Education","Internship","Skills"], str(order))
    page.focus('[data-nav-link][href="#about"]')
    ol = page.evaluate("(()=>{const s=getComputedStyle(document.activeElement); return s.outlineStyle+' '+s.outlineWidth})()")
    page.keyboard.press("Tab"); page.keyboard.press("Shift+Tab")
    ol2 = page.evaluate("(()=>{const s=getComputedStyle(document.activeElement); return s.outlineStyle+' '+s.outlineWidth})()")
    check("keyboard: visible focus ring on nav link", "solid 2px" in ol2, ol2)
    page.evaluate("window.scrollTo({top:0,behavior:'instant'})"); page.focus('[data-nav-link][href="#about"]'); page.keyboard.press("Enter"); page.wait_for_timeout(1800)
    check("keyboard: Enter on link scrolls to About", page.get_attribute('[data-nav-link][href="#about"]',"aria-current")=="true")

    # ---------- RESPONSIVE OVERFLOW ----------
    for w,h in [(320,640),(390,844),(768,1024),(900,800),(1024,768),(1440,900),(1920,1080)]:
        page.set_viewport_size({"width":w,"height":h}); page.wait_for_timeout(250)
        ov = page.evaluate("[document.documentElement.scrollWidth, innerWidth]")
        clipped = page.evaluate("[...document.querySelectorAll('h1,h2,.shell__note,.site-nav__brand')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.className||e.tagName)")
        check(f"responsive {w}px: no horizontal overflow / clipped headings", ov[0]<=ov[1] and not clipped, f"scrollW={ov[0]} vw={ov[1]} clipped={clipped}")
        tog = page.is_visible("[data-nav-toggle]")
        check(f"responsive {w}px: nav mode correct ({'hamburger' if w<900 else 'inline links'})", tog==(w<900), f"toggle visible={tog}")
        navbox = page.evaluate("(()=>{const r=document.querySelector('.site-nav__list').getBoundingClientRect();return [Math.round(r.right), innerWidth, getComputedStyle(document.querySelector('.site-nav__menu')).visibility]})()")
        if w>=900: check(f"responsive {w}px: inline nav fits viewport", navbox[0]<=navbox[1], str(navbox))
    page.set_viewport_size({"width":900,"height":800}); page.wait_for_timeout(200)
    page.screenshot(path="tests/shots/tablet_900.png")
    page.set_viewport_size({"width":1440,"height":900})
    ctx.close()

    # ---------- MOBILE ----------
    mctx = b.new_context(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    mctx.route("**/fonts.googleapis.com/**", block_fonts); mctx.route("**/fonts.gstatic.com/**", block_fonts)
    m = mctx.new_page(); merr=[]
    m.on("pageerror", lambda e: merr.append(str(e)))
    m.on("console", lambda x: merr.append(x.text) if x.type=="error" and "fonts.g" not in x.text and "ERR_FAILED" not in x.text else None)
    m.goto(BASE+"/index.html"); m.wait_for_timeout(500)
    check("mobile: no JS/console errors", not merr, str(merr))
    check("mobile: hamburger visible, inline list hidden", m.is_visible("[data-nav-toggle]") and m.evaluate("getComputedStyle(document.querySelector('.site-nav__menu')).visibility")=="hidden")
    check("mobile: no glass cursor on touch device", m.locator(".gc").count()==0 and not m.evaluate("document.documentElement.classList.contains('has-glass-cursor')"))
    check("mobile: menu links not tabbable while closed", m.evaluate("(()=>{const a=document.querySelector('[data-nav-link]');a.focus();return document.activeElement===a})()")==False)
    m.screenshot(path="tests/shots/mobile_home.png")
    m.tap("[data-nav-toggle]"); m.wait_for_timeout(600)
    check("mobile: menu opens (aria-expanded, body lock)", m.get_attribute("[data-nav-toggle]","aria-expanded")=="true" and m.evaluate("document.body.classList.contains('is-menu-open')"))
    check("mobile: toggle label updates for screen readers", m.inner_text("[data-nav-toggle-label]")=="Close menu")
    check("mobile: overlay covers full viewport", m.evaluate("(()=>{const r=document.querySelector('.site-nav__menu').getBoundingClientRect();return Math.round(r.width)===innerWidth&&Math.round(r.height)===innerHeight})()"))
    check("mobile: focus moves to first menu link", m.evaluate("document.activeElement.textContent.trim()")=="Home")
    check("mobile: nav theme forced dark while open", m.get_attribute("[data-nav]","data-theme")=="dark")
    m.screenshot(path="tests/shots/mobile_menu_open.png")
    # focus trap
    seq=[]
    for i in range(8):
        m.keyboard.press("Tab"); seq.append(m.evaluate("document.activeElement.textContent.trim()||document.activeElement.className"))
    check("mobile: focus trapped inside open menu", all(s in ["Shifa","Home","About","Projects","Education","Internship","Skills","Contact","Close menu"] or "toggle" in s or "site-nav" in s for s in seq), str(seq))
    m.keyboard.press("Shift+Tab")
    # Escape
    m.keyboard.press("Escape"); m.wait_for_timeout(600)
    check("mobile: Escape closes menu", m.get_attribute("[data-nav-toggle]","aria-expanded")=="false" and not m.evaluate("document.body.classList.contains('is-menu-open')"))
    check("mobile: Escape returns focus to toggle", m.evaluate("document.activeElement.hasAttribute('data-nav-toggle')"))
    check("mobile: body scroll unlocked after close", m.evaluate("getComputedStyle(document.body).overflow")!="hidden")
    # navigate via menu
    for name in ["education","about","contact"]:
        m.tap("[data-nav-toggle]"); m.wait_for_timeout(500)
        m.tap(f'[data-nav-link][href="#{name}"]'); m.wait_for_timeout(1500)
        top = m.evaluate(f"Math.round(document.getElementById('{name}').getBoundingClientRect().top)")
        sy = m.evaluate("scrollY"); mx = m.evaluate("document.documentElement.scrollHeight-innerHeight")
        check(f"mobile: menu link #{name} closes menu & scrolls", m.get_attribute("[data-nav-toggle]","aria-expanded")=="false" and (abs(top)<=6 or sy>=mx-4), f"top={top} scrollY={sy:.0f}")
        check(f"mobile: #{name} marked active", m.get_attribute(f'[data-nav-link][href="#{name}"]',"aria-current")=="true")
    m.screenshot(path="tests/shots/mobile_contact.png")
    # resize to desktop while open
    m.evaluate("window.scrollTo({top:0,behavior:'instant'})"); m.tap("[data-nav-toggle]"); m.wait_for_timeout(400)
    m.set_viewport_size({"width":1100,"height":800}); m.wait_for_timeout(500)
    check("mobile→desktop resize auto-closes open menu", not m.evaluate("document.body.classList.contains('is-menu-open')") and m.get_attribute("[data-nav-toggle]","aria-expanded")=="false")
    mctx.close()

    # ---------- REDUCED MOTION ----------
    rctx = b.new_context(viewport={"width":1440,"height":900}, reduced_motion="reduce")
    rctx.route("**/fonts.googleapis.com/**", block_fonts); rctx.route("**/fonts.gstatic.com/**", block_fonts)
    r = rctx.new_page(); r.goto(BASE+"/index.html"); r.wait_for_timeout(400)
    r.mouse.move(500,400); r.wait_for_timeout(300)
    check("reduced-motion: glass cursor not created, native cursor kept", r.locator(".gc").count()==0 and not r.evaluate("document.documentElement.classList.contains('has-glass-cursor')"))
    check("reduced-motion: smooth scroll disabled", r.evaluate("getComputedStyle(document.documentElement).scrollBehavior")=="auto")
    r.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.remove('is-visible'))")
    check("reduced-motion: reveal content visible without animation", r.evaluate("[...document.querySelectorAll('.reveal')].every(e=>getComputedStyle(e).opacity==='1' && getComputedStyle(e).transform==='none')"))
    r.click('[data-nav-link][href="#about"]'); r.wait_for_timeout(250)
    check("reduced-motion: nav jump is instant", r.get_attribute('[data-nav-link][href="#about"]',"aria-current")=="true")
    rctx.close()

    # ---------- NO-JS ----------
    nctx = b.new_context(viewport={"width":1440,"height":900}, java_script_enabled=False)
    n = nctx.new_page(); n.route("**/fonts.g*/**", block_fonts); n.goto(BASE+"/index.html"); n.wait_for_timeout(300)
    check("no-JS: content still visible (progressive enhancement)", n.is_visible("h1") and n.is_visible("#projects-title") is not None and n.evaluate("getComputedStyle(document.querySelector('.reveal')).opacity")=="1")
    nctx.close()

    # ---------- CONTRAST ----------
    def lum(h):
        h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
        c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
        return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
    def cr(a,b):
        la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
    pairs={"charcoal on ivory":("#292B27","#F4F0E7"),"ivory on forest":("#F4F0E7","#263B32"),
           "forest on sage-wash":("#263B32","#D5DACE"),"charcoal on terracotta (btn hover)":("#292B27","#C58B69"),
           "terracotta on forest (large only)":("#C58B69","#263B32"),"terracotta on ivory (decor only)":("#C58B69","#F4F0E7")}
    for k,(f,bg) in pairs.items():
        v=cr(f,bg); print(f"  contrast {k}: {v:.2f}:1")
    check("contrast: body/UI pairs >= 4.5:1", all(cr(*pairs[k])>=4.5 for k in ["charcoal on ivory","ivory on forest","forest on sage-wash","charcoal on terracotta (btn hover)"]))
    b.close()

fails=[r for r in results if not r[1]]
print(f"\nTOTAL {len(results)}  PASS {len(results)-len(fails)}  FAIL {len(fails)}")
for f in fails: print("  FAILED:", f[0], f[2])
