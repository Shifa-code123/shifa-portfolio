/* about.js — About lists and Contact links, from content.js. */
(function () {
  'use strict';
  var U = window.PortfolioUtil, data = window.PORTFOLIO || {};

  var interests = document.querySelector('[data-about-interests]');
  if (interests && data.about) interests.innerHTML = U.chips(data.about.interests, 'about__chips');

  /* Skills & tools are rendered and animated by js/skills.js */

  var mail = document.querySelector('[data-contact-email]');
  if (mail && data.contact) {
    var e = data.contact.email;
    mail.innerHTML = U.isPh(e) ? '<span class="contact__mail is-placeholder">' + U.esc(e) + '</span>' : '<a class="contact__mail" href="mailto:' + U.esc(e) + '">' + U.esc(e).replace('@', '@<wbr>') + '</a>';
  }
  var links = document.querySelector('[data-contact-links]');
  if (links && data.contact) {
    links.innerHTML = (data.contact.links || []).map(function (l) {
      return '<li>' + (U.isPh(l.url) || !l.url ? '<span class="is-placeholder">' + U.esc(l.label) + '</span>'
        : '<a href="' + U.esc(l.url) + '" target="_blank" rel="noopener">' + U.esc(l.label) + '</a>') + '</li>';
    }).join('');
  }
})();
