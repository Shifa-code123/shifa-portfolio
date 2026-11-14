/* effects.js — hero pointer parallax, gentle scroll parallax, magnetic buttons.
   Pointer effects are off for touch and prefers-reduced-motion. Scroll parallax uses CSS variables only. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce) return;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* Scroll parallax: sets --sy (-1..1) on [data-parallax] while visible. */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var ticking = false;
  function scrollTick() {
    ticking = false;
    var vh = window.innerHeight;
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
      el.style.setProperty('--sy', (-clamp(p, -1, 1)).toFixed(3));
    });
  }
  if (items.length) {
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(scrollTick); } }, { passive: true });
    scrollTick();
  }

  if (!fine) return;

  /* Hero: portrait and name drift slightly against the pointer. */
  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var tx = 0, ty = 0, cx = 0, cy = 0, run = false;
    var loop = function () {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      hero.style.setProperty('--px', cx.toFixed(3)); hero.style.setProperty('--py', cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) requestAnimationFrame(loop); else run = false;
    };
    var kick = function () { if (!run) { run = true; requestAnimationFrame(loop); } };
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
      kick();
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
  }

  /* Magnetic buttons */
  document.querySelectorAll('[data-magnetic]').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = el.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = 'translate3d(' + (dx * 14).toFixed(1) + 'px,' + (dy * 10).toFixed(1) + 'px,0)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });
})();
