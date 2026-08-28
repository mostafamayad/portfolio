// ============================================================
// MAIN.JS — Core functionality
// ============================================================

// Fix black screen when navigating back on mobile (bfcache restore).
// The persisted snapshot can render before CSS/JS finish, so force a reload.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.location.reload();
});

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

        // Stagger children: apply cascading delays
        if (entry.target.classList.contains('stagger-group')) {
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            child.style.transitionDelay = (i * 0.1) + 's';
          });
        }

        // Timeline items
        if (entry.target.classList.contains('stagger-children')) {
          entry.target.classList.add('visible');
        }
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .timeline-item, .stagger-children, .scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-rotate, .stagger-group').forEach(el => {
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
  document.documentElement.classList.toggle('light-mode', light);
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

    // Restore playback position only — never auto-play.
    if (audioState.currentTime > 0) {
      try { bgMusic.currentTime = audioState.currentTime; } catch (e) {}
    }

    // ── Play / pause helper ──
    const npBtn = document.getElementById('np-play-btn');
    const syncPlayBtn = () => {
      if (!npBtn) return;
      npBtn.innerHTML = bgMusic.paused
        ? '<i class="fas fa-play"></i>'
        : '<i class="fas fa-pause"></i>';
    };
    bgMusic.addEventListener('play', syncPlayBtn);
    bgMusic.addEventListener('pause', syncPlayBtn);

    // Play button: the ONLY way music starts (user clicks play)
    if (npBtn) {
      npBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!bgMusic) return;
        if (bgMusic.paused) {
          bgMusic.play().then(() => { audioInitialized = true; }).catch(() => {});
        } else {
          bgMusic.pause();
        }
        if (soundToggle) soundToggle.classList.add('on');
        audioState.soundOn = true;
        audioState.volume = bgMusic.volume;
        cvSaveJSON(CV_AUDIO_KEY, audioState);
      });
    }

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

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundToggle.classList.toggle('on');
      if (!bgMusic) return;
      if (soundToggle.classList.contains('on') && bgMusic.paused && audioInitialized) {
        bgMusic.play().catch(() => {});
      } else if (!soundToggle.classList.contains('on')) {
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
        <div class="stat-icon"><i class="${s.icon}"></i></div>
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
    const catKey = {1:'branding', 2:'social', 3:'poster', 4:'web', 5:'motion', 6:'it'};
    const cards = DATA.categories.map(cat => {
      const cover = (DATA.projects.find(p => p.category === catKey[cat.id] && p.cover) || {}).cover || '';
      const media = cover
        ? `<img src="${cover}" alt="${cat.title}" class="cat-card-img" loading="lazy">`
        : `<div class="cat-card-placeholder" style="background: linear-gradient(135deg, ${cat.color}22, ${cat.color}11);">${getCatIcon(cat.id)}</div>`;
      return `
      <div class="cat-card shimmer scroll-reveal" style="--cat-color: ${cat.color}" id="cat-${cat.id}">
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
    // Mobile only: wrap the cards in a duplicated marquee track so the row
    // loops forever (last card unters out right, first one glides back in).
    if (window.matchMedia('(max-width: 600px)').matches) {
      container.classList.add('is-marquee');
      container.innerHTML = `<div class="marquee-track"><div class="marquee-group">${cards}</div><div class="marquee-group">${cards}</div></div>`;
    } else {
      container.innerHTML = cards;
    }
    const track = container.querySelector('.marquee-track');
    if (track) {
      let anim = null;
      let dragging = false;
      let startX = 0;
      let startTime = 0;
      let pxPerMs = 0;
      const DURATION = 28000;
      const getAnim = () => {
        const list = track.getAnimations().filter(a => a.animationName === 'categories-marquee');
        return list[0] || null;
      };
      const onChangeWeight = () => {
        const desc = track.offsetWidth / 2;
        return desc;
      };
      const onDown = (e) => {
        anim = getAnim();
        if (!anim) return;
        pxPerMs = onChangeWeight() / DURATION;
        dragging = true;
        startX = e.clientX;
        startTime = typeof anim.currentTime === 'number' ? anim.currentTime : 0;
        anim.pause();
        try { track.setPointerCapture(e.pointerId); } catch (_) {}
      };
      const onMove = (e) => {
        if (!dragging || !anim) return;
        const dx = e.clientX - startX;
        const t = Math.min(Math.max(0, startTime - dx / pxPerMs), DURATION);
        anim.currentTime = t;
      };
      const onEnd = () => {
        if (!dragging) return;
        dragging = false;
        if (anim) { try { anim.play(); } catch (_) {} }
        anim = null;
      };
      track.addEventListener('pointerdown', onDown);
      track.addEventListener('pointermove', onMove);
      track.addEventListener('pointerup', onEnd);
      track.addEventListener('pointercancel', onEnd);
    }
    initRevealAnimations();
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
        <span class="service-icon"><i class="${s.icon}"></i></span>
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
          : `<div class="panel-proj-img-placeholder" style="background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1));width:50px;height:50px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:1.2rem;border:1px solid var(--border);flex-shrink:0;">${getProjectIcon(p.category)}</div>`
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
        <div class="contact-item-icon"><i class="fa-solid fa-envelope"></i></div>
        <div><div class="contact-item-label">Email</div><div class="contact-item-val" data-field="email">${DATA.personal.email}</div></div>
      </div>
      <div class="contact-item reveal">
        <div class="contact-item-icon"><i class="fa-solid fa-phone"></i></div>
        <div><div class="contact-item-label">Phone</div><div class="contact-item-val" data-field="phone">${DATA.personal.phone}</div></div>
      </div>
      <div class="contact-item reveal">
        <div class="contact-item-icon"><i class="fa-solid fa-location-dot"></i></div>
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
          : `<div class="work-media work-media-empty">${getProjectIcon(p.category)}</div>`
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
    {
      tag: 'Design Tips',
      title: 'The Psychology of Color in Brand Design',
      excerpt: 'How colors shape perception and influence purchasing decisions in brand identity.',
      date: 'Aug 2024',
      readTime: '5 min',
      image: 'assets/images/blog/blog-color.svg',
      intro: 'Color is the first thing a customer notices about your brand — and the last thing they forget. In under seven seconds, people form a first impression of your product, and up to 90% of that impression is based on color alone. Here is how to use color psychology with real intent rather than guesswork.',
      sections: [
        { heading: '1. Start from the feeling, not the palette',
          body: 'Before picking any hex code, answer one question: what should someone feel when they touch your brand? Trust, excitement, calm, urgency? Every color family sends a subconscious signal — red accelerates the heart rate and creates urgency, blue lowers it and builds trust, yellow boosts optimism but fatigues the eye in large doses. Write down the emotion first, then let it drive every other choice.' },
        { heading: '2. Use the 60-30-10 rule',
          body: 'A professional palette is rarely balanced equally. Use 60% of a dominant neutral, 30% of a supporting secondary color, and 10% of a high-contrast accent. This structure gives the eye a resting place, keeps the brand breathing, and makes the accent color feel intentional instead of loud. Applied to both web and print, it prevents muddy, noisy results.' },
        { heading: '3. Respect context and culture',
          body: 'White reads as purity in the West but mourning in parts of Asia. Green means nature in some markets and finance in others. If your brand ships globally, research cultural associations before locking a palette. Also test your colors in context: against dark and light backgrounds, in small badges, and at a glance on a smartphone — hues shift dramatically with size and background.' },
        { heading: '4. Verify accessibility before launch',
          body: 'Two colors that look stunning side by side can fail the contrast test for color-blind users or low-vision readers. Check your text-on-background combinations against WCAG AA (4.5:1 for body text, 3:1 for large text). Free tools like WebAIM\'s contrast checker make this a two-minute habit instead of an afterthought.' },
      ],
      cta: 'Rule of thumb: your accent color should do one job — nothing more. Remove every decorative use of it until a single meaningful interaction carries it.' },
    {
      tag: 'Workflow',
      title: 'My Design Process: From Brief to Final Artwork',
      excerpt: 'A behind-the-scenes look at how I approach every new design project.',
      date: 'Jul 2024',
      readTime: '8 min',
      image: 'assets/images/blog/blog-process.svg',
      intro: 'A good designer hides their process; a great designer controls it. Over years of client work, I have distilled my workflow into five stages that reduce revisions, protect deadlines, and keep creativity from burning out. Here is the exact pipeline I use for every project, from the first call to the final export.',
      sections: [
        { heading: '1. Discover — understand before you draw',
          body: 'The first deliverable of any project is never a sketch; it is a question list. Who is the audience? What behavior do we actually want to change? Who are the two strongest competitors? Spend the discovery phase interviewing, not designing. Projects fail far more often because of a misunderstood brief than a lack of talent.' },
        { heading: '2. Define — write the goal down',
          body: 'Turn the discovery answers into a one-sentence creative brief: "Increase online demo sign-ups among mid-size agencies by 30%." A measurable target changes every decision downstream — it tells you whether a layout works and gives the client a fair way to judge results instead of taste.' },
        { heading: '3. Diverge — explore multiple directions',
          body: 'Never present your only idea. Create two or three radically different directions: a safe one, a surprising one, and a compromise. Exploring even rejected directions sharpens the final one, and clients feel genuinely involved when they choose between options rather than accept or reject a single concept.' },
        { heading: '4. Refine — iterate on one winner',
          body: 'Once a direction is chosen, stop exploring and start obsessing. Tighten spacing, align the grid, test type scale, review hierarchy at every breakpoint. Professional craft lives in the second 20% of the work — the polish most portfolios never show because it is the part that costs real hours.' },
        { heading: '5. Deliver — package for the real world',
          body: 'Final delivery is a file, but handoff is an experience. Provide organized folders, source files, exported assets, font licenses, and a short written rationale for each decision. A designer who documents their work saves the client from re-opening a year later with "can we try another blue?"' },
      ],
      cta: 'Steal this rule: never deliver a design without a one-paragraph rationale. It teaches clients to judge the problem you solved, not the pixels you moved.' },
    {
      tag: 'Motion',
      title: 'Why Motion Graphics Are the Future of Marketing',
      excerpt: 'Animated content outperforms static in every metric. Here\'s why.',
      date: 'Jun 2024',
      readTime: '6 min',
      image: 'assets/images/blog/blog-motion.svg',
      intro: 'Attention spans are shrinking while feeds keep scrolling. Motion is the only format that interrupts the scroll without shouting. Research consistently shows animated posts out-perform static images on reach, engagement, and recall. But the real reason is neuroscience, not hype: our vision system is wired to detect movement first.',
      sections: [
        { heading: '1. Motion earns attention for free',
          body: 'Before the brain processes shape, color, or text, it flags motion as important. That is why an animated thumbnail stops the thumb while a static image gets ignored. The practical takeaway: put your product, logo, or key message in motion for the first second of every ad — that is the moment you win or lose the impression.' },
        { heading: '2. Richer stories, shorter runway',
          body: 'A 15-minute video requires a viewer to commit; a 6-second loop only asks them to glance. Motion lets you compress a transformation — before/after, build-up/destruct, problem/solution — into half a second of visual storytelling. Formats like loops and short-form video work because they respect the viewer\'s time budget.' },
        { heading: '3. A measurable lift across the funnel',
          body: 'Across ad platforms, video and motion units routinely drive higher CTRs and lower cost-per-action than identical static campaigns. Add sound design and callback hooks and the effect compounds. Even at the bottom of the funnel, product demos in motion reduce perceived risk and shorten the decision time.' },
        { heading: '4. The design principles that matter',
          body: 'Good motion is not fancy; it is intentional. Respect easing (never linear) so movement feels alive, keep animations under 3 seconds for loops, and follow the 12 principles of animation that translate directly to UX. Motion should guide attention toward the CTA — if it competes with it, cut it.' },
      ],
      cta: 'The motion test: if your animation runs on mute, at 0.5x speed, in a 120px feed thumbnail, and still communicates the point — ship it.' },
    {
      tag: 'UI/UX',
      title: 'Dark Mode Design: Best Practices & Common Mistakes',
      excerpt: 'Everything you need to know to design stunning dark interfaces.',
      date: 'May 2024',
      readTime: '7 min',
      image: 'assets/images/blog/blog-darkmode.svg',
      intro: 'Dark mode is no longer a feature; it is an expectation. Around 80% of users prefer it when available, and for creatives, dark UIs reduce eye strain and let work stand in the spotlight. But a dark theme is not simply a light theme with inverted colors — it demands its own contrast logic, and most implementations get this wrong.',
      sections: [
        { heading: '1. Never use pure black',
          body: 'Pure #000 backgrounds cause intense halation — edges glow and text shimmers. Professional dark interfaces use "off-black" surfaces, typically #121212 to #1E1E1E with subtle elevation steps. Different surfaces (cards, modals, sheets) need slightly lighter backgrounds so depth reads without heavy borders.' },
        { heading: '2. Flip the contrast math',
          body: 'On a light background you lighten text; on dark you must lighten it too — but boost the difference. Body text should sit at a minimum of 10% luminance above the surface (e.g. #E0E0E0 on #121212), while muted text drops to around 60% of body value. Never use the exact same text color from light mode; it will disappear.' },
        { heading: '3. Saturated colors burn on dark',
          body: 'Strong, vivid hues that look fine on white can feel aggressive or glow oddly on dark surfaces, especially purple and cyan. Slightly desaturate accents for dark mode, and soften white overlays on images. Simulating light sources on dark UI is also powerful: shadows soften, glows become the new shadow.' },
        { heading: '4. Guard against the "fake dark" trap',
          body: 'The laziest mistake is simply toggling a CSS filter or flipping variables without retouching imagery, borders, and shadows. Dark mode is a redesign. Check every state: hover, focus, disabled, error, selection, and scrollbars. If any screenshot leaks a white paper icon or a hard black shadow, users notice instantly.' },
        { heading: '5. Respect the system',
          body: 'Follow the OS preference by default, but always let the user override it. Persist their choice, and animate the transition gently — a crisp crossfade of 200-300ms feels premium. Offer dark mode within your own content too: here at this portfolio, the theme toggle respects your saved choice across every page.' },
      ],
      cta: 'Dark mode audit checklist: backgrounds elevated, text above 10% luminance, accents desaturated, all states checked, toggle persisted. Five items, zero excuses.' },
  ];

  document.querySelectorAll('[data-blog]').forEach(container => {
    container.innerHTML = posts.map((p, i) => `
      <article class="blog-card reveal" id="blog-${i+1}" data-article="${i}">
        <div class="blog-card-media">
          <img src="${p.image}" alt="${p.title}" class="blog-card-img" loading="lazy">
          <div class="blog-card-overlay"><span>READ ARTICLE</span></div>
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
      </article>
    `).join('');

    container.querySelectorAll('.blog-card').forEach(card => {
      card.addEventListener('click', () => openArticle(posts[parseInt(card.dataset.article)]));
    });

    initRevealAnimations();
  });
}

// ── Article Reader (full post modal) ─────────────────────
let articleOverlay = null;

function openArticle(post) {
  if (!articleOverlay) {
    articleOverlay = document.createElement('div');
    articleOverlay.className = 'article-modal';
    articleOverlay.innerHTML = `
      <div class="article-backdrop"></div>
      <div class="article-panel" role="dialog" aria-modal="true">
        <button class="article-close" aria-label="Close article"><i class="fas fa-times"></i></button>
        <div class="article-hero"><img alt="" class="article-hero-img"></div>
        <div class="article-content"></div>
      </div>`;
    document.body.appendChild(articleOverlay);
    articleOverlay.addEventListener('click', (e) => {
      if (e.target.closest('.article-close') || e.target.classList.contains('article-backdrop')) closeArticle();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && articleOverlay && articleOverlay.classList.contains('open')) closeArticle();
    });
  }

  const heroImg = articleOverlay.querySelector('.article-hero-img');
  heroImg.src = post.image;
  heroImg.alt = post.title;

  const content = articleOverlay.querySelector('.article-content');
  content.innerHTML = `
    <div class="article-tag">${post.tag} — ${post.readTime} read</div>
    <h2 class="article-title">${post.title}</h2>
    <p class="article-intro">${post.intro}</p>
    ${post.sections.map(s => `
      <div class="article-section">
        <h3>${s.heading}</h3>
        <p>${s.body}</p>
      </div>`).join('')}
    <div class="article-cta">${post.cta}</div>
  `;

  articleOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  articleOverlay.querySelector('.article-panel').scrollTop = 0;
}

function closeArticle() {
  if (!articleOverlay) return;
  articleOverlay.classList.remove('open');
  document.body.style.overflow = '';
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const origText = btn.textContent;
    const success = (msg) => showToast(msg, 'success');
    const fail = (msg) => showToast(msg, 'error');

    const fields = {
      name: (form.elements['name'] || {}).value || '',
      phone: (form.elements['phone'] || {}).value || '',
      service: (form.elements['service'] || {}).value || '',
      message: (form.elements['message'] || {}).value || ''
    };
    const phoneDigits = fields.phone.replace(/[^\d]/g, '');
    if (!fields.name || !fields.message) {
      fail('Please fill in all required fields.');
      return;
    }
    if (!/^(010|011|012|015)\d{8}$/.test(phoneDigits)) {
      fail('Please enter a valid Egyptian phone number: 11 digits starting with 010, 011, 012, or 015.');
      return;
    }

    btn.textContent = 'SENDING...';
    btn.disabled = true;
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        success('Message sent successfully! I\'ll get back to you soon.');
        form.reset();
      } else {
        fail('Something went wrong. Please try again or email me directly.');
      }
    } catch (err) {
      fail('Check your internet connection and try again.');
    } finally {
      btn.textContent = origText;
      btn.disabled = false;
    }
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

// ── Emoji Helpers (now Font Awesome based) ────────────────
function getCatIcon(id) {
  const icons = { 1:'fa-solid fa-pen-ruler', 2:'fa-solid fa-hashtag', 3:'fa-solid fa-image', 4:'fa-solid fa-code', 5:'fa-solid fa-box-open', 6:'fa-solid fa-clapperboard' };
  return `<i class="${icons[id] || 'fa-solid fa-table-cells-large'}"></i>`;
}

function getProjectIcon(cat) {
  const map = {
    social: 'fa-solid fa-hashtag', poster: 'fa-solid fa-image', branding: 'fa-solid fa-pen-ruler',
    web: 'fa-solid fa-code', packaging: 'fa-solid fa-box-open', motion: 'fa-solid fa-clapperboard', it: 'fa-solid fa-network-wired'
  };
  return `<i class="${map[cat] || 'fa-solid fa-table-cells-large'}"></i>`;
}

// ── Custom Select Dropdown (replaces native <select> for full theme control) ──
function initCustomSelects() {
  document.querySelectorAll('select.form-input, .custom-select > select').forEach(sel => {
    const wrap = document.createElement('div');
    wrap.className = 'custom-select';
    sel.parentNode.insertBefore(wrap, sel);
    sel.classList.add('native-select');
    wrap.appendChild(sel);

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    const ph = sel.querySelector('option[value=""]');
    const phText = ph ? ph.textContent : 'Select...';
    trigger.innerHTML = `<span class="selected-label">${phText}</span><span class="arrow">&#9660;</span>`;
    wrap.appendChild(trigger);

    const list = document.createElement('div');
    list.className = 'custom-select-options';
    wrap.appendChild(list);

    Array.from(sel.options).forEach(opt => {
      const item = document.createElement('div');
      item.className = 'custom-select-option';
      item.textContent = opt.textContent;
      item.dataset.value = opt.value;
      if (opt.selected && opt.value) item.classList.add('selected');
      if (!opt.value) item.classList.add('placeholder');
      list.appendChild(item);
    });

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-select.open').forEach(c => c.classList.remove('open'));
      wrap.classList.toggle('open');
    });

    list.addEventListener('click', (e) => {
      const item = e.target.closest('.custom-select-option');
      if (!item) return;
      sel.value = item.dataset.value;
      list.querySelectorAll('.custom-select-option').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      const lbl = trigger.querySelector('.selected-label');
      if (item.dataset.value) {
        lbl.textContent = item.textContent;
        lbl.classList.remove('placeholder');
      } else {
        lbl.textContent = phText;
        lbl.classList.add('placeholder');
      }
      wrap.classList.remove('open');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });

    document.addEventListener('click', () => wrap.classList.remove('open'));
  });
}

// ── Magnetic Buttons (cursor pull effect on desktop) ──────
function initMagneticButtons() {
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
  const btns = document.querySelectorAll('.btn-primary, .btn-secondary, .hire-me-btn, .stats-cta-btn, .form-submit, .work-view-btn');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ── WhatsApp Floating Button ──────────────────────────────
function initWhatsAppButton() {
  if (document.getElementById('whatsapp-fab')) return;
  const wa = document.createElement('a');
  wa.id = 'whatsapp-fab';
  wa.className = 'whatsapp-fab';
  wa.href = 'https://wa.me/201032129702?text=';
  wa.target = '_blank';
  wa.rel = 'noopener noreferrer';
  wa.setAttribute('aria-label', 'Chat on WhatsApp');
  wa.innerHTML = `
    <span class="wa-ring"></span>
    <svg class="wa-icon" viewBox="0 0 32 32" fill="currentColor"><path d="M16.04 3C9.44 3 4 8.38 4 14.9c0 2.63.86 5.05 2.3 7L4.9 28l6.25-1.64a12 12 0 0 0 4.89 1.03C22.63 27.4 28 22 28 15.48 28 8.95 22.63 3 16.04 3zm0 22.1a9.9 9.9 0 0 1-5.06-1.38l-.36-.22-3.7.97 1-3.6-.24-.37A9.85 9.85 0 0 1 6.3 14.9c0-5.42 4.4-9.6 9.73-9.6 5.34 0 9.67 4.18 9.67 9.6S21.38 25.1 16.04 25.1zm5.2-7.2c-.28-.14-1.67-.82-1.93-.92-.26-.09-.45-.14-.64.14-.19.28-.73.92-.9 1.1-.16.19-.33.22-.61.07-.28-.14-1.18-.43-2.25-1.38-.83-.75-1.39-1.67-1.55-1.95-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49-.16-.02-.35-.02-.53-.02-.19 0-.5.07-.75.34-.26.28-.99.97-.99 2.36s1.01 2.73 1.16 2.92c.14.19 2 3.05 4.84 4.28.68.29 1.2.47 1.61.6.68.22 1.29.19 1.78.12.54-.09 1.67-.69 1.9-1.35.24-.66.24-1.22.17-1.34-.07-.12-.26-.19-.54-.33z"/></svg>
  `;
  document.body.appendChild(wa);
  setTimeout(() => wa.classList.add('wa-visible'), 80);
  wa.addEventListener('pointerdown', () => wa.classList.add('wa-tapping'));
  wa.addEventListener('pointerup', () => setTimeout(() => wa.classList.remove('wa-tapping'), 250));
  wa.addEventListener('pointercancel', () => wa.classList.remove('wa-tapping'));
}

// Init page-specific
window.addEventListener('load', () => {
  initWhatsAppButton();
  initCustomSelects();
  initMagneticButtons();
  initFilters();
  initContactForm();
});
