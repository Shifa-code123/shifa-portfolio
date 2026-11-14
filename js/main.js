/* main.js — content binding, scroll reveal, small page-level setup. */
(function () {
  'use strict';

  var data = window.PORTFOLIO || {};
  var get = function (obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  };

  /* data-bind="profile.name" -> text from content.js */
  document.querySelectorAll('[data-bind]').forEach(function (el) {
    var v = get(data, el.getAttribute('data-bind'));
    if (typeof v === 'string' && v) {
      el.textContent = v;
      if (window.PortfolioUtil && PortfolioUtil.isPh(v)) el.classList.add('is-placeholder');
    }
  });
  /* data-bind-src="profile.heroPortrait" -> image path from content.js */
  document.querySelectorAll('[data-bind-src]').forEach(function (el) {
    var v = get(data, el.getAttribute('data-bind-src'));
    if (typeof v === 'string' && v) el.setAttribute('src', v);
  });
  /* data-bind-count="projects" -> number of items in an array */
  document.querySelectorAll('[data-bind-count]').forEach(function (el) {
    var v = get(data, el.getAttribute('data-bind-count'));
    if (Array.isArray(v)) el.textContent = v.length;
  });
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
  if (data.site && data.site.title) document.title = data.site.title;

  /* Scroll reveal: reveal once, then stop observing. */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  items.forEach(function (el) { io.observe(el); });
})();
