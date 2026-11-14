/* ink-within.js — "The Ink Within": a floating notebook icon that opens a sheet of white paper on which a pencil writes.
   How the writing works: js/ink-glyphs.js holds real single-stroke pen paths for a connected cursive alphabet. The text is laid
   out into those paths, and a pencil is moved along them at a natural, varying speed; ink is drawn on a <canvas> exactly where the
   pencil tip is, so the tip is always on the letter being written. i-dots and t-bars are added after the word, like by hand.
   Questions and answers live in js/config/ink-within.js (predefined text, no AI, no network). */
(function () {
  'use strict';
  var CFG = window.INK_WITHIN, GL = window.INK_GLYPHS && window.INK_GLYPHS.g;
  if (!CFG || !GL || !document.body) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var QS = CFG.questions || [];
  var MS_PER_CHAR_WELCOME = 58, MS_PER_CHAR = 36, MIN_MS = 1800, MAX_MS = 10000, PEN_UP_SPEED = 3.4, START_DELAY = 650;

  /* ---------- tiny helpers ---------- */
  function el(tag, cls, attrs) { var n = document.createElement(tag); if (cls) n.className = cls; for (var k in (attrs || {})) n.setAttribute(k, attrs[k]); return n; }
  function clean(t) {
    return String(t || '').replace(/[\u2018\u2019\u02BC]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/\u2026/g, '...')
      .replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
  }
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function glyph(ch) { return GL[ch] || GL['?'] || [10, []]; }

  /* ---------- text -> pen paths ---------- */
  function wordWidth(w, k) { var s = 0; for (var i = 0; i < w.length; i++) s += glyph(w[i])[0]; return s * k; }
  function smooth(pts, n) {                       /* corner-cutting: turns the font's polylines into soft curves, keeps both end points */
    for (var it = 0; it < n && pts.length > 2; it++) {
      var out = [pts[0]];
      for (var i = 0; i < pts.length - 1; i++) { var a = pts[i], b = pts[i + 1]; out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]], [0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]); }
      out.push(pts[pts.length - 1]); pts = out;
    }
    return pts;
  }
  function plen(pts) { var s = 0; for (var i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; }
  function mkPath(pts, down) {
    var cum = [0]; for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts: pts, down: down, cum: cum, len: cum[cum.length - 1] };
  }

  function layout(text, innerW) {
    var k = Math.min(1.42, Math.max(1.22, innerW / 290)), rnd = rng(hash(text));
    var space = glyph(' ')[0] * k * 0.78, words = clean(text).split(' ').filter(Boolean), lines = [], cur = { w: [], width: 0 };
    words.forEach(function (w) {
      var ww = wordWidth(w, k), sc = ww > innerW ? innerW / ww : 1; ww *= sc;
      if (cur.w.length && cur.width + space + ww > innerW) { lines.push(cur); cur = { w: [], width: 0 }; }
      cur.width += (cur.w.length ? space : 0) + ww; cur.w.push({ t: w, width: ww, sc: sc });
    });
    if (cur.w.length) lines.push(cur);
    var pitch = 34 * k, first = 22 * k + 6, height = Math.ceil(first + Math.max(0, lines.length - 1) * pitch + 16 * k + 8);
    var paths = [], pen = null;
    function add(pts, down) { var p = mkPath(pts, down); paths.push(p); pen = pts[pts.length - 1]; }
    lines.forEach(function (ln, li) {
      var x = 8 + (rnd() - 0.5) * 2, base = first + li * pitch, drift = (rnd() - 0.5) * 1.4;
      ln.w.forEach(function (word) {
        var main = [], deferred = [], cur = null, last = null, wy = (rnd() - 0.5) * 1.6, sc0 = k * word.sc;
        for (var ci = 0; ci < word.t.length; ci++) {
          var g = glyph(word.t[ci]), sc = sc0 * (1 + (rnd() - 0.5) * 0.06);
          for (var si = 0; si < g[1].length; si++) {
            var st = g[1][si], pts = [];
            for (var j = 0; j < st.length; j += 2) { var px = x + st[j] * sc; pts.push([px, base + (st[j + 1] - 9) * sc + wy + Math.sin(px * 0.012 + li * 1.9) * 0.9 + drift * (px / innerW)]); }
            if (!pts.length) continue;
            if (last && Math.hypot(last[0] - pts[0][0], last[1] - pts[0][1]) < 2.4 * sc) { cur.push.apply(cur, pts); last = pts[pts.length - 1]; }
            else if (si > 0 && cur && plen(pts) < 15 * sc) { deferred.push(pts); }          /* i-dots, t-bars: added after the word */
            else { cur = pts; main.push(cur); last = pts[pts.length - 1]; }
          }
          x += g[0] * sc;
        }
        main.forEach(function (m) { var p = smooth(m, 2); if (pen && Math.hypot(pen[0] - p[0][0], pen[1] - p[0][1]) > 0.8) add([pen, p[0]], false); add(p, true); });
        deferred.sort(function (a, b) { return a[0][0] - b[0][0]; }).forEach(function (d) { var p = smooth(d, 1); if (pen) add([pen, p[0]], false); add(p, true); });
        x += space;
      });
    });
    var downLen = 0, upLen = 0; paths.forEach(function (p) { if (p.down) downLen += p.len; else upLen += p.len; });
    return { paths: paths, height: height, down: downLen, up: upLen, chars: clean(text).length };
  }

  /* ---------- DOM ---------- */
  var root = el('div', 'ink'), fab = el('button', 'ink-fab', { type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-label': 'Open The Ink Within' });
  fab.innerHTML = '<svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">' +
    '<rect x="6" y="4.5" width="19" height="26" rx="3" fill="#fff" stroke="currentColor" stroke-width="1.7"/>' +
    '<path class="ink-fab__line" d="M10 11c1.5-3 3-3 4 0s3 3 4 0 2.5-2 3-1" fill="none" stroke="#C58B69" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M10 17.5c1.5-2 3-2 4 0s2.2 1.6 3.4 0" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="1.3" stroke-linecap="round"/>' +
    '<path d="M10 23.5c1.3-1.6 2.6-1.6 3.6 0" fill="none" stroke="currentColor" stroke-opacity=".3" stroke-width="1.3" stroke-linecap="round"/>' +
    '<g class="ink-fab__pencil"><g transform="translate(25.5 25) rotate(40)"><rect x="-2.3" y="-14" width="4.6" height="15" fill="#263B32"/><rect x="-2.3" y="-14" width="1.5" height="15" fill="#3b5a4d"/>' +
    '<rect x="-2.3" y="-17" width="4.6" height="3" rx="1" fill="#C58B69"/><rect x="-2.3" y="-14.3" width="4.6" height="1.5" fill="#d7dad3"/>' +
    '<path d="M-2.3 1h4.6L0 6.3z" fill="#EBD9B8"/><path d="M-.75 4.4h1.5L0 6.3z" fill="#2c2f33"/></g></g></svg><span class="ink-fab__tip" aria-hidden="true">The Ink Within</span>';

  var overlay = el('div', 'ink-overlay'), paper = el('section', 'ink-paper', { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'The Ink Within', tabindex: '-1' });
  var head = el('div', 'ink-paper__head'), dateEl = el('span', 'ink-date');
  var backBtn = el('button', 'ink-btn ink-back', { type: 'button' }); backBtn.hidden = true; backBtn.textContent = '\u2190 Questions';
  var closeBtn = el('button', 'ink-btn ink-close', { type: 'button', 'aria-label': 'Close The Ink Within' });
  closeBtn.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>';
  head.appendChild(dateEl); head.appendChild(backBtn); head.appendChild(closeBtn);
  var page = el('div', 'ink-page'), qtitle = el('h2', 'ink-qtitle'); qtitle.hidden = true;
  var stage = el('div', 'ink-stage'), canvas = el('canvas', 'ink-canvas', { 'aria-hidden': 'true' }), ctx = canvas.getContext('2d');
  stage.appendChild(canvas);
  var actions = el('div', 'ink-actions'); actions.hidden = true;
  var list = el('ol', 'ink-qs', { 'aria-label': 'Questions' }); list.hidden = true;
  page.appendChild(qtitle); page.appendChild(stage); page.appendChild(actions); page.appendChild(list);
  var hint = el('p', 'ink-hint', { 'aria-hidden': 'true' }); hint.textContent = 'tap the paper to finish writing';
  var pencil = el('div', 'ink-pencil', { 'aria-hidden': 'true' });
  pencil.innerHTML = '<svg viewBox="0 0 24 170" focusable="false"><path d="M6 36h12v104H6z" fill="#263B32"/><path d="M6 36h4v104H6z" fill="#3b5a4d"/><path d="M14 36h4v104h-4z" fill="#1b2c25"/>' +
    '<path d="M9.3 36v104" stroke="#fff" stroke-opacity=".16" stroke-width="1"/><path d="M6 140q3 5 6 0t6 0l-4.2 19.5h-3.6z" fill="#EBD9B8"/><path d="M12 140q3 5 6 0l-4.2 19.5H12z" fill="#d8c39c"/>' +
    '<path d="M10.2 159.5h3.6L12 168z" fill="#33363b"/><rect x="6" y="26" width="12" height="12" fill="#cfd3cc"/><path d="M6 29h12M6 33h12" stroke="#a9aea5" stroke-width="1"/>' +
    '<rect x="6" y="6" width="12" height="21" rx="3.5" fill="#C58B69"/><path d="M6 20h12" stroke="#a9704f" stroke-width="1.2"/></svg>';
  var live = el('div', 'ink-sr', { 'aria-live': 'polite' });
  paper.appendChild(head); paper.appendChild(page); paper.appendChild(hint); paper.appendChild(pencil); paper.appendChild(live);
  overlay.appendChild(paper); root.appendChild(fab); root.appendChild(overlay); document.body.appendChild(root);
  var pencilSvg = pencil.querySelector('svg');

  /* ---------- the pencil + ink ---------- */
  var runId = 0, writer = null, current = null, isOpen = false, lastFocus = null, startTimer = 0;

  function sizeCanvas(h) {
    var w = stage.clientWidth || 300, dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    stage.style.height = h + 'px';
  }
  var inkRnd = rng(7);
  function inkSeg(a, b, press) {                              /* graphite: a soft dark core, a lighter grainy edge and a few specks */
    var w = 1.25 + 0.55 * press;
    ctx.strokeStyle = 'rgba(40,43,48,0.80)'; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,43,48,0.26)'; ctx.lineWidth = w * 0.55; var j = (inkRnd() - 0.5) * 0.9;
    ctx.beginPath(); ctx.moveTo(a[0] + j, a[1] - j); ctx.lineTo(b[0] + j, b[1] - j); ctx.stroke();
    if (inkRnd() < 0.55) { ctx.fillStyle = 'rgba(40,43,48,0.20)'; ctx.fillRect(b[0] + (inkRnd() - 0.5) * 2.6, b[1] + (inkRnd() - 0.5) * 2.6, 0.8, 0.8); }
  }
  function pointAt(p, d) {
    var c = p.cum, i = 0; while (i < c.length - 2 && c[i + 1] < d) i++;
    var s = c[i + 1] - c[i], t = s > 0 ? (d - c[i]) / s : 0; if (t < 0) t = 0; if (t > 1) t = 1;
    return [p.pts[i][0] + (p.pts[i + 1][0] - p.pts[i][0]) * t, p.pts[i][1] + (p.pts[i + 1][1] - p.pts[i][1]) * t];
  }
  function drawRange(p, d0, d1) {
    if (!p.down || p.pts.length < 2) return;
    var press = 0.5 + 0.5 * Math.sin(Math.PI * Math.min(1, Math.max(0, ((d0 + d1) / 2) / (p.len || 1))));
    var a = pointAt(p, d0), steps = Math.max(1, Math.ceil((d1 - d0) / 2.5));
    for (var s = 1; s <= steps; s++) { var b = pointAt(p, d0 + (d1 - d0) * s / steps); inkSeg(a, b, press); a = b; }
  }
  function renderInstant(lay) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lay.paths.forEach(function (p) { if (!p.down) return; for (var i = 1; i < p.pts.length; i++) inkSeg(p.pts[i - 1], p.pts[i], 0.7); });
  }

  var pAngle = 32, pLift = 0, pVis = false;
  function placePencil(tip, down, ts) {
    var x = page.offsetLeft + stage.offsetLeft + tip[0] - page.scrollLeft, y = page.offsetTop + stage.offsetTop + tip[1] - page.scrollTop;
    pLift += ((down ? 0 : 1) - pLift) * 0.25;
    var vis = y > page.offsetTop - 4 && y < page.offsetTop + page.clientHeight + 4;
    if (vis !== pVis) { pencil.style.visibility = vis ? 'visible' : 'hidden'; pVis = vis; }
    if (down) { x += (Math.random() - 0.5) * 0.5; y += (Math.random() - 0.5) * 0.5; }
    var ang = pAngle + Math.sin(ts / 330) * 1.1 - pLift * 2.5;
    pencil.style.transform = 'translate3d(' + (x + pLift * 4).toFixed(1) + 'px,' + (y - pLift * 7).toFixed(1) + 'px,0) rotate(' + ang.toFixed(2) + 'deg)';
    pencilSvg.style.setProperty('--lift', pLift.toFixed(2));
  }
  function followScroll(tipY) {
    var rel = stage.offsetTop + tipY - page.scrollTop, room = page.clientHeight;
    if (rel > room - 96) page.scrollTop += (rel - (room - 96)) * 0.22 + 0.5;
    else if (rel < 24 && page.scrollTop > 0) page.scrollTop -= (24 - rel) * 0.22 + 0.5;
  }
  function pencilEnter() { pencilSvg.style.animation = 'none'; void pencilSvg.getBoundingClientRect(); pencilSvg.style.animation = ''; }

  function Writer(lay, ms, onDone) {
    var paths = lay.paths, pi = 0, d = 0, last = 0, raf = 0, stopped = false;
    var vd = (lay.down + lay.up / PEN_UP_SPEED) / (ms / 1000) * 1.12;
    function finish(instant) {
      stopped = true; cancelAnimationFrame(raf);
      if (instant) renderInstant(lay);
      root.classList.remove('is-writing'); onDone && onDone();
    }
    function frame(ts) {
      if (stopped) return;
      var dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016); last = ts;
      var budget = dt, tip = paths.length ? paths[Math.min(pi, paths.length - 1)].pts[0] : [0, 0], down = true;
      while (budget > 0 && pi < paths.length) {
        var p = paths[pi], u = p.len ? d / p.len : 1, mod = 0.58 + 0.42 * Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
        var v = (p.down ? vd : vd * PEN_UP_SPEED) * mod, adv = v * budget, remain = p.len - d;
        if (adv >= remain) { drawRange(p, d, p.len); budget -= remain / v; pi++; d = 0; if (pi < paths.length) { tip = paths[pi].pts[0]; down = paths[pi].down; } else { tip = p.pts[p.pts.length - 1]; } }
        else { drawRange(p, d, d + adv); d += adv; budget = 0; tip = pointAt(p, d); down = p.down; }
      }
      placePencil(tip, down, ts); followScroll(tip[1]);
      if (pi >= paths.length) { finish(false); return; }
      raf = requestAnimationFrame(frame);
    }
    this.start = function () { ctx.clearRect(0, 0, canvas.width, canvas.height); root.classList.add('is-writing'); pencilEnter(); raf = requestAnimationFrame(frame); };
    this.finishNow = function () { if (!stopped) finish(true); };
    this.cancel = function () { stopped = true; cancelAnimationFrame(raf); root.classList.remove('is-writing'); };
  }

  /* write(text, onDone): lay the text out on the sheet and have the pencil write it (instantly when asked / reduced motion) */
  function write(text, onDone, opts) {
    opts = opts || {}; var id = ++runId; clearTimeout(startTimer);
    if (writer) { writer.cancel(); writer = null; }
    var w = stage.clientWidth || 300, lay = layout(text, w - 18);
    current = { text: text, lay: lay };
    sizeCanvas(lay.height); live.textContent = clean(text);
    var instant = opts.instant || reduce.matches;
    if (instant) { renderInstant(lay); root.classList.remove('is-writing'); onDone && onDone(); return; }
    var ms = Math.max(MIN_MS, Math.min(MAX_MS, lay.chars * (opts.slow ? MS_PER_CHAR_WELCOME : MS_PER_CHAR)));
    ctx.clearRect(0, 0, canvas.width, canvas.height); pVis = false;
    var first = lay.paths[0] ? lay.paths[0].pts[0] : [0, 0]; placePencil(first, false, 0);
    startTimer = setTimeout(function () {
      if (id !== runId) return;
      writer = new Writer(lay, ms, function () { if (id !== runId) return; writer = null; onDone && onDone(); });
      writer.start();
    }, opts.delay || 0);
  }

  /* ---------- views ---------- */
  function resetView() { qtitle.hidden = true; list.hidden = true; actions.hidden = true; actions.innerHTML = ''; backBtn.hidden = true; page.scrollTop = 0; }
  function showQuestions() {
    list.innerHTML = '';
    QS.forEach(function (q, i) {
      var li = el('li'), b = el('button', 'ink-q', { type: 'button' }); li.style.setProperty('--i', i);
      b.innerHTML = '<span class="ink-q__n"></span><span class="ink-q__t"></span>'; b.firstChild.textContent = (i + 1) + '.'; b.lastChild.textContent = q.q;
      b.addEventListener('click', function () { answer(i); }); li.appendChild(b); list.appendChild(li);
    });
    list.hidden = false;
    var first = list.querySelector('.ink-q'); if (first && isOpen && !reduce.matches) { /* keep focus on the paper; no jump */ }
  }
  function welcome(opts) {
    resetView(); opts = opts || {};
    write(CFG.welcome, function () { if (!isOpen) return; showQuestions(); }, { slow: true, delay: opts.instant ? 0 : START_DELAY, instant: opts.instant });
  }
  function answer(i) {
    var q = QS[i]; if (!q) return;
    resetView(); qtitle.textContent = q.q; qtitle.hidden = false; backBtn.hidden = false; backBtn.textContent = '\u2190 ' + (CFG.backLabel || 'Back to questions');
    write(q.a, function () { if (isOpen) showActions(q); }, { delay: 380 });
    backBtn.focus({ preventScroll: true });
  }
  function resumeAvailable() {
    var r = window.PORTFOLIO && window.PORTFOLIO.resume; if (!r || !r.file) return Promise.resolve(false);
    if (location.protocol === 'file:' || !window.fetch) return Promise.resolve(true);
    return fetch(r.file, { method: 'HEAD' }).then(function (res) { return res.ok; }, function () { return false; });
  }
  function showActions(q) {
    actions.innerHTML = '';
    (q.actions || []).forEach(function (a) {
      if (a.resume) {
        var r = (window.PORTFOLIO && window.PORTFOLIO.resume) || {}, link = el('a', 'ink-act'); link.textContent = a.label || 'Download resume';
        link.setAttribute('aria-disabled', 'true'); actions.appendChild(link);
        resumeAvailable().then(function (ok) {
          if (ok) { link.href = r.file; link.setAttribute('download', r.downloadName || ''); link.removeAttribute('aria-disabled'); }
          else { link.textContent = 'Resume coming soon'; }
        });
        return;
      }
      if (!a.href || /^\s*\[/.test(a.href)) return;                         /* placeholder such as "[Add GitHub URL]": skip */
      var l = el('a', 'ink-act'); l.textContent = a.label; l.href = a.href;
      if (/^https?:/i.test(a.href)) { l.target = '_blank'; l.rel = 'noopener noreferrer'; }
      else if (a.href.charAt(0) === '#') l.addEventListener('click', function () { close(true); });
      actions.appendChild(l);
    });
    var back = el('button', 'ink-act ink-act--ghost', { type: 'button' }); back.textContent = '\u2190 ' + (CFG.backLabel || 'Back to questions');
    back.addEventListener('click', toQuestions); actions.appendChild(back);
    actions.hidden = false; actions.style.animation = 'none'; void actions.offsetWidth; actions.style.animation = '';
    page.scrollTo ? page.scrollTo({ top: page.scrollHeight, behavior: reduce.matches ? 'auto' : 'smooth' }) : (page.scrollTop = page.scrollHeight);
  }
  function toQuestions() {
    if (writer) { writer.cancel(); writer = null; }
    resetView(); write(CFG.welcome, null, { instant: true }); showQuestions();
    var f = list.querySelector('.ink-q'); if (f) f.focus({ preventScroll: true });
  }

  /* ---------- open / close ---------- */
  function open() {
    if (isOpen) return; isOpen = true; lastFocus = document.activeElement;
    dateEl.textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    root.classList.add('is-open'); fab.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { paper.focus({ preventScroll: true }); welcome(); });
  }
  function close(keepFocus) {
    if (!isOpen) return; isOpen = false; runId++; clearTimeout(startTimer);
    if (writer) { writer.cancel(); writer = null; }
    root.classList.remove('is-open', 'is-writing'); fab.setAttribute('aria-expanded', 'false'); pencil.style.visibility = 'hidden'; pVis = false;
    if (!keepFocus && lastFocus && lastFocus.focus) { try { fab.focus({ preventScroll: true }); } catch (e) {} }
    setTimeout(function () { if (!isOpen) { resetView(); list.innerHTML = ''; ctx.clearRect(0, 0, canvas.width, canvas.height); current = null; } }, 450);
  }

  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', function () { close(); });
  backBtn.addEventListener('click', toQuestions);
  overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
  overlay.addEventListener('wheel', function (e) { if (!paper.contains(e.target)) e.preventDefault(); }, { passive: false });
  overlay.addEventListener('touchmove', function (e) { if (!paper.contains(e.target)) e.preventDefault(); }, { passive: false });
  page.addEventListener('click', function (e) { if (writer && !e.target.closest('a, button')) writer.finishNow(); });
  paper.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if (e.key === 'Enter' && writer && e.target === paper) { writer.finishNow(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(paper.querySelectorAll('button, a[href]'), function (n) { return !n.hidden && !n.closest('[hidden]') && n.offsetParent !== null; });
    if (!f.length) { e.preventDefault(); paper.focus(); return; }
    var first = f[0], lastEl = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === paper)) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('keydown', function (e) { if (isOpen && e.key === 'Escape') close(); });

  var resizeT = 0, lastW = 0;
  window.addEventListener('resize', function () {
    if (!isOpen) return; clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var w = stage.clientWidth; if (!current || Math.abs(w - lastW) < 2) return; lastW = w;
      var t = current.text, wasWriting = !!writer; if (writer) { writer.cancel(); writer = null; }
      write(t, wasWriting ? function () { if (isOpen) { if (!qtitle.hidden) { var q = QS.filter(function (x) { return x.q === qtitle.textContent; })[0]; if (q) showActions(q); } else showQuestions(); } } : null, { instant: true });
    }, 160);
  });

  window.Portfolio = window.Portfolio || {}; window.Portfolio.inkWithin = { open: open, close: close };
})();
