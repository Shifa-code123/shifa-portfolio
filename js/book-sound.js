/* book-sound.js — paper page-turn sound for the project book.
   - Plays only after a real user interaction (a click, key press or drag that turns a page), never on load.
   - One sound at a time: a new turn stops the previous one; very fast repeats are ignored.
   - Sound ON/OFF button (data-book-sound), remembered in localStorage when available.
   - Replace the files below with your own recording any time (keep the folder, or edit this list). */
(function () {
  'use strict';
  var SOUND_FILES = ['assets/audio/page-flip-1', 'assets/audio/page-flip-2', 'assets/audio/page-flip-3'];  /* no extension: .ogg or .mp3 is chosen */
  var CLIP_MS = 900, VOLUME = 0.5, MIN_GAP_MS = 140, KEY = 'portfolio-book-sound';

  var root = document.querySelector('[data-book]');
  if (!root || typeof Audio === 'undefined') return;
  var btn = root.querySelector('[data-book-sound]');
  var probe = document.createElement('audio');
  var ext = probe.canPlayType && probe.canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3';
  var pool = [], next = 0, lastAt = 0, unlocked = false, enabled = true;

  try { if (localStorage.getItem(KEY) === 'off') enabled = false; } catch (e) {}

  function build() {
    if (pool.length) return;
    pool = SOUND_FILES.map(function (f) {
      var a = new Audio(f + '.' + ext); a.preload = 'auto'; a.volume = VOLUME; return a;
    });
  }
  /* iOS/Safari only allow audio that was started inside a gesture: start each clip silently once, then stop it. */
  function unlock() {
    if (unlocked) return; unlocked = true; build();
    pool.forEach(function (a) {
      try { a.muted = true; var p = a.play(); var done = function () { a.pause(); a.currentTime = 0; a.muted = false; };
        if (p && p.then) p.then(done, function () { a.muted = false; }); else done(); } catch (e) {}
    });
  }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { root.addEventListener(ev, unlock, { once: true, passive: true }); });

  function play(turnMs) {
    if (!enabled) return;
    var now = Date.now(); if (now - lastAt < MIN_GAP_MS) return; lastAt = now;
    build();
    pool.forEach(function (a) { if (!a.paused) { a.pause(); } });         /* never overlap */
    var a = pool[next]; next = (next + 1) % pool.length;
    try { a.muted = false; a.currentTime = 0;
      a.playbackRate = turnMs > 0 ? Math.min(2.5, Math.max(0.8, CLIP_MS / turnMs)) : 1;   /* fit the clip to this turn's length */
      var p = a.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  }

  function paint() {
    if (!btn) return;
    btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    btn.classList.toggle('is-off', !enabled);
    var label = btn.querySelector('[data-sound-label]'); if (label) label.textContent = enabled ? 'Sound on' : 'Sound off';
  }
  if (btn) btn.addEventListener('click', function () {
    enabled = !enabled; try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch (e) {}
    if (enabled) { unlock(); } else { pool.forEach(function (a) { a.pause(); }); }
    paint();
  });
  paint();
  window.Portfolio = window.Portfolio || {};
  window.Portfolio.bookSound = { play: play, get enabled() { return enabled; } };
})();
