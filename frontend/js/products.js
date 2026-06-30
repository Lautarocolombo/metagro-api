// products.js — Lógica de productos, catálogo, panel admin y presupuesto
// Dependencias: config.js (APP_CONFIG), api.js (api, showToast, showError, escapeHtml, encodeImgPath)

let products = [];
let useApi = true;
let hasUnsavedChanges = false;
let originalProducts = [];
let currentPage = 1;

function normalizeProducts(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(p => {
    const imgMain = p.img || p.imagen_url || p.imagen || '';
    const imgs = Array.isArray(p.images) && p.images.length ? p.images : (imgMain ? [imgMain] : []);
    return {
      id: p.id ?? null,
      name: p.name || p.nombre || '',
      tag: p.tag || p.categoria || p.category || 'General',
      desc: p.desc || p.descripcion || p.description || 'Consultá disponibilidad y precio en Metagro SRL.',
      icon: p.icon || '',
      img: imgMain,
      imagen_url: p.imagen_url || imgMain,
      images: imgs,
      seo: p.seo || null
    };
  }).filter(p => p.id !== null);
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
        return;
      }
    } catch (e) {
      if (attempt === retries) break;
      await new Promise(r => setTimeout(r, delay * attempt));
    }
  }
  useApi = false;
  const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS);
  if (saved) { try { products = JSON.parse(saved); } catch (e) {} }
  if (!products.length) {
    try {
      const res = await fetch(APP_CONFIG.FALLBACK_PRODUCTS_URL);
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        products = normalizeProducts(data);
        saveLocal();
      }
    } catch (e) {
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
  }
  showError('No se pudo cargar el catálogo en vivo. Mostrando productos guardados.');
  const bar = document.getElementById('api-status-bar');
  if (bar) bar.classList.add('show');
  populateCategoryFilter();
  renderCatalog();
  setTimeout(() => {
    if (!useApi) fetchProducts(3, 3000);
  }, 15000);
}

function localFallback() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS);
    if (raw) products = JSON.parse(raw);
  } catch (e) {
    products = [];
  }
}

function saveLocal() {
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
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
  const totalPages = Math.max(1, Math.ceil(total / APP_CONFIG.ITEMS_PER_PAGE));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * APP_CONFIG.ITEMS_PER_PAGE;
  const paged = filtered.slice(start, start + APP_CONFIG.ITEMS_PER_PAGE);
  return { items: paged, total, totalPages, page: currentPage };
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
  renderCatalog();
  renderAdminProducts();
  showToast('Producto eliminado');
}

function addProduct() {
  products.push({
    id: null,
    name: '',
    tag: 'General',
    desc: '',
    icon: '',
    img: ''
  });
  hasUnsavedChanges = true;
  updateUnsavedIndicator();
  renderAdminProducts();
  const grid = document.getElementById('admin-prod-grid');
  if (grid) grid.scrollTop = grid.scrollHeight;
}

async function handleAdminImage(input, index) {
  const file = input.files && input.files[0];
  if (!file) return;
  const compressed = await compressImage(file);
  if (products[index]) {
    products[index].img = compressed;
    renderAdminProducts();
  }
}

function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
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
