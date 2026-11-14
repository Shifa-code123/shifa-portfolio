/* util.js — tiny shared helpers (loaded before everything else). */
window.PortfolioUtil = (function () {
  'use strict';
  var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return map[c]; }); }
  /* Values like "[Add email]" are placeholders. */
  function isPh(s) { return typeof s === 'string' && /^\s*\[.*\]\s*$/.test(s); }
  /* Escapes text and marks placeholders visibly. */
  function text(s) { return isPh(s) ? '<span class="is-placeholder">' + esc(s) + '</span>' : esc(s); }
  function list(arr, cls) {
    return '<ul' + (cls ? ' class="' + cls + '"' : '') + '>' + (arr || []).map(function (i) { return '<li>' + text(i) + '</li>'; }).join('') + '</ul>';
  }
  function chips(arr, cls) {
    return '<div class="' + (cls || 'chips') + '">' + (arr || []).map(function (i) { return '<span class="chip' + (isPh(i) ? ' is-placeholder' : '') + '">' + esc(i) + '</span>'; }).join('') + '</div>';
  }
  /* Hide an image that fails to load instead of showing a broken icon. */
  function guardImages(root) {
    root.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () { img.style.visibility = 'hidden'; }, { once: true });
    });
  }
  return { esc: esc, isPh: isPh, text: text, list: list, chips: chips, guardImages: guardImages };
})();
