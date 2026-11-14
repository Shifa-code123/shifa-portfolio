/* ==========================================================================
   ink-within.js (config) — everything "The Ink Within" says. Edit freely; no code changes needed.

   - welcome:   the sentence the pencil writes when the paper opens.
   - questions: the list the visitor can pick from. Each one has
        q        the question shown on the paper
        a        the answer the pencil writes (plain text; keep it to a few short sentences)
        actions  optional buttons shown under the answer. Each action is one of:
                   { label: "Open the project book", href: "#projects" }      jump to a section of the page
                   { label: "Email me", href: "mailto:you@example.com" }       open an email
                   { label: "Download resume", resume: true }                  uses resume.file from content.js
                   { label: "GitHub", href: "https://github.com/you" }         opens in a new tab
   - Handwriting supports letters, digits and common punctuation (. , ! ? ' " - : ; ( ) @ % & / +).
     Accented letters and emoji are not part of the handwriting font and are skipped.
   - Add, remove or reorder questions as you like; the list builds itself.
   No AI, no API keys, no server: this is just a list of predefined questions and answers.
   ========================================================================== */
window.INK_WITHIN = {
  welcome: "Hello, I'm Shifa. What would you like to know about me?",
  backLabel: "Back to questions",
  questions: [
    {
      q: "Who is Shifa?",
      a: "I'm Shifa, a Computer Engineering student from Khamgaon. I love mixing technology, design and creativity to build useful digital experiences, and I'm drawn to Product Design and UI/UX.",
      actions: [{ label: "More about me", href: "#about" }]
    },
    {
      q: "What projects have you worked on?",
      a: "I've worked on CampusSaathi, HealthAI, Blood Donation Prediction and a gym management website for Atharva Fitness World. Open the project book to read each case study.",
      actions: [{ label: "Open the project book", href: "#projects" }]
    },
    {
      q: "Tell me about CampusSaathi.",
      a: "CampusSaathi is my capstone Android app. It helps new students find nearby shops, rooms and mess facilities, while local owners share posts and events. I worked on the UI/UX and the owner-side app using Kotlin, XML, Firebase and Cloudinary.",
      actions: [{ label: "Read the case study", href: "case-studies/project-1.html" }]
    },
    {
      q: "What skills do you have?",
      a: "Java, Kotlin, C and Python. Android, XML, HTML, CSS, JavaScript and Bootstrap. Firebase, Firestore and Cloudinary. Figma, wireframing and prototyping. Plus Android Studio, GitHub and VS Code.",
      actions: [{ label: "See skills & tools", href: "#skills" }]
    },
    {
      q: "What can you do?",
      a: "I can design clean interfaces in Figma, build Android apps and websites, and develop admin panels. I built one during my internship. I learn best by building things.",
      actions: [{ label: "See my work", href: "#projects" }]
    },
    {
      q: "What is your learning journey?",
      a: "I finished 10th with 93% and 12th (PCM) with 90%, then completed my Diploma in Computer Science in 2026 with 91.24% in the final semester. Now I'm studying Computer Engineering at SSGMCE, 2026 to 2029.",
      actions: [{ label: "See the journey", href: "#education" }]
    },
    {
      q: "Can I see your resume?",
      a: "Of course! My resume is right below.",
      actions: [{ label: "Download resume", resume: true }]
    },
    {
      q: "How can I contact you?",
      a: "I'd love to hear from you! Write to me at shiiifali01@gmail.com. I'm open to internship opportunities and creative collaborations.",
      actions: [
        { label: "Email me", href: "mailto:shiiifali01@gmail.com" },
        { label: "Contact section", href: "#contact" }
      ]
    }
  ]
};
