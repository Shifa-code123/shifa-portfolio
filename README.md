# Shifa — Interactive Personal Portfolio

A hybrid portfolio site: one smooth-scrolling main page plus a dedicated case-study page for every project.
Built with plain **HTML, CSS and vanilla JavaScript** (no build step). The only third-party library is
[StPageFlip](https://github.com/Nodlik/StPageFlip) (MIT licence, v2.0.7), already bundled in `js/vendor/`.

**Sections (in order):** Home · About · Projects (interactive 3D book) · Education journey (winding road) ·
Internship & achievements (framed certificate viewer) · Skills & tools · Contact, plus `case-studies/project-1..3.html`.

## Open it in VS Code

1. Unzip, then in VS Code choose **File > Open Folder...** and select the `portfolio` folder.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and choose **Open with Live Server**. The site opens at `http://127.0.0.1:5500` and reloads when you save.
4. Edit your details in `js/config/content.js`, save, and the page updates.

To view it on your phone while Live Server is running, connect the phone to the same Wi-Fi and open
`http://<your-computer-IP>:5500` (VS Code shows the address in the Live Server status bar).

## Run it locally

You need nothing installed except a browser.

**Quickest:** double-click `index.html`. Everything works from disk (the scripts are plain, non-module files).

**Recommended (acts like a real host):** serve the folder.

```bash
cd portfolio
python3 -m http.server 8000      # then open http://localhost:8000
```

(Alternatives: VS Code "Live Server", or `npx serve`.)

The Google Fonts (Fraunces + Hanken Grotesk) need an internet connection. Offline, the site falls back to
system serif/sans fonts and the layout does not break.

## Edit your content

**Everything editable is in `js/config/content.js`.** Anything in `[square brackets]` is a placeholder and shows
with a dashed outline on the page, so nothing looks final by accident. Replace it with your real text.

| What | Where |
|---|---|
| Name, role, tagline, portrait paths | `profile` |
| Email and social links (GitHub, LinkedIn, Instagram) | `contact` (set a link's `url` to `""` to hide it, e.g. Instagram) |
| Footer closing statement and availability | `footer` (set `availability.show` to `false` if it does not apply) |
| Location (shown in the footer) | `profile.location` (set to `""` to hide) |
| Book pages and case-study pages | `projects` (each has `overview`, `purpose`, `role`, `technologies`, `status`, `cover`, `screenshots`, and a `study` block for the case-study page) |
| Education roadmap | `education.milestones` |
| Internship text, achievements and certificate | `internship` |
| Skills & tools groups | `skills` |
| About section | `about` |

To add a 4th project: add one more object to `projects` and copy `case-studies/project-3.html` to `project-4.html`,
changing `data-project="project-3"` to `project-4`. The book grows by one spread automatically.

## Replace the placeholder images

Drop your file at the same path (same filename), or change the path in `content.js`.

| File | Notes |
|---|---|
| `assets/images/hero-portrait.png` | Transparent PNG, half-body (placeholder is 900x1100) |
| `assets/images/about-portrait.png` | Transparent PNG, full body. Then adjust `--hand-x` / `--hand-y` in `css/about.css` so the hand lines up with the name |
| `assets/images/project-N/cover.png`, `screenshot-1.png`, `screenshot-2.png` | Project visuals (4:3 works best) |
| `assets/images/internship-certificate/certificate.png` | Optionally set `internship.certificate.pdf` to also show an "Open PDF" button |

`tools/make_placeholders.py` regenerates the temporary placeholders (needs Pillow). You can delete it.

## Project structure

```
portfolio/
├── index.html                 main page
├── styleguide.html            colour / type / spacing / glass-cursor test page (safe to delete)
├── demos/book-typing.html     the book + typing layer on its own (safe to delete)
├── case-studies/              project-1.html, project-2.html, project-3.html
├── css/                       tokens, base, layout, components, hero, book, roadmap,
│                              experience, about, skills, footer, case-study, cursor, styleguide
├── js/
│   ├── config/content.js      ALL editable content
│   ├── util.js  main.js  nav.js  effects.js  cursor.js  icons.js  footer.js
│   ├── book.js  roadmap.js  experience.js  about.js  case-study.js
│   └── vendor/page-flip.browser.js
├── assets/images/             portraits, project-1..3, internship-certificate, education, icons, book
├── tools/make_placeholders.py
└── tests/                     Playwright test scripts
```

Colours, fonts, spacing and the type scale live in `css/tokens.css`.

## Features

- Real 3D page-turning book: click the cover, drag a page corner, swipe, arrow keys, or the buttons. One page on phones, two on larger screens.
- Winding SVG road that draws as you scroll, with milestones that light up when reached.
- Framed certificate that opens a larger viewer (zoom, Esc to close, optional PDF link).
- Frosted-glass orb cursor with a soft trailing lag. It grows over interactive elements and shows labels such as OPEN BOOK and VIEW PROJECT. Add `data-cursor-label="TEXT"` to any element for your own label. Your normal pointer stays visible everywhere except on labelled targets, text selection is untouched, and it is off for touch and reduced motion.
- Typing layer inside the book: when a project spread settles after a page turn, the title and short lines are typed with a blinking caret, longer text fades in, and screenshots reveal with a soft wipe. Each project plays once only. It sits on top of the real page turn and is off for reduced motion.
- Editorial footer: closing statement, availability, quick links, Connect (GitHub, LinkedIn, Email, Instagram) with Lucide icons, contact details and a bottom bar with Back to top. Placeholder links stay dashed and non-clickable until you add real URLs; real ones open safely in a new tab. Icons are inlined from Lucide (ISC licence) in `js/icons.js`, so no network is needed.
- Hero pointer parallax and magnetic buttons.
- Respects `prefers-reduced-motion`; keyboard navigation, skip link, visible focus states.

## Tests (optional)

```bash
pip install playwright && playwright install chromium
python3 -m http.server 8123 &            # serve the folder
python3 tests/stage1_test.py             # nav, keyboard, mobile menu, reduced motion, fonts, overflow
python3 tests/demo_isolated_test.py      # glass cursor (styleguide.html) and typing layer (demos/book-typing.html)
python3 tests/stage2_7_test.py           # hero, book, roadmap, certificate, case studies, mobile
python3 tests/full_site_test.py          # section order, responsive QA at 5 widths, contact, certificate, cursor labels
python3 tests/footer_test.py             # footer links, icons, placeholders vs real values, responsive stacking, contrast
```

## Notes

- Tested in Chromium (desktop and mobile emulation). Safari and Firefox have not been tested.
- Bootstrap is not used; the layout is plain CSS, so there is no dependency to load.
- Typing in the book: text over 80 characters fades in instead of being typed, so real project summaries stay short and readable.
- Cursor-following eyes were not built: the placeholder portraits are silhouettes, so there is no face to animate. The pointer-parallax hook in `js/effects.js` is where it would go once you have your real photo.
- Your existing Education Journey code was never uploaded, so the roadmap is new, not adapted from it.
- Text inside book pages is line-clamped so long copy can't overflow a page; keep book summaries short and put detail in the case study.
