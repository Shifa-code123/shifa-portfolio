/* roadmap.js — education timeline. The road is an SVG path built from the real marker positions,
   drawn as you scroll. Milestones are reached when the road gets to them. */
(function () {
  'use strict';
  var U = window.PortfolioUtil, data = window.PORTFOLIO || {};
  var root = document.querySelector('[data-roadmap]');
  var items = data.education && data.education.milestones;
  if (!root || !items || !items.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var ICONS = {
    school: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    twelfth: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    diploma: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    engineering: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c3 2.5 9 2.5 12 0v-4.5"/>'
  };

  root.innerHTML = '<svg class="roadmap__svg" aria-hidden="true" focusable="false"><path class="road__base"/><path class="road__travelled"/><path class="road__dash"/><circle class="road__car" r="7"/></svg>' +
    '<ol class="roadmap__list">' + items.map(function (m) {
      return '<li class="milestone" data-milestone><div class="milestone__marker" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[m.id] || ICONS.school) + '</svg></div>' +
        '<div class="milestone__card"><span class="milestone__year">' + U.text(m.year) + '</span><h3 class="milestone__label">' + U.esc(m.label) + '</h3>' +
        '<p class="milestone__inst">' + U.text(m.institution) + '</p><p>' + U.text(m.qualification) + '</p><p class="milestone__desc">' + U.text(m.description) + '</p>' +
        (m.image ? '<img class="milestone__img" src="' + U.esc(m.image) + '" alt="" loading="lazy">' : '') + '</div></li>';
    }).join('') + '</ol>';
  U.guardImages(root);

  var svg = root.querySelector('.roadmap__svg'), base = svg.querySelector('.road__base'),
      trav = svg.querySelector('.road__travelled'), dash = svg.querySelector('.road__dash'), car = svg.querySelector('.road__car');
  var marks = Array.prototype.slice.call(root.querySelectorAll('[data-milestone]'));
  var total = 0, lens = [], H = 0, ticking = false;

  function layout() {
    var rr = root.getBoundingClientRect(); var W = rr.width; H = rr.height;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var pts = marks.map(function (li) {
      var r = li.querySelector('.milestone__marker').getBoundingClientRect();
      return { x: r.left - rr.left + r.width / 2, y: r.top - rr.top + r.height / 2 };
    });
    var segs = ['M' + pts[0].x + ' 0', 'L' + pts[0].x + ' ' + pts[0].y];
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], dy = b.y - a.y, off = Math.abs(a.x - b.x) < 40 ? (i % 2 ? 1 : -1) * W * 0.07 : 0;
      segs.push('C' + (a.x + off) + ' ' + (a.y + dy * 0.45) + ' ' + (b.x - off) + ' ' + (b.y - dy * 0.45) + ' ' + b.x + ' ' + b.y);
    }
    var markerD = segs.slice(); /* prefixes up to each marker */
    segs.push('L' + pts[pts.length - 1].x + ' ' + H);
    var d = segs.join(' ');
    [base, trav, dash].forEach(function (p) { p.setAttribute('d', d); });
    total = base.getTotalLength();
    lens = pts.map(function (_, i) {
      var t = document.createElementNS(NS, 'path'); t.setAttribute('d', markerD.slice(0, i + 2).join(' '));
      svg.appendChild(t); var l = t.getTotalLength(); svg.removeChild(t); return l;
    });
    trav.style.strokeDasharray = total + ' ' + total;
  }

  function lengthAtY(y) {
    var lo = 0, hi = total;
    for (var i = 0; i < 16; i++) { var m = (lo + hi) / 2; if (base.getPointAtLength(m).y < y) lo = m; else hi = m; }
    return hi;
  }

  function update() {
    ticking = false;
    var L;
    if (reduce) L = total;
    else {
      var y = window.innerHeight * 0.62 - root.getBoundingClientRect().top;
      L = y <= 0 ? 0 : (y >= H ? total : lengthAtY(y));
    }
    trav.style.strokeDashoffset = String(total - L);
    var pt = base.getPointAtLength(L);
    car.setAttribute('cx', pt.x); car.setAttribute('cy', pt.y);
    car.style.display = reduce || L <= 0 ? 'none' : '';
    marks.forEach(function (li, i) { li.classList.toggle('is-reached', L >= lens[i] - 6); });
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  function relayout() { layout(); update(); }
  relayout();
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('load', relayout);
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(root);
  else window.addEventListener('resize', relayout);
  window.Portfolio = window.Portfolio || {}; window.Portfolio.roadmap = { update: update };
})();
