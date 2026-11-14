/* experience.js — internship details and the framed certificate viewer. */
(function () {
  'use strict';
  var U = window.PortfolioUtil, data = window.PORTFOLIO || {}, xp = data.internship;
  var root = document.querySelector('[data-experience]');
  if (!root || !xp) return;
  var cert = xp.certificate || {};

  root.innerHTML =
    '<div class="xp__details"><dl class="xp__meta"><dt>Organization</dt><dd>' + U.text(xp.organization) + '</dd><dt>Role</dt><dd>' + U.text(xp.role) + '</dd><dt>Duration</dt><dd>' + U.text(xp.duration) + '</dd></dl>' +
    '<div class="xp__block"><h3>Work performed</h3>' + U.list(xp.work, 'xp__list') + '</div>' +
    '<div class="xp__block"><h3>Skills gained</h3>' + U.chips(xp.skills, 'xp__chips') + '</div>' +
    '<div class="xp__block"><h3>My contributions</h3>' + U.list(xp.contributions, 'xp__list') + '</div>' +
    (xp.achievements && xp.achievements.length ? '<div class="xp__block"><h3>Achievements</h3>' + U.list(xp.achievements, 'xp__list') + '</div>' : '') + '</div>' +
    '<div class="cert"><button class="cert__open" type="button" aria-haspopup="dialog" data-cursor-label="VIEW"><span class="cert__frame"><span class="cert__mat">' +
    '<img src="' + U.esc(cert.preview) + '" alt="' + U.esc(cert.alt) + '" width="1754" height="1240" loading="lazy" decoding="async"><span class="cert__glare"></span></span></span>' +
    '<span class="visually-hidden">Open the internship certificate in a larger viewer</span></button>' +
    '<p class="cert__hint">Select the certificate to view it larger.</p></div>';
  U.guardImages(root);

  var dlg = document.createElement('dialog');
  dlg.className = 'cert-viewer';
  dlg.setAttribute('aria-label', 'Internship certificate');
  dlg.innerHTML = '<div class="cert-viewer__body"><div class="cert-viewer__bar">' +
    (cert.pdf ? '<a class="cert-viewer__btn" href="' + U.esc(cert.pdf) + '" target="_blank" rel="noopener">Open PDF</a>' : '') +
    '<button class="cert-viewer__btn" type="button" data-zoom aria-pressed="false">Zoom in</button>' +
    '<button class="cert-viewer__btn" type="button" data-close>Close</button></div>' +
    '<div class="cert-viewer__stage"><img src="' + U.esc(cert.preview) + '" alt="' + U.esc(cert.alt) + '"></div></div>';
  document.body.appendChild(dlg);
  var stage = dlg.querySelector('.cert-viewer__stage'), zoomBtn = dlg.querySelector('[data-zoom]');

  function zoom(on) {
    stage.classList.toggle('is-zoomed', on); zoomBtn.setAttribute('aria-pressed', String(on)); zoomBtn.textContent = on ? 'Zoom out' : 'Zoom in';
  }
  root.querySelector('.cert__open').addEventListener('click', function () {
    zoom(false); dlg.showModal(); document.body.classList.add('is-locked');
  });
  dlg.querySelector('[data-close]').addEventListener('click', function () { dlg.close(); });
  zoomBtn.addEventListener('click', function () { zoom(!stage.classList.contains('is-zoomed')); });
  stage.querySelector('img').addEventListener('click', function () { zoom(!stage.classList.contains('is-zoomed')); });
  stage.addEventListener('click', function (e) { if (e.target === stage) dlg.close(); });  /* click outside the image */
  dlg.addEventListener('close', function () { document.body.classList.remove('is-locked'); });
})();
