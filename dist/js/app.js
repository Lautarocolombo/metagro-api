// Usar la misma URL del dominio en producción (Vercel) para que /api/* apunte al backend desplegado aquí.
const API_BASE = 'https://metagro-api-ds6r.onrender.com/api';

let products = [];
let useApi = true;
let hasUnsavedChanges = false;
let originalProducts = [];
let currentPage = 1;
const itemsPerPage = 24;
let currentLang = 'es';
let translations = {};

function detectLanguage() {
  const saved = localStorage.getItem('mg_lang');
  if (saved) return saved;
  const navLang = (navigator.language || navigator.userLanguage || 'es').split('-')[0];
  return ['es', 'en'].includes(navLang) ? navLang : 'es';
}

async function fetchTranslations(lang) {
  try {
    const res = await fetch(`${API_BASE}/translations?lang=${lang}`);
    const data = await res.json();
    if (data.ok) {
      translations = data.translations || {};
      window._translationsCache = window._translationsCache || {};
      Object.assign(window._translationsCache, translations);
    }
  } catch (e) {
    console.error('[lang] failed to fetch translations:', e);
  }
}

function t(key) {
  return translations[key] || key;
}

async function switchLanguage() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  localStorage.setItem('mg_lang', currentLang);
  document.cookie = `mg_lang=${currentLang};path=/;max-age=${60*60*24*365}`;
  const label = document.getElementById('lang-label');
  if (label) label.textContent = currentLang.toUpperCase();
  await fetchTranslations(currentLang);
  applyTranslations();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = (translations && translations[key]) || (window._translationsCache && window._translationsCache[key]);
    if (!translation) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = translation;
    } else {
      el.textContent = translation;
    }
  });
}

async function initLanguage() {
  currentLang = detectLanguage();
  const label = document.getElementById('lang-label');
  if (label) label.textContent = currentLang.toUpperCase();
  await fetchTranslations(currentLang);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initWysiwyg() {
  document.querySelectorAll('.wysiwyg-toolbar').forEach(toolbar => {
    toolbar.querySelectorAll('.wysiwyg-btn').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const cmd = btn.dataset.cmd;
        if (cmd === 'insertImage') {
          const url = prompt('URL de la imagen:');
          if (url) document.execCommand('insertImage', false, url);
        } else if (cmd === 'createLink') {
          const url = prompt('URL del enlace:');
          if (url) document.execCommand('createLink', false, url);
        } else {
          document.execCommand(cmd, false, null);
        }
      });
    });
  });
  document.querySelectorAll('.wysiwyg').forEach(el => {
    el.addEventListener('blur', () => {
      el.dataset.value = el.innerHTML || '';
    });
  });
}

function encodeImgPath(path) {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = sessionStorage.getItem('mg_admin_token');
  if (token) headers['x-mg-token'] = token;
  const ctrl = opts.signal ? { signal: opts.signal } : {};
  const res = await fetch(API_BASE + path, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    ...ctrl
  });
  if (!res.ok) throw new Error('API ' + res.status);
  return res;
}

async function tryRefreshToken() {
  const refreshToken = sessionStorage.getItem('mg_refresh_token');
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/admin/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await res.json();
    if (data.token) {
      sessionStorage.setItem('mg_admin_token', data.token);
      if (data.refreshToken) sessionStorage.setItem('mg_refresh_token', data.refreshToken);
      return true;
    }
  } catch (e) {
    console.error('[api] refresh failed:', e);
  }
  return false;
}

function showError(message) {
  const el = document.getElementById('app-error');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.app-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `app-toast app-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function renderSkeletons(count = 6) {
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }).map(() => `
    <div class="cat-card cat-card--skeleton">
      <div class="cat-img-placeholder cat-img-placeholder--skeleton"></div>
      <div class="cat-body">
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line skeleton-line--text"></div>
        <div class="skeleton-line skeleton-line--tag"></div>
      </div>
    </div>
  `).join('');
}

function normalizeProducts(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(p => {
    const imgMain = p.img || p.imagen_url || p.imagen || '';
    const imgs = Array.isArray(p.images) && p.images.length
      ? p.images
      : (imgMain ? [imgMain] : []);
    return {
      id:         p.id ?? null,
      name:       p.name || p.nombre || '',
      tag:        p.tag || p.categoria || p.category || 'General',
      desc:       p.desc || p.descripcion || p.description || 'Consultá disponibilidad y precio en Metagro SRL.',
      icon:       p.icon || '',
      img:        imgMain,
      imagen_url: p.imagen_url || imgMain,
      images:     imgs,
      seo:        p.seo || null
    };
  }).filter(p => p.id !== null);
}

async function fetchProducts(retries = 3, delay = 2000) {
  console.log('[fetchProducts] start useApi:', useApi);
  if (!useApi) return;
  renderSkeletons();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 6000);
      const res = await api('/products', { signal: ctrl.signal });
      clearTimeout(tid);
      const data = await res.json();
      console.log('[fetchProducts] attempt', attempt, 'status:', res.status, 'items:', Array.isArray(data) ? data.length : 'not array');
      if (Array.isArray(data) && data.length > 0) {
        products = normalizeProducts(data);
        localStorage.setItem('mg_products', JSON.stringify(products));
        useApi = true;
        const bar = document.getElementById('api-status-bar');
        if (bar) {
          if (document.getElementById('btn-sync-db')) {
            bar.textContent = `✓ ${products.length} productos cargados desde la base de datos Neon`;
            bar.style.background = '#1b3a1b';
            bar.style.color = '#8f8';
          } else {
            bar.classList.remove('show');
          }
        }
        populateCategoryFilter();
        renderCatalog();
        console.log('[fetchProducts] success, products:', products.length);
        return;
      }
    } catch (e) {
      console.log('[fetchProducts] attempt', attempt, 'error:', e.message || e);
      if (attempt === retries) break;
      await new Promise(r => setTimeout(r, delay * attempt));
    }
  }
  useApi = false;
  const saved = localStorage.getItem('mg_products');
  if (saved) { try { products = JSON.parse(saved); } catch (e) {} }
  if (!products.length) {
    products = normalizeProducts([
      { id: 1, nombre: 'Acople Rápido Aluminio', categoria: 'Acoples', descripcion: 'Acople rápido a palanca de aluminio.', imagen_url: '/productos/Acople Rapido a palanca aluminio.jpg' },
      { id: 2, nombre: 'Carretel con Hilo 500 Mts', categoria: 'Carreteles', descripcion: 'Carretel con hilo 500 metros.', imagen_url: '/productos/Carretel con Hilo 500 Mts.jpg' },
      { id: 3, nombre: 'Bujes Reducción', categoria: 'Bujes', descripcion: 'Buje de reducción para caños.', imagen_url: '/productos/Buje reduccion.jpg' },
      { id: 4, nombre: 'Llave Esférica Plástica', categoria: 'Llaves', descripcion: 'Llave esférica plástica Duke.', imagen_url: '/productos/Llave ESferica Plastica Duke.jpg' },
      { id: 5, nombre: 'Poste Quebracho', categoria: 'Postes', descripcion: 'Poste de quebracho para alambrado.', imagen_url: '/productos/Poste Quebracho.JPG' },
      { id: 6, nombre: 'Varilla Galvanizada', categoria: 'Varillas', descripcion: 'Varilla galvanizada 1/2".', imagen_url: '/productos/Varilla Galvanizada.JPG' }
    ]);
    saveLocal();
  }
  showError('No se pudo cargar el catálogo. Mostrando productos de ejemplo.');
  const bar = document.getElementById('api_status_bar');
  if (bar) bar.classList.add('show');
  populateCategoryFilter();
  renderCatalog();
  console.log('[fetchProducts] fallback products:', products.length);
  setTimeout(() => {
    if (!useApi) fetchProducts(3, 3000);
  }, 15000);
}

function localFallback() {
  try {
    const raw = localStorage.getItem('mg_products');
    if (raw) products = JSON.parse(raw);
  } catch (e) {
    products = [];
  }
}

function saveLocal() {
  localStorage.setItem('mg_products', JSON.stringify(products));
}

function populateCategoryFilter() {
  const sel = document.getElementById('cat-filter');
  if (!sel) return;
  const current = sel.value;
  const set = new Set(products.map(p => (p.tag || '').trim()).filter(Boolean));
  const cats = Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  sel.innerHTML = '<option value="__all__">Todas las categorias</option>' +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  sel.value = cats.includes(current) ? current : '__all__';
}

function getSelectedProducts() {
  const q = (document.getElementById('cat-search')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('cat-filter')?.value || '__all__';
  const filtered = products
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.desc || '').toLowerCase();
      const tag = (p.tag || '').toLowerCase();
      const matchesQ = !q || name.includes(q) || desc.includes(q) || tag.includes(q);
      const matchesCat = cat === '__all__' || (p.tag || '') === cat;
      return matchesQ && matchesCat;
    });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * itemsPerPage;
  const paged = filtered.slice(start, start + itemsPerPage);
  return { items: paged, total, totalPages, page: currentPage };
}

function renderCatalog() {
  const totalEl = document.getElementById('prod-total-display');
  const filtered = getSelectedProducts();
  console.log('[renderCatalog] total products:', products.length, 'filtered:', filtered.items.length);
  if (totalEl && products.length) {
    totalEl.style.display = 'block';
    totalEl.textContent = `${filtered.items.length} de ${filtered.total} productos`;
  }
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  const items = filtered.items;
  if (!items.length) {
    grid.innerHTML = '<div class="cat-empty">No se encontraron productos.</div>';
    return;
  }
  grid.innerHTML = items.map(({ p, i }) => {
    const allImages = Array.isArray(p.images) ? p.images : (p.img ? [p.img] : []);
    const mainImg = allImages[0] || '';
    const hasImg = !!mainImg;
    const descClean = (p.desc || '')
      .split(/\r?\n/)
      .map(line => line.split(' | ').pop() || line)
      .map(line => line.trim())
      .filter(line => line && line !== (p.tag || '') && line !== (p.name || ''));
    const descHtml = descClean.length
      ? `<div class="cat-desc">${escapeHtml(descClean.join('\n'))}</div>`
      : '';
    const iconAttr = escapeHtml(p.icon || '??');
    const thumbs = allImages.slice(1).map(src => `<img src="${encodeImgPath(src)}" alt="" loading="lazy" />`).join('');
    return `
    <div class="cat-card" data-index="${i}">
      <div class="cat-img-placeholder${hasImg ? '' : ' cat-img-placeholder--noimg'}">
        ${hasImg ? `<img src="${encodeImgPath(mainImg)}" loading="lazy" fetchpriority="low" decoding="async" alt="${escapeHtml(p.name || '')}" data-icon="${iconAttr}" />` : `<span class="cat-icon-fallback">${iconAttr}</span>`}
      </div>
      ${thumbs ? `<div class="cat-variants">${thumbs}</div>` : ''}
      <div class="cat-body">
        <div class="cat-name">${escapeHtml(p.name)}</div>
        ${descHtml}
        <span class="cat-tag">${escapeHtml(p.tag)}</span>
      </div>
    </div>
  `;}).join('');

  const paginationEl = document.getElementById('cat-pagination');
  if (paginationEl) {
    if (filtered.totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }
    let html = '<div class="cat-pagination">';
    html += `<button class="cat-page-btn" data-page="${filtered.page - 1}" ${filtered.page === 1 ? 'disabled' : ''}>« Anterior</button>`;
    html += `<span class="cat-page-info">Página ${filtered.page} de ${filtered.totalPages}</span>`;
    html += `<button class="cat-page-btn" data-page="${filtered.page + 1}" ${filtered.page === filtered.totalPages ? 'disabled' : ''}>Siguiente »</button>`;
    html += '</div>';
    paginationEl.innerHTML = html;
    paginationEl.querySelectorAll('.cat-page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page, 10);
        if (!isNaN(page)) goToPage(page);
      });
    });
  }
}

function goToPage(page) {
  currentPage = page;
  renderCatalog();
  const grid = document.getElementById('cat-grid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleMenu() {
  const menu = document.getElementById('navLinks');
  menu.classList.toggle('open');
}

document.querySelectorAll('.navbar-menu .menu-link').forEach(link => {
  link.addEventListener('click', () => {
    const menu = document.getElementById('navLinks');
    if (menu.classList.contains('open')) menu.classList.remove('open');
  });
});

const sections = document.querySelectorAll('section[id]')
const navLinks = document.querySelectorAll('.menu-link')

function updateActiveNav() {
  let current = ''
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top
    if (top <= 140) current = section.getAttribute('id')
  })
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`)
  })
}
window.addEventListener('scroll', updateActiveNav, { passive: true })

function renderAdminProducts() {
  const countEl = document.getElementById('prod-count-bar');
  if (countEl) countEl.textContent = products.length + ' productos cargados';
  const grid = document.getElementById('admin-prod-grid');
  if (!grid) return;
  const searchQuery = (document.getElementById('admin-search')?.value || '').toLowerCase();
  const filtered = products.filter(p => {
    const q = searchQuery;
    if (!q) return true;
    return (p.name || '').toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q);
  });
  grid.innerHTML = filtered.map((p, idx) => {
    const realIndex = products.indexOf(p);
    return `
    <div class="admin-prod-card" draggable="true" data-index="${realIndex}">
      <div class="admin-prod-card-header">
        <span class="admin-prod-card-title">${escapeHtml(p.name || 'Sin nombre')}</span>
        <button class="btn-del" data-role="admin" aria-label="Eliminar producto" data-action="delete" data-index="${realIndex}" title="Eliminar">?</button>
      </div>
      <div class="admin-prod-card-body">
        <label class="admin-label">Nombre</label>
        <input class="admin-input" data-field="name" data-index="${realIndex}" value="${escapeHtml(p.name || '')}" />
        <label class="admin-label">Categoría</label>
        <input class="admin-input" data-field="tag" data-index="${realIndex}" value="${escapeHtml(p.tag || '')}" />
        <label class="admin-label">Descripción</label>
        <div class="wysiwyg-toolbar">
          <button type="button" class="wysiwyg-btn" data-cmd="bold"><b>B</b></button>
          <button type="button" class="wysiwyg-btn" data-cmd="italic"><i>I</i></button>
          <button type="button" class="wysiwyg-btn" data-cmd="underline"><u>U</u></button>
          <button type="button" class="wysiwyg-btn" data-cmd="insertUnorderedList">• Lista</button>
        </div>
        <div class="admin-textarea wysiwyg" contenteditable="true" data-field="desc" data-index="${realIndex}">${escapeHtml(p.desc || '')}</div>
        <label class="admin-label">Imagen (ruta o base64)</label>
        <input class="admin-input" data-field="img" data-index="${realIndex}" value="${escapeHtml(p.img || '')}" placeholder="productos/foto.jpg" />
        <div class="img-preview-wrap" data-action="open-file" data-index="${realIndex}">
          ${p.img ? `<img src="${encodeImgPath(p.img)}" alt="preview" />` : '<span style="color:#555;font-size:.8rem">Sin imagen</span>'}
          <input type="file" accept="image/*" class="file-input-hidden" data-field="img" data-index="${realIndex}" />
        </div>
        <span class="img-preview-label">Clic para cambiar imagen</span>
      </div>
    </div>
  `}).join('');
  initAdminProductEvents();
  initWysiwyg();
}

function initAdminProductEvents() {
  const grid = document.getElementById('admin-prod-grid');
  if (!grid) return;

  grid.querySelectorAll('.admin-prod-card').forEach(card => {
    card.ondragstart = (e) => onDragStart(e);
    card.ondragover = (e) => onDragOver(e);
    card.ondrop = (e) => onDrop(e);
    card.ondragend = (e) => onDragEnd(e);
  });

  grid.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index, 10);
      if (!isNaN(index)) deleteProduct(index);
    });
  });

  grid.querySelectorAll('input[data-field][data-index]').forEach(input => {
    input.addEventListener('change', () => {
      const index = parseInt(input.dataset.index, 10);
      const field = input.dataset.field;
      if (!isNaN(index) && field) updateAdminProduct(index, field, input.value);
    });
  });

  grid.querySelectorAll('.admin-textarea.wysiwyg[data-field][data-index]').forEach(el => {
    el.addEventListener('blur', () => {
      const index = parseInt(el.dataset.index, 10);
      const field = el.dataset.field;
      if (!isNaN(index) && field) updateAdminProduct(index, field, el.innerText);
    });
  });

  grid.querySelectorAll('.img-preview-wrap[data-action="open-file"]').forEach(wrap => {
    wrap.addEventListener('click', () => {
      const input = wrap.querySelector('input[type="file"]');
      if (input) input.click();
    });
  });

  grid.querySelectorAll('input[type="file"].file-input-hidden[data-field][data-index]').forEach(input => {
    input.addEventListener('change', () => {
      const index = parseInt(input.dataset.index, 10);
      if (!isNaN(index)) handleAdminImage(input, index);
    });
  });
}

function updateAdminProduct(index, field, value) {
  if (products[index]) {
    products[index][field] = value;
    hasUnsavedChanges = true;
    updateUnsavedIndicator();
  }
}

let dragSrcIndex = null;

function onDragStart(event) {
  const card = event.target.closest('.admin-prod-card');
  if (!card) return;
  dragSrcIndex = parseInt(card.dataset.index, 10);
  event.dataTransfer.effectAllowed = 'move';
  card.style.opacity = '0.4';
}

function onDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  const card = event.target.closest('.admin-prod-card');
  if (card) card.style.borderTop = '3px solid var(--yellow)';
}

function onDrop(event) {
  event.preventDefault();
  const card = event.target.closest('.admin-prod-card');
  if (!card) return;
  const targetIndex = parseInt(card.dataset.index, 10);
  if (dragSrcIndex !== null && dragSrcIndex !== targetIndex) {
    const moved = products.splice(dragSrcIndex, 1)[0];
    products.splice(targetIndex, 0, moved);
    hasUnsavedChanges = true;
    updateUnsavedIndicator();
    renderAdminProducts();
    renderCatalog();
  }
  document.querySelectorAll('.admin-prod-card').forEach(c => {
    c.style.opacity = '1';
    c.style.borderTop = '';
  });
}

function onDragEnd(event) {
  document.querySelectorAll('.admin-prod-card').forEach(c => {
    c.style.opacity = '1';
    c.style.borderTop = '';
  });
  dragSrcIndex = null;
}

function exportProductsCSV() {
  const headers = ['ID', 'Nombre', 'Categoría', 'Descripción', 'Imagen'];
  const rows = products.map(p => [p.id, p.name, p.tag, (p.desc || '').replace(/\n/g, ' '), p.img]);
  let csv = '\uFEFF';
  csv += headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(',') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `metagro-productos-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('✓ CSV exportado correctamente');
}

async function deleteProduct(index) {
  if (!confirm('¿Borrar este producto?')) return;
  const p = products[index];
  if (!p) return;
  if (p.id && originalProducts.find(op => op.id === p.id)) {
    try {
      await api(`/products/${p.id}`, { method: 'DELETE' });
    } catch(e) {
      showToast('No se pudo eliminar del servidor. Se eliminó localmente.', 'error');
    }
  }
  originalProducts = originalProducts.filter(op => op.id !== p.id);
  products.splice(index, 1);
  hasUnsavedChanges = false;
  saveLocal();
  populateCategoryFilter();
  renderAdminProducts();
  renderCatalog();
  showToast('Producto eliminado');
}

function addProduct() {
  const newP = { id: Date.now(), name: 'Producto nuevo', tag: 'General', desc: '', icon: '🤝', img: '' };
  products.push(newP);
  hasUnsavedChanges = true;
  updateUnsavedIndicator();
  saveLocal();
  populateCategoryFilter();
  renderAdminProducts();
  renderCatalog();
  document.getElementById('admin-prod-grid').scrollTop = document.getElementById('admin-prod-grid').scrollHeight;
}

async function handleAdminImage(input, index) {
  const file = input.files[0];
  if (!file) return;
  try {
    const base64 = await compressImage(file);
    if (products[index]) {
      products[index].img = base64;
      hasUnsavedChanges = true;
      updateUnsavedIndicator();
      saveLocal();
      renderAdminProducts();
      renderCatalog();
    }
  } catch (err) {
    showToast('Error al procesar la imagen', 'error');
  }
}

function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function saveProducts() {
  const invalid = products.filter(p => !p.name || !p.name.trim());
  if (invalid.length > 0) {
    showToast(invalid.length + ' producto(s) sin nombre. Corregí antes de guardar.', 'error');
    return;
  }
  saveLocal();
  let created = 0, updated = 0, deleted = 0;
  try {
    const currentIds = new Set(products.map(p => p.id).filter(Boolean));
    const originalIds = new Set(originalProducts.map(p => p.id).filter(Boolean));
    for (const p of products) {
      if (!p.id || !originalIds.has(p.id)) {
        try {
          const res = await api('/products', { method: 'POST', body: JSON.stringify(p) });
          const saved = await res.json();
          if (saved.id) p.id = saved.id;
          created++;
        } catch (e) {
          showToast(`Error creando ${p.name}: ${e.message}`, 'error');
        }
      } else {
        const orig = originalProducts.find(op => op.id === p.id);
        if (orig && JSON.stringify(orig) !== JSON.stringify(p)) {
          try {
            await api(`/products/${p.id}`, { method: 'PUT', body: JSON.stringify(p) });
            updated++;
          } catch (e) {
            showToast(`Error actualizando ${p.name}: ${e.message}`, 'error');
          }
        }
      }
    }
    for (const p of originalProducts) {
      if (p.id && !currentIds.has(p.id)) {
        try {
          await api(`/products/${p.id}`, { method: 'DELETE' });
          deleted++;
        } catch (e) {
          showToast(`Error eliminando ${p.name}: ${e.message}`, 'error');
        }
      }
    }
    originalProducts = JSON.parse(JSON.stringify(products));
  } catch(e) {
    showError('Error al guardar en el servidor: ' + e.message);
  }
  hasUnsavedChanges = false;
  updateUnsavedIndicator();
  saveLocal();
  const parts = [];
  if (created) parts.push(created + ' creados');
  if (updated) parts.push(updated + ' actualizados');
  if (deleted) parts.push(deleted + ' eliminados');
  const msg = parts.length ? '? ' + parts.join(', ') : '? Sin cambios pendientes';
  showToast(msg);
  const msgEl = document.getElementById('save-msg-prod');
  if (msgEl) { msgEl.textContent = msg; msgEl.classList.add('show'); setTimeout(() => msgEl.classList.remove('show'), 3000); }
  populateCategoryFilter();
  renderCatalog();
}

async function openBulkUpload() {
  document.getElementById('bulk-zone').style.display = 'flex';
  document.getElementById('bulk-names').value = '';
  document.getElementById('bulk-list').innerHTML = '';
  document.getElementById('bulk-bar').style.width = '0%';
}

function closeBulkUpload() {
  document.getElementById('bulk-zone').style.display = 'none';
}

async function handleBulkFiles(input) {
  const files = Array.from(input.files);
  if (!files.length) return;
  const list = document.getElementById('bulk-list');
  const bar = document.getElementById('bulk-bar');
  const namesText = document.getElementById('bulk-names').value.trim();
  const namesArr = namesText ? namesText.split('\n').map(s => s.trim()).filter(Boolean) : [];
  list.innerHTML = '';
  files.forEach((f) => {
    const item = document.createElement('div');
    item.className = 'bulk-item';
    item.textContent = f.name;
    list.appendChild(item);
  });
  bar.style.width = '100%';
  const processFile = async (file, idx) => {
    try {
      const base64 = await compressImage(file);
      const name = namesArr[idx] || file.name.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ');
      products.push({
        id: Date.now() + idx,
        name, tag: 'General', desc: 'Cargado por carga masiva', icon: '', img: base64
      });
    } catch (err) {
      // silently skip failed image
    }
  };
  await Promise.all(files.map((f, i) => processFile(f, i)));
  populateCategoryFilter();
  renderCatalog();
  renderAdminProducts();
  await Promise.allSettled(
    products.slice(products.length - files.length).map(np =>
      api('/products', { method: 'POST', body: JSON.stringify(np) })
        .then(res => res.json())
        .then(saved => { if (saved.id) np.id = saved.id; })
        .catch(() => {})
    )
  );
  saveLocal();
  originalProducts = JSON.parse(JSON.stringify(products));
  setTimeout(() => { bar.style.width = '0%'; }, 600);
  input.value = '';
}

function saveColors() {
  const colors = {
    '--yellow': document.getElementById('color-yellow').value,
    '--black': document.getElementById('color-black').value,
    '--steel': document.getElementById('color-steel').value,
    '--cream': document.getElementById('color-cream').value,
  };
  const root = document.documentElement;
  for (const [key, val] of Object.entries(colors)) root.style.setProperty(key, val);
  localStorage.setItem('mg_colors', JSON.stringify(colors));
  const msg = document.getElementById('save-msg-color');
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 2000);
}

function resetColors() {
  const defaults = { '--yellow': '#F5C800', '--black': '#111111', '--steel': '#1a1a1a', '--cream': '#F5F0E8' };
  const root = document.documentElement;
  for (const [key, val] of Object.entries(defaults)) root.style.setProperty(key, val);
  document.getElementById('color-yellow').value = defaults['--yellow'];
  document.getElementById('color-black').value = defaults['--black'];
  document.getElementById('color-steel').value = defaults['--steel'];
  document.getElementById('color-cream').value = defaults['--cream'];
  localStorage.removeItem('mg_colors');
}

function applyColor(key, value) {
  document.documentElement.style.setProperty(key, value);
}

function updateUnsavedIndicator() {
  const el = document.getElementById('unsaved-indicator');
  if (el) el.style.display = hasUnsavedChanges ? 'inline' : 'none';
}

function syncLocalInfoToInputs() {
  const cfg = (() => { try { return JSON.parse(localStorage.getItem('mg_config') || '{}'); } catch (e) { return {}; } })();
  const map = { 'cfg-tel': 'tel', 'cfg-wa': 'wa', 'cfg-horario1': 'horario1', 'cfg-horario2': 'horario2', 'cfg-dir': 'dir', 'cfg-wamsg': 'wamsg', 'cfg-admin-user': 'adminUser', 'cfg-admin-pass': 'adminPass' };
  for (const [id, key] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el && cfg[key]) el.value = cfg[key];
  }
}

async function saveLocalInfo() {
  const cfg = {
    tel: document.getElementById('cfg-tel')?.value || '',
    wa: document.getElementById('cfg-wa')?.value || '',
    horario1: document.getElementById('cfg-horario1')?.value || '',
    horario2: document.getElementById('cfg-horario2')?.value || '',
    dir: document.getElementById('cfg-dir')?.value || '',
    wamsg: document.getElementById('cfg-wamsg')?.value || ''
  };
  const { adminPass: _adminPass, ...safe } = cfg;
  localStorage.setItem('mg_config', JSON.stringify(safe));
  try {
    await api('/guardar-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    });
  } catch (e) {
    showToast('No se pudo guardar la config en el servidor', 'error');
  }
  const msg = document.getElementById('save-msg-local');
  if (msg) { msg.classList.add('show'); setTimeout(() => msg.classList.remove('show'), 2000); }
}

const VENTAJAS_CONFIG = [
  { key: 'rapida', icon: '⚡', defaultTitulo: 'Atención Rápida', defaultDesc: 'Atendemos más rápido que la competencia. Tu tiempo en el campo vale.' },
  { key: 'cta', icon: '🤝', defaultTitulo: 'Cuenta Corriente', defaultDesc: 'Crédito para clientes habituales. Comprá hoy y pagá cuando puedas.' },
  { key: 'precios', icon: '💰', defaultTitulo: 'Mejores Precios', defaultDesc: 'Precios competitivos respaldados por 43 años de trayectoria y volumen de compra.' },
  { key: 'stock', icon: '📦', defaultTitulo: 'Stock Permanente', defaultDesc: 'Amplia disponibilidad de productos para que no pares tu trabajo.' },
  { key: 'exp', icon: '🏆', defaultTitulo: '43 Años de Experiencia', defaultDesc: 'Desde 1983 sirviendo al campo de Entre Ríos. Cartera de clientes fiel y reconocida.' },
  { key: 'agro', icon: '🌿', defaultTitulo: 'Especialistas en el Agro', defaultDesc: 'Asesoramiento técnico para agroganaderos, molineros y alambradores.' },
];

const SITE_TEXTS_FALLBACKS = {
  'hero_linea_1': 'SIEMPRE JUNTO',
  'hero_linea_2': 'AL CAMPO.',
  'hero_desc': 'Insumos para la agroganadería, alambrados, molinos, aguadas y ferretería. Atención personalizada, precios competitivos y cuenta corriente para nuestros clientes.',
  'hero_numero': '43',
  'hero_etiqueta': 'AÑOS EN EL MERCADO',
  'vent_eyebrow': 'POR QUÉ ELEGIRNOS',
  'vent_titulo_1': 'VENTAJAS',
  'vent_titulo_2': 'METAGRO',
  'vent_card_1_titulo': 'ATENCIÓN RÁPIDA',
  'vent_card_1_desc': 'Atendemos más rápido que la competencia. Tu tiempo en el campo vale.',
  'vent_card_2_titulo': 'CUENTA CORRIENTE',
  'vent_card_2_desc': 'Crédito para clientes habituales. Comprá hoy y pagá cuando puedas.',
  'vent_card_3_titulo': 'MEJORES PRECIOS',
  'vent_card_3_desc': 'Precios competitivos respaldados por 43 años de trayectoria y volumen de compra.',
  'vent_card_4_titulo': 'STOCK PERMANENTE',
  'vent_card_4_desc': 'Amplia disponibilidad de productos para que no pares tu trabajo.',
  'vent_card_5_titulo': '43 AÑOS DE EXPERIENCIA',
  'vent_card_5_desc': 'Desde 1983 sirviendo al campo de Entre Ríos. Cartera de clientes fiel y reconocida.',
  'vent_card_6_titulo': 'ESPECIALISTAS EN EL AGRO',
  'vent_card_6_desc': 'Asesoramiento técnico para agroganaderos, molineros y alambradores.',
  'cont_eyebrow': 'CONTACTO',
  'cont_titulo_1': '¿NECESITAS UN PRODUCTO?',
  'cont_titulo_2': 'CONSULTANOS.',
  'cont_desc': 'Ya sea para tu estancia, chacra o trabajo profesional, en Metagro SRL te asesoramos sin compromiso. Respondemos rapido por WhatsApp o por telefono.',
  'footer_tagline': 'Siempre junto al campo • Desde 1983'
};

function getSiteTexts() {
  try { return JSON.parse(localStorage.getItem('mg_site_texts') || '{}'); } catch(e) { return {}; }
}

async function loadSiteTextsIntoTab() {
  try {
    const texts = getSiteTexts();
    const get = (key) => texts[key] || SITE_TEXTS_FALLBACKS[key] || '';

    const heroLinea1El = document.getElementById('txt-hero-linea-1');
    const heroLinea2El = document.getElementById('txt-hero-linea-2');
    const heroDescEl = document.getElementById('txt-hero-desc');
    const heroNumeroEl = document.getElementById('txt-hero-numero');
    const heroEtiquetaEl = document.getElementById('txt-hero-etiqueta');

    if (heroLinea1El) heroLinea1El.value = get('hero_linea_1');
    if (heroLinea2El) heroLinea2El.value = get('hero_linea_2');
    if (heroDescEl) {
      if (heroDescEl.classList.contains('wysiwyg')) {
        heroDescEl.innerText = get('hero_desc');
      } else {
        heroDescEl.value = get('hero_desc');
      }
    }
    if (heroNumeroEl) heroNumeroEl.value = get('hero_numero');
    if (heroEtiquetaEl) heroEtiquetaEl.value = get('hero_etiqueta');

    const ventEyebrowEl = document.getElementById('txt-vent-eyebrow');
    const ventTitulo1El = document.getElementById('txt-vent-titulo-1');
    const ventTitulo2El = document.getElementById('txt-vent-titulo-2');

    if (ventEyebrowEl) ventEyebrowEl.value = get('vent_eyebrow');
    if (ventTitulo1El) ventTitulo1El.value = get('vent_titulo_1');
    if (ventTitulo2El) ventTitulo2El.value = get('vent_titulo_2');

    const grid = document.getElementById('info-ventajas-grid');
    let ventajasCards = [];
    for (let i = 1; i <= 6; i++) {
      const titulo = get(`vent_card_${i}_titulo`);
      const desc = get(`vent_card_${i}_desc`);
      if (titulo) {
        ventajasCards.push({
          icon: VENTAJAS_CONFIG[i-1]?.icon || '??',
          titulo: titulo,
          descripcion: desc
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    initMap();
    initImageFallbacks();
  });
} else {
  init();
  initMap();
  initImageFallbacks();
}
    }

    if (grid) {
      grid.innerHTML = ventajasCards.map((card, idx) => `
        <div class="ventaja-card" data-index="${idx}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <span style="font-weight:bold;color:var(--yellow);">Tarjeta #${idx + 1}</span>
            <button data-action="remove-ventaja" data-index="${idx}" style="background:#c0392b;color:#fff;border:none;padding:0.3rem 0.6rem;border-radius:4px;cursor:pointer;font-size:0.8rem;">🗑️ Eliminar</button>
          </div>
          <label class="admin-label">icono (emoji)</label>
          <input class="admin-input ventaja-icon" data-index="${idx}" value="${escapeHtml(card.icon || '')}" placeholder="?" />
          <label class="admin-label">Titulo</label>
          <input class="admin-input ventaja-titulo" data-index="${idx}" value="${escapeHtml(card.titulo || '')}" placeholder="Atención Rápida" />
          <label class="admin-label">Descripcion</label>
          <div class="admin-textarea wysiwyg ventaja-desc" data-index="${idx}" contenteditable="true">${escapeHtml(card.descripcion || '')}</div>
        </div>
      `).join('');
    }
  } catch (e) {
    showToast('Error al cargar los textos', 'error');
    const grid = document.getElementById('info-ventajas-grid');
    if (grid) grid.style.background = '#c0392b';
    console.error('[Leyendas] Error cargando textos:', e);
  }
}

function addVentajaCard() {
  const grid = document.getElementById('info-ventajas-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.ventaja-card');
  const newIndex = cards.length;
  const html = `
    <div class="ventaja-card" data-index="${newIndex}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <span style="font-weight:bold;color:var(--yellow);">Tarjeta #${newIndex + 1}</span>
        <button data-action="remove-ventaja" data-index="${newIndex}" style="background:#c0392b;color:#fff;border:none;padding:0.3rem 0.6rem;border-radius:4px;cursor:pointer;font-size:0.8rem;">🗑️ Eliminar</button>
      </div>
      <label class="admin-label">Ícono (emoji)</label>
      <input class="admin-input ventaja-icon" data-index="${newIndex}" value="" placeholder="⚡" />
      <label class="admin-label">Título</label>
      <input class="admin-input ventaja-titulo" data-index="${newIndex}" value="" placeholder="Nuevo beneficio" />
      <label class="admin-label">Descripción</label>
      <div class="wysiwyg-toolbar">
        <button type="button" class="wysiwyg-btn" data-cmd="bold"><b>B</b></button>
        <button type="button" class="wysiwyg-btn" data-cmd="italic"><i>I</i></button>
        <button type="button" class="wysiwyg-btn" data-cmd="underline"><u>U</u></button>
      </div>
      <div class="admin-textarea wysiwyg ventaja-desc" data-index="${newIndex}" contenteditable="true"></div>
    </div>
  `;
  grid.insertAdjacentHTML('beforeend', html);
  initWysiwyg();
}

function removeVentajaCard(index) {
  const card = document.querySelector(`.ventaja-card[data-index="${index}"]`);
  if (card) card.remove();
}

async function saveSiteTexts() {
  const texts = getSiteTexts();

  const heroLinea1 = document.getElementById('txt-hero-linea-1');
  const heroLinea2 = document.getElementById('txt-hero-linea-2');
  const heroDesc = document.getElementById('txt-hero-desc');
  const heroNumero = document.getElementById('txt-hero-numero');
  const heroEtiqueta = document.getElementById('txt-hero-etiqueta');

  if (heroLinea1) texts['hero_linea_1'] = heroLinea1.value;
  if (heroLinea2) texts['hero_linea_2'] = heroLinea2.value;
  if (heroDesc) texts['hero_desc'] = heroDesc.innerText || heroDesc.textContent || '';
  if (heroNumero) texts['hero_numero'] = heroNumero.value;
  if (heroEtiqueta) texts['hero_etiqueta'] = heroEtiqueta.value;

  const ventEyebrow = document.getElementById('txt-vent-eyebrow');
  const ventTitulo1 = document.getElementById('txt-vent-titulo-1');
  const ventTitulo2 = document.getElementById('txt-vent-titulo-2');

  if (ventEyebrow) texts['vent_eyebrow'] = ventEyebrow.value;
  if (ventTitulo1) texts['vent_titulo_1'] = ventTitulo1.value;
  if (ventTitulo2) texts['vent_titulo_2'] = ventTitulo2.value;

  const grid = document.getElementById('info-ventajas-grid');
  if (grid) {
    const cards = grid.querySelectorAll('.ventaja-card');
    const ventajasCards = Array.from(cards).map((card, i) => ({
      icon: card.querySelector('.ventaja-icon')?.value || '',
      titulo: card.querySelector('.ventaja-titulo')?.value || '',
      descripcion: card.querySelector('.ventaja-desc.wysiwyg')?.innerText || card.querySelector('.ventaja-desc')?.value || ''
    })).filter(c => c.titulo.trim());
    ventajasCards.forEach((card, i) => {
      texts[`vent_card_${i + 1}_titulo`] = card.titulo;
      texts[`vent_card_${i + 1}_desc`] = card.descripcion;
    });
    for (let i = ventajasCards.length + 1; i <= 6; i++) {
      delete texts[`vent_card_${i}_titulo`];
      delete texts[`vent_card_${i}_desc`];
    }
  }

  const prevTexts = getSiteTexts();
  localStorage.setItem('mg_site_texts', JSON.stringify(texts));
  addHistoryEntry(prevTexts, texts);
  fetchAndApplyTexts();
  await Promise.allSettled(
    Object.entries(texts).map(([key, value]) =>
      api(`/site-texts/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: JSON.stringify({ value })
      }).catch(e => ({ status: 'rejected', reason: e }))
    )
  );
  const msg = document.getElementById('save-msg-texts');
  if (msg) { msg.classList.add('show'); setTimeout(() => msg.classList.remove('show'), 2500); }
  showToast('✓ Todos los textos guardados');
}

function getSiteTextsHistory() {
  try { return JSON.parse(localStorage.getItem('mg_site_texts_history') || '[]'); } catch(e) { return []; }
}

function addHistoryEntry(prev, next) {
  const history = getSiteTextsHistory();
  const changes = [];
  const keys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);
  keys.forEach(key => {
    const oldVal = (prev && prev[key]) || '';
    const newVal = (next && next[key]) || '';
    if (oldVal !== newVal) {
      changes.push({ key, oldVal, newVal });
    }
  });
  if (changes.length === 0) return;
  history.unshift({
    date: new Date().toISOString(),
    changes
  });
  if (history.length > 50) history.length = 50;
  localStorage.setItem('mg_site_texts_history', JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const container = document.getElementById('info-history');
  if (!container) return;
  const history = getSiteTextsHistory();
  if (!history.length) {
    container.innerHTML = '<p style="color:#666;font-size:.85rem;">Sin cambios registrados</p>';
    return;
  }
  container.innerHTML = history.map(entry => {
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString('es-AR') + ' ' + d.toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'});
    const changesHtml = entry.changes.map(c => {
      const label = c.key.replace(/_/g, ' ').toUpperCase();
      return `<div style="margin-bottom:0.4rem;padding:0.4rem;background:#111;border-left:2px solid var(--yellow);font-size:.82rem;">
        <strong style="color:var(--yellow);">${escapeHtml(label)}</strong><br/>
        <span style="color:#888;">Antes:</span> ${escapeHtml(c.oldVal || '(vacío)')}<br/>
        <span style="color:#4caf50;">Ahora:</span> ${escapeHtml(c.newVal || '(vacío)')}
      </div>`;
    }).join('');
    return `<div style="margin-bottom:1rem;padding-bottom:0.8rem;border-bottom:1px solid #222;">
      <div style="color:#aaa;font-size:.75rem;margin-bottom:0.4rem;">📅 ${dateStr}</div>
      ${changesHtml}
    </div>`;
  }).join('');
}

async function loadDashboard() {
  try {
    const token = sessionStorage.getItem('mg_admin_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['x-mg-token'] = token;
    const res = await fetch(`${API_BASE}/analytics/dashboard`, { headers });
    const data = await res.json();
    if (!data.ok) throw new Error('Failed to load dashboard');
    const stats = data.stats || {};
    document.getElementById('dash-products').textContent = stats.products || 0;
    document.getElementById('dash-views').textContent = (stats.views || 0).toLocaleString();
    document.getElementById('dash-budgets').textContent = stats.budgets || 0;
    document.getElementById('dash-changes').textContent = stats.changes7d || 0;
    if (window.Chart) {
      if (window.topProductsChart) window.topProductsChart.destroy();
      if (window.topSearchesChart) window.topSearchesChart.destroy();
      const topProducts = (data.topProducts || []).slice(0, 5);
      const topSearches = (data.topSearches || []).slice(0, 5);
      window.topProductsChart = new Chart(document.getElementById('chart-top-products'), {
        type: 'bar',
        data: {
          labels: topProducts.map(p => p.name || `Producto ${p.id}`),
          datasets: [{ label: 'Visitas', data: topProducts.map(p => p.visits || 0), backgroundColor: '#F5C800' }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#aaa' } }, x: { ticks: { color: '#aaa' } } } }
      });
      window.topSearchesChart = new Chart(document.getElementById('chart-top-searches'), {
        type: 'bar',
        data: {
          labels: topSearches.map(s => s.q || ''),
          datasets: [{ label: 'Búsquedas', data: topSearches.map(s => parseInt(s.c || 0)), backgroundColor: '#27ae60' }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#aaa' } }, x: { ticks: { color: '#aaa' } } } }
      });
    }
  } catch (e) {
    console.error('[dashboard] error:', e);
  }
}

function fetchAndApplyTexts() {
  const texts = getSiteTexts();
  const get = (key) => texts[key] || SITE_TEXTS_FALLBACKS[key] || '';

  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const linea1 = get('hero_linea_1');
    const linea2 = get('hero_linea_2');
    heroTitle.innerHTML = `${escapeHtml(linea1)}<br/>${escapeHtml(linea2)}`;
  }
  const heroDesc = document.querySelector('.hero-desc');
  if (heroDesc) heroDesc.textContent = get('hero_desc');
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  if (heroEyebrow) heroEyebrow.textContent = get('hero_eyebrow');
  const heroBtns = document.querySelectorAll('.hero-actions a');
  if (heroBtns[0]) heroBtns[0].textContent = get('hero_btn1') || 'Ver Productos';
  if (heroBtns[1]) heroBtns[1].textContent = get('hero_btn2') || '?? Contactarnos';
  const statNum = document.querySelector('.stat-number');
  if (statNum) statNum.textContent = get('hero_numero');
  const statLabel = document.querySelector('.stat-label');
  if (statLabel) statLabel.textContent = get('hero_etiqueta');

  const ventEyebrow = document.querySelector('#ventajas .section-label');
  if (ventEyebrow) ventEyebrow.textContent = get('vent_eyebrow');
  const ventTitulo = document.querySelector('#ventajas .section-title');
  if (ventTitulo) {
    const t1 = get('vent_titulo_1');
    const t2 = get('vent_titulo_2');
    ventTitulo.innerHTML = `${escapeHtml(t1)} <span>${escapeHtml(t2)}</span>`;
  }

  const ventItems = document.querySelectorAll('.vent-item');
  ventItems.forEach((item, i) => {
    const cardIdx = i + 1;
    const titleEl = item.querySelector('.vent-title');
    const descEl = item.querySelector('.vent-desc');
    const iconEl = item.querySelector('.vent-icon');
    if (titleEl) titleEl.textContent = get(`vent_card_${cardIdx}_titulo`);
    if (descEl) descEl.textContent = get(`vent_card_${cardIdx}_desc`);
    if (iconEl && VENTAJAS_CONFIG[i]) iconEl.textContent = VENTAJAS_CONFIG[i].icon || '';
  });

  const contEyebrow = document.querySelector('#contacto .section-label');
  if (contEyebrow) contEyebrow.textContent = get('cont_eyebrow');
  const contTitle = document.querySelector('#contacto .section-title');
  if (contTitle) {
    const ct1 = get('cont_titulo_1');
    const ct2 = get('cont_titulo_2');
    contTitle.innerHTML = `${escapeHtml(ct1)}<br/>${escapeHtml(ct2)}`;
  }
  const contDesc = document.querySelector('.cta-desc');
  if (contDesc) contDesc.textContent = get('cont_desc');

  const tagline = document.querySelector('.footer-tagline');
  if (tagline) tagline.textContent = get('footer_tagline');
}

function applyRoleVisibility() {
  const role = sessionStorage.getItem('mg_admin_role') || 'admin';
  document.querySelectorAll('[data-role]').forEach(el => {
    const allowed = el.dataset.role.split(',');
    el.style.display = allowed.includes(role) ? '' : 'none';
  });
}

function doLogout() {
  if (hasUnsavedChanges && !confirm('Tenés cambios sin guardar. ¿Estás seguro que querés salir?')) return;
  hasUnsavedChanges = false;
  updateUnsavedIndicator();
  sessionStorage.removeItem('mg_admin_token');
  sessionStorage.removeItem('mg_refresh_token');
  document.getElementById('adminPanel').classList.remove('open');
}

function updateProductSEO(p) {
  if (!p) return;
  const base = window.location.origin;
  const title = p.seo?.title || `${p.name || 'Producto'} | Metagro SRL`;
  const desc = p.seo?.description || p.desc || 'Insumos para el agro en Gualeguay, Entre Ríos.';
  const img = p.seo?.image || p.img || '';
  const url = p.seo?.url || `${base}/productos/${p.id}`;

  document.title = title;
  const setOrCreate = (attr, content) => {
    let el = document.querySelector(`meta[${attr}]`);
    if (!el) {
      el = document.createElement('meta');
      if (attr.startsWith('property')) el.setAttribute('property', attr.slice(9));
      else el.setAttribute(attr.slice(5), attr.slice(5).toLowerCase());
    }
    el.setAttribute('content', content);
  };
  const ogImg = document.querySelector('meta[property="og:image"]');
  if (!ogImg) {
    const m = document.createElement('meta');
    m.setAttribute('property', 'og:image');
    document.head.appendChild(m);
    m.content = img;
  } else {
    ogImg.content = img;
  }
  document.querySelector('meta[property="og:title"]').content = title;
  document.querySelector('meta[property="og:description"]').content = desc;
  document.querySelector('meta[name="description"]').content = desc;
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = url;
}

function openProductModal(p) {
  updateProductSEO(p);
  const seoTitle = p.seo?.title || `${p.name || 'Producto'} | Metagro SRL`;
  const seoDesc = p.seo?.description || p.desc || 'Insumos para el agro en Gualeguay, Entre Ríos.';
  document.getElementById('modalName').textContent = p.name || '';
  document.getElementById('modalDesc').textContent = p.desc || '';
  document.getElementById('modalTag').textContent = p.tag || 'Producto';
  const imgWrap = document.getElementById('modalImage');
  if (p.img) {
    const iconAttr = escapeHtml(p.icon || '📦');
    imgWrap.innerHTML = `<img src="${encodeImgPath(p.img)}" alt="${escapeHtml(p.name || '')}" data-icon="${iconAttr}" />`;
  } else {
    imgWrap.innerHTML = `<span style="font-size:4rem">${escapeHtml(p.icon || '📦')}</span>`;
  }
  const waNum = (() => { try { return JSON.parse(localStorage.getItem('mg_config') || '{}').wa || '5403444466919'; } catch(e) { return '5403444466919'; } })();
  const waText = encodeURIComponent(`Hola Metagro! Quiero consultar por: ${p.name || 'producto'}. ¿Tienen stock y precio?`);
  document.getElementById('modalWa').href = `https://wa.me/${waNum}?text=${waText}`;
  document.getElementById('productModal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

function openAdminLogin() {
  document.getElementById('adminOverlay').classList.add('open');
  document.getElementById('adminUser').focus();
}

function closeAdminLogin() {
  document.getElementById('adminOverlay').classList.remove('open');
}

async function doLogin() {
  const u = document.getElementById('adminUser').value.trim();
  const p = document.getElementById('adminPass').value;
  const errEl = document.getElementById('loginError');
  if (!u || !p) { errEl.style.display = 'block'; errEl.textContent = 'Ingresá usuario y contraseña.'; return; }
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 15000);
    const res = await api('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: u, password: p }),
      signal: ctrl.signal
    });
    clearTimeout(tid);
    const data = await res.json();
    if (data.token) {
      sessionStorage.setItem('mg_admin_token', data.token);
      if (data.refreshToken) sessionStorage.setItem('mg_refresh_token', data.refreshToken);
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        sessionStorage.setItem('mg_admin_role', payload.role || 'admin');
      } catch (e) { /* ignore */ }
      document.getElementById('adminOverlay').classList.remove('open');
      document.getElementById('adminPanel').classList.add('open');
      applyRoleVisibility();
      await fetchProducts();
      originalProducts = JSON.parse(JSON.stringify(products || []));
      renderAdminProducts();
      syncLocalInfoToInputs();
      applyLocalConfig();
      loadSiteTextsIntoTab();
      errEl.style.display = 'none';
    } else {
      errEl.textContent = data.error || 'Usuario o contraseña incorrectos.';
      errEl.style.display = 'block';
    }
  } catch (e) {
    console.error('[login] error:', e);
    errEl.textContent = 'Error de conexion con el servidor.';
    errEl.style.display = 'block';
  }
}

document.querySelectorAll('#navLinks a').forEach(a => {
  a.addEventListener('click', () => {
    const menu = document.getElementById('navLinks');
    if (menu.classList.contains('open')) toggleMenu();
  });
});

document.getElementById('cat-grid').addEventListener('click', e => {
  const card = e.target.closest('.cat-card');
  if (!card) return;
  const idx = parseInt(card.getAttribute('data-index'), 10);
  if (!isNaN(idx) && products[idx]) openProductModal(products[idx]);
});

async function init() {
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const panel = document.getElementById('admin-test-panel');
    if (panel) panel.style.display = 'none';
  }
  let defaults = [];
  try {
    defaults = [];
    if (!Array.isArray(defaults)) defaults = [];
  } catch (e) { defaults = []; }
  products = [...defaults];
  localStorage.removeItem('mg_products');
  useApi = true;
  saveLocal();
  console.log('[init] products count:', products.length, 'useApi:', useApi);
  try {
    const current = JSON.parse(localStorage.getItem('mg_site_texts') || '{}');
    const merged = { ...SITE_TEXTS_FALLBACKS };
    for (const [key, value] of Object.entries(current)) {
      if (value && value.trim()) merged[key] = value;
    }
    localStorage.setItem('mg_site_texts', JSON.stringify(merged));
  } catch (e) {
    localStorage.setItem('mg_site_texts', JSON.stringify(SITE_TEXTS_FALLBACKS));
  }
  populateCategoryFilter();
  renderCatalog();
  const searchEl = document.getElementById('cat-search');
  const filterEl = document.getElementById('cat-filter');
  const clearBtn = document.getElementById('cat-clear');
  if (searchEl) searchEl.addEventListener('input', () => renderCatalog());
  if (filterEl) filterEl.addEventListener('change', () => renderCatalog());
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (searchEl) searchEl.value = '';
    if (filterEl) filterEl.value = '__all__';
    renderCatalog();
  });
  const btt = document.getElementById('backToTop');
  if (btt) {
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      btt.classList.toggle('show', window.scrollY > 400);
    });
  }
  fetchProducts();
  syncLocalInfoToInputs();
  fetchAndApplyTexts();
  loadHistory();
}

function initMap() {
  const mapEl = document.getElementById('leaflet-map');
  if (!mapEl) return;
  const tryInit = (attempt = 0) => {
    if (typeof L !== 'undefined' && mapEl.offsetWidth) {
      try {
        const map = L.map('leaflet-map', { zoomControl: true, scrollWheelZoom: false }).setView([-33.1308927, -59.3156888], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);
        L.marker([-33.1308927, -59.3156888])
          .addTo(map)
          .bindPopup('<b>Metagro SRL</b><br/>Gualeguay, Entre Ríos')
          .openPopup();
        setTimeout(() => map.invalidateSize(), 300);
      } catch (e) { /* map init failed */ }
    } else if (attempt < 40) {
      setTimeout(() => tryInit(attempt + 1), 500);
    } else {
      mapEl.innerHTML = '<iframe src="https://www.google.com/maps?q=Metagro+SRL,Gualeguay,Entre+Rios&output=embed" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
    }
  };
  tryInit();
}

function applyLocalConfig() {
  const cfg = (() => { try { return JSON.parse(localStorage.getItem('mg_config') || '{}'); } catch(e) { return {}; } })();
  const waBase = 'https://wa.me/' + (cfg.wa || '5403444466919') + '?text=' + encodeURIComponent(cfg.wamsg || 'Hola Metagro!');
  document.querySelectorAll('[data-wa-href]').forEach(el => { el.href = waBase; });
  document.querySelectorAll('[data-tel-href]').forEach(el => {
    el.href = 'tel:+' + (cfg.tel || '5403444466919').replace(/\D/g,'');
    if (el.childNodes.length === 1 && el.firstChild.nodeType === 3) {
      el.textContent = cfg.tel || '03444 - 466919';
    }
  });
  const dirEl = document.querySelector('[data-dir-text]');
  if (dirEl && cfg.dir) dirEl.textContent = cfg.dir;
  const horEl = document.querySelector('[data-horario-text]');
  if (horEl && cfg.horario1 && cfg.horario2) {
    horEl.innerHTML = escapeHtml(cfg.horario1 || '') + '<br/>' + escapeHtml(cfg.horario2 || '');
  }
}

async function syncFromDB() {
  const btn = document.getElementById('btn-sync-db');
  if (btn) btn.textContent = 'Sincronizando...';
  localStorage.removeItem('mg_products');
  useApi = true;
  await fetchProducts();
  originalProducts = JSON.parse(JSON.stringify(products));
  renderAdminProducts();
  const countEl = document.getElementById('prod-count-bar');
  if (countEl) countEl.textContent = products.length + ' productos cargados';
  if (btn) btn.textContent = 'Sincronizar DB';
  showToast('✓ ' + products.length + ' productos cargados desde la DB');
}

async function submitBudget() {
  const cliente = document.getElementById('budget-cliente')?.value?.trim();
  const email = document.getElementById('budget-email')?.value?.trim();
  const cantidad = parseInt(document.getElementById('budget-cantidad')?.value || '1', 10);
  const notas = document.getElementById('budget-notas')?.value?.trim() || '';
  const productName = document.getElementById('modalName')?.textContent || '';
  if (!cliente || !email) {
    showToast('Por favor completá nombre y email', 'error');
    return;
  }
  try {
    const res = await api('/v2/budget', {
      method: 'POST',
      body: JSON.stringify({ cliente, email, items: [{ name: productName, qty: cantidad, obs: notas }], notas })
    });
    const data = await res.json();
    if (data.ok) {
      showToast('✓ Presupuesto solicitado correctamente');
      closeProductModal();
    } else {
      showToast('Error al enviar presupuesto', 'error');
    }
  } catch (e) {
    showToast('Error de conexión', 'error');
  }
}

async function syncToDB() {
  try {
    await api('/sync-to-db', { method: 'POST' });
    showToast('📦 Productos migrados a la base de datos');
  } catch (e) {
    showToast('Error al migrar: ' + (e.message || 'desconocido'), 'error');
  }
}

function switchAdminTab(event, tabId) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'))
  document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'))
  event.currentTarget.classList.add('active');
  document.getElementById(tabId).classList.add('active');
  if (tabId === 'tab-dashboard') loadDashboard();
  if (tabId === 'tab-translations') loadTranslationsEditor();
}

function initInlineEvents() {
  document.getElementById('btn-open-admin')?.addEventListener('click', openAdminLogin);
  document.getElementById('btn-lang')?.addEventListener('click', switchLanguage);
  document.getElementById('hamburger')?.addEventListener('click', toggleMenu);
  document.getElementById('btn-do-login')?.addEventListener('click', doLogin);
  document.getElementById('btn-close-login')?.addEventListener('click', closeAdminLogin);
  document.getElementById('btn-logout')?.addEventListener('click', doLogout);
  document.getElementById('adminPass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('adminLoginForm')?.addEventListener('submit', e => { e.preventDefault(); doLogin(); });

  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', (e) => switchAdminTab(e, btn.dataset.tab));
  });

  document.getElementById('btn-add-product')?.addEventListener('click', addProduct);
  document.getElementById('btn-bulk-upload')?.addEventListener('click', openBulkUpload);
  document.getElementById('btn-sync-db')?.addEventListener('click', syncFromDB);
  document.getElementById('btn-sync-to-db')?.addEventListener('click', syncToDB);
  document.getElementById('btn-export-csv')?.addEventListener('click', exportProductsCSV);
  document.getElementById('admin-search')?.addEventListener('input', renderAdminProducts);
  document.getElementById('btn-save-products')?.addEventListener('click', saveProducts);

  document.getElementById('btn-save-colors')?.addEventListener('click', saveColors);
  document.getElementById('btn-reset-colors')?.addEventListener('click', resetColors);
  document.querySelectorAll('#tab-colores input[type="color"]').forEach(input => {
    input.addEventListener('input', () => {
      applyColor(input.dataset.css, input.value);
      const hexEl = document.getElementById(input.dataset.hex);
      if (hexEl) hexEl.textContent = input.value;
    });
  });

  document.getElementById('btn-save-local')?.addEventListener('click', saveLocalInfo);
  document.getElementById('btn-add-ventaja')?.addEventListener('click', addVentajaCard);
  document.getElementById('btn-save-texts')?.addEventListener('click', saveSiteTexts);
  document.getElementById('btn-save-translations')?.addEventListener('click', saveAllTranslations);
  document.getElementById('trans-search')?.addEventListener('input', renderTranslationsEditor);

  document.getElementById('btn-close-bulk')?.addEventListener('click', closeBulkUpload);
  document.getElementById('bulk-input')?.addEventListener('change', handleBulkFiles);
  document.getElementById('bulk-drop')?.addEventListener('click', () => document.getElementById('bulk-input')?.click());

  document.getElementById('productModal')?.addEventListener('click', e => { if (e.target.id === 'productModal') closeProductModal(); });
  document.getElementById('btn-close-modal')?.addEventListener('click', closeProductModal);
  document.getElementById('btn-close-modal-2')?.addEventListener('click', closeProductModal);
  document.getElementById('btn-submit-budget')?.addEventListener('click', submitBudget);

  document.getElementById('info-ventajas-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="remove-ventaja"]');
    if (!btn) return;
    const index = parseInt(btn.dataset.index, 10);
    if (!isNaN(index)) removeVentajaCard(index);
  });

  document.getElementById('trans-list')?.addEventListener('change', e => {
    const input = e.target.closest('input[data-key][data-lang]');
    if (!input) return;
    updateTranslation(input);
  });

  initAdminProductEvents();
}

const initApp = async () => {
  init();
  initMap();
  initWysiwyg();
  await initLanguage();
  applyTranslations();
  initInlineEvents();
};
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initApp();
} else {
  document.addEventListener('DOMContentLoaded', initApp);
}

function getPathParam(name) {
  const m = window.location.pathname.match(new RegExp(`/${name}/(\\d+)(?:-[^/]+)?$`));
  return m ? m[1] : null;
}

async function handleProductRoute() {
  const id = getPathParam('producto');
  if (!id) return;
  try {
    const res = await api(`/v2/products/${id}`);
    if (!res.ok) return;
    const p = await res.json();
    updateProductSEO(p);
    openProductModal(p);
  } catch (e) {
    console.error('[route] error loading product:', e);
  }
}

window.addEventListener('popstate', () => {
  handleProductRoute();
});

async function loadTranslationsEditor() {
  try {
    const res = await api('/translations');
    const data = await res.json();
    if (!data.ok) throw new Error('No translations');
    window._allTranslationKeys = Object.keys(data.translations || {});
    renderTranslationsEditor();
  } catch (e) {
    showToast('No se pudieron cargar las traducciones', 'error');
  }
}

function renderTranslationsEditor() {
  const container = document.getElementById('trans-list');
  if (!container) return;
  const keys = window._allTranslationKeys || [];
  const search = (document.getElementById('trans-search')?.value || '').toLowerCase();
  const filtered = search ? keys.filter(k => k.includes(search)) : keys;
  container.innerHTML = filtered.map(k => {
    const es = window._translationsCache?.[k] || '';
    return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;background:#0a0a0a;padding:.7rem;border-radius:4px;border:1px solid #222;">
      <div><label style="font-size:.7rem;color:#888;text-transform:uppercase;">ES</label>
        <input class="admin-input" data-key="${k}" data-lang="es" value="${escapeHtml(es)}" /></div>
      <div><label style="font-size:.7rem;color:#888;text-transform:uppercase;">EN</label>
        <input class="admin-input" data-key="${k}" data-lang="en" value="" /></div>
      <div style="grid-column:1/-1;font-size:.75rem;color:#aaa;">${escapeHtml(k)}</div>
    </div>`;
  }).join('');
}

window.updateTranslation = function (input) {
  const key = input.dataset.key;
  const lang = input.dataset.lang;
  if (!window._pendingTranslations) window._pendingTranslations = {};
  if (!window._pendingTranslations[key]) window._pendingTranslations[key] = {};
  window._pendingTranslations[key][lang] = input.value;
}

window.saveAllTranslations = async function () {
  if (!window._pendingTranslations) return;
  try {
    const res = await api('/translations/batch', {
      method: 'POST',
      body: JSON.stringify({ translations: window._pendingTranslations })
    });
    const data = await res.json();
    if (data.ok) {
      showToast('✓ Traducciones guardadas');
      window._pendingTranslations = null;
      await fetchTranslations(currentLang);
      applyTranslations();
    } else {
      showToast(data.error || 'Error al guardar', 'error');
    }
  } catch (e) {
    showToast('Error de conexión', 'error');
  }
};

window.addEventListener('popstate', () => {
  handleProductRoute();
});

(function checkRoute() {
  if (window.location.pathname.startsWith('/producto/')) {
    handleProductRoute();
  }
})();

function initImageFallbacks() {
  document.getElementById('cat-grid')?.addEventListener('error', function(e) {
    const img = e.target;
    if (img.tagName !== 'IMG' || img.dataset.handled) return;
    img.dataset.handled = '1';
    img.style.display = 'none';
    const fallback = document.createElement('span');
    fallback.className = 'cat-icon-fallback';
    fallback.textContent = img.dataset.icon || '📦';
    img.insertAdjacentElement('afterend', fallback);
  });
  document.getElementById('modalImage')?.addEventListener('error', function(e) {
    const img = e.target;
    if (img.tagName !== 'IMG' || img.dataset.handled) return;
    img.dataset.handled = '1';
    img.style.display = 'none';
    const fallback = document.createElement('span');
    fallback.style.fontSize = '4rem';
    fallback.textContent = img.dataset.icon || '📦';
    img.insertAdjacentElement('afterend', fallback);
  });
}
