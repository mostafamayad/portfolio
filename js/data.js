// ============================================================
// DATA.JS — Central Data Store (with LocalStorage override)
// ============================================================

const PORTFOLIO_DATA = {
  personal: {
    name: 'Mostafa Mohamed Ayad',
    title: 'Graphic Designer & Visual Creator',
    bio: "I'm <strong>Mostafa Mohamed Ayad</strong>, a Graphic Designer &amp; Visual Creator from Tanta, Egypt — crafting bold, modern and unforgettable digital experiences that leave a mark.",
    email: 'mo.ayyad1711@gmail.com',
    phone: '+20 103 212 9702',
    location: 'Tanta, Egypt',
    university: 'HIET — Tanta',
    available: true,
    quote: 'Great design is not just what it looks like — it\'s how it works and what it makes you feel.',
    currentVibe: 'Creating',
    nowPlaying: { title: 'Alf Leila wa Leila', artist: 'Om Kalthoum' },
    // Images — controlled from admin panel
    profileImage: 'assets/images/profile.jpg',
    coverImage: 'assets/images/profile.jpg',
    logoImage: 'assets/images/logo.png',
  },

  socials: [
    { id: 'behance',  name: 'Behance',  icon: 'fab fa-behance',  url: 'https://www.behance.net/mostafaayyad' },
    { id: 'github',   name: 'GitHub',   icon: 'fab fa-github',   url: 'https://github.com/mostafamayad' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', url: 'https://www.linkedin.com/in/officailmostafaayad/' },
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', url: 'https://www.facebook.com/mo.ayyad.14' },
  ],

  stats: [
    { icon: 'fa-solid fa-palette', value: 5,  suffix: '+', label: 'YEARS OF\nDESIGN' },
    { icon: 'fa-solid fa-clapperboard', value: 3,  suffix: '+', label: 'YEARS IN\nMOTION' },
    { icon: 'fa-solid fa-laptop-code', value: 2,  suffix: '+', label: 'YEARS IN\nIT' },
    { icon: 'fa-solid fa-rocket', value: 50, suffix: '+', label: 'PROJECTS\nDELIVERED' },
  ],

  skills: [
    { name: 'Graphic Design',     level: 95 },
    { name: 'Motion Graphics',    level: 85 },
    { name: 'Video Editing',      level: 88 },
    { name: 'UI/UX Design',       level: 80 },
    { name: 'HTML / CSS',         level: 75 },
    { name: 'IT & Networking',    level: 78 },
    { name: 'Node.js / SQL',      level: 60 },
    { name: 'Flutter',            level: 55 },
  ],

  techStack: [
    { name: 'Photoshop',     icon: 'fa-solid fa-palette' },
    { name: 'Illustrator',   icon: 'fa-solid fa-pen-nib' },
    { name: 'Premiere Pro',  icon: 'fa-solid fa-clapperboard' },
    { name: 'After Effects', icon: 'fa-solid fa-wand-magic-sparkles' },
    { name: 'Figma',         icon: 'fa-solid fa-drafting-compass' },
    { name: 'HTML / CSS',    icon: 'fa-solid fa-code' },
    { name: 'Node.js',       icon: 'fa-brands fa-node-js' },
    { name: 'SQL',           icon: 'fa-solid fa-database' },
    { name: 'Flutter',       icon: 'fa-solid fa-mobile-screen' },
    { name: 'CCNA',          icon: 'fa-solid fa-network-wired' },
    { name: 'AWS',           icon: 'fa-solid fa-cloud' },
    { name: 'MCSA',          icon: 'fa-solid fa-desktop' },
  ],

  certifications: [
    { name: 'CCNA Certification',   org: 'Cisco',     year: '2023', icon: 'fa-solid fa-network-wired' },
    { name: 'MCSA',                 org: 'Microsoft', year: '2022', icon: 'fa-solid fa-desktop' },
    { name: 'AWS Cloud Practitioner',org: 'Amazon',   year: '2023', icon: 'fa-solid fa-cloud' },
    { name: 'UI/UX Design',         org: 'Coursera',  year: '2023', icon: 'fa-solid fa-drafting-compass' },
    { name: 'Web Development',      org: 'Udemy',     year: '2022', icon: 'fa-solid fa-code' },
    { name: 'Motion Graphics',      org: 'Udemy',     year: '2021', icon: 'fa-solid fa-clapperboard' },
  ],

  experience: [
    {
      year: '2022 — Present',
      role: 'Freelance Graphic Designer',
      company: 'Self-Employed',
      desc: 'Creating brand identities, social media content, motion graphics, and digital campaigns for clients across different industries.',
    },
    {
      year: '2023 — Present',
      role: 'IT Support Specialist',
      company: 'Freelance / Local Businesses',
      desc: 'Network setup, server configuration, troubleshooting, and technical support for small businesses in Tanta.',
    },
    {
      year: '2021 — 2022',
      role: 'Junior Designer',
      company: 'Local Design Studio',
      desc: 'Designed print materials, social media content, and assisted in branding projects.',
    },
  ],

  education: [
    {
      year: '2021 — Present',
      role: 'B.Sc. Communications & Computer Engineering',
      company: 'Higher Institute of Engineering & Technology — Tanta (HIET)',
      desc: 'Studying Communications, Computer Engineering, Networking, and Software Development.',
    },
  ],

  categories: [
    { id: 1, num: '01', title: 'BRANDING & IDENTITY', subtitle: 'Brand Identity, Logos, Print', color: '#7c3aed' },
    { id: 2, num: '02', title: 'SOCIAL MEDIA',         subtitle: 'Posts, Stories, Campaigns',   color: '#06b6d4' },
    { id: 3, num: '03', title: 'THUMBNAIL',            subtitle: 'Thumbnails & YouTube Covers', color: '#e11d48' },
    { id: 4, num: '04', title: 'POSTER DESIGN',        subtitle: 'Posters, Prints, Campaigns',  color: '#f59e0b' },
    { id: 5, num: '05', title: 'UI/UX',                subtitle: 'Web & App Interfaces',       color: '#10b981' },
    { id: 6, num: '06', title: 'VIDEO EDITING',        subtitle: 'Cinematic, Commercial',      color: '#ef4444' },
    { id: 7, num: '07', title: 'IT SOLUTIONS',         subtitle: 'Network, Infrastructure',    color: '#8b5cf6' },
  ],

  // Projects — image/video controlled from Admin Panel
  // Backward-compatible optional fields: client, services, tools, featured, layout
  projects: [
    { id: 1, title: 'Brand Identity Project',     category: 'branding', year: '2024', description: 'Full brand identity design', cover: '', media: [], type: 'image', client: '', services: [], tools: [], featured: true,  layout: 'auto' },
    { id: 2, title: 'Social Media Campaign',      category: 'social',   year: '2024', description: 'Social media content series', cover: '', media: [], type: 'image', client: '', services: [], tools: [], featured: true,  layout: 'auto' },
    { id: 3, title: 'Motion Graphics Reel',       category: 'motion',   year: '2024', description: 'Animated promo video', cover: '', media: [], type: 'video', client: '', services: [], tools: [], featured: false, layout: 'auto' },
    { id: 4, title: 'UI/UX Dashboard Design',     category: 'web',      year: '2023', description: 'SaaS product UI design', cover: '', media: [], type: 'image', client: '', services: [], tools: [], featured: false, layout: 'auto' },
    { id: 5, title: 'Event Poster Series',        category: 'poster',   year: '2023', description: 'Event branding posters', cover: '', media: [], type: 'image', client: '', services: [], tools: [], featured: false, layout: 'auto' },
    { id: 6, title: 'Network Infrastructure',     category: 'it',       year: '2023', description: 'Enterprise network setup', cover: '', media: [], type: 'image', client: '', services: [], tools: [], featured: false, layout: 'auto' },
  ],

  services: [
    { icon: 'fa-solid fa-pen-ruler', title: 'Brand Identity',      desc: 'Full brand systems: logo, color palette, typography, brand guide & all collateral.',             price: 'Starting at $150' },
    { icon: 'fa-solid fa-hashtag',   title: 'Social Media Design', desc: 'Eye-catching posts, stories, highlight covers and full content calendar design.',                price: 'Starting at $80'  },
    { icon: 'fa-solid fa-clapperboard', title: 'Motion Graphics',  desc: 'Animated logos, intros, promotional videos and social reels that stop the scroll.',              price: 'Starting at $120' },
    { icon: 'fa-solid fa-drafting-compass', title: 'UI/UX Design', desc: 'Clean, modern and user-friendly interface design for web and mobile applications.',              price: 'Starting at $200' },
    { icon: 'fa-solid fa-image',     title: 'Poster & Print',      desc: 'Stunning posters, flyers, banners and all print materials that make an impact.',                 price: 'Starting at $50'  },
    { icon: 'fa-solid fa-network-wired', title: 'IT Solutions',    desc: 'Network setup, server configuration, IT support and infrastructure for your business.',          price: 'Custom Quote'     },
  ],
};

// ── Merge localStorage overrides ─────────────────────────
function loadData() {
  // Shared baseline baked into the site so every device (phone/desktop)
  // reads the same covers, images and content.
  const shared = (typeof SITE_DATA !== 'undefined' && SITE_DATA)
    ? JSON.parse(JSON.stringify(SITE_DATA))
    : null;
  const saved = localStorage.getItem('portfolio_data');
  let override = null;
  if (saved) {
    // Version gate: any override saved before the current unified release is
    // stale — it must not shadow the shared baseline, otherwise phone and
    // desktop would keep showing different projects.
    const savedVersion = localStorage.getItem('portfolio_data_version');
    const currentVersion = (typeof SITE_DATA_VERSION !== 'undefined') ? String(SITE_DATA_VERSION) : '';
    if (savedVersion && savedVersion === currentVersion) {
      try { override = JSON.parse(saved); } catch(e) { override = null; }
    }
  }
  if (!override) override = shared;
  if (!override) return PORTFOLIO_DATA;
  // Categories and nowPlaying are structural (code-owned), always take the fresh defaults
  delete override.categories;
  if (override.personal) delete override.personal.nowPlaying;
  return deepMerge(PORTFOLIO_DATA, override);
}

function deepMerge(target, source) {
  const result = JSON.parse(JSON.stringify(target));
  for (const key in source) {
    if (source[key] !== null && source[key] !== undefined && source[key] !== '') {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else if (Array.isArray(source[key]) && source[key].length > 0) {
        result[key] = source[key];
      } else if (!Array.isArray(source[key])) {
        result[key] = source[key];
      }
    }
  }
  return result;
}

const DATA = loadData();

// ── Project normalization (backward compatible) ────────────
const PROJECT_DEFAULTS = {
  client: '',
  services: [],
  tools: [],
  featured: false,
  layout: 'auto',
  sections: [],
};

function strToList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string')
    return value.split(/[,،\n]/).map(s => s.trim()).filter(Boolean);
  return [];
}

function normalizeProject(p) {
  if (!p || typeof p !== 'object') return p;
  const merged = Object.assign({}, PROJECT_DEFAULTS, p);
  merged.services = strToList(p.services);
  merged.tools = strToList(p.tools);
  return merged;
}

// Projects saved by the admin may lack new fields — fill defaults safely.
function normalizeProjects(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeProject);
}

// Legacy emoji icons (saved in older localStorage/export) → professional
// Font Awesome classes, so the site always renders crisp vector icons.
const LEGACY_ICON_MAP = {
  '✦': 'fa-solid fa-palette',
  '🎨': 'fa-solid fa-palette',
  '✒️': 'fa-solid fa-pen-nib', '✒': 'fa-solid fa-pen-nib',
  '🎬': 'fa-solid fa-clapperboard',
  '⚡': 'fa-solid fa-wand-magic-sparkles',
  '🖼️': 'fa-solid fa-drafting-compass', '🖼': 'fa-solid fa-drafting-compass',
  '💻': 'fa-solid fa-code',
  '🟢': 'fa-brands fa-node-js',
  '🗄️': 'fa-solid fa-database', '🗄': 'fa-solid fa-database',
  '📱': 'fa-solid fa-mobile-screen',
  '🌐': 'fa-solid fa-network-wired',
  '☁️': 'fa-solid fa-cloud', '☁': 'fa-solid fa-cloud',
  '🖥️': 'fa-solid fa-desktop', '🖥': 'fa-solid fa-desktop',
  '🚀': 'fa-solid fa-rocket',
  '✉': 'fa-solid fa-envelope',
  '📞': 'fa-solid fa-phone',
  '📍': 'fa-solid fa-location-dot',
  '🌙': 'fa-solid fa-moon',
  '📦': 'fa-solid fa-box-open',
  '🎵': 'fa-solid fa-music',
};

function normalizeIcon(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const t = value.trim();
  if (t.indexOf('fa-') === 0 || t.indexOf('fa ') === 0 || t.indexOf('fab ') === 0 || t.indexOf('fas ') === 0 || t.indexOf('fa-') !== -1) return value;
  if (LEGACY_ICON_MAP[t]) return LEGACY_ICON_MAP[t];
  return fallback;
}

// Normalize icon fields on DATA immediately, so every page (and every
// leftover localStorage override) displays crisp Font Awesome icons.
function normalizeIcons() {
  if (!DATA) return;
  if (Array.isArray(DATA.stats)) {
    DATA.stats.forEach(s => { if (s && s.icon) s.icon = normalizeIcon(s.icon, 'fa-solid fa-circle-info'); });
  }
  if (Array.isArray(DATA.techStack)) {
    DATA.techStack.forEach(t => { if (t && t.icon) t.icon = normalizeIcon(t.icon, 'fa-solid fa-code'); });
  }
  if (Array.isArray(DATA.certifications)) {
    DATA.certifications.forEach(c => { if (c && c.icon) c.icon = normalizeIcon(c.icon, 'fa-solid fa-award'); });
  }
  if (Array.isArray(DATA.services)) {
    DATA.services.forEach(s => { if (s && s.icon) s.icon = normalizeIcon(s.icon, 'fa-solid fa-briefcase'); });
  }
}
normalizeIcons();
