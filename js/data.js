// ============================================================
// PORTFOLIO DATA — Mostafa Mohamed Ayad
// ============================================================

const PORTFOLIO_DATA = {
  personal: {
    name: "Mostafa Ayad",
    nameAr: "مصطفى محمد عياد",
    title: "Graphic Designer & IT Specialist",
    tagline: "I DON'T JUST DESIGN.",
    tagline2: "I CRAFT EXPERIENCES.",
    bio: "I'm <strong>Mostafa Mohamed Ayad</strong>, a Graphic Designer, Motion Artist & IT Specialist crafting bold, modern and unforgettable digital experiences.",
    avatar: "assets/images/hero-photo.jpg",
    available: true,
    currentVibe: "Creating",
    nowPlaying: { title: "Cyberpunk", artist: "Eternal Night" },
    quote: "Great design is not just what it looks like, it's how it works.",
    email: "mostafamayad@gmail.com",
    phone: "+20 103 212 9702",
    location: "Tanta, Egypt",
    university: "Higher Institute of Engineering & Technology – Tanta",
    department: "Communications & Computer Engineering",
    cvFile: "assets/cv.pdf"
  },

  stats: [
    { value: 5, suffix: "+", label: "YEARS GRAPHIC\nDESIGN", icon: "🎨" },
    { value: 3, suffix: "+", label: "YEARS\nMOTION", icon: "🎬" },
    { value: 2, suffix: "+", label: "YEARS\nIT SUPPORT", icon: "💻" },
    { value: 50, suffix: "+", label: "PROJECTS\nDELIVERED", icon: "🏆" }
  ],

  socials: [
    { name: "Behance",  icon: "fab fa-behance",   url: "https://www.behance.net/mostafaayyad",              id: "be" },
    { name: "GitHub",   icon: "fab fa-github",    url: "https://github.com/mostafamayad",                  id: "gh" },
    { name: "LinkedIn", icon: "fab fa-linkedin",  url: "https://www.linkedin.com/in/officailmostafaayad/", id: "li" },
    { name: "Facebook", icon: "fab fa-facebook",  url: "https://www.facebook.com/mo.ayyad.14",             id: "fb" }
  ],

  nav: [
    { id: "home",       label: "HOME",       num: "01", page: "index.html"      },
    { id: "about",      label: "ABOUT",      num: "02", page: "about.html"      },
    { id: "works",      label: "WORKS",      num: "03", page: "works.html"      },
    { id: "experience", label: "EXPERIENCE", num: "04", page: "experience.html" },
    { id: "services",   label: "SERVICES",   num: "05", page: "services.html"   },
    { id: "blog",       label: "BLOG",       num: "06", page: "blog.html"       },
    { id: "contact",    label: "CONTACT",    num: "07", page: "contact.html"    }
  ],

  categories: [
    { id:1, num:"01", title:"SOCIAL MEDIA DESIGN",  subtitle:"Posts, banners & stories that grab attention.", color:"#7c3aed" },
    { id:2, num:"02", title:"POSTER DESIGN",         subtitle:"Bold visuals that speak louder than words.",    color:"#06b6d4" },
    { id:3, num:"03", title:"BRANDING & IDENTITY",   subtitle:"Logos, brand identity & visual systems.",       color:"#a855f7" },
    { id:4, num:"04", title:"UI/UX DESIGN",          subtitle:"Websites & interfaces designed with purpose.",   color:"#f59e0b" },
    { id:5, num:"05", title:"MOTION GRAPHICS",       subtitle:"Bringing ideas to life through motion.",         color:"#10b981" },
    { id:6, num:"06", title:"IT & NETWORKING",       subtitle:"CCNA, MCSA, AWS — infrastructure that works.",  color:"#ef4444" }
  ],

  projects: [
    { id:1, title:"Social Campaign Design",    category:"social",    description:"Bold social media campaign visuals with striking Arabic & English typography.", year:"2024", link:"https://www.behance.net/mostafaayyad" },
    { id:2, title:"Motivational Poster Series",category:"poster",    description:"Arabic motivational poster series with bold typography and neon effects.",      year:"2024", link:"https://www.behance.net/mostafaayyad" },
    { id:3, title:"Brand Identity System",     category:"branding",  description:"Complete brand identity — logo, colors, typography and brand guidelines.",      year:"2023", link:"https://www.behance.net/mostafaayyad" },
    { id:4, title:"UI/UX App Design",          category:"web",       description:"Mobile app interface with dark premium aesthetic and smooth UX flows.",          year:"2024", link:"https://www.behance.net/mostafaayyad" },
    { id:5, title:"Motion Graphics Reel",      category:"motion",    description:"Cinematic motion graphics and video editing reel showcasing 3 years of work.",   year:"2024", link:"https://www.behance.net/mostafaayyad" },
    { id:6, title:"Network Infrastructure",    category:"it",        description:"CCNA-level network design and implementation project for SME environment.",       year:"2023", link:"https://github.com/mostafamayad"       }
  ],

  skills: [
    { name:"Graphic Design",          level:95, icon:"🎨" },
    { name:"Motion Graphics & Video", level:85, icon:"🎬" },
    { name:"UI/UX Design",            level:80, icon:"💡" },
    { name:"HTML / CSS",              level:80, icon:"🌐" },
    { name:"Node.js / SQL",           level:65, icon:"⚙️" },
    { name:"Flutter",                 level:60, icon:"📱" },
    { name:"CCNA / Networking",       level:75, icon:"🔌" },
    { name:"AWS / Cloud",             level:65, icon:"☁️" }
  ],

  techStack: [
    { name:"Photoshop",   icon:"🖼️" },
    { name:"Illustrator", icon:"✦"  },
    { name:"After Effects",icon:"🎬"},
    { name:"Premiere Pro",icon:"🎞️" },
    { name:"Figma",       icon:"💡" },
    { name:"HTML/CSS",    icon:"🌐" },
    { name:"Node.js",     icon:"⚙️" },
    { name:"Flutter",     icon:"📱" },
    { name:"SQL",         icon:"🗄️" },
    { name:"AWS",         icon:"☁️" },
    { name:"CCNA",        icon:"🔌" },
    { name:"MCSA",        icon:"🖥️" }
  ],

  experience: [
    {
      year:    "2021 — Present",
      role:    "Freelance Graphic Designer",
      company: "Self-Employed",
      desc:    "Delivering brand identities, social media content, poster design, and motion graphics for clients across Egypt and the Arab world."
    },
    {
      year:    "2022 — Present",
      role:    "Motion Graphics & Video Editor",
      company: "Freelance",
      desc:    "Creating cinematic motion graphics, YouTube content, and promotional videos using After Effects and Premiere Pro."
    },
    {
      year:    "2023 — Present",
      role:    "IT Support Specialist",
      company: "Internship & Projects",
      desc:    "Network setup, troubleshooting, and IT infrastructure. Studying CCNA, MCSA & AWS certifications."
    },
    {
      year:    "2022 — Present",
      role:    "Web & App Developer",
      company: "Personal Projects",
      desc:    "Building web applications using HTML, CSS, Node.js, SQL and mobile apps with Flutter."
    }
  ],

  education: [
    {
      year:    "2022 — Present",
      role:    "B.Sc. Communications & Computer Engineering",
      company: "Higher Institute of Engineering & Technology — Tanta",
      desc:    "Specializing in telecommunications, computer networks, and software engineering."
    }
  ],

  certifications: [
    { name:"CCNA",             org:"Cisco",     icon:"🔌", year:"2024" },
    { name:"MCSA",             org:"Microsoft", icon:"🖥️", year:"2024" },
    { name:"AWS Cloud",        org:"Amazon",    icon:"☁️", year:"2024" },
    { name:"Graphic Design",   org:"Adobe",     icon:"🎨", year:"2022" },
    { name:"Motion Graphics",  org:"Adobe",     icon:"🎬", year:"2022" },
    { name:"UI/UX Design",     org:"Coursera",  icon:"💡", year:"2023" }
  ],

  services: [
    { icon:"✦", title:"Brand Identity",       desc:"Complete brand systems — logo, colors, typography, and full guidelines.",              price:"From $200"  },
    { icon:"◈", title:"Social Media Design",   desc:"Eye-catching posts, stories & banners that stop the scroll every time.",              price:"From $80"   },
    { icon:"🎬", title:"Motion Graphics",       desc:"Animated intros, promos, and cinematic visual effects that wow your audience.",        price:"From $150"  },
    { icon:"⬡", title:"UI/UX Design",          desc:"Beautiful, functional interfaces for web and mobile with full Figma files.",           price:"From $300"  },
    { icon:"▲", title:"Poster Design",         desc:"Bold print and digital posters — Arabic and English — with massive visual impact.",    price:"From $50"   },
    { icon:"💻", title:"Web Development",       desc:"Responsive websites using HTML, CSS, Node.js & modern frontend technologies.",        price:"From $250"  }
  ]
};

// ── Load from Admin overrides ─────────────────────────────
function loadData() {
  const saved = localStorage.getItem('portfolio_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return deepMerge(PORTFOLIO_DATA, parsed);
    } catch(e) { return PORTFOLIO_DATA; }
  }
  return PORTFOLIO_DATA;
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const DATA = loadData();
