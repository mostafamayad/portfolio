// ============================================================
// ADMIN.JS — Full Admin Panel with Image/Video Upload
// ============================================================

const ADMIN_PASSWORD = 'admin123';
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
  initExportImport();
});

function loadAdminData() {
  const base = (typeof SITE_DATA !== 'undefined' && SITE_DATA)
    ? JSON.parse(JSON.stringify(SITE_DATA))
    : PORTFOLIO_DATA;
  const saved = localStorage.getItem('portfolio_data');
  try { adminData = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(base)); }
  catch(e) { adminData = JSON.parse(JSON.stringify(base)); }
  if (!adminData.projects) adminData.projects = JSON.parse(JSON.stringify(base.projects));
  if (!adminData.personal) adminData.personal = JSON.parse(JSON.stringify(base.personal));
  // Ensure old saved projects get optional fields without losing data
  if (typeof normalizeProjects === 'function') {
    adminData.projects = normalizeProjects(adminData.projects);
  }
}

function saveAll() {
  try {
    localStorage.setItem('portfolio_data', JSON.stringify(adminData));
    showAdminToast('✓ تم الحفظ بنجاح', 'success');
  } catch (e) {
    console.error('Save failed', e);
    showAdminToast(
      (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'))
        ? '⚠️ مساحة المتصفح ممتلئة — ارفع صور أصغر أو احذف مشاريع'
        : '⚠️ لم يتم الحفظ — حاول مرة أخرى',
      'error'
    );
  }
}

// Compress uploaded images before storing so localStorage never overflows.
function compressImage(file, maxDim, quality) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) return resolve(null);
    // Keep vector/animated formats as-is to avoid flattening them
    if (/(svg|gif)/.test(file.type)) {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / img.width, maxDim / img.height);
        const cw = Math.max(1, Math.round(img.width * scale));
        const ch = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        canvas.getContext('2d').drawImage(img, 0, 0, cw, ch);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(null);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function readFileData(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => resolve(null);
    r.readAsDataURL(file);
  });
}

// ── Login ─────────────────────────────────────────────────
function initLogin() {
  const loginScreen = document.getElementById('login-screen');
  const loginBtn = document.getElementById('login-btn');
  const loginInput = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const dashboard = document.getElementById('admin-dashboard');

  function attemptLogin() {
    if (loginInput.value.trim() === ADMIN_PASSWORD) {
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
  loginInput.addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });
}

// ── Tabs ──────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`tab-${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });
}

// ── Save Buttons ──────────────────────────────────────────
function initSaveButtons() {
  document.querySelectorAll('[data-save]').forEach(btn => {
    btn.addEventListener('click', () => {
      collectFormData(btn.dataset.save);
      saveAll();
    });
  });
}

// ── Populate All Forms ────────────────────────────────────
function populateAllForms() {
  populatePersonal();
  populateSocial();
  populateStats();
  populateProjects();
  populateSkills();
  populateServices();
}

// ── PERSONAL TAB ─────────────────────────────────────────
function populatePersonal() {
  const p = adminData.personal || PORTFOLIO_DATA.personal;
  setVal('field-name', p.name);
  setVal('field-title', p.title);
  setVal('field-bio', p.bio ? p.bio.replace(/<[^>]*>/g, '') : '');
  setVal('field-email', p.email);
  setVal('field-phone', p.phone);
  setVal('field-location', p.location);
  setVal('field-university', p.university || '');
  setVal('field-quote', p.quote);
  setVal('field-vibe', p.currentVibe);

  // Show current images
  renderCurrentImage('preview-profile', p.profileImage);
  renderCurrentImage('preview-cover', p.coverImage);
  renderCurrentImage('preview-logo', p.logoImage);

  // Image upload handlers
  setupImageUpload('upload-profile', 'preview-profile', (base64) => {
    if (!adminData.personal) adminData.personal = {};
    adminData.personal.profileImage = base64;
  });
  setupImageUpload('upload-cover', 'preview-cover', (base64) => {
    if (!adminData.personal) adminData.personal = {};
    adminData.personal.coverImage = base64;
  });
  setupImageUpload('upload-logo', 'preview-logo', (base64) => {
    if (!adminData.personal) adminData.personal = {};
    adminData.personal.logoImage = base64;
  });
}

function renderCurrentImage(previewId, src) {
  const preview = document.getElementById(previewId);
  if (!preview || !src) return;
  preview.innerHTML = `<img src="${src}" style="max-width:100%;max-height:150px;border-radius:8px;object-fit:cover">`;
}

function setupImageUpload(inputId, previewId, callback) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;
    const dataUrl = (await compressImage(file, 1600, 0.8)) || (await readFileData(file));
    if (dataUrl) {
      callback(dataUrl);
      renderCurrentImage(previewId, dataUrl);
      showAdminToast('✓ تم رفع الصورة، اضغط حفظ لتأكيد التغييرات');
    }
  });
}

function collectFormData(section) {
  const panel = document.getElementById(`tab-${section}`);
  if (!panel) return;
  if (!adminData.personal) adminData.personal = {};

  switch(section) {
    case 'personal':
      adminData.personal.name      = getVal(panel, 'field-name');
      adminData.personal.title     = getVal(panel, 'field-title');
      adminData.personal.bio       = getVal(panel, 'field-bio');
      adminData.personal.email     = getVal(panel, 'field-email');
      adminData.personal.phone     = getVal(panel, 'field-phone');
      adminData.personal.location  = getVal(panel, 'field-location');
      adminData.personal.university= getVal(panel, 'field-university');
      adminData.personal.quote     = getVal(panel, 'field-quote');
      adminData.personal.currentVibe = getVal(panel, 'field-vibe');
      break;

    case 'social':
      if (!adminData.socials) adminData.socials = JSON.parse(JSON.stringify(PORTFOLIO_DATA.socials));
      adminData.socials = adminData.socials.map((s, i) => ({
        ...s, url: getVal(panel, `social-url-${i}`)
      }));
      break;

    case 'stats':
      if (!adminData.stats) adminData.stats = JSON.parse(JSON.stringify(PORTFOLIO_DATA.stats));
      adminData.stats = adminData.stats.map((s, i) => ({
        ...s,
        value: parseInt(getVal(panel, `stat-value-${i}`)) || s.value,
        label: getVal(panel, `stat-label-${i}`)
      }));
      break;

    case 'skills':
      if (!adminData.skills) adminData.skills = JSON.parse(JSON.stringify(PORTFOLIO_DATA.skills));
      adminData.skills = adminData.skills.map((s, i) => ({
        ...s,
        name: getVal(panel, `skill-name-${i}`),
        level: parseInt(getVal(panel, `skill-level-${i}`)) || s.level
      }));
      break;

    case 'services':
      if (!adminData.services) adminData.services = JSON.parse(JSON.stringify(PORTFOLIO_DATA.services));
      adminData.services = adminData.services.map((s, i) => ({
        ...s,
        title: getVal(panel, `svc-title-${i}`),
        desc:  getVal(panel, `svc-desc-${i}`),
        price: getVal(panel, `svc-price-${i}`)
      }));
      break;

    case 'projects':
      // Collect every rendered project card so the main "حفظ التغييرات"
      // button persists all project fields (cover/media already mutate adminData).
      adminData.projects.forEach((proj, i) => {
        proj.title       = getVal(panel, `proj-title-${i}`);
        const catEl   = panel.querySelector(`#proj-cat-${i}`);
        if (catEl) proj.category = catEl.value;
        proj.year        = getVal(panel, `proj-year-${i}`);
        proj.description = getVal(panel, `proj-desc-${i}`);
        proj.client      = getVal(panel, `proj-client-${i}`);
        proj.services    = strToList(getVal(panel, `proj-services-${i}`));
        proj.tools       = strToList(getVal(panel, `proj-tools-${i}`));
        const layoutEl   = panel.querySelector(`#proj-layout-${i}`);
        if (layoutEl) proj.layout = layoutEl.value || 'auto';
        const featEl     = panel.querySelector(`#proj-featured-${i}`);
        proj.featured    = featEl ? featEl.checked : !!proj.featured;
      });
      break;
  }
}

// ── SOCIAL TAB ────────────────────────────────────────────
function populateSocial() {
  const container = document.getElementById('social-fields');
  if (!container) return;
  const socials = adminData.socials || PORTFOLIO_DATA.socials;
  container.innerHTML = socials.map((s, i) => `
    <div class="form-group">
      <label class="form-label">${s.name} <i class="${s.icon}" style="margin-right:0.3rem;color:var(--purple-light)"></i></label>
      <input class="form-input" id="social-url-${i}" value="${s.url || ''}" placeholder="https://..." dir="ltr">
    </div>
  `).join('');
}

// ── STATS TAB ─────────────────────────────────────────────
function populateStats() {
  const container = document.getElementById('stats-fields');
  if (!container) return;
  const stats = adminData.stats || PORTFOLIO_DATA.stats;
  container.innerHTML = stats.map((s, i) => `
    <div class="item-card">
      <div class="item-card-header"><span class="item-num">${s.icon} الإحصائية ${i+1}</span></div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">القيمة</label>
          <input class="form-input" id="stat-value-${i}" type="number" value="${s.value}">
        </div>
        <div class="form-group">
          <label class="form-label">التسمية</label>
          <input class="form-input" id="stat-label-${i}" value="${s.label.replace('\n',' ')}">
        </div>
      </div>
    </div>
  `).join('');
}

// ── PROJECTS TAB (with image/video upload) ────────────────
function populateProjects() {
  const container = document.getElementById('projects-fields');
  if (!container) return;
  if (!adminData.projects) adminData.projects = JSON.parse(JSON.stringify(PORTFOLIO_DATA.projects));
  // Fill any missing optional fields so old saved projects stay editable & safe
  adminData.projects = normalizeProjects(adminData.projects);
  const projList = adminData.projects;

  container.innerHTML = projList.map((p, i) => `
    <div class="item-card project-card" id="proj-card-${i}">
      <div class="item-card-header">
        <span class="item-num">📁 مشروع ${i+1} — ${p.title}</span>
        <button class="item-del-btn" onclick="deleteProject(${i})" title="حذف المشروع"><i class="fas fa-trash"></i></button>
      </div>

      <!-- Basic Info -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">اسم المشروع</label>
          <input class="form-input" id="proj-title-${i}" value="${p.title || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">الفئة</label>
          <select class="form-input" id="proj-cat-${i}">
            <option value="social"   ${p.category==='social'   ?'selected':''}>Social Media</option>
            <option value="poster"   ${p.category==='poster'   ?'selected':''}>Poster / Print</option>
            <option value="branding" ${p.category==='branding' ?'selected':''}>Branding</option>
            <option value="web"      ${p.category==='web'      ?'selected':''}>UI / UX</option>
            <option value="motion"   ${p.category==='motion'   ?'selected':''}>Motion / Video</option>
            <option value="it"       ${p.category==='it'       ?'selected':''}>IT Solutions</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">السنة</label>
          <input class="form-input" id="proj-year-${i}" value="${p.year || '2024'}" placeholder="2024">
        </div>
        <div class="form-group">
          <label class="form-label">وصف قصير</label>
          <input class="form-input" id="proj-desc-${i}" value="${p.description || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">العميل (Client)</label>
          <input class="form-input" id="proj-client-${i}" value="${p.client || ''}" placeholder="اختياري — اسم العميل">
        </div>
        <div class="form-group">
          <label class="form-label">خدمات المشروع (Services)</label>
          <input class="form-input" id="proj-services-${i}" value="${(p.services||[]).join(', ')}" placeholder="Branding, Social Media, Video">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">الأدوات (Tools / Skills)</label>
          <input class="form-input" id="proj-tools-${i}" value="${(p.tools||[]).join(', ')}" placeholder="Photoshop, Illustrator, Premiere">
        </div>
        <div class="form-group">
          <label class="form-label">تخطيط المعرض (Layout)</label>
          <select class="form-input" id="proj-layout-${i}">
            <option value="auto"     ${(p.layout||'auto')==='auto'?'selected':''}>تلقائي — يحافظ على أبعاد كل صورة (Masonry)</option>
            <option value="grid"     ${p.layout==='grid'?'selected':''}>شبكة موحدة (Grid)</option>
            <option value="editorial" ${p.layout==='editorial'?'selected':''}>عرضي (Editorial)</option>
          </select>
        </div>
      </div>
      <div class="featured-row">
        <label class="featured-check">
          <input type="checkbox" id="proj-featured-${i}" ${p.featured ? 'checked' : ''}>
          <span>مشروع مميز (Featured)</span>
        </label>
      </div>

      <!-- Cover Image Upload -->
      <div class="form-group">
        <label class="form-label">🖼️ صورة الغلاف (Cover)</label>
        <div class="upload-area" onclick="document.getElementById('proj-cover-upload-${i}').click()">
          <input type="file" id="proj-cover-upload-${i}" accept="image/*" style="display:none" onchange="handleProjectCover(${i}, this)">
          <div id="proj-cover-preview-${i}" class="upload-preview">
            ${p.cover ? `<img src="${p.cover}" style="max-height:120px;max-width:100%;border-radius:8px;object-fit:contain;background:#0d0d1a">` : '<div class="upload-placeholder"><i class="fas fa-cloud-upload-alt"></i><span>اضغط لرفع صورة الغلاف</span></div>'}
          </div>
        </div>
      </div>

      <!-- Media Gallery Upload -->
      <div class="form-group">
        <label class="form-label">📂 معرض الصور والفيديوهات (يمكن إضافة متعدد)</label>
        <div class="upload-area" onclick="document.getElementById('proj-media-upload-${i}').click()">
          <input type="file" id="proj-media-upload-${i}" accept="image/*,video/*" multiple style="display:none" onchange="handleProjectMedia(${i}, this)">
          <div class="upload-placeholder small">
            <i class="fas fa-photo-video"></i>
            <span>اضغط لإضافة صور أو فيديوهات</span>
            <span class="upload-hint">JPG, PNG, GIF, MP4, MOV — بدون حد للجودة</span>
          </div>
        </div>
        <div id="proj-media-gallery-${i}" class="media-gallery">
          ${renderMediaGallery(p.media || [], i)}
        </div>
        <div style="margin-top:0.75rem;border-top:1px dashed var(--border);padding-top:0.75rem">
          <label class="form-label" style="font-size:0.85rem">🎬 فيديو كامل بالجودة الأصلية (مرفوع على YouTube أو كملف داخل الموقع)</label>
          <input type="text" id="proj-video-link-${i}" class="form-input" style="margin-bottom:0.4rem" placeholder="https://www.youtube.com/watch?v=... أو assets/videos/my-clip.mp4">
          <button class="add-btn" style="width:auto;padding:0.5rem 1rem" onclick="addVideoLink(${i})"><i class="fas fa-link"></i> إضافة الفيديو</button>
          <div class="upload-hint">المتصفح لا يتحمل حفظ فيديو كامل، فالرابط أو الملف داخل الموقع مش بيمتنزع على المساحة — والجودة تعليها من مشغل الفيديو.</div>
        </div>
      </div>

      <button class="save-btn" onclick="saveProject(${i})"><i class="fas fa-save"></i> حفظ هذا المشروع</button>
    </div>
  `).join('');

  // Add new project button
  container.innerHTML += `
    <button class="add-btn" onclick="addNewProject()">
      <i class="fas fa-plus"></i> إضافة مشروع جديد
    </button>
  `;
}

function renderMediaGallery(media, projIdx) {
  if (!media || media.length === 0) return '';
  return `<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.75rem">` +
    media.map((m, mi) => {
      if (m.type === 'youtube') {
        return `<div style="position:relative;width:120px;">
          <div style="width:120px;height:80px;border-radius:6px;border:1px solid var(--border);background:linear-gradient(135deg,rgba(124,58,237,0.35),rgba(220,38,38,0.35));display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:0.7rem;color:#fff;gap:0.25rem;text-align:center;padding:0.25rem">▶<span style="max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${m.src}">YouTube</span></div>
          <button onclick="removeMedia(${projIdx},${mi})" style="position:absolute;top:2px;right:2px;background:var(--red);border:none;border-radius:4px;color:white;font-size:0.6rem;padding:2px 5px;cursor:pointer">✕</button>
        </div>`;
      }
      if (m.type === 'video') {
        return `<div style="position:relative;width:120px;">
          <video src="${m.src}" style="width:120px;height:80px;border-radius:6px;object-fit:cover;border:1px solid var(--border)"></video>
          <button onclick="removeMedia(${projIdx},${mi})" style="position:absolute;top:2px;right:2px;background:var(--red);border:none;border-radius:4px;color:white;font-size:0.6rem;padding:2px 5px;cursor:pointer">✕</button>
        </div>`;
      } else {
        return `<div style="position:relative;width:120px;">
          <img src="${m.src}" style="width:120px;height:80px;border-radius:6px;object-fit:cover;border:1px solid var(--border)">
          <button onclick="removeMedia(${projIdx},${mi})" style="position:absolute;top:2px;right:2px;background:var(--red);border:none;border-radius:4px;color:white;font-size:0.6rem;padding:2px 5px;cursor:pointer">✕</button>
        </div>`;
      }
    }).join('') + `</div>`;
}

window.addVideoLink = function(projIdx) {
  const input = document.getElementById(`proj-video-link-${projIdx}`);
  if (!input) return;
  const raw = (input.value || '').trim();
  if (!raw) {
    showAdminToast('⚠️ اكتب رابط الفيديو أولاً');
    return;
  }
  if (!adminData.projects[projIdx].media) adminData.projects[projIdx].media = [];
  const yt = youtubeVideoId(raw);
  if (yt) {
    adminData.projects[projIdx].media.push({ src: yt, type: 'youtube', name: 'YouTube video' });
  } else {
    adminData.projects[projIdx].media.push({ src: raw, type: 'video', name: raw.split('/').pop() });
  }
  input.value = '';
  const gallery = document.getElementById(`proj-media-gallery-${projIdx}`);
  if (gallery) gallery.innerHTML = renderMediaGallery(adminData.projects[projIdx].media, projIdx);
  saveAll();
  showAdminToast('✓ تم إضافة الفيديو');
};

function youtubeVideoId(url) {
  const m = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/.exec(url);
  return m ? m[1] : null;
}

window.handleProjectCover = async function(projIdx, input) {
  const file = input.files[0];
  if (!file) return;
  const dataUrl = (await compressImage(file, 1600, 0.8)) || (await readFileData(file));
  if (!dataUrl) return;
  adminData.projects[projIdx].cover = dataUrl;
  const preview = document.getElementById(`proj-cover-preview-${projIdx}`);
  if (preview) preview.innerHTML = `<img src="${dataUrl}" style="max-height:120px;max-width:100%;border-radius:8px;object-fit:cover">`;
  saveAll();
  showAdminToast('✓ تم رفع وحفظ صورة الغلاف');
};

window.handleProjectMedia = async function(projIdx, input) {
  const files = Array.from(input.files);
  if (!files.length) return;
  if (!adminData.projects[projIdx].media) adminData.projects[projIdx].media = [];
  let loaded = 0;
  for (const file of files) {
    const isVideo = file.type.startsWith('video/');
    const dataSrc = isVideo ? (await readFileData(file)) : ((await compressImage(file, 1280, 0.78)) || (await readFileData(file)));
    if (dataSrc) {
      adminData.projects[projIdx].media.push({ src: dataSrc, type: isVideo ? 'video' : 'image', name: file.name });
    }
    loaded++;
    if (loaded === files.length) {
      const gallery = document.getElementById(`proj-media-gallery-${projIdx}`);
      if (gallery) gallery.innerHTML = renderMediaGallery(adminData.projects[projIdx].media, projIdx);
      saveAll();
      showAdminToast(`✓ تم رفع وحفظ ${files.length} ملف`);
    }
  }
};

window.removeMedia = function(projIdx, mediaIdx) {
  adminData.projects[projIdx].media.splice(mediaIdx, 1);
  const gallery = document.getElementById(`proj-media-gallery-${projIdx}`);
  if (gallery) gallery.innerHTML = renderMediaGallery(adminData.projects[projIdx].media, projIdx);
  saveAll();
};

window.saveProject = function(projIdx) {
  const panel = document.getElementById('tab-projects');
  const proj = adminData.projects[projIdx];
  proj.title       = getVal(panel, `proj-title-${projIdx}`);
  proj.category    = document.getElementById(`proj-cat-${projIdx}`).value;
  proj.year        = getVal(panel, `proj-year-${projIdx}`);
  proj.description = getVal(panel, `proj-desc-${projIdx}`);
  proj.client      = getVal(panel, `proj-client-${projIdx}`);
  proj.services    = strToList(getVal(panel, `proj-services-${projIdx}`));
  proj.tools       = strToList(getVal(panel, `proj-tools-${projIdx}`));
  proj.layout      = document.getElementById(`proj-layout-${projIdx}`).value || 'auto';
  const featBox = document.getElementById(`proj-featured-${projIdx}`);
  proj.featured    = featBox ? featBox.checked : !!proj.featured;
  saveAll();
};

window.deleteProject = function(projIdx) {
  if (!confirm('هتحذف المشروع ده، متأكد؟')) return;
  adminData.projects.splice(projIdx, 1);
  saveAll();
  populateProjects();
};

window.addNewProject = function() {
  if (!adminData.projects) adminData.projects = [];
  adminData.projects.push({
    id: Date.now(),
    title: 'مشروع جديد',
    category: 'social',
    year: new Date().getFullYear().toString(),
    description: '',
    cover: '',
    media: [],
    type: 'image',
    client: '',
    services: [],
    tools: [],
    featured: false,
    layout: 'auto'
  });
  saveAll();
  populateProjects();
  // Scroll to new project
  setTimeout(() => {
    const cards = document.querySelectorAll('.project-card');
    if (cards.length) cards[cards.length-1].scrollIntoView({ behavior: 'smooth' });
  }, 100);
};

// ── SKILLS TAB ────────────────────────────────────────────
function populateSkills() {
  const container = document.getElementById('skills-fields');
  if (!container) return;
  const skills = adminData.skills || PORTFOLIO_DATA.skills;
  container.style.display = 'grid';
  container.style.gridTemplateColumns = '1fr 1fr';
  container.style.gap = '1rem';
  container.innerHTML = skills.map((s, i) => `
    <div class="item-card">
      <div class="form-group">
        <label class="form-label">اسم المهارة</label>
        <input class="form-input" id="skill-name-${i}" value="${s.name}">
      </div>
      <div class="form-group">
        <label class="form-label">المستوى: <span id="skill-val-${i}">${s.level}%</span></label>
        <input class="skill-level-input" type="range" id="skill-level-${i}" 
          min="0" max="100" value="${s.level}"
          oninput="document.getElementById('skill-val-${i}').textContent = this.value + '%'">
      </div>
    </div>
  `).join('');
}

// ── SERVICES TAB ──────────────────────────────────────────
function populateServices() {
  const container = document.getElementById('services-fields');
  if (!container) return;
  const services = adminData.services || PORTFOLIO_DATA.services;
  container.innerHTML = services.map((s, i) => `
    <div class="item-card">
      <div class="item-card-header"><span class="item-num">${s.icon} خدمة ${i+1}</span></div>
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
function getVal(container, id) {
  const el = container ? container.querySelector(`#${id}`) : document.getElementById(id);
  return el ? el.value : '';
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

// ── Preview, Reset, Logout ────────────────────────────────
function initPreview() {
  const btn = document.getElementById('btn-preview');
  if (btn) btn.addEventListener('click', () => window.open('../index.html', '_blank'));
}
function initReset() {
  const btn = document.getElementById('btn-reset');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (confirm('هتمسح كل التعديلات وترجع للبيانات الأصلية. متأكد؟')) {
      localStorage.removeItem('portfolio_data');
      adminData = JSON.parse(JSON.stringify(PORTFOLIO_DATA));
      populateAllForms();
      showAdminToast('✓ تم إعادة الضبط', 'success');
    }
  });
}
function initLogout() {
  const btn = document.getElementById('btn-logout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-password').value = '';
  });
}

// ── Export / Import ──────────────────────────────────────
function initExportImport() {
  const exportBtn = document.getElementById('btn-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(adminData, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'portfolio_data.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      showAdminToast('✓ تم تنزيل بيانات الموقع');
    });
  }

  const importInput = document.getElementById('import-data');
  if (importInput) {
    importInput.addEventListener('change', () => {
      const file = importInput.files[0];
      importInput.value = '';
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed || typeof parsed !== 'object') throw new Error('invalid');
          if (!parsed.projects) parsed.projects = JSON.parse(JSON.stringify(PORTFOLIO_DATA.projects));
          if (typeof normalizeProjects === 'function') {
            parsed.projects = normalizeProjects(parsed.projects);
          }
          adminData = parsed;
          saveAll();
          populateAllForms();
          showAdminToast('✓ تم استيراد البيانات وحفظها بنجاح', 'success');
        } catch (err) {
          console.error('Import failed', err);
          showAdminToast('⚠️ الملف غير صالح — اختر ملف JSON صحيح', 'error');
        }
      };
      reader.onerror = () => showAdminToast('⚠️ تعذر قراءة الملف', 'error');
      reader.readAsText(file);
    });
  }
}

// ── Toast ─────────────────────────────────────────────────
function showAdminToast(msg, type = '') {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `admin-toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}
