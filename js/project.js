// ============================================================
// PROJECT.JS — Dynamic project detail page
// Builds project.html?id=... using the existing DATA structure.
// Admin/works links keep working because this reads the exact
// same PORTFOLIO_DATA pipeline (localStorage overrides included).
// ============================================================

function extractDriveId(raw) {
  const m = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|uc\?export=download[^#]*id=))([\w-]{20,})/.exec(raw);
  if (m) return m[1];
  const q = /[?&]id=([\w-]{20,})/.exec(raw);
  return q ? q[1] : null;
}

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // Keep the navigation honest: PROJECT is a child of WORKS
    const worksNav = document.getElementById('nav-works');
    if (worksNav) worksNav.classList.add('active');

    const root = document.getElementById('project-page');
    if (!root) return;

    const rawId = new URLSearchParams(window.location.search).get('id');
    const found = (typeof DATA !== 'undefined' ? DATA.projects : [])
      .find(p => String(p.id) === String(rawId));
    const project = found ? normalizeProject(found) : null;

    document.title = project
      ? `${project.title} | Mostafa Ayad`
      : 'Project Not Found | Mostafa Ayad';

    if (!project) {
      root.innerHTML = notFoundHTML();
      return;
    }

    const media = collectMedia(project);

    root.innerHTML = heroHTML(project) + bodyHTML(project, media);
    initGallerySpans(root, project);
    bindViewer(media);
    initVideoCovers(root);
    if (typeof initRevealAnimations === 'function') initRevealAnimations();
  });

  // ── Helpers ─────────────────────────────────────────────
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function collectMedia(p) {
    const list = [];
    const hasSections = Array.isArray(p.sections) && p.sections.length;
    if (Array.isArray(p.media)) {
      p.media.forEach(m => {
        if (!m || !m.src) return;
        const raw = String(m.src || '');
        let toType = m.type === 'video' ? 'video' : (m.type === 'youtube' ? 'youtube' : (m.type === 'drive' ? 'drive' : 'image'));
        if (toType === 'video' && /drive\.google\.com/.test(raw)) toType = 'drive';
        if (toType === 'video' && /youtube\.com|youtu\.be/.test(raw)) toType = 'youtube';
        list.push({ src: toType === 'drive' ? (extractDriveId(raw) || raw) : raw, type: toType, name: m.name || '', poster: m.poster || '', section: m.section || '' });
      });
    }
    // When the project is split into sections the cover already lives in the
    // hero, so it isn't duplicated as an ungrouped gallery leftover.
    if (p.cover && !hasSections && !list.some(m => m.src === p.cover)) {
      list.unshift({ src: p.cover, type: 'image', name: 'Cover' });
    }
    return list;
  }

  // Split the media list into ordered sections. Each media item carried a
  // `section` name; anything unmatched or unspecified falls back to a single
  // "Gallery" group so no file ever disappears.
  function buildSections(p, media) {
    const sections = Array.isArray(p.sections) && p.sections.length ? p.sections.map(String).filter(Boolean) : [];
    const groups = sections.length ? sections.map(title => ({ title, items: [] })) : [{ title: 'Gallery', items: [] }];
    const leftover = [];
    media.forEach((m, i) => {
      const idx = sections.indexOf(m.section);
      if (sections.length && m.section && idx !== -1) groups[idx].items.push({ m, i });
      else leftover.push({ m, i });
    });
    if (!sections.length) groups[0].items = media.map((m, i) => ({ m, i }));
    else if (leftover.length) groups.push({ title: 'Gallery', items: leftover });
    return groups.filter(g => g.items.length);
  }

  function layoutOf(project) {
    return (project && ['auto', 'grid', 'editorial'].indexOf(project.layout) !== -1)
      ? project.layout
      : 'auto';
  }

  // ── Hero ─────────────────────────────────────────────────
  function heroHTML(p) {
    const chips = [
      p.client ? `<span class="pchip hl"><i class="fas fa-user-tie" style="margin-right:0.4rem"></i>${esc(p.client)}</span>` : '',
      `<span class="pchip"><i class="fas fa-tag" style="margin-right:0.4rem"></i>${esc(p.category)}</span>`,
      `<span class="pchip"><i class="fas fa-calendar" style="margin-right:0.4rem"></i>${esc(p.year)}</span>`,
    ].join('');

    const cover = p.cover
      ? `<div class="project-hero-cover reveal"><img src="${p.cover}" alt="${esc(p.title)}" loading="lazy"></div>`
      : '';

    return `
      <div class="project-hero">
        <a href="works.html" class="project-back">← BACK TO WORKS</a>
        <div class="page-tag">03 — PROJECT / ${esc(p.category)}</div>
        <h1 class="project-title">${esc(p.title)}</h1>
        ${p.description ? `<p class="project-short">${esc(p.description)}</p>` : ''}
        <div class="project-chips">${chips}</div>
        ${cover}
      </div>`;
  }

  // ── Body ─────────────────────────────────────────────────
  function bodyHTML(p, media) {
    const metaItems = [
      '<div class="project-meta-item scroll-reveal"><div class="pmi-label">Category</div><div class="pmi-value">' + esc(p.category || '—') + '</div></div>',
      '<div class="project-meta-item scroll-reveal"><div class="pmi-label">Year</div><div class="pmi-value">' + esc(p.year || '—') + '</div></div>',
      p.client ? '<div class="project-meta-item scroll-reveal"><div class="pmi-label">Client</div><div class="pmi-value">' + esc(p.client) + '</div></div>' : '',
      '<div class="project-meta-item scroll-reveal"><div class="pmi-label">Media</div><div class="pmi-value">' + media.length + ' <small>file' + (media.length === 1 ? '' : 's') + '</small></div></div>',
    ].join('');

    const tools = (p.tools && p.tools.length)
      ? `<div class="project-section scroll-reveal"><div class="project-section-title">Tools &amp; Skills</div><div class="chip-row">${p.tools.map(t => `<span class="tool-chip"><i class="fas fa-wrench" style="margin-right:0.35rem"></i>${esc(t)}</span>`).join('')}</div></div>`
      : '';

    const services = (p.services && p.services.length)
      ? `<div class="project-section scroll-reveal"><div class="project-section-title">Services</div><div class="chip-row">${p.services.map(s => `<span class="tool-chip"><i class="fas fa-rocket" style="margin-right:0.35rem"></i>${esc(s)}</span>`).join('')}</div></div>`
      : '';

    const sections = buildSections(p, media);
    const gallery = media.length
      ? sections.map(sec => `
          <div class="project-section">
            <div class="project-section-title scroll-reveal">${esc(sec.title)}</div>
            ${galleryHTML(sec.items, layoutOf(p))}
          </div>`).join('')
      : `<div class="project-section"><div class="project-section-title scroll-reveal">Gallery</div><div class="no-media scroll-reveal">No media uploaded yet for this project.</div></div>`;

    const next = `
      <div class="project-next reveal">
        <a href="works.html" class="btn-secondary">← BACK TO ALL WORKS</a>
        <a href="contact.html" class="btn-primary">START A PROJECT →</a>
      </div>`;

    return `
      <div class="project-body">
        <div class="project-section">
          <div class="project-meta-grid">${metaItems}</div>
        </div>
        ${services}
        ${tools}
        ${gallery}
        ${next}
      </div>`;
  }

  function galleryHTML(items, layout) {
    if (layout === 'grid') {
      return `<div class="project-gallery gallery-grid stagger-group" data-viewer>${items.map(({ m, i }) => itemFigure(m, i)).join('')}</div>`;
    }
    if (layout === 'editorial') {
      const figs = items.map(({ m, i }) => itemFigure(m, i));
      const featured = figs[0] ? figs[0].replace('class="g-item"', 'class="g-item scroll-reveal-scale"') : '';
      const rest = figs.slice(1);
      const groups = [];
      for (let j = 0; j < rest.length; j += 2) {
        const a = rest[j] ? rest[j].replace('class="g-item"', 'class="g-item scroll-reveal-left"') : '';
        const b = rest[j + 1] ? rest[j + 1].replace('class="g-item"', 'class="g-item scroll-reveal-right"') : '';
        groups.push(`<div class="g-pair">${a}${b}</div>`);
      }
      return `<div class="project-gallery gallery-editorial stagger-group" data-viewer>${featured}${groups.join('')}</div>`;
    }
    // auto → masonry (natural aspect ratio, zero cropping)
    return `<div class="project-gallery gallery-masonry stagger-group${items.length === 1 ? ' one' : ''}" data-viewer>${items.map(({ m, i }) => itemFigure(m, i)).join('')}</div>`;
  }

  function itemFigure(m, i) {
    const open = `data-vw-index="${i}"`;
    const poster = m.poster || '';
    if (m.type === 'youtube') {
      const p = poster || `https://i.ytimg.com/vi/${esc(m.src)}/hqdefault.jpg`;
      return `<figure class="g-item g-video" ${open} data-type="youtube" data-click-type="youtube"><div class="g-video-cover" data-cover data-poster="${esc(p)}"><span class="g-play-btn"><i class="fas fa-play"></i></span></div></figure>`;
    }
    if (m.type === 'drive') {
      const p = poster || `https://drive.google.com/thumbnail?id=${esc(m.src)}&sz=w800`;
      return `<figure class="g-item g-video" ${open} data-type="video" data-click-type="https://drive.google.com/file/d/${esc(m.src)}/preview"><div class="g-video-cover" data-cover data-poster="${esc(p)}"><span class="g-play-btn"><i class="fas fa-play"></i></span></div></figure>`;
    }
    if (m.type === 'video') {
      return `<figure class="g-item g-video" ${open} data-type="video" data-click-type="${esc(m.src)}"><video src="${m.src}" preload="metadata" muted playsinline data-local-video></video><div class="g-video-cover" data-cover><span class="g-play-btn"><i class="fas fa-play"></i></span></div></figure>`;
    }
    return `<figure class="g-item" ${open} data-type="image"><img src="${m.src}" alt="" loading="lazy" onload="window.__fitGalleryItem && window.__fitGalleryItem(this)"></figure>`;
  }

  // Grid layout: assign spans from the real image ratio (after load)
  window.__fitGalleryItem = function (img) {
    const figure = img.closest('.g-item');
    if (!figure || !figure.closest('.gallery-grid')) return;
    const w = img.naturalWidth || 1;
    const h = img.naturalHeight || 1;
    const ratio = w / h;
    figure.classList.remove('g-grid-tall', 'g-grid-wide');
    if (ratio > 1.35) figure.classList.add('g-grid-wide');
    else if (ratio < 0.8) figure.classList.add('g-grid-tall');
  };

  function initGallerySpans(root) {
    // videos in grid get a neutral span
    root.querySelectorAll('.gallery-grid .g-item[data-type="video"], .gallery-grid .g-item[data-type="youtube"]').forEach(f => {
      f.classList.add('g-grid-wide');
    });
    // click binding for the whole gallery
    root.querySelectorAll('[data-viewer]').forEach(container => {
      container.querySelectorAll('.g-item').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-vw-index') || '0', 10);
          openViewer(idx);
        });
      });
    });
  }

  // ── Video covers (show a thumbnail instead of a black player) ──
  function initVideoCovers(root) {
    // YouTube / Drive: load remote poster into the cover div
    root.querySelectorAll('[data-cover][data-poster]').forEach(cover => {
      const img = new Image();
      img.onload = () => { cover.style.backgroundImage = `url("${cover.dataset.poster}")`; };
      img.onerror = () => { cover.classList.add('g-video-cover-fallback'); };
      img.src = cover.dataset.poster;
    });

    // Local video files: grab the first frame as the cover
    root.querySelectorAll('video[data-local-video]').forEach(vid => {
      const figure = vid.closest('.g-item');
      const cover = figure ? figure.querySelector('[data-cover]') : null;
      const setFrame = () => {
        if (!cover || cover.style.backgroundImage) return;
        try {
          const c = document.createElement('canvas');
          c.width = vid.videoWidth || 640;
          c.height = vid.videoHeight || 360;
          c.getContext('2d').drawImage(vid, 0, 0, c.width, c.height);
          cover.style.backgroundImage = `url("${c.toDataURL('image/jpeg', 0.7)}")`;
        } catch (e) {
          cover.classList.add('g-video-cover-fallback');
        }
      };
      vid.addEventListener('loadeddata', setFrame);
      vid.addEventListener('seeked', setFrame);
      vid.currentTime = 0.5;
    });
  }

  // ── Fullscreen Viewer ────────────────────────────────────
  let viewer = null;
  let viewerIndex = 0;
  let viewerItems = [];

  function ensureViewer() {
    if (viewer) return viewer;
    viewer = document.createElement('div');
    viewer.className = 'project-viewer';
    viewer.innerHTML = `
      <button class="vbtn vbtn-close" data-vw="close" aria-label="Close">&times;</button>
      <button class="vbtn vbtn-prev" data-vw="prev" aria-label="Previous">‹</button>
      <div class="viewer-stage">
        <div class="viewer-media" id="vw-media"></div>
        <div class="viewer-meta">
          <span class="vm-count" id="vw-count"></span>
          <span id="vw-name"></span>
        </div>
      </div>
      <button class="vbtn vbtn-next" data-vw="next" aria-label="Next">›</button>`;
    document.body.appendChild(viewer);

    viewer.addEventListener('click', (e) => {
      if (e.target === viewer) closeViewer(); // backdrop click
      const action = e.target.closest('[data-vw]');
      if (!action) return;
      if (action.getAttribute('data-vw') === 'close') closeViewer();
      if (action.getAttribute('data-vw') === 'prev') stepViewer(-1);
      if (action.getAttribute('data-vw') === 'next') stepViewer(1);
    });

    document.addEventListener('keydown', (e) => {
      if (viewer && viewer.classList.contains('open')) {
        if (e.key === 'Escape') closeViewer();
        if (e.key === 'ArrowLeft') stepViewer(-1);
        if (e.key === 'ArrowRight') stepViewer(1);
      }
    });
    return viewer;
  }

  function bindViewer(media) {
    viewerItems = media;
  }

  function openViewer(index) {
    if (!viewerItems.length) return;
    ensureViewer();
    viewerIndex = (index + viewerItems.length) % viewerItems.length;
    renderViewerMedia();
    viewer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeViewer() {
    if (!viewer) return;
    viewer.classList.remove('open');
    viewer.querySelector('#vw-media').innerHTML = '';
    document.body.style.overflow = '';
  }

  function stepViewer(dir) {
    viewerIndex = (viewerIndex + dir + viewerItems.length) % viewerItems.length;
    renderViewerMedia();
  }

  function renderViewerMedia() {
    const item = viewerItems[viewerIndex];
    const mediaBox = viewer.querySelector('#vw-media');
    const count = viewer.querySelector('#vw-count');
    const name = viewer.querySelector('#vw-name');

    mediaBox.innerHTML = item.type === 'youtube'
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${esc(item.src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
      : item.type === 'drive'
        ? `<iframe src="https://drive.google.com/file/d/${esc(item.src)}/preview" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        : item.type === 'video'
          ? `<video src="${item.src}" controls autoplay playsinline></video>`
          : `<img src="${item.src}" alt="">`;

    if (count) count.textContent = `${viewerIndex + 1} / ${viewerItems.length}`;
    if (name) name.textContent = item.name ? `— ${item.name}` : '';
  }

  // Expose for inline usage / debugging
  window.__openProjectViewer = openViewer;
  window.closeViewer = closeViewer;

  // ── Not-found state ─────────────────────────────────────
  function notFoundHTML() {
    return `
      <div class="project-hero" style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div class="page-tag">03 — PROJECT</div>
        <h1 class="project-title">Project Not Found</h1>
        <p class="project-short">This project doesn't exist or may have been removed.</p>
        <div class="project-next" style="justify-content:center;padding:0;margin-top:2rem;">
          <a href="works.html" class="btn-primary">← BACK TO WORKS</a>
        </div>
      </div>`;
  }
})();