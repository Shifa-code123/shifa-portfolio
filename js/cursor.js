/* cursor.js — frosted-glass orb cursor.
   Desktop mouse only; off for touch and prefers-reduced-motion. pointer-events:none, so clicks and
   text selection are untouched. Add data-cursor-label="TEXT" to any element for a contextual label. */
(function () {
  'use strict';
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduce.matches) return;

  var root = document.documentElement;
  var el = document.createElement('div');
  el.className = 'gc';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="gc__orb"><span class="gc__label"></span></div>';
  document.body.appendChild(el);
  var labelEl = el.querySelector('.gc__label');
  root.classList.add('has-glass-cursor');

  var INTERACTIVE = 'a, button, summary, label, [role="button"], [data-cursor="hover"]';
  var TEXT = 'input, textarea, select, [contenteditable]';
  var tx = 0, ty = 0, x = 0, y = 0, press = 1, targetPress = 1;
  var seen = false, running = false, last = 0, state = 'default', tone = 'light', label = '';

  function set(nextState, nextTone, nextLabel) {
    if (nextState !== state) { state = nextState; el.setAttribute('data-state', state); }
    if (nextTone !== tone) { tone = nextTone; el.setAttribute('data-tone', tone); }
    if (nextLabel !== label) { label = nextLabel; if (nextLabel) labelEl.textContent = nextLabel; }
  }
  el.setAttribute('data-state', state); el.setAttribute('data-tone', tone);

  function classify(t) {
    if (!t || !t.closest) return;
    var th = t.closest('[data-theme]');
    var nextTone = th && th.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    var lab = t.closest('[data-cursor-label]');
    if (t.closest('[data-cursor="hide"]')) set('hidden', nextTone, label);
    else if (t.closest(TEXT)) set('text', nextTone, label);
    else if (lab) set('label', nextTone, lab.getAttribute('data-cursor-label'));
    else if (t.closest(INTERACTIVE)) set('hover', nextTone, label);
    else set('default', nextTone, label);
  }

  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.05); last = now;
    var k = 1 - Math.exp(-dt * 11);                 /* soft trailing lag, frame-rate independent */
    x += (tx - x) * k; y += (ty - y) * k;
    press += (targetPress - press) * (1 - Math.exp(-dt * 16));
    el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + press.toFixed(3) + ')';
    if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1 && Math.abs(targetPress - press) < 0.002) { running = false; return; }
    requestAnimationFrame(frame);
  }
  function start() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  function show() { el.classList.add('is-visible'); }
  function hide() { el.classList.remove('is-visible'); }

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') { hide(); return; }
    tx = e.clientX; ty = e.clientY;
    if (!seen) { x = tx; y = ty; seen = true; }
    classify(e.target); show(); start();
  }, { passive: true });
  document.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') { targetPress = 0.88; start(); } });
  document.addEventListener('pointerup', function () { targetPress = 1; start(); });
  root.addEventListener('mouseleave', hide);
  root.addEventListener('mouseenter', function () { if (seen) show(); });
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', function () { if (document.hidden) hide(); });
  window.Portfolio = window.Portfolio || {}; window.Portfolio.cursor = { get state() { return state; }, get label() { return label; } };
})();
