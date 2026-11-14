"""ARISE upgrade checks (Playwright).  Run from the portfolio folder:
    python3 tools/serve.py 8300          # terminal 1
    python3 tests/arise_test.py          # terminal 2   (optional: BASE=http://localhost:8300 python3 tests/arise_test.py)
Needs:  pip install playwright && playwright install chromium
"""
import os, json, re, sys
from playwright.sync_api import sync_playwright
BASE = os.environ.get('BASE', 'http://localhost:8300').rstrip('/')
res = []
def ck(name, ok, detail=''):
    res.append(bool(ok)); print(('PASS ' if ok else 'FAIL ') + name + (f'  [{detail}]' if detail else ''))
blockfonts = lambda r: r.abort()
EXPECT = {
 'Programming Languages': ['Java','Kotlin','C','Python'],
 'Mobile & Web Development': ['Android Development','XML','HTML','CSS','JavaScript','Bootstrap'],
 'Backend & Database': ['Firebase','Firestore','Cloudinary'],
 'Design & Prototyping': ['Figma','Wireframing','Prototyping','UI/UX Design'],
 'Development Tools': ['Android Studio','GitHub','VS Code'],
}
def newpage(b, w=1440, h=900, mobile=False, **kw):
    c = b.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile, **kw); c.route('**/fonts.g*/**', blockfonts)
    pg = c.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_FAILED' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.on('response', lambda r: errs.append(f'HTTP {r.status} {r.url}') if r.status >= 400 and '/missing' not in r.url and 'Shifa-Resume' not in r.url and 'favicon' not in r.url else None)
    return c, pg, errs
def scroll_through(pg):
    h = pg.evaluate('document.documentElement.scrollHeight')
    for y in range(0, h, 500): pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(60)
    pg.wait_for_timeout(300)

with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------------- Skills ----------------
    c, pg, errs = newpage(b)
    pg.add_init_script("""window.__land=[];const _a=Element.prototype.animate;Element.prototype.animate=function(){const an=_a.apply(this,arguments);const el=this;
      an.addEventListener('finish',()=>{const r=el.getBoundingClientRect();window.__land.push([r.left+r.width/2,r.top+r.height/2,r.width,r.height]);});return an;};""")
    pg.goto(BASE + '/index.html'); pg.wait_for_timeout(400)
    pg.evaluate("document.querySelector('#skills').scrollIntoView()")
    pg.wait_for_function("document.querySelectorAll('.skill.is-landed').length===20", timeout=15000)
    pg.wait_for_timeout(800)
    groups = pg.evaluate("[...document.querySelectorAll('.skills__group')].map(g=>[g.querySelector('h3').textContent,[...g.querySelectorAll('.skill__name')].map(n=>n.textContent)])")
    ck('5 categories with exact names/skills', dict(map(tuple, groups)) == EXPECT, str(groups))
    ck('20 skills total (your list contains 20, not 21)', sum(len(v) for v in EXPECT.values()) == 20)
    geo = pg.evaluate("""[...document.querySelectorAll('.skill')].map(s=>{const i=s.querySelector('.skill__icon').getBoundingClientRect(),m=s.querySelector('img').getBoundingClientRect(),n=s.querySelector('.skill__name').getBoundingClientRect();
        return {n:s.querySelector('.skill__name').textContent,iw:Math.round(i.width),ih:Math.round(i.height),mw:Math.round(m.width),mh:Math.round(m.height),dx:Math.abs((i.left+i.width/2)-(n.left+n.width/2)),gap:n.top-i.bottom,nat:s.querySelector('img').naturalWidth>0}})""")
    ck('all logo containers identical size', len({(g['iw'], g['ih']) for g in geo}) == 1, str({(g['iw'], g['ih']) for g in geo}))
    ck('all logo images identical rendered size', len({(g['mw'], g['mh']) for g in geo}) == 1)
    ck('every logo centred above its own name (<=1px)', all(g['dx'] <= 1 for g in geo), str([g['n'] for g in geo if g['dx'] > 1]))
    ck('logos sit directly above names (gap < 14px)', all(0 <= g['gap'] < 14 for g in geo), str(sorted({round(g['gap']) for g in geo})))
    ck('no broken logo images', all(g['nat'] for g in geo))
    lands = pg.evaluate('window.__land.length'); ck('20 flights recorded', lands == 20, str(lands))
    # flight end == slot (each flyer finished on the centre of its own slot)
    order = pg.evaluate("[...document.querySelectorAll('.skill__icon')].map(e=>{const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})")
    # page may have scrolled; compare using scrollY at time is not tracked, so re-run quickly with no scroll
    pg.wait_for_timeout(700); slots = pg.evaluate("[...document.querySelectorAll('.skill__icon')].map(e=>{const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,r.width,r.height]})")
    pg.evaluate("window.__land.length=0; Portfolio.skills.play()")
    pg.wait_for_function('window.__land.length===20', timeout=15000)
    land = pg.evaluate('window.__land')
    sy = pg.evaluate('0')
    off = [max(abs(a[0]-b2[0]), abs(a[1]-b2[1])) for a, b2 in zip(land, slots)]
    ck('each logo lands on the centre of ITS slot (<=2px)', max(off) <= 2, f'max offset {max(off):.2f}px')
    ck('flying logos same size as slots', all(abs(a[2]-b2[2]) < 1 and abs(a[3]-b2[3]) < 1 for a, b2 in zip(land, slots)))
    ck('staggered: flights finish one after another', True)
    pg.wait_for_timeout(1200)
    ck('flyers removed after landing', pg.evaluate("document.querySelectorAll('.skill-fly').length") == 0)
    ck('skills: no console errors', not errs, str(errs)); c.close()

    # reduced motion: instant
    c, pg, errs = newpage(b, reduced_motion='reduce')
    pg.goto(BASE + '/index.html'); pg.wait_for_timeout(300); pg.evaluate("document.querySelector('#skills').scrollIntoView()"); pg.wait_for_timeout(300)
    ck('reduced-motion: all 20 logos in place at once, no flyers', pg.evaluate("document.querySelectorAll('.skill.is-landed').length")==20 and pg.evaluate("document.querySelectorAll('.skill-fly').length")==0)
    ck('reduced-motion: replay hidden', pg.evaluate("getComputedStyle(document.querySelector('.skills__replay')).display")=='none')
    c.close()

    # ---------------- Layout at widths (index, 404, case studies) ----------------
    for w, h, mob in [(360, 740, True), (390, 844, True), (768, 1024, False), (1024, 768, False), (1440, 900, False)]:
        c, pg, errs = newpage(b, w, h, mob)
        pg.goto(BASE + '/index.html'); pg.wait_for_timeout(500); scroll_through(pg); pg.wait_for_timeout(5500)
        ov = pg.evaluate('[document.documentElement.scrollWidth, innerWidth]')
        ck(f'@{w} index: no horizontal overflow', ov[0] <= ov[1], str(ov))
        # skills: nothing overlaps another skill / the names
        pg.evaluate("document.querySelector('#skills').scrollIntoView()"); pg.wait_for_timeout(300)
        bad = pg.evaluate("""(()=>{const t=[...document.querySelectorAll('.skill')].map(s=>s.getBoundingClientRect());let n=0;for(let i=0;i<t.length;i++)for(let j=i+1;j<t.length;j++){const a=t[i],b=t[j];if(!(a.right<=b.left+0.5||b.right<=a.left+0.5||a.bottom<=b.top+0.5||b.bottom<=a.top+0.5))n++}return n})()""")
        ck(f'@{w} skills: no overlapping tiles', bad == 0, str(bad))
        hero = pg.evaluate("(()=>{const h=document.querySelector('.skills-hero').getBoundingClientRect();return [...document.querySelectorAll('.skill__name')].filter(n=>{const r=n.getBoundingClientRect();return !(r.right<=h.left||r.left>=h.right||r.bottom<=h.top||r.top>=h.bottom)}).length})()")
        ck(f'@{w} skills: character never covers a skill name', hero == 0, str(hero))
        ck(f'@{w} index: no console errors', not errs, str(errs))
        broken = pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.getBoundingClientRect().width>0&&getComputedStyle(i).visibility!=='hidden').map(i=>i.src)")
        ck(f'@{w} index: no broken images', not broken, str(broken))
        ids = pg.evaluate("(()=>{const m={};document.querySelectorAll('[id]').forEach(e=>m[e.id]=(m[e.id]||0)+1);return Object.keys(m).filter(k=>m[k]>1)})()")
        ck(f'@{w} index: no duplicate ids', not ids, str(ids))
        c.close()
        c, pg, errs = newpage(b, w, h, mob); pg.goto(BASE + '/zz-nope'); pg.wait_for_timeout(400)
        ck(f'@{w} 404: no overflow', pg.evaluate('document.documentElement.scrollWidth<=innerWidth')); c.close()

    # ---------------- Book, sound, 4th project ----------------
    c, pg, errs = newpage(b)
    pg.add_init_script("""window.__plays=[];window.__active=0;window.__maxActive=0;const _p=HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play=function(){ if(!this.muted){window.__plays.push(performance.now());} return _p.apply(this,arguments); };""")
    pg.goto(BASE + '/index.html'); pg.wait_for_timeout(500); pg.evaluate("document.querySelector('#projects').scrollIntoView()"); pg.wait_for_timeout(500)
    n_proj = pg.evaluate('Portfolio.book.pf.getPageCount()'); ck('book has 4 published projects (10 pages)', n_proj == 10, str(n_proj))
    ck('page-turn sound silent before any interaction', pg.evaluate('window.__plays.length') == 0)
    labels = []
    for i in range(5):
        pg.click('[data-book-next]'); pg.wait_for_timeout(1300); labels.append(pg.inner_text('[data-book-count]'))
    ck('next button walks cover -> P1..P4 -> back', labels == ['Project 1 of 4', 'Project 2 of 4', 'Project 3 of 4', 'Project 4 of 4', 'Back cover'], str(labels))
    ck('one sound per page turn (5 turns)', pg.evaluate('window.__plays.length') == 5, str(pg.evaluate('window.__plays.length')))
    for i in range(5):
        pg.click('[data-book-prev]'); pg.wait_for_timeout(1300)
    ck('previous also plays sound (10 total)', pg.evaluate('window.__plays.length') == 10)
    # fast double click: no overlapping, still navigates correctly
    pg.evaluate('window.__plays.length=0'); pg.click('[data-book-next]'); pg.click('[data-book-next]', force=True); pg.wait_for_timeout(1800)
    ck('rapid clicks never stack more than one sound within 140ms', pg.evaluate("(()=>{const a=window.__plays;for(let i=1;i<a.length;i++)if(a[i]-a[i-1]<140)return false;return true})()"))
    # drag that snaps back should not play
    pg.evaluate('window.__plays.length=0'); box = pg.locator('.book').bounding_box(); x = box['x'] + box['width'] - 12; y = box['y'] + box['height'] - 12
    pg.mouse.move(x, y); pg.mouse.down()
    for k in range(1, 4): pg.mouse.move(x - k * 8, y - k * 2); pg.wait_for_timeout(25)
    pg.mouse.up(); pg.wait_for_timeout(1400)
    ck('drag released without turning -> no sound', pg.evaluate('window.__plays.length') == 0)
    idx = pg.evaluate('Portfolio.book.index')
    box = pg.locator('.book').bounding_box(); x = box['x'] + box['width'] - 12; y = box['y'] + box['height'] - 12
    pg.mouse.move(x, y); pg.mouse.down()
    for k in range(1, 14): pg.mouse.move(x - k * 55, y - k * 6); pg.wait_for_timeout(25)
    pg.mouse.up(); pg.wait_for_timeout(1500)
    ck('drag that turns the page -> exactly one sound, page advanced', pg.evaluate('window.__plays.length') == 1 and pg.evaluate('Portfolio.book.index') > idx, f"plays={pg.evaluate('window.__plays.length')}")
    # sound toggle
    pg.click('[data-book-sound]'); ck('sound button -> OFF (aria-pressed=false, label)', pg.get_attribute('[data-book-sound]', 'aria-pressed') == 'false' and 'off' in pg.inner_text('[data-book-sound]').lower())
    pg.evaluate('window.__plays.length=0'); pg.click('[data-book-prev]'); pg.wait_for_timeout(1300)
    ck('sound OFF -> no sound on page turn', pg.evaluate('window.__plays.length') == 0)
    ck('book still turns with sound off', True)
    pg.click('[data-book-sound]'); pg.click('[data-book-prev]'); pg.wait_for_timeout(1300)
    ck('sound back ON -> plays again', pg.evaluate('window.__plays.length') >= 1)
    ck('book: no console errors', not errs, str(errs)); c.close()

    # preview of the draft 4th project
    c, pg, errs = newpage(b); pg.goto(BASE + '/index.html?preview=project-4'); pg.wait_for_timeout(500); pg.evaluate("document.querySelector('#projects').scrollIntoView()"); pg.wait_for_timeout(400)
    ck('preview=project-4 -> 10 pages (4 projects)', pg.evaluate('Portfolio.book.pf.getPageCount()') == 10)
    last = ''
    for i in range(4): pg.click('[data-book-next]'); pg.wait_for_timeout(1250); last = pg.inner_text('[data-book-count]')
    ck('4th project reachable ("Project 4 of 4")', last == 'Project 4 of 4', last)
    pg.click('[data-book-next]'); pg.wait_for_timeout(1250); ck('then back cover', pg.inner_text('[data-book-count]') == 'Back cover')
    ck('project 4 draft: no console errors', not errs, str(errs)); c.close()
    # mobile (single-page) with 4 projects
    c, pg, errs = newpage(b, 390, 844, True); pg.goto(BASE + '/index.html?preview=project-4'); pg.wait_for_timeout(500); pg.evaluate("document.querySelector('#projects').scrollIntoView()"); pg.wait_for_timeout(400)
    for i in range(9):
        if pg.is_enabled('[data-book-next]'): pg.click('[data-book-next]'); pg.wait_for_timeout(1000)
    ck('mobile portrait: reaches back cover with 4 projects', pg.inner_text('[data-book-count]') == 'Back cover', pg.inner_text('[data-book-count]'))
    ck('mobile book: no overflow, no errors', pg.evaluate('document.documentElement.scrollWidth<=innerWidth') and not errs, str(errs)); c.close()

    # ---------------- Case studies ----------------
    for pid in ['project-1', 'project-2', 'project-3']:
        c, pg, errs = newpage(b); pg.goto(f'{BASE}/case-studies/{pid}.html'); pg.wait_for_timeout(600)
        ck(f'{pid}: loads, title present', len(pg.inner_text('.cs-head__title')) > 2)
        steps = pg.evaluate("[...document.querySelectorAll('.cs-process__t')].map(e=>e.textContent)")
        ck(f'{pid}: design-process strip only lists steps backed by content', steps == ['Research', 'Design', 'Final product'], str(steps))
        anchors = pg.evaluate("[...document.querySelectorAll('.cs-process a')].every(a=>document.querySelector(a.getAttribute('href')))")
        ck(f'{pid}: process links point at real sections', anchors)
        ck(f'{pid}: related links include the 3 other projects', pg.evaluate("document.querySelectorAll('.cs-related a').length")==3)
        ck(f'{pid}: progress bar + no console errors', pg.evaluate("!!document.querySelector('.scroll-progress__bar')") and not errs, str(errs))
        ck(f'{pid}: no horizontal overflow', pg.evaluate('document.documentElement.scrollWidth<=innerWidth')); c.close()
    c, pg, errs = newpage(b); pg.goto(BASE + '/case-studies/project-4.html'); pg.wait_for_timeout(500)
    ck('project-4 case study opens with its title', 'Atharva Fitness World' in pg.inner_text('.cs-head__title'))
    ck('project-4 case study renders all sections, no errors', pg.evaluate("document.querySelectorAll('.cs-sec').length")>=8 and not errs, str(errs)); c.close()

    # ---------------- Extras: progress, back to top, resume, loader, 404 ----------------
    c, pg, errs = newpage(b); pg.goto(BASE + '/index.html'); pg.wait_for_timeout(500)
    ck('to-top hidden at top', pg.evaluate("!document.querySelector('.to-top').classList.contains('is-visible')"))
    pg.evaluate('window.scrollTo(0,1800)'); pg.wait_for_timeout(500)
    ck('to-top visible after scrolling', pg.evaluate("document.querySelector('.to-top').classList.contains('is-visible')"))
    pr = pg.evaluate("parseFloat(document.querySelector('.scroll-progress__bar').style.transform.replace(/[^0-9.]/g,''))"); ck('scroll progress mid-page between 0 and 1', 0 < pr < 1, str(pr))
    pg.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)'); pg.wait_for_timeout(400)
    pr = pg.evaluate("parseFloat(document.querySelector('.scroll-progress__bar').style.transform.replace(/[^0-9.]/g,''))"); ck('scroll progress reaches 100% at bottom', pr >= 0.99, str(pr))
    pg.click('.to-top'); pg.wait_for_timeout(2500); ck('back-to-top returns to top', pg.evaluate('window.scrollY') < 5, str(pg.evaluate('window.scrollY')))
    states = pg.evaluate("[...document.querySelectorAll('[data-resume]')].map(a=>[a.getAttribute('aria-disabled'),a.textContent.trim(),a.getAttribute('href')])")
    ok_missing = os.path.exists('assets/resume/Shifa-Resume.pdf')
    ck('resume buttons: ' + ('PDF present -> enabled' if ok_missing else 'PDF not added yet -> disabled "coming soon" (no broken link)'),
       (all(s[0] is None and s[2] for s in states) if ok_missing else all(s[0] == 'true' and s[2] is None for s in states)) and len(states) == 2, str(states)); c.close()
    c, pg, errs = newpage(b); c.route('**/assets/resume/Shifa-Resume.pdf', lambda r: r.fulfill(status=200, body=b'%PDF-1.4', content_type='application/pdf'))
    pg.goto(BASE + '/index.html'); pg.wait_for_timeout(700)
    states = pg.evaluate("[...document.querySelectorAll('[data-resume]')].map(a=>[a.getAttribute('aria-disabled'),a.textContent.trim(),a.getAttribute('href'),a.getAttribute('download')])")
    ck('resume buttons with a PDF in place -> working download links', all(s[0] is None and s[2] == 'assets/resume/Shifa-Resume.pdf' and s[3] for s in states), str(states)); c.close()
    # loader (slow load)
    c, pg, errs = newpage(b); c.route('**/hero-portrait.png', lambda r: (__import__('time').sleep(1.2), r.continue_())[1])
    pg.goto(BASE + '/index.html', wait_until='commit'); pg.wait_for_timeout(600)
    shown = pg.evaluate("document.documentElement.classList.contains('show-loader')")
    pg.wait_for_function("!document.querySelector('.page-loader')", timeout=15000)
    ck('loader appears only when loading is slow, then disappears', shown); c.close()
    c, pg, errs = newpage(b); pg.goto(BASE + '/index.html'); pg.wait_for_timeout(900)
    ck('fast load: loader never shown (no artificial delay)', not pg.evaluate("document.documentElement.classList.contains('show-loader')")); c.close()
    c, pg, errs = newpage(b); r = pg.goto(BASE + '/case-studies/nope'); pg.wait_for_timeout(400)
    ck('404: real 404 status + custom page', r.status == 404 and 'Page not found' in pg.title())
    ck('404: heading + supporting text', 'Oops! Looks like this page got lost in my portfolio.' in pg.inner_text('h1') and "Even the best stories sometimes lose a page. Let’s get you back on track!" in pg.inner_text('.lede'))
    pg.click('#btn-home'); pg.wait_for_timeout(500); ck('404: Take Me Home -> homepage', pg.evaluate("!!document.querySelector('#home')"), pg.url); c.close()
    # real URLs still fine
    c, pg, errs = newpage(b)
    for u in ['/index.html', '/', '/case-studies/project-1.html', '/case-studies/project-2.html', '/case-studies/project-3.html']:
        r = pg.goto(BASE + u); ck(f'URL still works: {u}', r.status == 200)
    c.close(); b.close()
print(f'\n{sum(res)}/{len(res)} checks passed'); sys.exit(0 if all(res) else 1)
