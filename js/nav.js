/* nav.js — active-section feedback, theme-aware nav, mobile menu. */
(function () {
  'use strict';

  var nav = document.querySelector('[data-nav]');
  if (!nav) return;

  var toggle = nav.querySelector('[data-nav-toggle]');
  var toggleLabel = nav.querySelector('[data-nav-toggle-label]');
  var links = Array.prototype.slice.call(nav.querySelectorAll('[data-nav-link]'));
  var sections = links.map(function (a) { return document.querySelector(a.hash); }).filter(Boolean);
  var themed = Array.prototype.slice.call(document.querySelectorAll('main [data-theme], footer[data-theme]'));
  var mobile = window.matchMedia('(max-width: 899.98px)');
  var navH = nav.offsetHeight;
  var ticking = false;
  var isOpen = false;

  function currentSection() {
    var line = window.innerHeight * 0.35;
    var cur = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) cur = sections[i]; else break;
    }
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    return atBottom ? sections[sections.length - 1] : cur;
  }

  function themeUnderNav() {
    var y = navH / 2;
    for (var i = 0; i < themed.length; i++) {
      var r = themed[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) return themed[i].getAttribute('data-theme');
    }
    return 'light';
  }

  function update() {
    ticking = false;
    navH = nav.offsetHeight;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    var cur = currentSection();
    links.forEach(function (a) {
      if (document.querySelector(a.hash) === cur) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    nav.setAttribute('data-theme', isOpen ? 'dark' : themeUnderNav());
  }
  function requestUpdate() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  function setOpen(state, returnFocus) {
    isOpen = state;
    nav.classList.toggle('is-open', state);
    document.body.classList.toggle('is-menu-open', state);
    toggle.setAttribute('aria-expanded', String(state));
    if (toggleLabel) toggleLabel.textContent = state ? 'Close menu' : 'Open menu';
    update();
    if (state && links[0]) links[0].focus();
    if (!state && returnFocus) toggle.focus();
  }

  toggle.addEventListener('click', function () { setOpen(!isOpen, true); });
  links.forEach(function (a) { a.addEventListener('click', function () { if (isOpen) setOpen(false, false); }); });
  var brand = nav.querySelector('.site-nav__brand');
  if (brand) brand.addEventListener('click', function () { if (isOpen) setOpen(false, false); });

  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false, true); return; }
    if (e.key === 'Tab') {            /* keep focus inside the open menu */
      var stops = [brand, toggle].concat(links);
      var first = stops[0], last = stops[stops.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  var onBreakpoint = function () { if (!mobile.matches && isOpen) setOpen(false, false); };
  if (mobile.addEventListener) mobile.addEventListener('change', onBreakpoint);
  else mobile.addListener(onBreakpoint);

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
})();
