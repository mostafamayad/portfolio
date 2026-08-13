// ============================================================
// MAIN.JS — Core functionality
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initLoading();
  initCursor();
  initScrollProgress();
  initRevealAnimations();
  initNavigation();
  initTopBar();
  initCounters();
  initSpotlight();
  initPageTransitions();
  buildPage();
});

// Session keys kept inside a single tab session so the site behaves
// like one continuous session instead of restarting on every page.
const CV_AUDIO_KEY   = 'cv_audio_state_v1';
const CV_THEME_KEY   = 'cv_theme_state_v1';
const CV_VISITED_KEY = 'cv_site_visited_v1';

function cvLoadJSON(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function cvSaveJSON(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

function runHeroAnimations(delay) {
  document.querySelectorAll('.hero-animate').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * (delay || 150));
  });
}

// ── Loading Screen (only on the first visit) ─────────────
function initLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  if (sessionStorage.getItem(CV_VISITED_KEY)) {
    // Returning visitor → skip loader for continuous navigation
    screen.classList.add('skip');
    document.body.style.overflow = '';
    runHeroAnimations(60);
    return;
  }
  sessionStorage.setItem(CV_VISITED_KEY, '1');

  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    screen.classList.add('hidden');
    document.body.style.overflow = '';
    runHeroAnimations(150);
  }, 1600);
}

// ── Custom Cursor ────────────────────────────────────────
function initCursor() {
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover effects
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, [data-hover], .cat-card, .work-card, .service-card, .blog-card');
    if (target) {
      cursor.classList.add('hovered');
      follower.classList.add('hovered');
    }
  });
  document.addEventListener('mouseout', () => {
    cursor.classList.remove('hovered');
    follower.classList.remove('hovered');
  });
}

// ── Scroll Progress ──────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  const mainContent = document.querySelector('.main-content') || window;
  const updateProgress = () => {
    const scrollEl = document.querySelector('.main-content');
    if (scrollEl) {
      const pct = scrollEl.scrollTop / (scrollEl.scrollHeight - scrollEl.clientHeight) * 100;
      bar.style.width = Math.min(100, pct) + '%';
    }
  };

  const scrollEl = document.querySelector('.main-content');
  if (scrollEl) scrollEl.addEventListener('scroll', updateProgress);
  else window.addEventListener('scroll', updateProgress);
}

// ── Reveal Animations ────────────────────────────────────
function initRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Skill bars
        const fills = entry.target.querySelectorAll('.skill-fill[data-width]');
        fills.forEach(fill => {
          setTimeout(() => {
            fill.style.width = fill.dataset.width + '%';
          }, 200);
        });

        // Timeline items
        if (entry.target.classList.contains('stagger-children')) {
          entry.target.classList.add('visible');
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .timeline-item, .stagger-children').forEach(el => {
    observer.observe(el);
  });

  // Observe skill fills directly
  document.querySelectorAll('.skill-fill[data-width]').forEach(fill => {
    const observer2 = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => {
          fill.style.width = fill.dataset.width + '%';
        }, 300);
        observer2.disconnect();
      }
    }, { threshold: 0.3 });
    observer2.observe(fill);
  });
}

// ── Navigation ───────────────────────────────────────────
function initNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-item a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// ── Top Bar, Audio & Theme (persistent across pages) ─────
let audioInitialized = false;

function applyTheme(light) {
  document.body.classList.toggle('light-mode', light);
  const root = document.documentElement;
  if (light) {
    root.style.setProperty('--bg-primary', '#f4f4f5');
    root.style.setProperty('--bg-secondary', '#ffffff');
    root.style.setProperty('--bg-card', 'rgba(0,0,0,0.05)');
    root.style.setProperty('--text-primary', '#0f172a');
    root.style.setProperty('--text-secondary', '#334155');
    root.style.setProperty('--text-muted', '#64748b');
  } else {
    root.style.setProperty('--bg-primary', '#080810');
    root.style.setProperty('--bg-secondary', '#0d0d1a');
    root.style.setProperty('--bg-card', 'rgba(255,255,255,0.03)');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', 'rgba(255,255,255,0.85)');
    root.style.setProperty('--text-muted', 'rgba(255,255,255,0.55)');
  }
}

function initTopBar() {
  const soundToggle = document.querySelector('.toggle-switch[data-type="sound"]');
  const themeToggle = document.querySelector('.toggle-switch[data-type="theme"]');
  const bgMusic = document.getElementById('bg-music');

  const audioState = cvLoadJSON(CV_AUDIO_KEY, {});
  const themeState = cvLoadJSON(CV_THEME_KEY, { light: false });

  // ── Restore theme on every page ──
  if (themeState.light) {
    applyTheme(true);
    if (themeToggle) themeToggle.classList.add('on');
  }

  // ── Restore sound toggle state ──
  if (soundToggle && audioState.soundOn === false) {
    soundToggle.classList.remove('on');
  }

  if (bgMusic) {
    // metadata only → never download the full file until actually played
    bgMusic.preload = 'metadata';
    bgMusic.volume = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ? 0.1 : 0.2;

    const resume = () => {
      if (audioState.currentTime > 0) {
        try { bgMusic.currentTime = audioState.currentTime; } catch (e) {}
      }
      if (audioState.soundOn !== false && audioState.playing) {
        const tryPlay = () => bgMusic.play().then(() => { audioInitialized = true; })
          .catch(() => {});
        // Autoplay might be blocked — retry on the first user gesture
        let retried = false;
        const retry = () => {
          if (!retried) { retried = true; tryPlay(); }
          cleanup();
        };
        function cleanup() {
          document.removeEventListener('click', retry);
          document.removeEventListener('touchstart', retry);
        }
        document.addEventListener('click', retry, { once: true });
        document.addEventListener('touchstart', retry, { once: true });
        tryPlay();
      }
    };

    if (bgMusic.readyState >= 1) resume();
    else bgMusic.addEventListener('loadedmetadata', resume, { once: true });

    // ── Persist playback state during the session ──
    let lastSave = 0;
    const persist = () => {
      const now = Date.now();
      if (now - lastSave < 1500) return;
      lastSave = now;
      audioState.currentTime = bgMusic.currentTime;
      audioState.playing = !bgMusic.paused;
      audioState.soundOn = soundToggle ? soundToggle.classList.contains('on') : true;
      audioState.volume = bgMusic.volume;
      cvSaveJSON(CV_AUDIO_KEY, audioState);
    };
    bgMusic.addEventListener('timeupdate', persist);
    bgMusic.addEventListener('play', persist);
    bgMusic.addEventListener('pause', persist);

    const saveOnExit = () => {
      audioState.currentTime = bgMusic.currentTime;
      audioState.playing = !bgMusic.paused;
      audioState.soundOn = soundToggle ? soundToggle.classList.contains('on') : true;
      audioState.volume = bgMusic.volume;
      cvSaveJSON(CV_AUDIO_KEY, audioState);
    };
    window.addEventListener('pagehide', saveOnExit);
    window.addEventListener('beforeunload', saveOnExit);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveOnExit();
    });
  }

  // First-ever visit: start music on the first user interaction if ON
  const playOnFirstGesture = () => {
    if (!audioInitialized && soundToggle && soundToggle.classList.contains('on') && bgMusic) {
      bgMusic.play().then(() => { audioInitialized = true; }).catch(() => {});
    }
  };
  document.addEventListener('click', playOnFirstGesture, { once: true });
  document.addEventListener('touchstart', playOnFirstGesture, { once: true });

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundToggle.classList.toggle('on');
      if (!bgMusic) return;
      if (soundToggle.classList.contains('on')) {
        bgMusic.play().catch(() => {});
        audioInitialized = true;
      } else {
        bgMusic.pause();
      }
      audioState.currentTime = bgMusic.currentTime;
      audioState.playing = !bgMusic.paused;
      audioState.soundOn = soundToggle.classList.contains('on');
      audioState.volume = bgMusic.volume;
      cvSaveJSON(CV_AUDIO_KEY, audioState);
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const on = themeToggle.classList.toggle('on');
      applyTheme(on);
      cvSaveJSON(CV_THEME_KEY, { light: on });
    });
  }
}

// ── Smooth page transitions (no more "website restarting" feel) ──
function initPageTransitions() {
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (a.target === '_blank') return;
    if (href.startsWith('#') || href.startsWith('javascript:')) return;
    if (/^(https?:)?\/\//.test(href)) return;
    if (!/\.html($|\?)/.test(href)) return;
    // Same page → let it behave normally
    const targetPath = href.split('?')[0];
    if (targetPath === currentPageName()) return;

    a.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      navigateToPage(href);
    });
  });
}

function currentPageName() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function navigateToPage(url) {
  let overlay = document.getElementById('page-transition-layer');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'page-transition-layer';
    overlay.className = 'page-transition';
    document.body.appendChild(overlay);
  }
  requestAnimationFrame(() => overlay.classList.add('entering'));
  setTimeout(() => { window.location.href = url; }, 380);
}

// ── Counter Animations ───────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
          const current = Math.floor(eased * target);
          el.textContent = current + suffix;

          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target + suffix;
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ── Spotlight ────────────────────────────────────────────
function initSpotlight() {
  const spotlights = document.querySelectorAll('.spotlight');
  document.addEventListener('mousemove', (e) => {
    spotlights.forEach(spotlight => {
      const rect = spotlight.parentElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
      spotlight.style.setProperty('--mouse-x', x);
      spotlight.style.setProperty('--mouse-y', y);
    });
  });
}

// ── Build Page from Data ─────────────────────────────────
function buildPage() {
  if (typeof DATA === 'undefined') return;

  // Fill personal data
  const d = DATA.personal;

  // Logo
  document.querySelectorAll('[data-name]').forEach(el => {
    el.innerHTML = el.dataset.field === 'html' ? d.name : d.name;
  });

  // Dynamic elements by data attribute
  const map = {
    '[data-field="name"]': d.name,
    '[data-field="title"]': d.title,
    '[data-field="bio"]': d.bio,
    '[data-field="email"]': d.email,
    '[data-field="phone"]': d.phone,
    '[data-field="location"]': d.location,
    '[data-field="quote"]': d.quote,
    '[data-field="vibe"]': d.currentVibe,
    '[data-field="np-title"]': d.nowPlaying.title,
    '[data-field="np-artist"]': d.nowPlaying.artist,
  };

  Object.entries(map).forEach(([sel, val]) => {
    document.querySelectorAll(sel).forEach(el => {
      if (sel.includes('bio')) el.innerHTML = val;
      else el.textContent = val;
    });
  });

  // Logo mark initials
  document.querySelectorAll('[data-field="initials"]').forEach(el => {
    el.textContent = d.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  });

  // Logo name parts
  const nameParts = d.name.split(' ');
  document.querySelectorAll('[data-field="firstname"]').forEach(el => el.textContent = nameParts[0] || '');
  document.querySelectorAll('[data-field="lastname"]').forEach(el => el.textContent = nameParts.slice(1).join(' ') || '');

  // Availability
  document.querySelectorAll('[data-field="available"]').forEach(el => {
    el.style.display = d.available ? 'flex' : 'none';
  });

  // Load Custom Images
  if (d.profileImage) {
    document.querySelectorAll('.hero-photo, .right-profile-img').forEach(img => {
      img.src = d.profileImage;
    });
  }
  if (d.logoImage) {
    document.querySelectorAll('.sidebar-logo-img, .hero-badge-logo-img, .loader-logo-img').forEach(img => {
      img.src = d.logoImage;
    });
    // Hide fallback if logo exists
    document.querySelectorAll('.logo-fallback-text').forEach(el => el.style.display = 'none');
  }

  // Socials
  document.querySelectorAll('[data-socials]').forEach(container => {
    container.innerHTML = DATA.socials.map(s => `
      <a href="${s.url}" class="social-link" id="social-${s.id}" target="_blank" rel="noopener" title="${s.name}" data-hover>
        <i class="${s.icon}"></i>
      </a>
    `).join('');
  });

  // Stats
  document.querySelectorAll('[data-stats]').forEach(container => {
    container.innerHTML = DATA.stats.map(s => `
      <div class="stat-item reveal">
        <div class="stat-icon">${s.icon}</div>
        <div>
          <div class="stat-value" data-count="${s.value}" data-suffix="${s.suffix}">0${s.suffix}</div>
          <div class="stat-label">${s.label.replace('\n', '<br>')}</div>
        </div>
      </div>
    `).join('');
    initCounters();
    initRevealAnimations();
  });

  // Categories
  document.querySelectorAll('[data-categories]').forEach(container => {
    const catKey = {1:'branding', 2:'social', 3:'motion', 4:'web', 5:'video', 6:'it'};
    container.innerHTML = DATA.categories.map(cat => {
      const cover = (DATA.projects.find(p => p.category === catKey[cat.id] && p.cover) || {}).cover || '';
      const media = cover
        ? `<img src="${cover}" alt="${cat.title}" class="cat-card-img" loading="lazy">`
        : `<div class="cat-card-placeholder" style="background: linear-gradient(135deg, ${cat.color}22, ${cat.color}11);">${getCatEmoji(cat.id)}</div>`;
      return `
      <div class="cat-card shimmer" style="--cat-color: ${cat.color}" id="cat-${cat.id}">
        ${media}
        <div class="cat-card-overlay">
          <div class="cat-num">${cat.num}</div>
          <div class="cat-name">${cat.title}</div>
          <div class="cat-subtitle">${cat.subtitle}</div>
        </div>
        <div class="cat-arrow">→</div>
      </div>
    `;
    }).join('');
    container.querySelectorAll('.cat-card').forEach(card => {
      card.addEventListener('click', () => {
        const key = catKey[card.id.replace('cat-', '')];
        const proj = DATA.projects.find(p => p.category === key);
        navigateToPage(proj ? `project.html?id=${proj.id}` : 'works.html');
      });
    });
  });

  // Projects (works page)
  buildProjects();

  // Skills (about page)
  document.querySelectorAll('[data-skills]').forEach(container => {
    container.innerHTML = DATA.skills.map(s => `
      <div class="skill-item reveal">
        <div class="skill-header">
          <span class="skill-name">${s.name}</span>
          <span class="skill-pct">${s.level}%</span>
        </div>
        <div class="skill-bar">
          <div class="skill-fill" data-width="${s.level}" style="width:0%"></div>
        </div>
      </div>
    `).join('');
    initRevealAnimations();
  });

  // Experience timeline
  document.querySelectorAll('[data-timeline]').forEach(container => {
    container.innerHTML = DATA.experience.map(e => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-year">${e.year}</div>
        <div class="timeline-role">${e.role}</div>
        <div class="timeline-company">${e.company}</div>
        <div class="timeline-desc">${e.desc}</div>
      </div>
    `).join('');
    initRevealAnimations();
  });

  // Services
  document.querySelectorAll('[data-services]').forEach(container => {
    container.innerHTML = DATA.services.map((s, i) => `
      <div class="service-card reveal gradient-border" id="service-${i+1}">
        <span class="service-icon">${s.icon}</span>
        <div class="service-title">${s.title}</div>
        <div class="service-desc">${s.desc}</div>
        <div class="service-price">${s.price}</div>
      </div>
    `).join('');
    initRevealAnimations();
  });

  // Right panel mini projects
  document.querySelectorAll('[data-mini-projects]').forEach(container => {
    container.innerHTML = DATA.projects.slice(0, 3).map(p => `
      <a href="project.html?id=${p.id}" class="panel-proj-item" id="mini-proj-${p.id}" style="text-decoration:none;color:inherit;display:flex;">
        ${p.cover 
          ? `<img src="${p.cover}" class="panel-proj-img" style="width:50px;height:50px;border-radius:var(--radius-sm);object-fit:contain;background:#0d0d1a;padding:4px;border:1px solid var(--border);flex-shrink:0;">`
          : `<div class="panel-proj-img-placeholder" style="background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1));width:50px;height:50px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:1.2rem;border:1px solid var(--border);flex-shrink:0;">${getProjectEmoji(p.category)}</div>`
        }
        <div class="panel-proj-info" style="cursor:pointer;">
          <div class="panel-proj-cat">${p.category}</div>
          <div class="panel-proj-title">${p.title}</div>
        </div>
      </a>
    `).join('');
  });

  // Contact info
  document.querySelectorAll('[data-contact-items]').forEach(container => {
    container.innerHTML = `
      <div class="contact-item reveal">
        <div class="contact-item-icon">✉</div>
        <div><div class="contact-item-label">Email</div><div class="contact-item-val" data-field="email">${DATA.personal.email}</div></div>
      </div>
      <div class="contact-item reveal">
        <div class="contact-item-icon">📞</div>
        <div><div class="contact-item-label">Phone</div><div class="contact-item-val" data-field="phone">${DATA.personal.phone}</div></div>
      </div>
      <div class="contact-item reveal">
        <div class="contact-item-icon">📍</div>
        <div><div class="contact-item-label">Location</div><div class="contact-item-val" data-field="location">${DATA.personal.location}</div></div>
      </div>
    `;
    initRevealAnimations();
  });

  // Blog posts
  buildBlog();
}

function buildProjects(filter = 'all') {
  document.querySelectorAll('[data-projects]').forEach(container => {
    const filtered = filter === 'all'
      ? DATA.projects
      : DATA.projects.filter(p => p.category === filter);

    container.innerHTML = filtered.map(p => `
      <div class="work-card reveal" data-category="${p.category}" id="work-${p.id}">
        ${p.cover
          ? `<div class="work-media"><img src="${p.cover}" alt="${p.title}" loading="lazy" class="work-media-img" onload="window.__fitProjectCover && window.__fitProjectCover(this)"></div>`
          : `<div class="work-media work-media-empty">${getProjectEmoji(p.category)}</div>`
        }
        <div class="work-card-info">
          <div>
            <div class="work-cat">${p.category}</div>
            <div class="work-title">${p.title}</div>
          </div>
          <div class="work-year">${p.year}</div>
        </div>
        <div class="work-card-hover">
          <a href="project.html?id=${p.id}" class="work-view-btn">VIEW PROJECT</a>
        </div>
      </div>
    `).join('');
    initRevealAnimations();
    container.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const btn = card.querySelector('.work-view-btn');
        if (btn && btn.getAttribute('href')) navigateToPage(btn.getAttribute('href'));
      });
    });
  });
}

// Intelligent cover fitting: read the real image ratio and size the
// media box accordingly so the artwork is never cropped or stretched.
window.__fitProjectCover = function (img) {
  const wrap = img.closest('.work-media');
  if (!wrap) return;
  const w = img.naturalWidth || 1;
  const h = img.naturalHeight || 1;
  const ratio = w / h;
  wrap.classList.remove('r-portrait', 'r-wide', 'r-square');
  if (ratio < 0.8) wrap.classList.add('r-portrait');
  else if (ratio > 1.7) wrap.classList.add('r-wide');
  else wrap.classList.add('r-square');
};



function buildBlog() {
  const posts = [
    { tag: 'Design Tips', title: 'The Psychology of Color in Brand Design', excerpt: 'How colors shape perception and influence purchasing decisions in brand identity.', date: 'Aug 2024', readTime: '5 min', emoji: '🎨' },
    { tag: 'Workflow', title: 'My Design Process: From Brief to Final Artwork', excerpt: 'A behind-the-scenes look at how I approach every new design project.', date: 'Jul 2024', readTime: '8 min', emoji: '⚡' },
    { tag: 'Motion', title: 'Why Motion Graphics Are the Future of Marketing', excerpt: 'Animated content outperforms static in every metric. Here\'s why.', date: 'Jun 2024', readTime: '6 min', emoji: '🎬' },
    { tag: 'UI/UX', title: 'Dark Mode Design: Best Practices & Common Mistakes', excerpt: 'Everything you need to know to design stunning dark interfaces.', date: 'May 2024', readTime: '7 min', emoji: '🌙' },
  ];

  document.querySelectorAll('[data-blog]').forEach(container => {
    container.innerHTML = posts.map((p, i) => `
      <div class="blog-card reveal" id="blog-${i+1}">
        <div class="blog-card-img-placeholder" style="background: linear-gradient(135deg, rgba(124,58,237,0.25), rgba(6,182,212,0.1));">
          <span style="font-size:3rem">${p.emoji}</span>
        </div>
        <div class="blog-card-body">
          <div class="blog-tag">${p.tag}</div>
          <div class="blog-title">${p.title}</div>
          <div class="blog-excerpt">${p.excerpt}</div>
        </div>
        <div class="blog-footer">
          <span>${p.date}</span>
          <span>${p.readTime} read</span>
        </div>
      </div>
    `).join('');
    initRevealAnimations();
  });
}

// ── Filter Works ─────────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      buildProjects(btn.dataset.filter);
    });
  });
}

// ── Contact Form ─────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const origText = btn.textContent;
    btn.textContent = 'SENDING...';
    btn.disabled = true;

    setTimeout(() => {
      showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
      form.reset();
      btn.textContent = origText;
      btn.disabled = false;
    }, 1500);
  });
}

// ── Toast ─────────────────────────────────────────────────
function showToast(message, type = '') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ── Emoji Helpers ─────────────────────────────────────────
function getCatEmoji(id) {
  const emojis = { 1:'📱', 2:'🖼️', 3:'✦', 4:'💻', 5:'📦', 6:'🎬' };
  return emojis[id] || '✦';
}

function getProjectEmoji(cat) {
  const map = {
    social: '📱', poster: '🖼️', branding: '✦',
    web: '💻', packaging: '📦', motion: '🎬'
  };
  return map[cat] || '✦';
}

// Init page-specific
window.addEventListener('load', () => {
  initFilters();
  initContactForm();
});
