// ============================================================
// ADMIN.JS — Admin Panel Logic
// Used by admin/index.html
// ============================================================

const ADMIN_PASSWORD = 'admin123';

// ── State ────────────────────────────────────────────────
let adminData = null;

// ── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadAdminData();
  initLogin();
  initTabs();
  initSaveButtons();
  initPreview();
  initReset();
  initLogout();
});

function loadAdminData() {
  const saved = localStorage.getItem('portfolio_data');
  if (saved) {
    try { adminData = JSON.parse(saved); } catch(e) { adminData = {}; }
  } else {
    adminData = {};
  }
  // Merge with defaults
  adminData = deepMergeAdmin(PORTFOLIO_DATA, adminData);
}

function deepMergeAdmin(target, source) {
  const result = JSON.parse(JSON.stringify(target));
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMergeAdmin(target[key] || {}, source[key]);
    } else if (source[key] !== undefined && source[key] !== null) {
      result[key] = source[key];
    }
  }
  return result;
}

function saveToLocalStorage() {
  localStorage.setItem('portfolio_data', JSON.stringify(adminData));
}

// ── Login ─────────────────────────────────────────────────
function initLogin() {
  const loginScreen = document.getElementById('login-screen');
  const loginBtn = document.getElementById('login-btn');
  const loginInput = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const dashboard = document.getElementById('admin-dashboard');

  if (!loginBtn || !loginInput) return;

  function attemptLogin() {
    const pass = loginInput.value.trim();
    if (pass === ADMIN_PASSWORD) {
      loginScreen.classList.add('hidden');
      dashboard.style.display = 'block';
      populateAllForms();
    } else {
      loginError.style.display = 'block';
      loginInput.value = '';
      loginInput.focus();
      loginInput.style.borderColor = 'var(--red)';
      setTimeout(() => { loginInput.style.borderColor = ''; }, 1500);
    }
  }

  loginBtn.addEventListener('click', attemptLogin);
  loginInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptLogin();
  });
}

// ── Tabs ──────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`tab-${tabId}`);
      if (panel) panel.classList.add('active');
    });
  });
}

// ── Save Buttons ──────────────────────────────────────────
function initSaveButtons() {
  document.querySelectorAll('[data-save]').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.save;
      collectFormData(section);
      saveToLocalStorage();
      showAdminToast('تم الحفظ بنجاح ✓', 'success');
    });
  });
}

function collectFormData(section) {
  const panel = document.getElementById(`tab-${section}`);
  if (!panel) return;

  switch(section) {
    case 'personal':
      adminData.personal.name = getVal(panel, 'field-name');
      adminData.personal.title = getVal(panel, 'field-title');
      adminData.personal.bio = getVal(panel, 'field-bio');
      adminData.personal.email = getVal(panel, 'field-email');
      adminData.personal.phone = getVal(panel, 'field-phone');
      adminData.personal.location = getVal(panel, 'field-location');
      adminData.personal.university = getVal(panel, 'field-university');
      adminData.personal.quote = getVal(panel, 'field-quote');
      adminData.personal.currentVibe = getVal(panel, 'field-vibe');
      break;

    case 'social':
      adminData.socials = adminData.socials.map((s, i) => ({
        ...s,
        url: getVal(panel, `social-url-${i}`)
      }));
      break;

    case 'stats':
      adminData.stats = adminData.stats.map((s, i) => ({
        ...s,
        value: parseInt(getVal(panel, `stat-value-${i}`)) || s.value,
        label: getVal(panel, `stat-label-${i}`)
      }));
      break;

    case 'projects':
      adminData.projects = adminData.projects.map((p, i) => ({
        ...p,
        title: getVal(panel, `proj-title-${i}`),
        description: getVal(panel, `proj-desc-${i}`),
        link: getVal(panel, `proj-link-${i}`),
        year: getVal(panel, `proj-year-${i}`)
      }));
      break;

    case 'skills':
      adminData.skills = adminData.skills.map((s, i) => ({
        ...s,
        name: getVal(panel, `skill-name-${i}`),
        level: parseInt(getVal(panel, `skill-level-${i}`)) || s.level
      }));
      break;

    case 'services':
      adminData.services = adminData.services.map((s, i) => ({
        ...s,
        title: getVal(panel, `svc-title-${i}`),
        desc: getVal(panel, `svc-desc-${i}`),
        price: getVal(panel, `svc-price-${i}`)
      }));
      break;
  }
}

function getVal(container, id) {
  const el = container.querySelector(`#${id}`);
  return el ? el.value : '';
}

// ── Populate Forms ────────────────────────────────────────
function populateAllForms() {
  populatePersonal();
  populateSocial();
  populateStats();
  populateProjects();
  populateSkills();
  populateServices();
}

function populatePersonal() {
  const p = adminData.personal;
  setVal('field-name', p.name);
  setVal('field-title', p.title);
  setVal('field-bio', p.bio);
  setVal('field-email', p.email);
  setVal('field-phone', p.phone);
  setVal('field-location', p.location);
  setVal('field-university', p.university || '');
  setVal('field-quote', p.quote);
  setVal('field-vibe', p.currentVibe);
}

function populateSocial() {
  const container = document.getElementById('social-fields');
  if (!container) return;
  container.innerHTML = adminData.socials.map((s, i) => `
    <div class="form-group">
      <label class="form-label">${s.name}</label>
      <input class="form-input" id="social-url-${i}" value="${s.url}" placeholder="https://...">
    </div>
  `).join('');
}

function populateStats() {
  const container = document.getElementById('stats-fields');
  if (!container) return;
  container.innerHTML = adminData.stats.map((s, i) => `
    <div class="item-card">
      <div class="item-card-header">
        <span class="item-num">${s.icon} الإحصائية ${i+1}</span>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">القيمة</label>
          <input class="form-input" id="stat-value-${i}" type="number" value="${s.value}">
        </div>
        <div class="form-group">
          <label class="form-label">التسمية</label>
          <input class="form-input" id="stat-label-${i}" value="${s.label}">
        </div>
      </div>
    </div>
  `).join('');
}

function populateProjects() {
  const container = document.getElementById('projects-fields');
  if (!container) return;
  container.innerHTML = adminData.projects.map((p, i) => `
    <div class="item-card">
      <div class="item-card-header">
        <span class="item-num">مشروع ${i+1}</span>
      </div>
      <div class="form-group">
        <label class="form-label">اسم المشروع</label>
        <input class="form-input" id="proj-title-${i}" value="${p.title}">
      </div>
      <div class="form-group">
        <label class="form-label">الوصف</label>
        <textarea class="form-textarea" id="proj-desc-${i}" rows="2">${p.description}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">رابط المشروع</label>
          <input class="form-input" id="proj-link-${i}" value="${p.link}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label class="form-label">السنة</label>
          <input class="form-input" id="proj-year-${i}" value="${p.year}">
        </div>
      </div>
    </div>
  `).join('');
}

function populateSkills() {
  const container = document.getElementById('skills-fields');
  if (!container) return;
  container.innerHTML = adminData.skills.map((s, i) => `
    <div class="item-card">
      <div class="form-group">
        <label class="form-label">اسم المهارة</label>
        <input class="form-input" id="skill-name-${i}" value="${s.name}">
      </div>
      <div class="form-group">
        <label class="form-label">المستوى</label>
        <div class="skill-level-wrap">
          <input class="skill-level-input" type="range" id="skill-level-${i}" 
            min="0" max="100" value="${s.level}"
            oninput="document.getElementById('skill-val-${i}').textContent = this.value + '%'">
          <span class="skill-level-val" id="skill-val-${i}">${s.level}%</span>
        </div>
      </div>
    </div>
  `).join('');
}

function populateServices() {
  const container = document.getElementById('services-fields');
  if (!container) return;
  container.innerHTML = adminData.services.map((s, i) => `
    <div class="item-card">
      <div class="item-card-header">
        <span class="item-num">خدمة ${i+1}</span>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">اسم الخدمة</label>
          <input class="form-input" id="svc-title-${i}" value="${s.title}">
        </div>
        <div class="form-group">
          <label class="form-label">السعر</label>
          <input class="form-input" id="svc-price-${i}" value="${s.price}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">الوصف</label>
        <textarea class="form-textarea" id="svc-desc-${i}" rows="2">${s.desc}</textarea>
      </div>
    </div>
  `).join('');
}

// ── Helpers ───────────────────────────────────────────────
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

// ── Preview ───────────────────────────────────────────────
function initPreview() {
  const btn = document.getElementById('btn-preview');
  if (btn) btn.addEventListener('click', () => window.open('../index.html', '_blank'));
}

// ── Reset ─────────────────────────────────────────────────
function initReset() {
  const btn = document.getElementById('btn-reset');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (confirm('هتمسح كل التعديلات وترجع للبيانات الأصلية. متأكد؟')) {
      localStorage.removeItem('portfolio_data');
      adminData = JSON.parse(JSON.stringify(PORTFOLIO_DATA));
      populateAllForms();
      showAdminToast('تم إعادة الضبط بنجاح', 'success');
    }
  });
}

// ── Logout ────────────────────────────────────────────────
function initLogout() {
  const btn = document.getElementById('btn-logout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-password').value = '';
  });
}

// ── Toast ─────────────────────────────────────────────────
function showAdminToast(msg, type = '') {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `admin-toast ${type} show`;
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}
