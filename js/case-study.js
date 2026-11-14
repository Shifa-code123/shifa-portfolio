/* case-study.js — renders a case-study page from content.js. <body data-project="project-1"> picks the project. */
(function () {
  'use strict';
  var U = window.PortfolioUtil, data = window.PORTFOLIO || {};
  var id = document.body.getAttribute('data-project');
  var list = data.projects || [];
  var preview = (/[?&]preview=([^&#]+)/.exec(window.location.search) || [])[1];
  var p = list.filter(function (x) { return x.id === id; })[0];
  var isDraft = !!(p && p.draft && preview !== 'all' && preview !== p.id);
  list = list.filter(function (x) { return !x.draft || x === p && !isDraft; });     /* unpublished projects never appear in "More projects" */
  var root = document.getElementById('cs-root');
  if (!root) return;
  if (p && isDraft) { root.innerHTML = '<div class="container cs-head"><p class="cs-head__no">Project ' + (p.number < 10 ? '0' : '') + p.number + '</p><h1 class="cs-head__title">Coming soon</h1><p class="cs-head__intro">This case study is being prepared.</p><p><a href="../index.html#projects">Back to the portfolio</a></p></div>'; document.title = 'Coming soon \u2014 ' + ((data.profile && data.profile.name) || 'Portfolio'); return; }
  if (!p) { root.innerHTML = '<div class="container cs-head"><h1 class="cs-head__title">Project not found</h1><p><a href="../index.html#projects">Back to the portfolio</a></p></div>'; return; }
  var s = p.study || {};
  var pre = '../'; /* case studies live one folder down */
  function img(src) { return src ? pre + src : ''; }
  function media(m, label) {
    return m && m.image ? '<figure class="cs-media"><img src="' + U.esc(img(m.image)) + '" alt="' + U.esc(label) + '" loading="lazy"></figure>'
      : '<div class="cs-media">' + U.text(m && m.note) + '</div>';
  }
  function sec(title, body, anchor) { return '<section class="cs-sec container"' + (anchor ? ' id="' + anchor + '"' : '') + '><h2>' + title + '</h2><div class="cs-body">' + body + '</div></section>'; }
  function has(v) { return typeof v === 'string' && v.trim() !== '' && !U.isPh(v); }
  /* Design process strip: ONLY steps that this project's real content supports (nothing is invented).
     Ideation appears when study.ideation is written; Wireframing when study.design.image is set. */
  function processHTML() {
    var st = [], d = s.design || {};
    if (has(s.research)) st.push(['Research', 'Research and understanding', 'cs-research']);
    if (has(s.ideation)) st.push(['Ideation', 'Ideation', 'cs-ideation']);
    if (d.image) st.push(['Wireframing', 'Wireframes', 'cs-design']);
    if (has(d.note)) st.push(['Design', 'Design decisions', 'cs-design']);
    if ((p.screenshots || []).length) st.push(['Final product', 'Screenshots', 'cs-shots']);
    if (st.length < 3) return '';
    return '<section class="cs-process container" aria-labelledby="cs-process-h"><h2 id="cs-process-h">Design process</h2><ol class="cs-process__list">' +
      st.map(function (x, n) { return '<li><a href="#' + x[2] + '"><span class="cs-process__n">' + (n + 1) + '</span><span class="cs-process__t">' + x[0] + '</span><span class="cs-process__s">' + x[1] + '</span></a></li>'; }).join('') + '</ol></section>';
  }

  document.title = (U.isPh(p.title) ? 'Case study ' + p.number : p.title) + ' — ' + ((data.profile && data.profile.name) || 'Portfolio');
  var i = list.indexOf(p);
  root.innerHTML =
    '<header class="container cs-head"><p class="cs-head__no">Project ' + (p.number < 10 ? '0' : '') + p.number + '</p><h1 class="cs-head__title">' + U.text(p.title) + '</h1><p class="cs-head__intro">' + U.text(s.intro) + '</p></header>' +
    '<div class="container"><figure class="cs-cover"><img src="' + U.esc(img(p.cover)) + '" alt="Cover image for project ' + p.number + '"></figure></div>' +
    processHTML() +
    sec('Problem', '<p>' + U.text(s.problem) + '</p>') +
    sec('Goals and requirements', U.list(s.goals)) +
    (has(s.ideation) ? sec('Ideation', '<p>' + U.text(s.ideation) + '</p>', 'cs-ideation') : '') + sec('Research and understanding', '<p>' + U.text(s.research) + '</p>', 'cs-research') +
    sec('User flow and system architecture', media(s.flow, 'User flow or architecture diagram')) +
    sec('Wireframes and design decisions', media(s.design, 'Wireframes'), 'cs-design') +
    sec('Screenshots', '<div class="cs-shots">' + (p.screenshots || []).map(function (x, n) { return '<img src="' + U.esc(img(x)) + '" alt="Screenshot ' + (n + 1) + ' of project ' + p.number + '" loading="lazy">'; }).join('') + '</div>', 'cs-shots') +
    sec('Technology stack', U.chips(p.technologies, 'cs-chips')) +
    sec('My contribution', '<p>' + U.text(s.contribution) + '</p>') +
    sec('Challenges and solutions', (s.challenges || []).map(function (c) { return '<div class="cs-pair"><p><strong>Challenge.</strong> ' + U.text(c.challenge) + '</p><p><strong>Solution.</strong> ' + U.text(c.solution) + '</p></div>'; }).join('')) +
    sec('Outcomes and learnings', '<p>' + U.text(s.outcomes) + '</p>') +
    sec('Next steps', '<p>' + U.text(s.next) + '</p>') +
    '<section class="cs-related container"><h2>More projects</h2><div class="cs-related__grid">' +
      list.filter(function (x) { return x !== p; }).map(function (x) { return '<a href="' + U.esc(x.id) + '.html"><span class="cs-head__no">Project ' + (x.number < 10 ? '0' : '') + x.number + '</span><span class="milestone__label">' + U.text(x.title) + '</span><span>' + U.text(x.status) + '</span></a>'; }).join('') +
    '</div></section>';
  U.guardImages(root);
  var brand = document.querySelector('[data-bind-name]'); if (brand && data.profile) brand.textContent = data.profile.name;
})();
