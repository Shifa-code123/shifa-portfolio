/* eye-tracking.js — subtle cursor-directed iris movement for the hero portrait.
   The original eyelids, lashes and glasses remain part of the portrait; only the iris layers move. */
(function () {
  'use strict';

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reducedMotion) return;

  var figure = document.querySelector('[data-hero-eyes]');
  if (!figure) return;

  var eyes = Array.prototype.slice.call(figure.querySelectorAll('.hero__iris'));
  if (!eyes.length) return;

  var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  var raf = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function render() {
    raf = 0;
    currentX += (targetX - currentX) * 0.16;
    currentY += (targetY - currentY) * 0.16;

    eyes.forEach(function (eye, index) {
      /* Tiny per-eye variation avoids a perfectly mechanical, duplicated movement. */
      var factor = index === 0 ? 0.96 : 1;
      eye.style.setProperty('--gaze-x', (currentX * factor).toFixed(2) + 'px');
      eye.style.setProperty('--gaze-y', (currentY * factor).toFixed(2) + 'px');
    });

    if (Math.abs(targetX - currentX) > 0.04 || Math.abs(targetY - currentY) > 0.04) {
      raf = requestAnimationFrame(render);
    }
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(render);
  }

  document.addEventListener('pointermove', function (event) {
    if (event.pointerType !== 'mouse') return;

    var rect = figure.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    /* Eye midpoint in the source portrait, expressed as normalized image coordinates. */
    var eyeCenterX = rect.left + rect.width * 0.504;
    var eyeCenterY = rect.top + rect.height * 0.29;

    /* Clamp travel so the irises stay comfortably inside the original eyelid opening. */
    targetX = clamp((event.clientX - eyeCenterX) / (rect.width * 0.42), -1, 1) * 4.2;
    targetY = clamp((event.clientY - eyeCenterY) / (rect.height * 0.38), -1, 1) * 2.8;
    schedule();
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', function () {
    targetX = 0;
    targetY = 0;
    schedule();
  });

  window.addEventListener('blur', function () {
    targetX = 0;
    targetY = 0;
    schedule();
  });

  /* Start from the neutral, forward-looking position. */
  eyes.forEach(function (eye) {
    eye.style.setProperty('--gaze-x', '0px');
    eye.style.setProperty('--gaze-y', '0px');
  });
})();
