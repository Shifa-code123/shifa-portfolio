# ARISE upgrade — what changed

## New files
- `js/skills.js`, `css/skills.css` (rewritten) — laptop-to-label logo animation
- `assets/images/skills-character.png/.webp` — background-removed character with her natural shadow (semi-transparent)
- `assets/images/icons/skills/*.svg` — 20 logos (Devicon MIT, Simple Icons CC0, Lucide ISC for generic icons)
- `js/book-sound.js`, `assets/audio/page-flip-{1,2,3}.{mp3,ogg}`, `tools/make_page_flip_sound.py` — page-turn sound (synthesised paper sound)
- `js/site-ui.js`, `css/enhancements.css` — scroll progress, back-to-top, book loader, resume buttons
- `404.html`, `tools/serve.py` (local server that mimics GitHub Pages 404)
- `case-studies/project-4.html`, `assets/images/project-4-placeholder.png`
- `assets/resume/README.md`, `tests/arise_test.py` (106 checks)

## Modified files
`index.html`, `js/config/content.js` (skills category "Development Tools", resume config, project 4), `js/book.js` (draft filter, sound hook),
`js/about.js` (skills now rendered by skills.js), `js/case-study.js` (design-process strip, anchors), `css/book.css`, `css/case-study.css`, `case-studies/project-1..3.html`.

## Still needed from you
1. Your resume PDF -> `assets/resume/Shifa-Resume.pdf`
2. Project 4 details (overview, purpose, role, technologies, status, images, case-study text) in `js/config/content.js` — only the title is filled in.
3. GitHub / LinkedIn URLs (still `[Add ...]` placeholders in your original content.js).

## Run locally
`cd portfolio && python3 tools/serve.py` -> http://localhost:8000  (or double-click index.html)

## Publish on GitHub Pages
Upload the CONTENTS of the `portfolio` folder to a repo root (so `index.html` and `404.html` are at the top), then Settings -> Pages -> Deploy from branch (main, /root). `404.html` is picked up automatically.

## Final polish (book sound + character animation)
- `assets/audio/page-flip-{1,2,3}.{mp3,ogg}` regenerated (softer paper peel, air swish, gentle settle; 0.9 s to match the flip). `js/book-sound.js` / `js/book.js`: sound is time-fitted to each turn. The flip animation itself is untouched.
- `assets/images/skills-character-base.*` + `skills-character-arms.*` (new): the original character split into body and hands+laptop so the hands can move. Original `skills-character.png/.webp` kept as the fallback (reduced-motion users).
- `js/skills.js`, `css/skills.css`: gentle hand sway, and logos now rise and float up/outward from the laptop before gliding into their slots.

## New feature: The Ink Within
A floating notebook icon (bottom-right, above the back-to-top button) opens a clean white sheet of paper. A pencil writes the welcome message and the answers in connected cursive, following real pen-stroke paths so the tip is always on the letter being written. No AI, no API, no backend.
- Edit questions/answers: `js/config/ink-within.js` (the only file you need to touch).
- New files: `js/ink-within.js`, `js/ink-glyphs.js`, `js/config/ink-within.js`, `css/ink-within.css`, `assets/fonts/caveat-*.woff2` (+ OFL licence), `tools/make_ink_glyphs.py`.
- `index.html`: only 4 lines added (1 stylesheet link, 3 script tags). Nothing else in the existing site was changed.
- Reduced-motion visitors get the text instantly (no pencil animation). Tap/click the paper while it is writing to finish instantly. Esc or the x closes it.
