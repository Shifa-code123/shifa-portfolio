
/* ==========================================================================
   content.js — Shifa's Personal Portfolio
   Existing structure and bindings preserved.
   Only personal content has been updated.
   ========================================================================== */

window.PORTFOLIO = {
  site: {
    title: "Shifa — Portfolio"
  },

  profile: {
    name: "Shifa",
    role: "Computer Engineering Student | Aspiring Product Designer",
    tagline: "I enjoy building thoughtful digital experiences through technology, creativity and problem-solving.",
    location: "Khamgaon, Maharashtra.",
    heroPortrait: "assets/images/hero-portrait.png",
    aboutPortrait: "assets/images/about-portrait.png"
  },

  /* Resume button. Put your real PDF at this path (see assets/resume/README.md). Nothing is invented:
     if the file is not found the button shows a disabled "coming soon" state instead of a broken link. */
  resume: {
    file: "assets/resume/Shifa-Resume.pdf",
    label: "Download resume",
    downloadName: "Shifa-Resume.pdf"
  },

  contact: {
    email: "shiiifali01@gmail.com",
    links: [
      { label: "GitHub", icon: "github", url: "https://github.com/Shifa-code123" },
      { label: "LinkedIn", icon: "linkedin", url: "https://www.linkedin.com/in/shifa-ali-671646427/" }
    ]
  },

  footer: {
    closing: "Curious by nature, creative by heart, and always learning something new. Thank you for exploring my little corner of the internet.",
    availability: {
      show: true,
      status: "Open to internship opportunities",
      note: "Interested in UI/UX, Product Design and creative collaborations."
    }
  },

  projects: [
    {
      id: "project-1",
      number: 1,
      title: "CampusSaathi",
      overview: "A student-focused campus management application designed to bring useful campus services and information together.",
      purpose: "To create a centralized platform supporting student and administrative activities.",
      role: "Android Developer & UI Implementation.And worked on owner side application.",
      technologies: ["Kotlin", "XML", "Firebase", "Firestore", "Cloudinary"],
      status: "Completed.",
      cover: "assets/images/project1of1.png",
      screenshots: [
        "assets/images/project1of2.png",
        "assets/images/project1of3.png"
      ],
      caseStudy: "case-studies/project-1.html",

      study: {
        intro: "CampusSaathi is an Android-based campus discovery and local services platform designed to help students, especially newcomers, easily explore and connect with essential services around their college. Moving to a new city or joining an unfamiliar campus often makes it difficult for students to find nearby stationery shops, bookstores, salons, accommodation, mess facilities and other everyday services. CampusSaathi brings these local resources together in one digital platform. It also introduces a social-media-inspired experience where local service owners can share their products, services, updates and events through posts, allowing students to discover businesses, interact with owners and stay informed about their surroundings.",

        problem: "Students entering a new college or moving to an unfamiliar location often struggle to find reliable information about nearby essential services. Information about stationery shops, bookstores, salons, rental rooms, mess facilities and other local businesses is usually scattered across different sources. Students may have to depend on word-of-mouth recommendations, manually search for locations or ask multiple people just to find basic facilities. On the other hand, small local business owners often lack a dedicated digital platform to showcase their services, share updates and directly reach the student community. There is a gap between students looking for nearby services and local owners trying to connect with potential customers.",

        goals: [
          "Student Module – Provide students with an easy-to-use platform to discover nearby shops, services, accommodation, mess facilities and other campus-related essentials. Enable students to explore locations through a map, browse owner posts, like and comment on updates, and connect with service providers.",

          "Owner Module – Allow local business owners and service providers to create their presence on the platform, share business information, upload photographs of their products and services, publish updates and announce events to reach students.",

          "Admin Module – Establish a centralized administrative layer for managing platform information and maintaining an organized ecosystem connecting students and local service providers.",

          "Centralized Campus Information – Bring essential campus-related services and nearby local resources together in one accessible digital platform.",

          "Student–Owner Connectivity – Create a direct communication and discovery channel between students and local service providers.",

          "Community Engagement – Introduce social-media-inspired interactions through posts, likes and comments, making service discovery more engaging and interactive."
        ],

        research: "The project started with identifying the everyday difficulties faced by students who are new to a college or unfamiliar with its surrounding area. The main focus was understanding how students discover essential local services and how local business owners communicate their offerings. This helped establish two primary user groups: students searching for nearby facilities and owners looking to promote their businesses. The research and problem understanding shaped the application's core concept around accessibility, location-based discovery, organized service information and student-owner interaction. The design approach aimed to make information discovery simple while giving local owners an opportunity to build visibility within the student community.",

        flow: {
          note: "The application follows a role-based user journey with separate experiences for students and service owners, supported by a centralized administrative module. Student Flow: Open the application → Create an account → Explore the surrounding area through the map → Discover nearby shops and services → Browse owner-uploaded posts → Like or comment on posts → View service and business information → Connect with the respective owner. Owner Flow: Open the application → Access the owner-side experience → Add business and service information → Upload photographs of products and offerings → Publish business updates and events → Share information with the student community. Admin Flow: A separate administrative layer is intended to support centralized platform management and organization. The overall technical foundation uses Kotlin and XML for Android development, Firebase Firestore for data management and Cloudinary for image handling.",
          image: ""
        },

        design: {
          note: "The UI/UX approach focuses on simplicity, accessibility and ease of navigation. Since the application serves two different user groups, the experience is structured around student-side discovery and owner-side service management. The student experience emphasizes exploring nearby places, discovering local businesses, viewing posts and interacting with owners. The owner experience focuses on presenting business information, uploading service photographs and sharing updates or events. A familiar social-media-inspired post interaction model helps make the platform more engaging. The interface is intended to keep essential information easy to find and reduce unnecessary complexity in everyday tasks. The design decisions prioritize clear navigation, understandable content organization and a consistent mobile application experience.",
          image: ""
        },

        contribution: "My primary contribution to CampusSaathi focused on UI/UX design and owner-side Android application development. I worked on understanding the owner-side user experience and how local service providers could present their businesses to students. My responsibilities included contributing to the interface structure, thinking through user interactions and developing owner-side functionality. This involved working with Kotlin and XML for Android development, along with Firebase Firestore and Cloudinary as part of the application's technical foundation. I also contributed to shaping the overall experience so that the owner module aligned with the project's larger goal of connecting local service providers with students. The project helped me understand the relationship between interface design, user requirements and practical application development.",

        challenges: [
          {
            challenge: "Designing an application for two different user groups with different needs. Students need a simple discovery experience, while local business owners need a way to present their services and share updates.",
            solution: "The application concept was structured around separate student and owner modules. This role-based approach helps keep each user's journey focused on their specific requirements while maintaining a connected platform."
          },

          {
            challenge: "Organizing different types of local services and business information within a single application without making the experience confusing.",
            solution: "The project follows a centralized service-discovery approach that brings different local resources, including shops, stationery, bookstores, salons, accommodation and mess facilities, into one platform."
          },

          {
            challenge: "Creating a meaningful way for local business owners to showcase their offerings instead of limiting the application to a basic directory of businesses.",
            solution: "A social-media-inspired posting concept was introduced, allowing owners to upload photographs, share information about their offerings and communicate updates or events. Students can interact with these posts through likes and comments."
          },

          {
            challenge: "Handling business information and image-based content as part of an Android application.",
            solution: "The project uses Firebase Firestore as its data-management foundation and Cloudinary for image handling, alongside Kotlin and XML for Android application development."
          },

          {
            challenge: "Ensuring that the owner-side experience supports the overall purpose of the platform and remains useful for local service providers.",
            solution: "The owner-side experience was approached around three important activities: presenting business information, uploading products or service photographs, and sharing updates or events with students."
          }
        ],

        outcomes: "CampusSaathi developed into a broader concept than a conventional campus information application. It combines local service discovery with social-media-inspired community interaction, creating a platform where students can explore their surroundings and owners can showcase their businesses. Working on this project strengthened my understanding of role-based application design, UI/UX thinking, Android development and the importance of designing around actual user requirements. It also gave me practical exposure to Kotlin, XML, Firebase Firestore and Cloudinary. One of my biggest learnings was understanding how different user journeys can come together within a single application while still maintaining a clear and focused experience.",

        next: "There are several opportunities to improve and expand CampusSaathi in the future. The platform could introduce more advanced search and filtering options to help students discover relevant services faster. A verified-owner system could improve trust and reliability. Additional possibilities include service booking, ratings and reviews, improved owner analytics, in-app notifications, enhanced location-based recommendations and a more comprehensive administrative dashboard. The student-owner communication experience could also be further developed to make connecting with local service providers easier. These improvements could help CampusSaathi evolve into a complete digital ecosystem for college communities."
      }
    },


    {
      id: "project-2",
      number: 2,
      title: "HealthAI",

      overview:
        "HealthAI is an AI-powered community health-literacy Android application designed to make reliable health information accessible, understandable, and engaging. The application focuses on preventive healthcare awareness, emergency education, and responsible use of AI in health-related information.",

      purpose:
        "To improve community health literacy by providing accessible educational resources, emergency awareness, interactive quizzes, and AI-assisted health information in one mobile application.",

      role:
        "Android Developer & UI Implementation. I primarily contributed to designing and developing XML-based Android layouts and integrating Firebase Firestore to connect the application with its cloud database. The project was developed collaboratively with a teammate.",

      technologies: [
        "Java",
        "XML",
        "Firebase",
        "Cloud Firestore",
        "Android Studio"
      ],

      status: "Developed Academic Project",

      cover: "assets/images/project2of1.jpeg",

      screenshots: [
        "assets/images/project2of2.jpeg",
        "assets/images/project2of3.jpeg"
      ],

      caseStudy: "case-studies/project-2.html",

      study: {
        intro: [
          "HealthAI is a community-focused health-literacy application developed to make health education more accessible through technology.",
          "Instead of functioning as a medical diagnosis or prescription tool, the application focuses on preventive awareness, emergency knowledge, and helping users understand health information responsibly."
        ],

        problem:
          "Many people lack access to simple, understandable, and reliable health education. Important information about heart health, stroke symptoms, diabetes, hygiene, preventive checkups, and emergency response is often scattered across different sources. People may also misunderstand AI-generated health information or rely on it without verifying its accuracy.",

        goals: [
          "Make health education accessible through a mobile application.",
          "Provide educational resources on common health topics.",
          "Improve awareness of emergency warning signs and first response.",
          "Promote responsible AI usage in health-related information.",
          "Make learning interactive through quizzes and awareness content.",
          "Organize health-related information in a simple and user-friendly interface."
        ],

        research:
          "The project focused on understanding common community health-literacy gaps and identifying topics that could be communicated through a simple digital platform. The content scope included heart health, stroke awareness, diabetes, hydration, personal hygiene, preventive health checkups, and AI literacy. The research direction emphasized clear communication, accessibility, preventive education, and responsible health information consumption.",

        flow: {
          note:
            "The application follows a simple learning journey. Users can explore health education topics, access emergency awareness information, interact with the AI health assistant, attempt awareness quizzes, explore digital health content, and access additional health-related utilities.",
          image: ""
        },

        design: {
          note:
            "The Android application interface was implemented using XML layouts. The focus was on creating an organized, accessible, and easy-to-navigate experience. Different sections were structured to help users discover health topics, emergency resources, quizzes, and other application features without unnecessary complexity.",
          image: ""
        },

        contribution:
          "My primary contribution was in Android UI implementation and Firebase integration. I worked on developing the XML layouts that structure the application's screens and user interface. I also worked on connecting the application with Firebase Cloud Firestore to support cloud-based data storage and retrieval. I collaborated with my teammate throughout the development process, contributing to the implementation and integration of the application. My main technical focus was XML-based UI development and the Firestore connection.",

        challenges: [
          {
            challenge:
              "Creating organized and consistent Android application layouts for multiple health-related modules.",
            solution:
              "Worked with XML layouts in Android Studio to structure the application screens and maintain a consistent interface across different sections."
          },
          {
            challenge:
              "Connecting the Android application with a cloud-based database.",
            solution:
              "Worked on Firebase Cloud Firestore integration to establish the application's connection with cloud data storage."
          },
          {
            challenge:
              "Presenting health information in a way that is understandable to users without creating confusion between health education and medical advice.",
            solution:
              "Organized the content around awareness and preventive education, with an emphasis on responsible AI usage rather than medical diagnosis or prescriptions."
          }
        ],

        outcomes:
          "The project resulted in a functional health-literacy application concept combining Android development, cloud database integration, and interactive educational features. In a documented evaluation involving 60 participants, the project recorded improvements in several learning indicators: F.A.S.T. stroke awareness increased from 28.3% to 91.7%, AI safety awareness from 45.0% to 96.6%, and preventive screening awareness from 38.3% to 81.6%. The average quiz score increased from 4.2/10 to 8.7/10. These results reflect improvements in participants' health-literacy knowledge, not clinical health outcomes.",

        next:
          "Future improvements could include expanding multilingual support, improving the AI assistant's information verification, enhancing the user experience, adding more health education modules, strengthening database functionality, and conducting broader usability testing."
      }
    },



    {
      id: "project-3",
      number: 3,
      title: "Blood Donation Prediction",

      overview:
        "Blood Donation Prediction is a supervised machine learning micro-project that explores how historical blood donation records can be used to predict the likelihood of future donations. The project applies data analysis, feature engineering, and machine learning techniques to understand donor behaviour and support better blood donation planning.",

      purpose:
        "To investigate how historical donor information can help identify potential blood donors and support more informed blood donation campaigns through predictive analytics.",

      role:
        "Machine Learning Project Developer. Contributed to data preprocessing, feature analysis, model development, performance evaluation, and Flask-based application integration as part of the project.",

      technologies: [
        "Python",
        "Machine Learning",
        "Pandas",
        "NumPy",
        "Scikit-learn",
        "Flask",
        "Joblib"
      ],

      status: "Completed Machine Learning Micro-Project",

      cover: "assets/images/project3of1.png",

      screenshots: [
        "assets/images/project3of2.png",
        "assets/images/project3of3.png"
      ],

      caseStudy: "case-studies/project-3.html",

      study: {
        intro:
          "Blood Donation Prediction is a data-driven machine learning project designed to explore donor behaviour using historical blood donation records. It uses Recency, Frequency, Monetary, and Time (RFM-T) features to understand donation patterns and develop a predictive model.",

        problem:
          "Blood donation organizations need to identify potential donors and encourage regular donations. However, predicting whether a previous donor is likely to donate again can be challenging. Historical donation records contain useful behavioural patterns, but these records need to be processed and analyzed before they can support meaningful predictions. This project explores how machine learning can help address this problem.",

        goals: [
          "Understand historical blood donation data.",
          "Analyze donor behaviour using RFM-T features.",
          "Perform data preprocessing and feature analysis.",
          "Develop a supervised machine learning prediction model.",
          "Evaluate model performance using appropriate metrics.",
          "Integrate the trained model into a Flask application.",
          "Explore how predictive analytics can support donor outreach and planning."
        ],

        research:
          "The project uses an RFM-T analytical approach. Recency represents the time since the last donation, Frequency represents the number of previous donations, Monetary represents the total blood donated, and Time represents the period since the first donation. These features help describe donor history and provide useful inputs for supervised machine learning. The project follows a workflow involving dataset understanding, preprocessing, feature preparation, model training, evaluation, and application integration.",

        flow: {
          note:
            "The project follows a structured machine learning pipeline: Historical Donation Dataset → Data Understanding → Data Cleaning and Preprocessing → RFM-T Feature Analysis → Model Training → Model Evaluation → Model Serialization using Joblib → Flask API Integration → Prediction Output.",
          image: ""
        },

        design: {
          note:
            "The system was structured around a machine learning backend and a Flask-based application layer. Python was used for data processing and model development, while Joblib was used to serialize the trained model for reuse. Flask provided an application interface for connecting the prediction model with the user-facing system.",
          image: ""
        },

        contribution:
          "My contribution focused on the machine learning development workflow. I worked on understanding the blood donation dataset, preparing the data for analysis, exploring RFM-T features, and contributing to the development and evaluation of the supervised learning model. I also worked with the Flask integration workflow to make the trained model accessible through an application interface. This project helped me gain practical experience in Python-based data analysis, predictive modelling, model evaluation, and integrating machine learning models into applications.",

        challenges: [
          {
            challenge:
              "Understanding donor behaviour from historical donation records and identifying meaningful features for prediction.",
            solution:
              "Used the RFM-T framework to organize donation history into meaningful analytical features, helping structure the dataset for machine learning."
          },
          {
            challenge:
              "Preparing historical data for supervised machine learning.",
            solution:
              "Worked with the data preprocessing and feature preparation workflow to make the dataset suitable for model training and evaluation."
          },
          {
            challenge:
              "Making the trained machine learning model accessible through an application.",
            solution:
              "Used Joblib for model serialization and worked with Flask integration to connect the prediction model with an application interface."
          }
        ],

        outcomes:
          "The project successfully demonstrated an end-to-end machine learning workflow for blood donation prediction, from historical data analysis to model integration using Flask. The model achieved a reported accuracy of approximately 0.76 (76%) during the project evaluation. The project provided practical experience in predictive analytics, feature engineering, supervised learning, model evaluation, and deployment-oriented integration.",

        next:
          "Future improvements could include experimenting with additional machine learning algorithms, optimizing model parameters, evaluating precision, recall, F1-score and ROC-AUC, handling class imbalance, testing the model on larger datasets, and improving the Flask interface. Further work could also explore more reliable donor behaviour patterns to support blood donation organizations."
      }
    },

    /* ======================================================================================
       PROJECT 4 — Atharva Fitness World (title supplied; the rest are placeholders)
       1. Replace every "[Add ...]" below with your real project details (nothing is pre-filled).
       2. Put images in assets/images/ and set cover / screenshots.
       3. (Already published: draft is false.)  The book, page counter and case study (case-studies/project-4.html,
          already created) update automatically.
       Preview the unfinished page in the book at  index.html?preview=project-4
       ====================================================================================== */
    {
      id: "project-4",
      number: 4,
      draft: false,
      title: "Atharva Fitness World – Gym Management Website",

      overview: "Atharva Fitness World is a web-based Gym Management System developed to digitize and simplify daily gym operations. The platform replaces manual record-keeping with a centralized system for managing gym members, membership plans, attendance, and administrative activities. It also includes an attendance streak and ranking feature to encourage consistency among gym members.",

      purpose: "The primary purpose of this project was to transform traditional manual gym management processes into a digital and organized system. The website was designed to reduce paperwork, simplify administrative tasks, maintain accurate member records, and improve attendance tracking through an automated system.",

      role: "Worked as a UI/UX Designer and Web Development Team Member in a two-person team. I designed three website pages, while my teammate designed the other three. I independently handled the complete Admin Panel design and contributed significantly to its development and implementation. I also worked on the main website pages, including membership plans and other user-facing sections.",

      technologies: [
        "Python",
        "Flask",
        "HTML5",
        "CSS3",
        "Bootstrap",
        "JavaScript",
        "Database Management"
      ],

      status: "Completed",

      cover: "assets/images/project4.png",

      screenshots: [],

      caseStudy: "case-studies/project-4.html",

      study: {
        intro: "Atharva Fitness World was developed as a practical solution to modernize traditional gym management operations. The project focused on creating a user-friendly digital platform where administrators could manage gym members, membership plans, attendance records, and other essential activities. The system also introduced an attendance streak and ranking feature to motivate members to maintain regular gym attendance.",

        problem: "Traditional gym operations often depend on manual registers and paperwork for managing member information, attendance, and membership details. This approach can become time-consuming, difficult to maintain, and prone to human errors. Tracking attendance consistency and identifying the most regular gym members manually also creates additional administrative work. Our project aimed to solve these problems through a centralized digital management system.",

        goals: [
          "Digitize traditional gym management operations and reduce manual paperwork.",
          "Provide an organized system for managing gym members and their records.",
          "Simplify membership plan management and related administrative activities.",
          "Automate member attendance tracking.",
          "Maintain attendance history and calculate consecutive attendance streaks.",
          "Display member rankings based on attendance consistency.",
          "Create a simple, user-friendly interface for administrators and gym members."
        ],

        research: "This project was assigned as a team-based development project. We started by understanding the requirements of a gym management environment and identifying the problems associated with manual record-keeping. We considered the needs of administrators and gym members, explored the essential features required for daily gym operations, and planned the website structure accordingly. Requirement understanding and feature planning helped us decide the main modules, user flow, and administrative functionalities.",

        flow: {
          note: "The application follows a structured user flow. Users can access the website, explore gym information and membership plans, and proceed through the registration and login process. After authentication, users can access the relevant features according to their roles. The Admin Panel provides centralized access to administrative operations such as member management, attendance records, membership-related information, and other management activities. Attendance records are used to maintain member history and calculate attendance streaks and rankings.",
          image: ""
        },

        design: {
          note: "The website was designed with a focus on usability, simplicity, and organized information presentation. The work was divided between two team members, with each designing three website pages. I independently designed the complete Admin Panel, focusing on a structured dashboard, clear navigation, organized information, and accessible management sections. I also contributed to the design of the main website pages, including membership plans and other user-facing sections. The design process involved planning page layouts, arranging content, selecting suitable UI elements, and maintaining consistency across the website.",
          image: ""
        },

        contribution: "My primary contribution was in UI/UX design and the Admin Panel. I independently designed the complete Admin Panel and worked on its development and implementation. In our two-member team, I designed three website pages, while my teammate designed the remaining three. I also contributed to the main website, including the membership plans and other front-facing pages. I participated in understanding requirements, planning the interface, organizing features, and developing the overall gym management experience using the selected technologies.",

        challenges: [
          {
            challenge: "Understanding the requirements of a real-world gym management system and identifying which operations needed to be digitized.",
            solution: "We analyzed the basic workflow of gym operations and divided the requirements into manageable modules, including member management, membership plans, attendance tracking, and administration."
          },
          {
            challenge: "Designing an Admin Panel that could manage multiple gym operations without making the interface complicated.",
            solution: "I focused on a structured layout, clear navigation, organized sections, and a consistent interface to make administrative tasks easier to understand and manage."
          },
          {
            challenge: "Maintaining consistency across six website pages designed by two different team members.",
            solution: "We coordinated the page layouts, visual elements, and design structure to maintain a consistent user experience throughout the website."
          },
          {
            challenge: "Implementing an attendance tracking system that could maintain member history and identify consecutive attendance patterns.",
            solution: "We planned an attendance history and streak-based tracking approach to organize member attendance records and support member rankings based on consistency."
          },
          {
            challenge: "Connecting the frontend interface with backend functionality and database operations.",
            solution: "We used Flask and Python for backend development and integrated the website with a database to support structured data storage and management."
          }
        ],

        outcomes: "Successfully completed a web-based Gym Management System that digitizes essential gym operations. The project brings member management, membership information, and attendance tracking into a centralized platform. The attendance streak and ranking feature adds a motivational element by highlighting members who maintain consistent attendance. This project also strengthened my practical understanding of UI/UX design, Admin Panel development, team collaboration, frontend technologies, Flask-based backend development, and database integration.",

        next: "Future improvements could include online membership payments, automated membership renewal reminders, advanced attendance analytics, downloadable reports, role-based access control, and improved mobile accessibility. The system could also be enhanced with additional dashboards to help gym administrators make better operational decisions."
      }
    },

  ],

  education: {
    milestones: [
      {
        id: "school",
        label: "School",
        year: "Completed in 2022",
        institution: "St Ann's English Medium High School, Khamgaon.",
        description: "Completed 10th with 93% ",
        image: ""
      },
      {
        id: "twelfth",
        label: "12th Standard",
        year: "Completed in 2024",
        institution: "Gungkar College.",
        qualification: "12th Standard with PCM",
        description: "Completed 12th with 90%",
        image: ""
      },
      {
        id: "diploma",
        label: "Diploma in Computer Science",
        year: "Completed in 2026",
        institution: "Government Polytechnic, Khamgaon.",
        qualification: "Diploma in Computer Science",
        description: "Completed Diploma in Computer Science. Achieved 91.24% in the final semester.",
        image: ""
      },
      {
        id: "engineering",
        label: "Engineering at SSGMCE",
        year: "2026 - 2029",
        institution: "Shri Sant Gajanan Maharaj College of Engineering (SSGMCE)",
        qualification: "B.E. in Computer Engineering — Direct Second Year",
        description: "Currently pursuing Computer Engineering.",
        image: ""
      }
    ]
  },

  internship: {
    organization: "LitsBros Pvt. Ltd., Amravati",
    role: "Software Trainee – Python Technology",
    duration: "02 June 2025 – 23 August 2025",
    work: ["Client web-development projects, client requirements ke according reporting, aur technical support."],
    skills: ["Client communication, requirement handling, reporting, teamwork aur task orientation."],
    contributions: [
      "Independently developed the complete Admin Panel, including its functionality and code.",
      "Added extra features to improve the application's functionality.",
      "Contributed to frontend planning and UI/UX design decisions."
    ],
    achievements: ["Received the Most Regular Student Award as part of the team."],
    certificate: {
      preview: "assets/images/internship.png",
      pdf: "",
      alt: "Internship certificate"
    }
  },

  skills: {
    groups: [
      {
        title: "Programming Languages",
        items: ["Java", "Kotlin", "C", "Python"]
      },
      {
        title: "Mobile & Web Development",
        items: ["Android Development", "XML", "HTML", "CSS", "JavaScript", "Bootstrap"]
      },
      {
        title: "Backend & Database",
        items: ["Firebase", "Firestore", "Cloudinary"]
      },
      {
        title: "Design & Prototyping",
        items: ["Figma", "Wireframing", "Prototyping", "UI/UX Design"]
      },
      {
        title: "Development Tools",
        items: ["Android Studio", "GitHub", "VS Code"]
      }
    ]
  },

  about: {
    intro: "I'm Shifa, a Computer Engineering student with a background in Computer Science. I enjoy combining technology, design and creativity to build useful digital experiences. I'm particularly interested in Product Design, UI/UX and understanding how well-designed systems work.",
    interests: [
      "Product Design",
      "UI/UX Design",
      "Android Development",
      "System Design",
      "Creative Problem Solving"
    ],
    approach: "I believe in learning by building. I enjoy exploring an idea, understanding the problem, experimenting with solutions and improving through practical experience.",
    philosophy: "I believe technology should be useful, intuitive and thoughtfully designed. My goal is to create digital experiences that balance functionality, simplicity and meaningful design."
  }
};
