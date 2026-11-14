/* skills.js — renders Skills & tools from content.js and plays the laptop-to-label logo animation.
   - Each skill gets a fixed-size logo slot above its name. When the section scrolls into view, logos leave Shifa's laptop one
     after another, drop with a little gravity and land exactly in their own slot (measured from the real DOM, so it stays
     correct at any screen size).  - On landing the flying logo is swapped for the permanent logo inside the slot.
   - Reduced motion / no IntersectionObserver / no Web Animations: logos are simply in place.
   Logo files live in assets/images/icons/skills/ (see ICONS below). */
(function () {
  'use strict';
  var U = window.PortfolioUtil, data = window.PORTFOLIO || {};
  var host = document.querySelector('[data-skills]'), stage = document.querySelector('[data-skills-stage]');
  if (!host || !stage || !data.skills) return;
  var fly = stage.querySelector('[data-skills-fly]'), emit = stage.querySelector('[data-skills-emit]'), hero = stage.querySelector('[data-skills-hero]');
  var BASE = 'assets/images/icons/skills/';

  /* skill name (as written in content.js)  ->  logo file. Brand logos: Devicon (MIT) and Simple Icons (CC0). Generic line icons
     (XML, Firestore, Wireframing, Prototyping, UI/UX Design) are Lucide (ISC) because those have no single official brand logo. */
  var ICONS = {
    'Java': 'java', 'Kotlin': 'kotlin', 'C': 'c', 'Python': 'python',
    'Android Development': 'android', 'XML': 'xml', 'HTML': 'html', 'CSS': 'css', 'JavaScript': 'javascript', 'Bootstrap': 'bootstrap',
    'Firebase': 'firebase', 'Firestore': 'firestore', 'Cloudinary': 'cloudinary',
    'Figma': 'figma', 'Wireframing': 'wireframing', 'Prototyping': 'prototyping', 'UI/UX Design': 'ui-ux-design',
    'Android Studio': 'android-studio', 'GitHub': 'github', 'VS Code': 'vscode'
  };
  function slug(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function src(n) { return BASE + (ICONS[n] || slug(n)) + '.svg'; }

  var gi = 0;
  host.innerHTML = (data.skills.groups || []).map(function (g) {
    gi++;
    return '<div class="skills__group" role="group" aria-labelledby="skills-g' + gi + '"><h3 id="skills-g' + gi + '">' + U.text(g.title) + '</h3>' +
      '<ul class="skills__row">' + (g.items || []).map(function (n) {
        return '<li class="skill" data-skill="' + U.esc(slug(n)) + '"><span class="skill__icon"><img src="' + U.esc(src(n)) + '" alt="" width="36" height="36" decoding="async"></span>' +
          '<span class="skill__name">' + U.esc(n) + '</span></li>';
      }).join('') + '</ul></div>';
  }).join('');
  U.guardImages(host);
  var skills = Array.prototype.slice.call(host.querySelectorAll('.skill'));

  var replay = document.createElement('button');
  replay.type = 'button'; replay.className = 'skills__replay'; replay.hidden = true; replay.textContent = '\u21BB Replay animation';
  host.appendChild(replay);

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobile = window.matchMedia('(max-width: 899.98px)');
  var running = false, timers = [], played = false;

  function landAll() { skills.forEach(function (s) { s.classList.remove('is-settling'); s.classList.add('is-landed'); }); }
  function reset() { timers.forEach(clearTimeout); timers = []; fly.innerHTML = ''; skills.forEach(function (s) { s.classList.remove('is-landed', 'is-settling'); }); }

  /* centre of an element relative to the stage */
  function centre(el) {
    var r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return { x: r.left + r.width / 2 - s.left, y: r.top + r.height / 2 - s.top };
  }
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeIn = function (t) { return t * t; };
  var easeBack = function (t) { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

  /* Build keyframes for one logo: it pops out of the laptop edge, rises and drifts up and outward (own height, direction, spin and
     size per logo), floats with a soft wobble, then glides on a smooth curve down into its own slot. Position follows a cubic
     Bezier, so there are no straight lines, sudden turns or bounces on the way. */
  var frac = function (v) { return v - Math.floor(v); };
  function frames(S, E, simple, i) {
    var out = [], N = simple ? 40 : 64;
    var k = simple ? 0.55 : 1;
    var dx = (frac(i * 0.618 + 0.13) - 0.3) * 120 * k, h = (46 + frac(i * 0.377 + 0.2) * 52) * k;
    var rotMax = (frac(i * 0.731 + 0.4) - 0.5) * (simple ? 18 : 30), sv = 0.08 + frac(i * 0.517) * 0.16;
    var ph1 = frac(i * 0.29) * 6.283, ph2 = frac(i * 0.43) * 6.283;
    var P1 = { x: S.x + dx * 0.75, y: S.y - h * 1.55 }, P2 = { x: E.x + dx * 0.1, y: E.y - (h * 0.7 + 26 * k) };
    for (var n = 0; n <= N; n++) {
      var t = n / N, u = t * t * (3 - 2 * t), m = 1 - u;
      var x = m * m * m * S.x + 3 * m * m * u * P1.x + 3 * m * u * u * P2.x + u * u * u * E.x;
      var y = m * m * m * S.y + 3 * m * m * u * P1.y + 3 * m * u * u * P2.y + u * u * u * E.y;
      var env = Math.sin(Math.PI * t);
      x += Math.sin(6.283 * t * 1.3 + ph1) * 6 * k * env; y += Math.sin(6.283 * t * 1.7 + ph2) * 4 * k * env;
      var sc = (t < 0.16 ? 0.2 + 0.8 * easeBack(t / 0.16) : 1) * (1 + sv * env);
      var op = Math.min(1, t / 0.1);
      out.push({ offset: t, opacity: op, transform: 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + (rotMax * env).toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')' });
    }
    out[out.length - 1].transform = 'translate3d(' + E.x.toFixed(1) + 'px,' + E.y.toFixed(1) + 'px,0) rotate(0deg) scale(1)';
    return out;
  }

  function launch(skill, simple, dur, idx) {
    var slot = skill.querySelector('.skill__icon');
    var el = document.createElement('span'); el.className = 'skill-fly';
    var im = document.createElement('img'); im.src = skill.querySelector('img').getAttribute('src'); im.alt = ''; im.width = 36; im.height = 36; el.appendChild(im);
    fly.appendChild(el);
    var S = centre(emit), E = centre(slot);
    var anim = el.animate(frames(S, E, simple, idx), { duration: dur, easing: 'linear', fill: 'forwards' });
    var done = function () { skill.classList.add('is-landed', 'is-settling'); if (el.parentNode) el.parentNode.removeChild(el); setTimeout(function () { skill.classList.remove('is-settling'); }, 520); };
    anim.onfinish = done; anim.oncancel = function () { if (el.parentNode) el.parentNode.removeChild(el); };
  }

  /* ---- Natural hand movement ----
     The illustration is split (see assets/images/skills-character-base / -arms) into a still body and one layer that holds both hands
     and the laptop. That layer sways a few pixels like someone holding and presenting a laptop, and lifts a little while logos leave it.
     Reduced motion, or any load problem: the original single image stays exactly as it was. */
  var armsEl = null;
  function setupHands() {
    var pic = hero && hero.querySelector('picture'), img = pic && pic.querySelector('img');
    if (!pic || !img || reduce.matches || typeof img.animate !== 'function') return;
    var A = BASE_IMG, base = new Image(), arms = new Image(), ok = 0;
    var go = function () {
      if (++ok < 2 || reduce.matches) return;
      var src = pic.querySelector('source'); if (src) src.srcset = A + 'skills-character-base.webp';
      img.src = A + 'skills-character-base.png';
      armsEl = document.createElement('span'); armsEl.className = 'skills-hero__arms'; armsEl.setAttribute('aria-hidden', 'true');
      var ai = document.createElement('img'); ai.alt = ''; ai.decoding = 'async';
      ai.src = arms.currentSrc || arms.src; armsEl.appendChild(ai); hero.appendChild(armsEl);
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { en.forEach(function (e) { armsEl.classList.toggle('is-live', e.isIntersecting); }); }).observe(stage);
      else armsEl.classList.add('is-live');
    };
    base.onload = go; arms.onload = go;
    var test = document.createElement('canvas'), webp = test.toDataURL && test.toDataURL('image/webp').indexOf('image/webp') === 5;
    base.src = A + 'skills-character-base.' + (webp ? 'webp' : 'png'); arms.src = A + 'skills-character-arms.' + (webp ? 'webp' : 'png');
  }
  var lastLift = 0;
  function presentLift() {
    var now = Date.now(); if (!armsEl || now - lastLift < 2600 || reduce.matches) return; lastLift = now;
    armsEl.animate([
      { transform: 'translate(0,0) rotate(0deg)' },
      { transform: 'translate(0.3%,-2.6%) rotate(-1.2deg)', offset: 0.35 },
      { transform: 'translate(0.2%,-2.1%) rotate(-0.9deg)', offset: 0.6 },
      { transform: 'translate(0,0) rotate(0deg)' }
    ], { duration: 2600, easing: 'ease-in-out' });
  }
  var BASE_IMG = 'assets/images/';
  setupHands();

  function play() {
    if (running) return;
    if (reduce.matches || !hero || !emit || typeof stage.animate !== 'function') { landAll(); replay.hidden = true; return; }
    reset(); running = true; replay.hidden = true;
    var simple = mobile.matches, gap = simple ? 150 : 200, dur = simple ? 1500 : 2100;
    skills.forEach(function (s, i) {
      timers.push(setTimeout(function () { launch(s, simple, dur, i); presentLift(); }, 250 + i * gap));
    });
    timers.push(setTimeout(function () { running = false; replay.hidden = false; }, 250 + skills.length * gap + dur + 200));
  }

  replay.addEventListener('click', function () { running = false; play(); });
  reduce.addEventListener && reduce.addEventListener('change', function () { if (reduce.matches) { reset(); landAll(); replay.hidden = true; running = false; } });

  /* Start once, when the section is mostly on screen */
  if (reduce.matches || !('IntersectionObserver' in window)) { landAll(); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting && !played) { played = true; io.disconnect(); play(); } });
    }, { threshold: mobile.matches ? 0.18 : 0.3 });
    io.observe(stage);
  }
  window.Portfolio = window.Portfolio || {}; window.Portfolio.skills = { play: function () { running = false; played = true; play(); }, landAll: landAll, get count() { return skills.length; } };
})();
