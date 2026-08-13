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
  buildPage();
});

// ── Loading Screen ───────────────────────────────────────
function initLoading() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  setTimeout(() => {
    screen.classList.add('hidden');
    document.body.style.overflow = '';
    // Trigger hero animations
    document.querySelectorAll('.hero-animate').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 150);
    });
  }, 1800);

  document.body.style.overflow = 'hidden';
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

// ── Top Bar & Audio ──────────────────────────────────────────────
let audioInitialized = false;
function initTopBar() {
  const soundToggle = document.querySelector('.toggle-switch[data-type="sound"]');
  const themeToggle = document.querySelector('.toggle-switch[data-type="theme"]');
  const bgMusic = document.getElementById('bg-music');

  if (bgMusic) bgMusic.volume = 0.3;

  // Autoplay on first user interaction
  const playAudio = () => {
    if (!audioInitialized && soundToggle && soundToggle.classList.contains('on') && bgMusic) {
      bgMusic.play().then(() => {
        audioInitialized = true;
      }).catch(e => console.log('Autoplay prevented by browser'));
    }
  };

  document.addEventListener('click', playAudio, { once: true });
  document.addEventListener('scroll', playAudio, { once: true });
  document.addEventListener('touchstart', playAudio, { once: true });

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      soundToggle.classList.toggle('on');
      if (bgMusic) {
        if (soundToggle.classList.contains('on')) {
          bgMusic.play().catch(e => console.log(e));
          audioInitialized = true;
        } else {
          bgMusic.pause();
        }
      }
    });
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      themeToggle.classList.toggle('on');
      document.body.classList.toggle('light-mode');
      
      if (document.body.classList.contains('light-mode')) {
        document.documentElement.style.setProperty('--bg-primary', '#f4f4f5');
        document.documentElement.style.setProperty('--bg-secondary', '#ffffff');
        document.documentElement.style.setProperty('--bg-card', 'rgba(0,0,0,0.05)');
        document.documentElement.style.setProperty('--text-primary', '#0f172a');
        document.documentElement.style.setProperty('--text-secondary', '#334155');
        document.documentElement.style.setProperty('--text-muted', '#64748b');
      } else {
        document.documentElement.style.setProperty('--bg-primary', '#080810');
        document.documentElement.style.setProperty('--bg-secondary', '#0d0d1a');
        document.documentElement.style.setProperty('--bg-card', 'rgba(255,255,255,0.03)');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', 'rgba(255,255,255,0.85)');
        document.documentElement.style.setProperty('--text-muted', 'rgba(255,255,255,0.55)');
      }
    });
  }
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
    container.innerHTML = DATA.categories.map(cat => `
      <div class="cat-card shimmer" style="--cat-color: ${cat.color}" id="cat-${cat.id}">
        <div class="cat-card-placeholder" style="background: linear-gradient(135deg, ${cat.color}22, ${cat.color}11);">
          ${getCatEmoji(cat.id)}
        </div>
        <div class="cat-card-overlay">
          <div class="cat-num">${cat.num}</div>
          <div class="cat-name">${cat.title}</div>
          <div class="cat-subtitle">${cat.subtitle}</div>
        </div>
        <div class="cat-arrow">→</div>
      </div>
    `).join('');
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
      <div class="panel-proj-item" id="mini-proj-${p.id}" onclick="openLightbox(${p.id})">
        ${p.cover 
          ? `<img src="${p.cover}" class="panel-proj-img" style="width:50px;height:50px;border-radius:var(--radius-sm);object-fit:cover;border:1px solid var(--border);flex-shrink:0;">`
          : `<div class="panel-proj-img-placeholder" style="background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1));width:50px;height:50px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:1.2rem;border:1px solid var(--border);flex-shrink:0;">${getProjectEmoji(p.category)}</div>`
        }
        <div class="panel-proj-info" style="cursor:pointer;">
          <div class="panel-proj-cat">${p.category}</div>
          <div class="panel-proj-title">${p.title}</div>
        </div>
      </div>
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
          ? `<img src="${p.cover}" style="width:100%;height:220px;object-fit:cover;border-radius:var(--radius-md) var(--radius-md) 0 0;" alt="${p.title}">`
          : `<div class="work-card-placeholder" style="background: linear-gradient(135deg, rgba(124,58,237,0.25), rgba(6,182,212,0.1));">
              ${getProjectEmoji(p.category)}
            </div>`
        }
        <div class="work-card-info">
          <div>
            <div class="work-cat">${p.category}</div>
            <div class="work-title">${p.title}</div>
          </div>
          <div class="work-year">${p.year}</div>
        </div>
        <div class="work-card-hover">
          <button class="work-view-btn" onclick="openLightbox(${p.id})">VIEW PROJECT</button>
        </div>
      </div>
    `).join('');
    initRevealAnimations();
  });
}

// ── Lightbox Logic ─────────────────────────────────────────
window.openLightbox = function(id) {
  const project = DATA.projects.find(p => p.id == id);
  if (!project) return;
  
  let lightbox = document.getElementById('project-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'project-lightbox';
    lightbox.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;opacity:0;transition:opacity 0.3s;pointer-events:none;';
    document.body.appendChild(lightbox);
  }
  
  let mediaHtml = '';
  if (project.media && project.media.length > 0) {
    mediaHtml = project.media.map(m => {
      if (m.type === 'video') {
        return `<video src="${m.src}" controls autoplay style="max-width:100%;max-height:70vh;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.5);margin-bottom:1rem;"></video>`;
      } else {
        return `<img src="${m.src}" style="max-width:100%;max-height:70vh;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.5);margin-bottom:1rem;object-fit:contain;">`;
      }
    }).join('');
  } else if (project.cover) {
    mediaHtml = `<img src="${project.cover}" style="max-width:100%;max-height:70vh;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.5);margin-bottom:1rem;object-fit:contain;">`;
  } else {
    mediaHtml = `<div style="padding:3rem;background:var(--bg-card);border-radius:12px;font-family:var(--font-mono);color:var(--text-muted)">No media uploaded yet.</div>`;
  }

  lightbox.innerHTML = `
    <button onclick="closeLightbox()" style="position:absolute;top:2rem;right:2rem;background:transparent;border:none;color:white;font-size:2rem;cursor:pointer;z-index:10000;">&times;</button>
    <div style="width:100%;max-width:800px;text-align:center;position:relative;z-index:10000;display:flex;flex-direction:column;align-items:center;">
      ${mediaHtml}
      <h2 style="margin-top:1rem;color:var(--purple-light);font-family:var(--font-display);font-size:1.5rem;">${project.title}</h2>
      <p style="color:var(--text-secondary);font-size:0.9rem;margin-top:0.5rem;max-width:600px;">${project.description}</p>
      <div style="margin-top:0.5rem;font-size:0.75rem;color:var(--text-muted);font-family:var(--font-mono)">${project.category.toUpperCase()} — ${project.year}</div>
    </div>
  `;
  
  lightbox.style.pointerEvents = 'auto';
  requestAnimationFrame(() => {
    lightbox.style.opacity = '1';
  });
};

window.closeLightbox = function() {
  const lightbox = document.getElementById('project-lightbox');
  if (lightbox) {
    lightbox.style.opacity = '0';
    lightbox.style.pointerEvents = 'none';
    setTimeout(() => {
      lightbox.innerHTML = ''; // clear videos so they stop playing
    }, 300);
  }
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
