/* book.js — interactive project book built on StPageFlip (js/vendor/page-flip.browser.js).
   Pages are generated from content.js. Real page flipping: click, drag a corner, swipe, keys, buttons. */
(function () {
  'use strict';
  var U = window.PortfolioUtil, data = window.PORTFOLIO || {};
  var preview = (/[?&]preview=([^&#]+)/.exec(window.location.search) || [])[1];
  var projects = (data.projects || []).filter(function (p) { return !p.draft || preview === 'all' || preview === p.id; });
  var root = document.querySelector('[data-book]');
  if (!root) return;
  var stage = root.querySelector('.book-stage');
  var ui = {
    prev: root.querySelector('[data-book-prev]'), next: root.querySelector('[data-book-next]'),
    toggle: root.querySelector('[data-book-toggle]'), count: root.querySelector('[data-book-count]')
  };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pf = null, idx = 0, bookEl = null, edgeL, edgeR, N = projects.length;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function pagesHTML() {
    var html = '<div class="page page--cover" data-density="hard" data-cursor-label="OPEN BOOK"><div class="cover"><div><h3 class="cover__title">Projects</h3>' +
      '<p class="cover__sub">Selected work, collected in one book.</p></div>' +
      '<div class="cover__foot"><span>' + U.esc((data.profile && data.profile.name) || '') + '</span><span class="cover__mark"></span></div></div></div>';
    projects.forEach(function (p) {
      var shots = (p.screenshots || []).slice(0, 2);
      html += '<div class="page page--left" data-project="' + p.number + '"><div class="page__inner">' +
        '<div class="page__no" aria-hidden="true">' + pad(p.number) + '</div>' +
        '<figure class="page__shot page__shot--main"><img src="' + U.esc(p.cover) + '" alt="Preview of project ' + p.number + '" decoding="async"><figcaption>Preview</figcaption></figure>' +
        (shots.length ? '<div class="page__thumbs">' + shots.map(function (s, i) { return '<figure class="page__shot"><img src="' + U.esc(s) + '" alt="Screenshot ' + (i + 1) + ' of project ' + p.number + '" decoding="async"></figure>'; }).join('') + '</div>' : '') +
        '</div></div>' +
        '<div class="page page--right" data-project="' + p.number + '"><div class="page__inner">' +
        '<h3 class="page__title">' + U.text(p.title) + '</h3>' +
        '<p class="page__text">' + U.text(p.overview) + '</p>' +
        '<dl class="page__rows"><div><dt>Purpose</dt><dd>' + U.text(p.purpose) + '</dd></div><div><dt>My role</dt><dd>' + U.text(p.role) + '</dd></div></dl>' +
        U.chips(p.technologies, 'page__chips') +
        '<p class="page__status">' + U.text(p.status) + '</p>' +
        '<a class="page__link" data-cursor-label="VIEW PROJECT" href="' + U.esc(p.caseStudy) + '">Explore Full Case Study \u2192</a>' +
        '</div></div>';
    });
    html += '<div class="page page--cover page--back" data-density="hard"><div class="cover"><div></div><div class="cover__foot"><span>Thank you for reading</span><span class="cover__mark"></span></div></div></div>';
    return html;
  }
  function build() { return pagesHTML(); }

  function modeFor() { return stage.parentElement.clientWidth < 640 ? 'portrait' : 'landscape'; }

  function shift(i) {
    var landscape = stage.dataset.mode === 'landscape', last = pf ? pf.getPageCount() - 1 : 0, x = 0;
    if (landscape && i === 0) x = -25; else if (landscape && i === last) x = 25;
    stage.style.transform = x ? 'translateX(' + x + '%)' : '';
  }

  function update(i) {
    idx = i;
    var count = pf.getPageCount(), last = count - 1, open = i > 0 && i < last;
    var no = i >= 1 && i <= 2 * N ? Math.ceil(i / 2) : 0;
    ui.count.textContent = no ? 'Project ' + no + ' of ' + N : (i === 0 ? 'Closed' : 'Back cover');
    ui.prev.disabled = i === 0; ui.next.disabled = i >= last;
    ui.toggle.textContent = i === 0 ? 'Open book' : 'Close book';
    ui.toggle.dataset.action = i === 0 ? 'open' : 'close';
    var p = i / last, portrait = stage.dataset.mode === 'portrait';
    edgeL.style.setProperty('--p', portrait ? 0 : p.toFixed(3));
    edgeR.style.setProperty('--p', portrait ? (1 - p).toFixed(3) : (1 - p).toFixed(3));
    stage.dataset.state = i === 0 ? 'closed' : (i >= last ? 'back' : 'open');
    shift(i);
  }


  /* ---------- Typing layer (an extra layer on top of the real page flip) ----------
     When a project spread settles after a flip, its title and short lines are typed with a blinking caret,
     longer paragraphs fade in line, screenshots reveal with a soft wipe. Each project plays once only.
     Text keeps its final layout from the start (typed part visible, remainder hidden), so nothing jumps. */
  var playedL = {}, playedR = {}, MAXTYPE = 80, lastCaret = null;
  var TYPE_SEL = '.page__title, .page__text, .page__rows dd, .page__status';
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  function prep(el) {
    if (reduce) return;
    el.querySelectorAll('.page--left[data-project]').forEach(function (pg) { if (!playedL[pg.dataset.project]) pg.classList.add('is-pending'); });
    el.querySelectorAll('.page--right[data-project]').forEach(function (pg) {
      if (playedR[pg.dataset.project]) return;
      pg.classList.add('is-pending');
      pg.querySelectorAll(TYPE_SEL).forEach(function (t) {
        var full = t.textContent.trim(); t._orig = t.innerHTML;
        if (full.length > MAXTYPE) { t.classList.add('ty-wait'); return; }      /* long text: fade, never type */
        var ph = !!t.querySelector('.is-placeholder');
        t._full = full;
        t.innerHTML = '<span class="visually-hidden">' + U.esc(full) + '</span><span class="ty' + (ph ? ' is-placeholder' : '') + '" aria-hidden="true"><span class="ty-done"></span><span class="ty-rest">' + U.esc(full) + '</span></span>';
      });
      pg.querySelectorAll('.page__chips, .page__link').forEach(function (t) { t.classList.add('ty-wait'); });
    });
  }

  function typeInto(t) {
    return new Promise(function (resolve) {
      var ty = t.querySelector('.ty'), done = ty.querySelector('.ty-done'), rest = ty.querySelector('.ty-rest');
      var full = t._full, i = 0, per = Math.max(10, Math.min(24, 560 / full.length));
      if (lastCaret && lastCaret.parentNode) lastCaret.remove();
      var caret = document.createElement('i'); caret.className = 'ty-caret'; ty.insertBefore(caret, rest); lastCaret = caret;
      (function step() {
        i++; done.textContent = full.slice(0, i); rest.textContent = full.slice(i);
        if (i < full.length) setTimeout(step, per); else resolve();
      })();
    });
  }

  function finalize(pg) {
    pg.querySelectorAll(TYPE_SEL).forEach(function (t) { if (t._orig != null && t.querySelector('.ty')) t.innerHTML = t._orig; });
    if (lastCaret && lastCaret.parentNode) lastCaret.remove();
  }

  async function playRight(n) {
    var pg = stage.querySelector('.page--right[data-project="' + n + '"]');
    if (!pg || playedR[n]) return;
    playedR[n] = true; pg.classList.remove('is-pending');
    var order = pg.querySelectorAll('.page__title, .page__text, .page__rows dd, .page__status, .page__chips, .page__link');
    for (var k = 0; k < order.length; k++) {
      var t = order[k];
      if (t._full) { await typeInto(t); await wait(50); }
      else { t.classList.add('ty-in'); await wait(90); }
    }
    setTimeout(function () { finalize(pg); }, 1800);                         /* caret lingers, then clean text is restored */
  }

  function playLeft(n) {
    var pg = stage.querySelector('.page--left[data-project="' + n + '"]');
    if (!pg || playedL[n]) return;
    playedL[n] = true;
    pg.querySelectorAll('.page__thumbs .page__shot img').forEach(function (im, i) { im.style.transitionDelay = (0.25 + i * 0.15) + 's'; });
    pg.classList.remove('is-pending');
  }

  function reveal(i) {
    if (reduce || i < 1 || i > 2 * N) return;
    var n = Math.ceil(i / 2);
    if (stage.dataset.mode === 'landscape') { playLeft(n); playRight(n); }
    else if (i % 2) playLeft(n); else playRight(n);
  }

  function init(startPage) {
    if (pf) { try { pf.destroy(); } catch (e) {} pf = null; }
    stage.classList.add('is-loading');
    stage.querySelectorAll('.book').forEach(function (n) { n.remove(); });
    stage.dataset.mode = modeFor();
    bookEl = document.createElement('div');
    bookEl.className = 'book';
    bookEl.innerHTML = build();
    U.guardImages(bookEl);
    prep(bookEl);
    var shadow = stage.querySelector('.book__shadow');
    stage.insertBefore(bookEl, shadow);
    pf = new St.PageFlip(bookEl, {
      width: 520, height: 700, size: 'stretch', minWidth: 260, maxWidth: 520, minHeight: 350, maxHeight: 700,
      showCover: true, maxShadowOpacity: 0.45, drawShadow: !reduce, flippingTime: reduce ? 200 : 900,
      usePortrait: true, startPage: startPage || 0, swipeDistance: 20, mobileScrollSupport: true,
      clickEventForward: true, useMouseEvents: true, showPageCorners: true, autoSize: true
    });
    pf.loadFromHTML(bookEl.querySelectorAll('.page'));
    /* Page-turn sound. StPageFlip decides "this release turns the page" inside animateFlippingTo(..., true); hooking it plays
       the sound exactly when the turn begins and never for a drag that snaps back or for the corner hint. */
    var fc = pf.flipController, snd = function (ms) { if (window.Portfolio && Portfolio.bookSound) Portfolio.bookSound.play(ms); };
    if (fc && typeof fc.animateFlippingTo === 'function') {
      var origAnim = fc.animateFlippingTo;
      fc.animateFlippingTo = function (from, to, isTurned) {
        if (isTurned === true) {   /* same duration maths as StPageFlip, so a short drag-release gets a proportionally short sound */
          var steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y)), full = pf.getSettings().flippingTime;
          snd(steps >= 1000 ? full : steps / 1000 * full);
        }
        return origAnim.apply(this, arguments);
      };
    } else { pf.on('flip', snd); }             /* fallback: sound at the end of the turn */
    if (pf.getPageCount() % 2) console.warn('[book] odd page count (' + pf.getPageCount() + '): each project needs a left AND a right page.');
    var queued = null;           /* StPageFlip fires 'flip' as the turn starts: wait for the 'read' state, then type */
    pf.on('flip', function (e) { update(e.data); queued = e.data; if (pf.getState() === 'read') { reveal(queued); queued = null; } });
    pf.on('changeOrientation', function (e) { stage.dataset.mode = e.data; update(pf.getCurrentPageIndex()); });
    pf.on('changeState', function (e) {
      if ((e.data === 'flipping' || e.data === 'user_fold') && idx === 0) bringIntoView();
      if ((e.data === 'flipping' || e.data === 'user_fold') && idx === 0) shift(1);   /* start centring as the cover lifts */
      if (e.data === 'read') { shift(idx); if (queued != null) { var q = queued; queued = null; reveal(q); } }
    });
    update(pf.getCurrentPageIndex());
    if (startPage > 0) reveal(pf.getCurrentPageIndex());
    stage.classList.remove('is-loading');
    api.pf = pf;
  }

  /* Make sure the whole book (and the case-study link at its foot) is on screen when it opens. */
  function bringIntoView() {
    var r = stage.getBoundingClientRect(), vh = window.innerHeight;
    if (r.top < 90 || r.bottom > vh - 24) stage.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }
  function open() { if (idx === 0) { shift(1); pf.flipNext(); } }
  function close() {
    if (idx === 0) return;
    stage.style.transform = stage.dataset.mode === 'landscape' ? 'translateX(-25%)' : '';
    pf.flip(0);
    setTimeout(function () { if (pf && pf.getCurrentPageIndex() !== 0) pf.turnToPage(0); update(pf.getCurrentPageIndex()); }, reduce ? 400 : 1600);
  }
  function next() { if (idx === 0) shift(1); pf.flipNext(); }
  function prev() { pf.flipPrev(); }

  var api = { played: function () { return { left: Object.keys(playedL), right: Object.keys(playedR) }; }, open: open, close: close, next: next, prev: prev, get index() { return idx; }, pf: null };
  window.Portfolio = window.Portfolio || {}; window.Portfolio.book = api;

  if (!window.St || !projects.length) {          /* graceful fallback if the library cannot load */
    stage.outerHTML = '<div class="book-fallback">' + projects.map(function (p) {
      return '<p><a href="' + U.esc(p.caseStudy) + '">' + U.text(p.title) + '</a></p>'; }).join('') + '</div>';
    return;
  }

  ui.next.addEventListener('click', next);
  ui.prev.addEventListener('click', prev);
  ui.toggle.addEventListener('click', function () {
    if (idx === 0) bringIntoView();
    (idx === 0 ? open : close)();
  });
  stage.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'Escape' && idx > 0) { close(); }
  });

  /* Rebuild when the layout switches between one page and two pages. */
  var timer;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (modeFor() !== stage.dataset.mode) {
        var i = pf.getCurrentPageIndex();
        init(modeFor() === 'landscape' && i % 2 === 0 && i > 0 && i < pf.getPageCount() - 1 ? i - 1 : i);
      }
    }, 200);
  });

  edgeL = stage.querySelector('.book__edge--l'); edgeR = stage.querySelector('.book__edge--r');
  init(0);
})();
