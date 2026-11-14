Shifa — Interactive Personal Portfolio

A creative, interactive personal portfolio showcasing my projects, education journey, skills, achievements, and contact information.

Built using HTML, CSS, and Vanilla JavaScript, with no build step required.

The project uses "StPageFlip" (https://github.com/Nodlik/StPageFlip) (MIT License, v2.0.7), bundled locally in "js/vendor/".

Portfolio Sections

- Home
- About Me
- Projects — interactive 3D book with project case studies
- Education Journey — interactive winding-road layout
- Internship & Achievements
- Skills & Tools
- Contact
- Individual project case-study pages

Featured Interaction: The Ink Within

The Ink Within is an interactive feature designed to make exploring my portfolio more personal and engaging.

- Opens as a floating rectangular popup within the existing portfolio.
- Displays a welcome message and predefined questions about me.
- Provides answers about my background, projects, skills, learning journey, and contact information.
- Features an animated pencil that visually writes the responses in a handwritten style.
- Uses predefined questions and answers, without requiring AI APIs or external AI services.

This feature brings a creative, notebook-inspired interaction into the portfolio while keeping the experience simple and accessible.

Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- SVG
- StPageFlip
- Lucide Icons

Key Features

- Interactive 3D page-turning project book.
- Animated education journey with a winding SVG road.
- Interactive certificate viewer.
- Animated typing effects within project pages.
- Hero pointer interactions and magnetic buttons.
- Frosted-glass cursor effect with interactive labels.
- The Ink Within — animated handwritten Q&A experience.
- Responsive layouts for mobile and desktop.
- Keyboard navigation and visible focus states.
- Support for reduced-motion preferences.

Getting Started

Open in VS Code

1. Open VS Code.
2. Select File → Open Folder.
3. Choose the "Portfolio-Shifa" folder.
4. Install the Live Server extension by Ritwick Dey.
5. Right-click "index.html".
6. Select Open with Live Server.

The website will open in your browser and automatically reload when you save changes.

Run Locally

You can also open "index.html" directly in a browser.

Alternatively, run a local server:

cd Portfolio-Shifa
python3 -m http.server 8000

Then visit:

"http://localhost:8000"

Google Fonts (Fraunces and Hanken Grotesk) require an internet connection. System fonts are used as fallbacks when offline.

Customizing Portfolio Content

Most editable portfolio content is maintained in:

"js/config/content.js"

This includes:

- Profile information
- Name, role, and tagline
- Email and social media links
- Project descriptions and case studies
- Education milestones
- Internship and achievements
- Skills and tools
- About section
- Footer information

Update the relevant content in this file to customize the portfolio.

Project Structure

Portfolio-Shifa/
├── index.html
├── styleguide.html
├── demos/
│   └── book-typing.html
├── case-studies/
│   ├── project-1.html
│   ├── project-2.html
│   └── project-3.html
├── css/
├── js/
│   ├── config/
│   │   └── content.js
│   ├── vendor/
│   │   └── page-flip.browser.js
│   └── Other JavaScript files
├── assets/
│   └── images/
├── tools/
├── tests/
└── README.md

Third-Party Libraries and Credits

- StPageFlip: Used for the interactive page-flipping book. MIT License.
- Lucide Icons: Used for interface icons. ISC License.
- Google Fonts: Fraunces and Hanken Grotesk.

Browser Compatibility

The project has been tested in Chromium-based browsers, including desktop and mobile emulation.

Safari and Firefox compatibility has not yet been verified.

Future Improvements

- Further enhance portfolio interactions.
- Add more project case studies.
- Continue improving responsive design and accessibility.
- Expand the portfolio as new projects and skills are developed.

---

Designed and developed by Shifa.

GitHub and LinkedIn profiles are available through the portfolio's contact section.