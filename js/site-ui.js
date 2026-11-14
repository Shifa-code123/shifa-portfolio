/* site-ui.js — small page-level extras shared by the main page and the case-study pages:
   scroll progress bar, back-to-top button, loader hand-off and the Download Resume buttons. */
(function () {
  'use strict';
  var doc = document.documentElement, data = window.PORTFOLIO || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- Scroll progress + back to top (one rAF-throttled scroll listener) ---- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span class="scroll-progress__bar"></span>';
  document.body.insertBefore(bar, document.body.firstChild);
  var fill = bar.firstChild;

  var top = document.createElement('button');
  top.type = 'button'; top.className = 'to-top'; top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>';
  document.body.appendChild(top);
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' }); });

  var ticking = false;
  function update() {
    ticking = false;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight), y = window.pageYOffset || doc.scrollTop || 0;
    fill.style.transform = 'scaleX(' + Math.min(1, Math.max(0, y / max)).toFixed(4) + ')';
    top.classList.toggle('is-visible', y > Math.max(500, window.innerHeight * 0.6));
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();

  /* ---- Loader hand-off (markup is in index.html; it only shows if loading is slow) ---- */
  function hideLoader() {
    doc.classList.add('loader-done');
    setTimeout(function () { doc.classList.remove('show-loader'); var l = document.querySelector('.page-loader'); if (l && l.parentNode) l.parentNode.removeChild(l); }, 400);
    try { sessionStorage.setItem('portfolio-loaded', '1'); } catch (e) {}
  }
  if (document.readyState === 'complete') hideLoader(); else { window.addEventListener('load', hideLoader); setTimeout(hideLoader, 3500); }

  /* ---- Download Resume ---- */
  var r = data.resume || {}, buttons = document.querySelectorAll('[data-resume]');
  if (buttons.length) {
    var prefix = document.body.getAttribute('data-root') || '';
    var file = r.file ? prefix + r.file : '';
    function paint(ok) {
      buttons.forEach(function (a) {
        var label = a.querySelector('[data-resume-label]');
        if (ok) {
          a.setAttribute('href', file); a.setAttribute('download', r.downloadName || ''); a.removeAttribute('aria-disabled'); a.removeAttribute('title');
          if (label) label.textContent = r.label || 'Download resume';
        } else {
          a.removeAttribute('href'); a.removeAttribute('download'); a.setAttribute('aria-disabled', 'true'); a.setAttribute('role', 'link');
          a.title = 'Resume PDF not added yet (see assets/resume/README.md)';
          if (label) label.textContent = 'Resume coming soon';
        }
      });
    }
    if (!file) paint(false);
    else {
      paint(true);                                                            /* assume present, then verify */
      if (window.location.protocol !== 'file:' && window.fetch) {
        fetch(file, { method: 'HEAD', cache: 'no-cache' }).then(function (res) { paint(res.ok); }, function () { paint(false); });
      }
    }
  }
})();
