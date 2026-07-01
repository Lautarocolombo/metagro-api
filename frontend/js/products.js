// products.js — Lógica de productos, catálogo, panel admin y presupuesto
// Dependencias: config.js (APP_CONFIG), api.js (api)
// Utilidades externas: escapeHtml, encodeImgPath, showToast, showError, renderSkeletons (app.js)

const ITEMS_PER_PAGE = APP_CONFIG.ITEMS_PER_PAGE;

let products = [];
let useApi = true;
let hasUnsavedChanges = false;
let originalProducts = [];
let currentPage = 1;

// Cache de la última renderización del admin para evitar re-renders innecesarios
let _lastAdminRenderState = '';

function normalizeProducts(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(p => {
      const imgMain = p.img || p.imagen_url || p.imagen || '';
      const imgs = Array.isArray(p.images) && p.images.length ? p.images : (imgMain ? [imgMain] : []);
      return { id: p.id ?? null, name: p.name || p.nombre || '', tag: p.tag || p.categoria || p.category || 'General', desc: p.desc || p.descripcion || p.description || '', icon: p.icon || '', img: imgMain, imagen_url: p.imagen_url || imgMain, images: imgs, seo: p.seo || null };
    })
    .filter(p => p.id !== null);
}

async function fetchProducts(retries = 3, delay = 2000) {
  if (!useApi) return;
  renderSkeletons();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 6000);
      const res = await api('/products', { signal: ctrl.signal });
      clearTimeout(tid);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        products = normalizeProducts(data);
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        useApi = true;
        const bar = document.getElementById('api-status_bar') || document.getElementById('api-status-bar');
        if (bar) {
          const isAdmin = !!document.getElementById('btn-sync-db');
          bar.textContent = isAdmin ? `✓ ${products.length} productos cargados desde la base de datos Neon` : '';
          bar.style.background = '#1b3a1b';
          bar.style.color = '#8f8';
          if (!isAdmin) bar.classList.remove('show');
        }
        populateCategoryFilter();
        renderCatalog();
        return;
      }
    } catch { if (attempt === retries) break; await new Promise(r => setTimeout(r, delay * attempt)); }
  }

  useApi = false;
  const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS);
  if (saved) { try { products = JSON.parse(saved); } catch {} }

  if (!products.length) {
    try {
      const res = await fetch(APP_CONFIG.FALLBACK_PRODUCTS_URL);
      const data = await res.json();
      if (Array.isArray(data) && data.length) { products = normalizeProducts(data); saveLocal(); }
    } catch {
      products = normalizeProducts([
        { id: 1, nombre: 'Acople Rápido Aluminio', categoria: 'Acoples', descripcion: 'Acople rápido a palanca de aluminio.', imagen_url: '/productos/Acople Rapido a palanca aluminio.jpg' },
        { id: 2, nombre: 'Carretel con Hilo 500 Mts', categoria: 'Carreteles', descripcion: 'Carretel con hilo 500 metros.', imagen_url: '/productos/Carretel con Hilo 500 Mts.jpg' },
        { id: 3, nombre: 'Bujes Reducción', categoria: 'Bujes', descripcion: 'Buje de reducción para caños.', imagen_url: '/productos/Buje reduccion.jpg' },
        { id: 4, nombre: 'Llave Esférica Plástica', categoria: 'Llaves', descripcion: 'Llave esférica plástica Duke.', imagen_url: '/productos/Llave ESferica Plastica Duke.jpg' },
        { id: 5, nombre: 'Poste Quebracho', categoria: 'Postes', descripcion: 'Poste de quebracho para alambrado.', imagen_url: '/productos/Poste Quebracho.JPG' },
        { id: 6, nombre: 'Varilla Galvanizada', categoria: 'Varillas', descripcion: 'Varilla galvanizada 1/2".', imagen_url: '/productos/Varilla Galvanizada.JPG' },
      ]);
      saveLocal();
    }
  }
  showError('No se pudo cargar el catálogo en vivo. Mostrando productos guardados.');
  const bar = document.getElementById('api-status_bar') || document.getElementById('api-status-bar');
  if (bar) bar.classList.add('show');
  populateCategoryFilter();
  renderCatalog();
  setTimeout(() => { if (!useApi) fetchProducts(3, 3000); }, 15000);
}

function saveLocal() {
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function populateCategoryFilter() {
  const sel = document.getElementById('cat-filter');
  if (!sel) return;
  const current = sel.value;
  const cats = Array.from(new Set(products.map(p => (p.tag || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
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
      const matchesQ = !q || (p.name || '').toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q);
      const matchesCat = cat === '__all__' || (p.tag || '') === cat;
      return matchesQ && matchesCat;
    });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  return { items: filtered.slice(start, start + ITEMS_PER_PAGE), total, totalPages, page: currentPage };
}

function renderCatalog() {
  const totalEl = document.getElementById('prod-total-display');
  const filtered = getSelectedProducts();
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
      .split(/\r?\n/).map(l => l.split(' | ').pop() || l).map(l => l.trim()).filter(l => l && l !== p.tag && l !== p.name);

    const thumbs = allImages.slice(1).map(src => `<img src="${encodeImgPath(src)}" alt="" loading="lazy" />`).join('');
    return `
    <div class="cat-card" data-index="${i}">
      <div class="cat-img-placeholder${hasImg ? '' : ' cat-img-placeholder--noimg'}">
        ${hasImg ? `<img src="${encodeImgPath(mainImg)}" loading="lazy" fetchpriority="low" decoding="async" alt="${escapeHtml(p.name || '')}" data-icon="${escapeHtml(p.icon || '📦')}" />` : `<span class="cat-icon-fallback">${escapeHtml(p.icon || '📦')}</span>`}
      </div>
      ${thumbs ? `<div class="cat-variants">${thumbs}</div>` : ''}
      <div class="cat-body">
        <div class="cat-name">${escapeHtml(p.name)}</div>
        ${descClean.length ? `<div class="cat-desc">${escapeHtml(descClean.join('\n'))}</div>` : ''}
        <span class="cat-tag">${escapeHtml(p.tag)}</span>
      </div>
    </div>`;
  }).join('');

  const paginationEl = document.getElementById('cat-pagination');
  if (paginationEl) {
    if (filtered.totalPages <= 1) { paginationEl.innerHTML = ''; return; }
    paginationEl.innerHTML = `
      <div class="cat-pagination">
        <button class="cat-page-btn" data-page="${filtered.page - 1}" ${filtered.page === 1 ? 'disabled' : ''}>« Anterior</button>
        <span class="cat-page-info">Página ${filtered.page} de ${filtered.totalPages}</span>
        <button class="cat-page-btn" data-page="${filtered.page + 1}" ${filtered.page === filtered.totalPages ? 'disabled' : ''}>Siguiente »</button>
      </div>`;
    paginationEl.querySelectorAll('.cat-page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pg = parseInt(btn.dataset.page, 10);
        if (!isNaN(pg)) goToPage(pg);
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

// Cache para evitar re-render cuando búsqueda no cambió
let _lastAdminSearchKey = null;
let _adminListEl = null;
let _prodCountEl = null;

function renderAdminProducts() {
  _adminListEl = _adminListEl || document.getElementById('admin-prod-grid');
  _prodCountEl = _prodCountEl || document.getElementById('prod-count-bar');
  if (!_adminListEl) return;

  const searchQuery = (document.getElementById('admin-search')?.value || '').toLowerCase();
  const stateKey = searchQuery + '|' + products.length;

  if (stateKey === _lastAdminSearchKey) return;
  _lastAdminSearchKey = stateKey;

  if (_prodCountEl) _prodCountEl.textContent = products.length + ' productos cargados';

  const filtered = searchQuery
    ? products.filter(p => (p.name || '').toLowerCase().includes(searchQuery) || (p.tag || '').toLowerCase().includes(searchQuery) || (p.desc || '').toLowerCase().includes(searchQuery))
    : products;

  if (!filtered.length) {
    _adminListEl.innerHTML = '<div class="cat-empty">No se encontraron productos.</div>';
    return;
  }

  _adminListEl.innerHTML = filtered.map(p => {
    const realIndex = products.indexOf(p);
    return `
    <div class="admin-prod-card" draggable="true" data-index="${realIndex}">
      <div class="admin-prod-card-header">
        <span class="admin-prod-card-title">${escapeHtml(p.name || 'Sin nombre')}</span>
        <button class="btn-del" data-role="admin" aria-label="Eliminar producto" data-action="delete" data-index="${realIndex}" title="Eliminar">🗑</button>
      </div>
      <div class="admin-prod-card-body">
        <label class="admin-label">Nombre</label>
        <input class="admin-input" data-field="name" data-index="${realIndex}" value="${escapeHtml(p.name || '')}" />
        <label class="admin-label">Categoría</label>
        <input class="admin-input" data-field="tag" data-index="${realIndex}" value="${escapeHtml(p.tag || '')}" />
        <label class="admin-label">Descripción</label>
        <div class="admin-textarea wysiwyg" contenteditable="true" data-field="desc" data-index="${realIndex}">${escapeHtml(p.desc || '')}</div>
        <label class="admin-label">Imagen (ruta o base64)</label>
        <input class="admin-input" data-field="img" data-index="${realIndex}" value="${escapeHtml(p.img || '')}" placeholder="productos/foto.jpg" />
        <div class="img-preview-wrap" data-action="open-file" data-index="${realIndex}">
          ${p.img ? `<img src="${encodeImgPath(p.img)}" alt="preview" />` : '<span style="color:#555;font-size:.8rem">Sin imagen</span>'}
          <input type="file" accept="image/*" class="file-input-hidden" data-field="img" data-index="${realIndex}" />
        </div>
        <span class="img-preview-label">Clic para cambiar imagen</span>
      </div>
    </div>`;
  }).join('');
}

// Event delegation para el panel admin - evita re-bindear en cada render
let _adminEventsInited = false;

function initAdminProductEvents() {
  if (_adminEventsInited) return;
  _adminEventsInited = true;

  const grid = document.getElementById('admin-prod-grid');
  if (!grid) return;

  // Drag & drop
  grid.addEventListener('dragstart', e => {
    const card = e.target.closest('.admin-prod-card');
    if (!card) return;
    _dragSrcIndex = parseInt(card.dataset.index, 10);
    e.dataTransfer.effectAllowed = 'move';
    card.style.opacity = '0.4';
  });
  grid.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const card = e.target.closest('.admin-prod-card');
    if (card) card.style.borderTop = '3px solid var(--yellow)';
  });
  grid.addEventListener('drop', e => {
    e.preventDefault();
    const card = e.target.closest('.admin-prod-card');
    if (!card) return;
    const targetIndex = parseInt(card.dataset.index, 10);
    if (_dragSrcIndex !== null && _dragSrcIndex !== targetIndex) {
      const moved = products.splice(_dragSrcIndex, 1)[0];
      products.splice(targetIndex, 0, moved);
      hasUnsavedChanges = true;
      updateUnsavedIndicator();
      _lastAdminSearchKey = null; // invalidar cache
      renderAdminProducts();
      renderCatalog();
    }
    qsa('.admin-prod-card').forEach(c => { c.style.opacity = '1'; c.style.borderTop = ''; });
  });
  grid.addEventListener('dragend', e => {
    qsa('.admin-prod-card').forEach(c => { c.style.opacity = '1'; c.style.borderTop = ''; });
    _dragSrcIndex = null;
  });

  // Delegación: eliminar, inputs, file inputs, wysiwyg blur
  grid.addEventListener('click', e => {
    const delBtn = e.target.closest('[data-action="delete"]');
    if (delBtn) { deleteProduct(parseInt(delBtn.dataset.index, 10)); return; }
    const fileWrap = e.target.closest('[data-action="open-file"]');
    if (fileWrap) { fileWrap.querySelector('input[type="file"]')?.click(); }
  });

  grid.addEventListener('input', e => {
    const input = e.target;
    if (input.matches('input[data-field][data-index]')) {
      updateAdminProduct(parseInt(input.dataset.index, 10), input.dataset.field, input.value);
    }
  });

  grid.addEventListener('change', e => {
    const input = e.target;
    if (input.matches('input[type="file"].file-input-hidden[data-field][data-index]')) {
      handleAdminImage(input, parseInt(input.dataset.index, 10));
    }
  });

  grid.addEventListener('blur', e => {
    const el = e.target;
    if (el.matches('.wysiwyg[data-field][data-index]')) {
      updateAdminProduct(parseInt(el.dataset.index, 10), el.dataset.field, el.innerText);
    }
  }, true); // capture phase para capturar blur antes que el elemento se modifique
}

let _dragSrcIndex = null;
let _debounceTimer = null;

function updateAdminProduct(index, field, value) {
  if (products[index]) {
    products[index][field] = value;
    hasUnsavedChanges = true;
    updateUnsavedIndicator();
  }
}

function exportProductsCSV() {
  const headers = ['ID', 'Nombre', 'Categoría', 'Descripción', 'Imagen'];
  const rows = products.map(p => [p.id, p.name, p.tag, (p.desc || '').replace(/\n/g, ' '), p.img]);
  let csv = '\uFEFF' + headers.join(',') + '\n';
  rows.forEach(row => { csv += row.map(f => `"${String(f || '').replace(/"/g, '""')}"`).join(',') + '\n'; });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
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
    try { await api(`/products/${p.id}`, { method: 'DELETE' }); } catch { showToast('No se pudo eliminar del servidor. Se eliminó localmente.', 'error'); }
  }
  originalProducts = originalProducts.filter(op => op.id !== p.id);
  products.splice(index, 1);
  hasUnsavedChanges = false;
  saveLocal();
  _lastAdminSearchKey = null;
  renderAdminProducts();
  renderCatalog();
  showToast('Producto eliminado');
}

function addProduct() {
  products.push({ id: Date.now(), name: 'Producto nuevo', tag: 'General', desc: '', icon: '🤝', img: '' });
  hasUnsavedChanges = true;
  updateUnsavedIndicator();
  saveLocal();
  _lastAdminSearchKey = null;
  renderAdminProducts();
  renderCatalog();
  const grid = document.getElementById('admin-prod-grid');
  if (grid) grid.scrollTop = grid.scrollHeight;
}

async function handleAdminImage(input, index) {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const base64 = await compressImage(file);
    if (products[index]) {
      products[index].img = base64;
      hasUnsavedChanges = true;
      updateUnsavedIndicator();
      saveLocal();
      _lastAdminSearchKey = null;
      renderAdminProducts();
      renderCatalog();
    }
  } catch { showToast('Error al procesar la imagen', 'error'); }
}

function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, 1);
        const w = Math.round(img.width * ratio), h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function saveProducts() {
  const invalid = products.filter(p => !p.name || !p.name.trim());
  if (invalid.length) { showToast(`${invalid.length} producto(s) sin nombre. Corregí antes de guardar.`, 'error'); return; }
  saveLocal();
  const offline = sessionStorage.getItem('mg_offline_mode') === 'true';
  
  if (offline) {
    // Modo offline: guardar solo en localStorage
    originalProducts = JSON.parse(JSON.stringify(products));
    hasUnsavedChanges = false;
    updateUnsavedIndicator();
    renderAdminProducts();
    renderCatalog();
    showToast('✓ Cambios guardados localmente (modo offline)');
    const msgEl = document.getElementById('save-msg-prod');
    if (msgEl) { msgEl.textContent = '✓ Guardado local'; msgEl.classList.add('show'); setTimeout(() => msgEl.classList.remove('show'), 3000); }
    return;
  }
  
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
        } catch (e) { showToast(`Error creando ${p.name}: ${e.message}`, 'error'); }
      } else {
        const orig = originalProducts.find(op => op.id === p.id);
        if (orig && JSON.stringify(orig) !== JSON.stringify(p)) {
          try {
            await api(`/products/${p.id}`, { method: 'PUT', body: JSON.stringify(p) });
            updated++;
          } catch (e) { showToast(`Error actualizando ${p.name}: ${e.message}`, 'error'); }
        }
      }
    }
    for (const p of originalProducts) {
      if (p.id && !currentIds.has(p.id)) {
        try { await api(`/products/${p.id}`, { method: 'DELETE' }); deleted++; }
        catch (e) { showToast(`Error eliminando ${p.name}: ${e.message}`, 'error'); }
      }
    }
    originalProducts = JSON.parse(JSON.stringify(products));
  } catch (e) { showError('Error al guardar en el servidor: ' + e.message); }
  hasUnsavedChanges = false;
  updateUnsavedIndicator();
  saveLocal();
  _lastAdminSearchKey = null;
  renderAdminProducts();
  renderCatalog();
  populateCategoryFilter();
  const parts = [];
  if (created) parts.push(created + ' creados');
  if (updated) parts.push(updated + ' actualizados');
  if (deleted) parts.push(deleted + ' eliminados');
  const msg = parts.length ? '✓ ' + parts.join(', ') : '✓ Sin cambios pendientes';
  showToast(msg);
  const msgEl = document.getElementById('save-msg-prod');
  if (msgEl) { msgEl.textContent = msg; msgEl.classList.add('show'); setTimeout(() => msgEl.classList.remove('show'), 3000); }
}

async function openBulkUpload() {
  const zone = document.getElementById('bulk-zone');
  if (zone) zone.style.display = 'flex';
  const namesEl = document.getElementById('bulk-names');
  if (namesEl) namesEl.value = '';
  const listEl = document.getElementById('bulk-list');
  if (listEl) listEl.innerHTML = '';
  const bar = document.getElementById('bulk-bar');
  if (bar) bar.style.width = '0%';
}

function closeBulkUpload() {
  const zone = document.getElementById('bulk-zone');
  if (zone) zone.style.display = 'none';
}

async function handleBulkFiles(input) {
  const files = Array.from(input.files);
  if (!files.length) return;
  const list = document.getElementById('bulk-list');
  const bar = document.getElementById('bulk-bar');
  const namesText = (document.getElementById('bulk-names')?.value || '').trim();
  const namesArr = namesText ? namesText.split('\n').map(s => s.trim()).filter(Boolean) : [];
  list.innerHTML = '';
  files.forEach(f => { const item = document.createElement('div'); item.className = 'bulk-item'; item.textContent = f.name; list.appendChild(item); });
  bar.style.width = '100%';
  const processFile = async (file, idx) => {
    try {
      const base64 = await compressImage(file);
      const name = namesArr[idx] || file.name.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ');
      products.push({ id: Date.now() + idx, name, tag: 'General', desc: 'Cargado por carga masiva', icon: '', img: base64 });
    } catch { /* skip failed */ }
  };
  await Promise.all(files.map((f, i) => processFile(f, i)));
  populateCategoryFilter();
  renderCatalog();
  _lastAdminSearchKey = null;
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
  setTimeout(() => { if (bar) bar.style.width = '0%'; }, 600);
  input.value = '';
}

function initImageFallbacks() {
  const grid = document.getElementById('cat-grid');
  if (grid && !grid._fallbackInit) {
    grid._fallbackInit = true;
    grid.addEventListener('error', function(e) {
      const img = e.target;
      if (img.tagName !== 'IMG' || img.dataset.handled) return;
      img.dataset.handled = '1'; img.style.display = 'none';
      const fallback = document.createElement('span');
      fallback.className = 'cat-icon-fallback'; fallback.textContent = img.dataset.icon || '📦';
      img.insertAdjacentElement('afterend', fallback);
    });
  }
  const modalImg = document.getElementById('modalImage');
  if (modalImg && !modalImg._fallbackInit) {
    modalImg._fallbackInit = true;
    modalImg.addEventListener('error', function(e) {
      const img = e.target;
      if (img.tagName !== 'IMG' || img.dataset.handled) return;
      img.dataset.handled = '1'; img.style.display = 'none';
      const fallback = document.createElement('span');
      fallback.style.fontSize = '4rem'; fallback.textContent = img.dataset.icon || '📦';
      img.insertAdjacentElement('afterend', fallback);
    });
  }
}

// Inicialización: eventos del admin con debounce en búsqueda
function initAdminSearchDebounce() {
  const searchEl = document.getElementById('admin-search');
  if (!searchEl || searchEl._debounceInit) return;
  searchEl._debounceInit = true;
  searchEl.addEventListener('input', () => {
    clearTimeout(_debounceTimer);
    _lastAdminSearchKey = null;
    _debounceTimer = setTimeout(renderAdminProducts, 150);
  });
}
