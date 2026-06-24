// Usar la misma URL del dominio en producción (Vercel) para que /api/* apunte al backend desplegado aquí.
const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000/api'
    : (window.METAGRO_API_BASE || `${window.location.origin}/api`);

window.DEFAULT_PRODUCTS = [
  { "id": 1, "name": "A - Rosca Hembra 2", "tag": "General", "desc": "", "img": "" },
  { "id": 2, "name": "A - Rosca Macho 2 1/2", "tag": "General", "desc": "", "img": "" },
  { "id": 3, "name": "A - Rosca Macho 2", "tag": "General", "desc": "", "img": "" },
  { "id": 4, "name": "A - Soldadura x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 5, "name": "A - Soldadura x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 6, "name": "A - Soldadura x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 7, "name": "A - Soldadura x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 8, "name": "A - Soldadura x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 9, "name": "A - Soldadura Electrica x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 10, "name": "A - Soldadura Electrica x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 11, "name": "A - Soldadura Electrica x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 12, "name": "A - Soldadura Electrica x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 13, "name": "A - Alambre Nylon x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 14, "name": "A - Alambre Nylon x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 15, "name": "A - Alambre Nylon x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 16, "name": "A - Alambre Nylon x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 17, "name": "A - Alambre Nylon x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 18, "name": "A - Alambre Negro x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 19, "name": "A - Alambre Negro x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 20, "name": "A - Alambre Negro x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 21, "name": "A - Alambre Negro x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 22, "name": "A - Alambre Negro x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 24, "name": "A - Clavo x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 25, "name": "A - Clavo x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 26, "name": "A - Clavo x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 27, "name": "A - Clavo x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 28, "name": "A - Clavo x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 29, "name": "A - Tornillo x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 30, "name": "A - Tornillo x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 31, "name": "A - Tornillo x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 32, "name": "A - Tornillo x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 33, "name": "A - Tornillo x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 34, "name": "A - Tuerca x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 35, "name": "A - Tuerca x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 36, "name": "A - Tuerca x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 37, "name": "A - Tuerca x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 38, "name": "A - Tuerca x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 39, "name": "A - Arandela x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 40, "name": "A - Arandela x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 41, "name": "B - Rosca Hembra 2", "tag": "General", "desc": "", "img": "" },
  { "id": 42, "name": "B - Rosca Macho 2 1/2", "tag": "General", "desc": "", "img": "" },
  { "id": 43, "name": "B - Rosca Macho 2", "tag": "General", "desc": "", "img": "" },
  { "id": 44, "name": "B - Soldadura x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 45, "name": "B - Soldadura x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 46, "name": "B - Soldadura x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 47, "name": "B - Soldadura x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 48, "name": "B - Soldadura x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 49, "name": "B - Soldadura Electrica x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 50, "name": "B - Soldadura Electrica x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 51, "name": "B - Soldadura Electrica x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 52, "name": "B - Soldadura Electrica x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 53, "name": "B - Alambre Nylon x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 54, "name": "B - Alambre Nylon x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 55, "name": "B - Alambre Nylon x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 56, "name": "B - Alambre Nylon x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 57, "name": "B - Alambre Nylon x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 58, "name": "B - Alambre Negro x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 59, "name": "B - Alambre Negro x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 60, "name": "B - Alambre Negro x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 61, "name": "B - Alambre Negro x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 62, "name": "B - Alambre Negro x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 64, "name": "B - Clavo x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 65, "name": "B - Clavo x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 66, "name": "B - Clavo x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 67, "name": "B - Clavo x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 68, "name": "B - Clavo x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 69, "name": "B - Tornillo x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 70, "name": "B - Tornillo x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 71, "name": "B - Tornillo x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 72, "name": "B - Tornillo x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 73, "name": "B - Tornillo x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 74, "name": "B - Tuerca x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 75, "name": "B - Tuerca x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 76, "name": "B - Tuerca x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 77, "name": "B - Tuerca x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 78, "name": "B - Tuerca x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 79, "name": "B - Arandela x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 80, "name": "B - Arandela x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 81, "name": "C - Rosca Hembra 2", "tag": "General", "desc": "", "img": "" },
  { "id": 82, "name": "C - Rosca Macho 2 1/2", "tag": "General", "desc": "", "img": "" },
  { "id": 83, "name": "C - Rosca Macho 2", "tag": "General", "desc": "", "img": "" },
  { "id": 84, "name": "C - Soldadura x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 85, "name": "C - Soldadura x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 86, "name": "C - Soldadura x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 87, "name": "C - Soldadura x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 88, "name": "C - Soldadura x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 89, "name": "C - Soldadura Electrica x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 90, "name": "C - Soldadura Electrica x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 91, "name": "C - Soldadura Electrica x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 92, "name": "C - Soldadura Electrica x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 93, "name": "C - Alambre Nylon x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 94, "name": "C - Alambre Nylon x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 95, "name": "C - Alambre Nylon x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 96, "name": "C - Alambre Nylon x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 97, "name": "C - Alambre Nylon x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 98, "name": "C - Alambre Negro x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 99, "name": "C - Alambre Negro x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 100, "name": "C - Alambre Negro x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 101, "name": "C - Alambre Negro x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 102, "name": "C - Alambre Negro x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 104, "name": "C - Clavo x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 105, "name": "C - Clavo x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 106, "name": "C - Clavo x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 107, "name": "C - Clavo x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 108, "name": "C - Clavo x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 109, "name": "C - Tornillo x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 110, "name": "C - Tornillo x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 111, "name": "C - Tornillo x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 112, "name": "C - Tornillo x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 113, "name": "C - Tornillo x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 114, "name": "C - Tuerca x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 115, "name": "C - Tuerca x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 116, "name": "C - Tuerca x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 117, "name": "C - Tuerca x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 118, "name": "C - Tuerca x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 119, "name": "C - Arandela x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 120, "name": "C - Arandela x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 121, "name": "D - Rosca Hembra 2", "tag": "General", "desc": "", "img": "" },
  { "id": 122, "name": "D - Rosca Macho 2 1/2", "tag": "General", "desc": "", "img": "" },
  { "id": 123, "name": "D - Rosca Macho 2", "tag": "General", "desc": "", "img": "" },
  { "id": 124, "name": "D - Soldadura x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 125, "name": "D - Soldadura x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 126, "name": "D - Soldadura x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 127, "name": "D - Soldadura x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 128, "name": "D - Soldadura x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 129, "name": "D -Soldadura Electrica x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 130, "name": "D -Soldadura Electrica x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 131, "name": "D -Soldadura Electrica x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 132, "name": "D -Soldadura Electrica x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 133, "name": "D - Alambre Nylon x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 134, "name": "D - Alambre Nylon x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 135, "name": "D - Alambre Nylon x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 136, "name": "D - Alambre Nylon x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 137, "name": "D - Alambre Nylon x 9 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 138, "name": "D - Alambre Negro x 1 Kg", "tag": "General", "desc": "", "img": "" },
  { "id": 139, "name": "D - Alambre Negro x 500 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 140, "name": "D - Alambre Negro x 250 gr", "tag": "General", "desc": "", "img": "" },
  { "id": 141, "name": "D - Alambre Negro x 18 pulg", "tag": "General", "desc": "", "img": "" },
  { "id": 142, "name": "D - Alambre Negro x 9 pulg", "tag": "General", "desc": "", "img": "" }
];

let products = [];
let useApi = true;
let hasUnsavedChanges = false;
let originalProducts = [];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res;
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
      desc:       p.desc || p.descripcion || p.description || '',
      icon:       p.icon || '',
      img:        imgMain,
      imagen_url: p.imagen_url || imgMain,
      images:     imgs
    };
  }).filter(p => p.id !== null);
}

async function fetchProducts() {
  if (!useApi) return;
  renderSkeletons();
  try {
    const res = await api('/products');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      products = normalizeProducts(data);
      localStorage.setItem('mg_products', JSON.stringify(products));
    } else if (!data || !data.length) {
      const saved = localStorage.getItem('mg_products');
      if (saved) { try { products = JSON.parse(saved); } catch (e) { /* localStorage corrupto, ignorar */ } }
      if (!products.length) products = [...(window.DEFAULT_PRODUCTS || [])];
    }
  } catch (e) {
    useApi = false;
    const saved = localStorage.getItem('mg_products');
    if (saved) { try { products = JSON.parse(saved); } catch (e) {} }
    if (!products.length) products = [...(window.DEFAULT_PRODUCTS || [])];
    showError('No se pudo cargar el catálogo. Se mostrarán los productos guardados.');
    const bar = document.getElementById('api-status-bar');
    if (bar) bar.classList.add('show');
  } finally {
    populateCategoryFilter();
    renderCatalog();
  }
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
  sel.innerHTML = '<option value="__all__">Todas las categorías</option>' +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  sel.value = cats.includes(current) ? current : '__all__';
}

function getSelectedProducts() {
  const q = (document.getElementById('cat-search')?.value || '').trim().toLowerCase();
  const cat = document.getElementById('cat-filter')?.value || '__all__';
  return products
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.desc || '').toLowerCase();
      const tag = (p.tag || '').toLowerCase();
      const matchesQ = !q || name.includes(q) || desc.includes(q) || tag.includes(q);
      const matchesCat = cat === '__all__' || (p.tag || '') === cat;
      return matchesQ && matchesCat;
    });
}

function renderCatalog() {
  const totalEl = document.getElementById('prod-total-display');
  if (totalEl && products.length) {
    totalEl.style.display = 'block';
    const items = getSelectedProducts();
    totalEl.textContent = items.length + ' de ' + products.length + ' productos';
  }
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  const items = getSelectedProducts();
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
    const iconSafe = escapeHtml(p.icon || '📦');
    const imgOnError = hasImg ? ` onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span class=\\'cat-icon-fallback\\'>${iconSafe}</span>')"` : '';
    const thumbs = allImages.slice(1).map(src => `<img src="${encodeImgPath(src)}" alt="" loading="lazy" />`).join('');
    return `
    <div class="cat-card" data-index="${i}">
      <div class="cat-img-placeholder${hasImg ? '' : ' cat-img-placeholder--noimg'}">
        ${hasImg ? `<img src="${encodeImgPath(mainImg)}" loading="lazy" alt="${escapeHtml(p.name || '')}"${imgOnError} />` : `<span class="cat-icon-fallback">${iconSafe}</span>`}
      </div>
      ${thumbs ? `<div class="cat-variants">${thumbs}</div>` : ''}
      <div class="cat-body">
        <div class="cat-name">${escapeHtml(p.name)}</div>
        ${descHtml}
        <span class="cat-tag">${escapeHtml(p.tag)}</span>
      </div>
    </div>
  `;}).join('');
}

function toggleMenu() {
  const menu = document.getElementById('navLinks');
  menu.classList.toggle('open');
}

function renderAdminProducts() {
  const countEl = document.getElementById('prod-count-bar');
  if (countEl) countEl.textContent = products.length + ' productos cargados';
  const grid = document.getElementById('admin-prod-grid');
  if (!grid) return;
  grid.innerHTML = products.map((p, i) => `
    <div class="admin-prod-card" data-index="${i}">
      <div class="admin-prod-card-header">
        <span class="admin-prod-card-title">${escapeHtml(p.name || 'Sin nombre')}</span>
        <button class="btn-del" onclick="deleteProduct(${i})" title="Eliminar">🗑</button>
      </div>
      <div class="admin-prod-card-body">
        <label class="admin-label">Nombre</label>
        <input class="admin-input" data-field="name" value="${escapeHtml(p.name || '')}" onchange="updateAdminProduct(${i},'name',this.value)" />
        <label class="admin-label">Categoría</label>
        <input class="admin-input" data-field="tag" value="${escapeHtml(p.tag || '')}" onchange="updateAdminProduct(${i},'tag',this.value)" />
        <label class="admin-label">Descripción</label>
        <textarea class="admin-textarea" data-field="desc" onchange="updateAdminProduct(${i},'desc',this.value)">${escapeHtml(p.desc || '')}</textarea>
        <label class="admin-label">Imagen (ruta o base64)</label>
        <input class="admin-input" data-field="img" value="${escapeHtml(p.img || '')}" onchange="updateAdminProduct(${i},'img',this.value)" placeholder="productos/foto.jpg" />
        <div class="img-preview-wrap" onclick="this.querySelector('input').click()">
          ${p.img ? `<img src="${p.img}" alt="preview" />` : '<span style="color:#555;font-size:.8rem">Sin imagen</span>'}
          <input type="file" accept="image/*" class="file-input-hidden" onchange="handleAdminImage(this, ${i})" />
        </div>
        <span class="img-preview-label">Clic para cambiar imagen</span>
      </div>
    </div>
  `).join('');
}

function updateAdminProduct(index, field, value) {
  if (products[index]) {
    products[index][field] = value;
    hasUnsavedChanges = true;
    updateUnsavedIndicator();
  }
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
  const newP = { id: Date.now(), name: 'Producto nuevo', tag: 'General', desc: '', icon: '📦', img: '' };
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
        const res = await api('/products', { method: 'POST', body: JSON.stringify(p) });
        const saved = await res.json();
        if (saved.id) p.id = saved.id;
        created++;
      } else {
        const orig = originalProducts.find(op => op.id === p.id);
        if (orig && JSON.stringify(orig) !== JSON.stringify(p)) {
          await api(`/products/${p.id}`, { method: 'PUT', body: JSON.stringify(p) });
          updated++;
        }
      }
    }
    for (const p of originalProducts) {
      if (p.id && !currentIds.has(p.id)) {
        await api(`/products/${p.id}`, { method: 'DELETE' });
        deleted++;
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
  const msg = parts.length ? '✓ ' + parts.join(', ') : '✓ Sin cambios pendientes';
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
  localStorage.setItem('mg_config', JSON.stringify(cfg));
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
  'cont_titulo_1': '¿NECESITÁS UN PRODUCTO?',
  'cont_titulo_2': 'CONSULTANOS.',
  'cont_desc': 'Ya sea para tu estancia, chacra o trabajo profesional, en Metagro SRL te asesoramos sin compromiso. Respondemos rápido por WhatsApp o por teléfono.',
  'footer_tagline': 'Siempre junto al campo · Desde 1983'
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
    if (heroDescEl) heroDescEl.value = get('hero_desc');
    if (heroNumeroEl) heroNumeroEl.value = get('hero_numero');
    if (heroEtiquetaEl) heroEtiquetaEl.value = get('hero_etiqueta');

    const grid = document.getElementById('leyendas-ventajas-grid');
    let ventajasCards = [];
    for (let i = 1; i <= 6; i++) {
      const titulo = get(`vent_card_${i}_titulo`);
      const desc = get(`vent_card_${i}_desc`);
      if (titulo) {
        ventajasCards.push({
          icon: VENTAJAS_CONFIG[i-1]?.icon || '📦',
          titulo: titulo,
          descripcion: desc
        });
      }
    }

    if (grid) {
      grid.innerHTML = ventajasCards.map((card, idx) => `
        <div class="ventaja-card" data-index="${idx}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <span style="font-weight:bold;color:var(--yellow);">Tarjeta #${idx + 1}</span>
            <button onclick="removeVentajaCard(${idx})" style="background:#c0392b;color:#fff;border:none;padding:0.3rem 0.6rem;border-radius:4px;cursor:pointer;font-size:0.8rem;">⚠️ Eliminar</button>
          </div>
          <label class="admin-label">Ícono (emoji)</label>
          <input class="admin-input ventaja-icon" data-index="${idx}" value="${escapeHtml(card.icon || '')}" placeholder="⚡" />
          <label class="admin-label">Título</label>
          <input class="admin-input ventaja-titulo" data-index="${idx}" value="${escapeHtml(card.titulo || '')}" placeholder="Atención Rápida" />
          <label class="admin-label">Descripción</label>
          <textarea class="admin-textarea ventaja-desc" data-index="${idx}" rows="2">${escapeHtml(card.descripcion || '')}</textarea>
        </div>
      `).join('');
    }
  } catch (e) {
    showToast('Error al cargar los textos', 'error');
    const grid = document.getElementById('leyendas-ventajas-grid');
    if (grid) grid.style.background = '#c0392b';
    console.error('[Leyendas] Error cargando textos:', e);
  }
}

function addVentajaCard() {
  const grid = document.getElementById('leyendas-ventajas-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.ventaja-card');
  const newIndex = cards.length;
  const html = `
    <div class="ventaja-card" data-index="${newIndex}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <span style="font-weight:bold;color:var(--yellow);">Tarjeta #${newIndex + 1}</span>
        <button onclick="removeVentajaCard(${newIndex})" style="background:#c0392b;color:#fff;border:none;padding:0.3rem 0.6rem;border-radius:4px;cursor:pointer;font-size:0.8rem;">⚠️ Eliminar</button>
      </div>
      <label class="admin-label">Ícono (emoji)</label>
      <input class="admin-input ventaja-icon" data-index="${newIndex}" value="" placeholder="⚡" />
      <label class="admin-label">Título</label>
      <input class="admin-input ventaja-titulo" data-index="${newIndex}" value="" placeholder="Nuevo beneficio" />
      <label class="admin-label">Descripción</label>
      <textarea class="admin-textarea ventaja-desc" data-index="${newIndex}" rows="2"></textarea>
    </div>
  `;
  grid.insertAdjacentHTML('beforeend', html);
}

function removeVentajaCard(index) {
  const card = document.querySelector(`.ventaja-card[data-index="${index}"]`);
  if (card) card.remove();
}

function saveSiteTexts() {
  const texts = getSiteTexts();

  const heroLinea1 = document.getElementById('txt-hero-linea-1');
  const heroLinea2 = document.getElementById('txt-hero-linea-2');
  const heroDesc = document.getElementById('txt-hero-desc');
  const heroNumero = document.getElementById('txt-hero-numero');
  const heroEtiqueta = document.getElementById('txt-hero-etiqueta');

  if (heroLinea1) texts['hero_linea_1'] = heroLinea1.value;
  if (heroLinea2) texts['hero_linea_2'] = heroLinea2.value;
  if (heroDesc) texts['hero_desc'] = heroDesc.value;
  if (heroNumero) texts['hero_numero'] = heroNumero.value;
  if (heroEtiqueta) texts['hero_etiqueta'] = heroEtiqueta.value;

  const grid = document.getElementById('leyendas-ventajas-grid');
  if (grid) {
    const cards = grid.querySelectorAll('.ventaja-card');
    const ventajasCards = Array.from(cards).map((card, i) => ({
      icon: card.querySelector('.ventaja-icon')?.value || '',
      titulo: card.querySelector('.ventaja-titulo')?.value || '',
      descripcion: card.querySelector('.ventaja-desc')?.value || ''
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
  const container = document.getElementById('leyendas-history');
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
  if (heroBtns[1]) heroBtns[1].textContent = get('hero_btn2') || '📞 Contactarnos';
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

function doLogout() {
  if (hasUnsavedChanges && !confirm('Tenés cambios sin guardar. ¿Estás seguro que querés salir?')) return;
  hasUnsavedChanges = false;
  updateUnsavedIndicator();
  sessionStorage.removeItem('mg_admin_token');
  document.getElementById('adminPanel').classList.remove('open');
}

function openProductModal(p) {
  document.getElementById('modalName').textContent = p.name || '';
  document.getElementById('modalDesc').textContent = p.desc || '';
  document.getElementById('modalTag').textContent = p.tag || 'Producto';
  const imgWrap = document.getElementById('modalImage');
  if (p.img) {
    const iconSafe = escapeHtml(p.icon || '📦');
    imgWrap.innerHTML = `<img src="${encodeImgPath(p.img)}" alt="${escapeHtml(p.name || '')}" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span style=\\'font-size:4rem\\'>${iconSafe}</span>')" />`;
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
    const res = await api('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (data.token) {
      sessionStorage.setItem('mg_admin_token', data.token);
      document.getElementById('adminOverlay').classList.remove('open');
      document.getElementById('adminPanel').classList.add('open');
      await fetchProducts();
      originalProducts = JSON.parse(JSON.stringify(products || []));
      renderAdminProducts();
      syncLocalInfoToInputs();
      applyLocalConfig();
      errEl.style.display = 'none';
    } else {
      errEl.textContent = data.error || 'Usuario o contraseña incorrectos.';
      errEl.style.display = 'block';
    }
  } catch (e) {
    errEl.textContent = 'Error de conexión con el servidor.';
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

function init() {
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const panel = document.getElementById('admin-test-panel');
    if (panel) panel.style.display = 'none';
  }
  let defaults = [];
  try {
    defaults = window.DEFAULT_PRODUCTS || [];
    if (!Array.isArray(defaults)) defaults = [];
  } catch (e) { defaults = []; }
  products = [...defaults];
  try {
    const raw = localStorage.getItem('mg_products');
    if (raw) {
      const local = JSON.parse(raw);
      if (Array.isArray(local)) {
        const remoteById = new Map(products.map(p => [String(p.id), p]));
        const merged = [...products];
        for (const p of local) {
          const idx = merged.findIndex(m => String(m.id) === String(p.id));
          if (idx >= 0) merged[idx] = { ...merged[idx], ...p };
          else merged.push(p);
        }
        products = merged;
      }
    }
  } catch (e) { products = [...defaults]; }
  if (!products.length) products = [...defaults];
  saveLocal();
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
   if (typeof useApi !== 'undefined' && useApi) fetchProducts();
  syncLocalInfoToInputs();
  fetchAndApplyTexts();
  loadHistory();
}

function initMap() {
  if (typeof L !== 'undefined' && document.getElementById('leaflet-map')) {
    try {
      setTimeout(() => {
        const mapEl = document.getElementById('leaflet-map');
        if (!mapEl || !mapEl.offsetWidth) return;
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
      }, 300);
    } catch (e) { /* map init failed */ }
  }
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
    horEl.innerHTML = cfg.horario1 + '<br/>' + cfg.horario2;
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

async function syncToDB() {
  try {
    await api('/sync-to-db', { method: 'POST' });
    showToast('✓ Productos migrados a la base de datos');
  } catch (e) {
    showToast('Error al migrar: ' + (e.message || 'desconocido'), 'error');
  }
}

function switchAdminTab(event, tabId) {
  document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => { init(); initMap(); });
