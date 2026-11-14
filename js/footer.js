/* footer.js — renders the footer's connect list, contact details and availability from content.js.
   Placeholder values ("[Add ...]") show as dashed, non-clickable items; real values become working links. */
(function () {
  'use strict';
  var U = window.PortfolioUtil, I = window.PortfolioIcons, data = window.PORTFOLIO || {};
  var footer = document.querySelector('[data-footer]');
  if (!footer) return;
  var contact = data.contact || {}, links = contact.links || [];
  var byIcon = function (name) { return links.filter(function (l) { return l.icon === name; })[0]; };
  var ready = function (v) { return typeof v === 'string' && v && !U.isPh(v); };

  function item(o) {            /* o: {label, icon, href, external, note} */
    var inner = '<span class="footer__ico">' + I.svg(o.icon) + '</span><span class="footer__item-label">' + U.esc(o.label) + '</span>';
    if (o.href) {
      return '<a class="footer__social" href="' + U.esc(o.href) + '"' + (o.external ? ' target="_blank" rel="noopener noreferrer"' : '') +
        ' aria-label="' + U.esc(o.label + (o.external ? ' (opens in a new tab)' : '')) + '">' + inner + '<span class="footer__arrow">' + I.svg('arrow-up-right') + '</span></a>';
    }
    return '<span class="footer__social is-disabled is-placeholder" title="Add this in js/config/content.js">' + inner + '</span>';
  }

  var connect = [];
  var gh = byIcon('github'), li = byIcon('linkedin'), ig = byIcon('instagram');
  if (gh) connect.push({ label: gh.label, icon: 'github', href: ready(gh.url) ? gh.url : '', external: true });
  if (li) connect.push({ label: li.label, icon: 'linkedin', href: ready(li.url) ? li.url : '', external: true });
  connect.push({ label: 'Email', icon: 'mail', href: ready(contact.email) ? 'mailto:' + contact.email : '', external: false });
  if (ig && ig.url !== '') connect.push({ label: ig.label, icon: 'instagram', href: ready(ig.url) ? ig.url : '', external: true });
  links.forEach(function (l) {   /* any extra links you add to content.js */
    if (['github', 'linkedin', 'instagram'].indexOf(l.icon) === -1 && l.url !== '') connect.push({ label: l.label, icon: l.icon || 'globe', href: ready(l.url) ? l.url : '', external: true });
  });
  var cEl = footer.querySelector('[data-footer-connect]');
  if (cEl) cEl.innerHTML = connect.map(function (o) { return '<li>' + item(o) + '</li>'; }).join('');

  var det = footer.querySelector('[data-footer-contact]');
  if (det) {
    var rows = [];
    var email = contact.email;
    rows.push('<li class="footer__detail"><span class="footer__ico">' + I.svg('mail') + '</span><span class="footer__detail-text"><span class="footer__detail-k">Email</span>' +
      (ready(email) ? '<a class="footer__mail" href="mailto:' + U.esc(email) + '">' + U.esc(email).replace('@', '@<wbr>') + '</a>' : '<span class="footer__mail is-placeholder">' + U.esc(email || '[Add email address]') + '</span>') + '</span></li>');
    var loc = data.profile && data.profile.location;
    if (loc) rows.push('<li class="footer__detail"><span class="footer__ico">' + I.svg('map-pin') + '</span><span class="footer__detail-text"><span class="footer__detail-k">Location</span>' + U.text(loc) + '</span></li>');
    det.innerHTML = rows.join('');
  }

  var av = data.footer && data.footer.availability, avEl = footer.querySelector('[data-footer-availability]');
  if (avEl) {
    if (av && av.show) {
      avEl.innerHTML = '<div class="footer__avail" role="group" aria-label="Availability"><span class="footer__dot" aria-hidden="true"></span><div><p class="footer__avail-status">' + U.text(av.status) + '</p><p class="footer__avail-note">' + U.text(av.note) + '</p></div></div>';
    } else avEl.remove();
  }
})();
