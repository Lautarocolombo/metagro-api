// app.js — Orchestrator y lógica principal
// Dependencias: config.js (APP_CONFIG), i18n.js (t, applyTranslations, initLanguage), api.js (api, tryRefreshToken)
// Utilidades propias: escapeHtml, encodeImgPath, showError, showToast, renderSkeletons, initWysiwyg

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function encodeImgPath(path) {
  if (!path || path.startsWith('data:') || path.startsWith('http')) return path;
  return path.split('/').map(encodeURIComponent).join('/');
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
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `app-toast app-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2500);
}

function renderSkeletons(count = 6) {
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="cat-card cat-card--skeleton">
      <div class="cat-img-placeholder cat-img-placeholder--skeleton"></div>
      <div class="cat-body">
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line skeleton-line--text"></div>
        <div class="skeleton-line skeleton-line--tag"></div>
      </div>
    </div>`).join('');
}

function initWysiwyg() {
  document.querySelectorAll('.wysiwyg-toolbar').forEach(toolbar => {
    if (toolbar._wysiwygInit) return;
    toolbar._wysiwygInit = true;
    toolbar.querySelectorAll('.wysiwyg-btn').forEach(btn => {
      btn.addEventListener('mousedown', e => {
        e.preventDefault();
        const cmd = btn.dataset.cmd;
        if (cmd === 'insertImage') { const url = prompt('URL de la imagen:'); if (url) document.execCommand('insertImage', false, url); }
        else if (cmd === 'createLink') { const url = prompt('URL del enlace:'); if (url) document.execCommand('createLink', false, url); }
        else document.execCommand(cmd, false, null);
      });
    });
  });
  document.querySelectorAll('.wysiwyg').forEach(el => {
    if (el._blurInit) return;
    el._blurInit = true;
    el.addEventListener('blur', () => { el.dataset.value = el.innerHTML || ''; });
  });
}

function toggleMenu() { document.getElementById('navLinks')?.classList.toggle('open'); }

function updateActiveNav() {
  let current = '';
  document.querySelectorAll('section[id]').forEach(section => { if (section.getBoundingClientRect().top <= 140) current = section.id; });
  document.querySelectorAll('.menu-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
}

function openAdminLogin() { document.getElementById('adminOverlay')?.classList.add('open'); document.getElementById('adminUser')?.focus(); }
function closeAdminLogin() { document.getElementById('adminOverlay')?.classList.remove('open'); }

async function doLogin() {
  const u = document.getElementById('adminUser')?.value.trim() || '';
  const p = document.getElementById('adminPass')?.value || '';
  const errEl = document.getElementById('loginError');
  if (!u || !p) { if (errEl) { errEl.style.display = 'block'; errEl.textContent = 'Ingresá usuario y contraseña.'; } return; }
  
  // Intentar login contra API primero
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 15000);
    const res = await api('/admin/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }), signal: ctrl.signal });
    clearTimeout(tid);
    const data = await res.json();
    if (data.token) {
      sessionStorage.setItem('mg_admin_token', data.token);
      if (data.refreshToken) sessionStorage.setItem('mg_refresh_token', data.refreshToken);
      try { const payload = JSON.parse(atob(data.token.split('.')[1])); sessionStorage.setItem('mg_admin_role', payload.role || 'admin'); } catch {}
      document.getElementById('adminOverlay')?.classList.remove('open');
      document.getElementById('adminPanel')?.classList.add('open');
      applyRoleVisibility();
      await loadAdminData();
      if (errEl) errEl.style.display = 'none';
      return;
    } else {
      if (errEl) { errEl.textContent = data.error || 'Usuario o contraseña incorrectos.'; errEl.style.display = 'block'; }
    }
  } catch (e) {
    // Si falla la API, intentar modo offline
    console.warn('[admin] API caída, intentando modo offline:', e.message);
  }
  
  // Fallback: login contra credenciales hardcodeadas + localStorage
  if (u === 'metagro' && p === 'montealegre22') {
    sessionStorage.setItem('mg_admin_token', 'offline-token-' + Date.now());
    sessionStorage.setItem('mg_admin_role', 'admin');
    sessionStorage.setItem('mg_offline_mode', 'true');
    document.getElementById('adminOverlay')?.classList.remove('open');
    document.getElementById('adminPanel')?.classList.add('open');
    showToast('⚠️ Modo offline — cambios guardados localmente', 'error');
    applyRoleVisibility();
    await loadAdminData();
    if (errEl) errEl.style.display = 'none';
  } else {
    if (errEl) { errEl.textContent = 'Error de conexión. Usá metagro / montealegre22 (modo offline).'; errEl.style.display = 'block'; }
  }
}

let _chartJsLoaded = false;

async function loadChartJs() {
  if (_chartJsLoaded) return;
  _chartJsLoaded = true;
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Chart.js'));
    document.head.appendChild(script);
  });
}

function switchAdminTab(event, tabId) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById(tabId)?.classList.add('active');
  if (tabId === 'tab-dashboard') { loadChartJs().catch(() => {}); loadDashboard(); }
  if (tabId === 'tab-translations') loadTranslationsEditor();
}

function applyColor(key, value) { document.documentElement.style.setProperty(key, value); }

function saveColors() {
  const colors = { '--yellow': document.getElementById('color-yellow')?.value || '#F5C800', '--black': document.getElementById('color-black')?.value || '#111111', '--steel': document.getElementById('color-steel')?.value || '#1a1a1a', '--cream': document.getElementById('color-cream')?.value || '#F5F0E8' };
  const root = document.documentElement;
  for (const [key, val] of Object.entries(colors)) root.style.setProperty(key, val);
  localStorage.setItem('mg_colors', JSON.stringify(colors));
  const msg = document.getElementById('save-msg-color');
  if (msg) { msg.classList.add('show'); setTimeout(() => msg.classList.remove('show'), 2000); }
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

function updateUnsavedIndicator() {
  const el = document.getElementById('unsaved-indicator');
  if (el) el.style.display = hasUnsavedChanges ? 'inline' : 'none';
}

async function doLogout() {
  if (hasUnsavedChanges && !confirm('Tenés cambios sin guardar. ¿Estás seguro que querés salir?')) return;
  hasUnsavedChanges = false;
  updateUnsavedIndicator();
  sessionStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
  sessionStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  document.getElementById('adminPanel')?.classList.remove('open');
}

async function loadAdminData() {
  await fetchProducts();
  originalProducts = JSON.parse(JSON.stringify(products || []));
  renderAdminProducts();
  syncLocalInfoToInputs();
  applyLocalConfig();
  loadSiteTextsIntoTab();
  const offline = sessionStorage.getItem('mg_offline_mode') === 'true';
  if (offline) {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) indicator.style.display = 'inline';
  }
}

async function loadTranslationsEditor() {
  try {
    const res = await api('/translations');
    const data = await res.json();
    if (!data.ok) throw new Error('No translations');
    window._allTranslationKeys = Object.keys(data.translations || {});
    renderTranslationsEditor();
  } catch { showToast('No se pudieron cargar las traducciones', 'error'); }
}

function renderTranslationsEditor() {
  const container = document.getElementById('trans-list');
  if (!container) return;
  const keys = window._allTranslationKeys || [];
  const search = (document.getElementById('trans-search')?.value || '').toLowerCase();
  const filtered = search ? keys.filter(k => k.includes(search)) : keys;
  container.innerHTML = filtered.map(k => {
    const es = window._translationsCache?.[k] || '';
    return `<div class="trans-item">
      <div><label>ES</label><input class="admin-input" data-key="${escapeHtml(k)}" data-lang="es" value="${escapeHtml(es)}" /></div>
      <div><label>EN</label><input class="admin-input" data-key="${escapeHtml(k)}" data-lang="en" value="" /></div>
      <div class="trans-key">${escapeHtml(k)}</div>
    </div>`;
  }).join('');
}

// Expuesto globalmente para el event listener onchange
window.updateTranslation = function(input) {
  const key = input.dataset.key;
  const lang = input.dataset.lang;
  if (!key || !lang) return;
  if (!window._pendingTranslations) window._pendingTranslations = {};
  if (!window._pendingTranslations[key]) window._pendingTranslations[key] = {};
  window._pendingTranslations[key][lang] = input.value;
};

window.saveAllTranslations = async function () {
  if (!window._pendingTranslations) return;
  try {
    const res = await api('/translations/batch', { method: 'POST', body: JSON.stringify({ translations: window._pendingTranslations }) });
    const data = await res.json();
    if (data.ok) {
      showToast('✓ Traducciones guardadas');
      window._pendingTranslations = null;
      await fetchTranslations(currentLang);
      applyTranslations();
    } else showToast(data.error || 'Error al guardar', 'error');
  } catch { showToast('Error de conexión', 'error'); }
};

async function syncLocalInfoToInputs() { home.syncLocalInfoToInputs?.(); }

function initMap() {
  const mapEl = document.getElementById('leaflet-map');
  if (!mapEl) return;
  const tryInit = (attempt = 0) => {
    if (typeof L !== 'undefined' && mapEl.clientHeight > 0) {
      try {
        const map = L.map('leaflet-map', { zoomControl: true, scrollWheelZoom: false }).setView([-33.1308927, -59.3156888], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
        L.marker([-33.1308927, -59.3156888]).addTo(map).bindPopup('<b>Metagro SRL</b><br/>Gualeguay, Entre Ríos').openPopup();
        setTimeout(() => map.invalidateSize(), 300);
      } catch { /* map init failed */ }
    } else if (attempt < 20) setTimeout(() => tryInit(attempt + 1), 400);
    else mapEl.innerHTML = '<iframe src="https://www.google.com/maps?q=Metagro+SRL,Gualeguay,Entre+Rios&output=embed" width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>';
  };
  tryInit();
}

function init() {
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const panel = document.getElementById('admin-test-panel');
    if (panel) panel.style.display = 'none';
  }
  products = [];
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS);
  useApi = true;
  saveLocal();
  try {
    const current = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS) || '{}');
    const merged = { ...SITE_TEXTS_FALLBACKS };
    for (const [key, value] of Object.entries(current)) { if (value && value.trim()) merged[key] = value; }
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS, JSON.stringify(merged));
  } catch { localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS, JSON.stringify(SITE_TEXTS_FALLBACKS)); }
  _siteTextsCache = null;

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
    window.addEventListener('scroll', () => btt.classList.toggle('show', window.scrollY > 400));
  }
  fetchProducts();
  home.syncLocalInfoToInputs?.();
  home.fetchAndApplyTexts?.();
  home.loadHistory?.();
  home.applyLocalConfig?.();
  initAdminSearchDebounce();
}

function initInlineEvents() {
  document.getElementById('btn-open-admin')?.addEventListener('click', openAdminLogin);
  document.getElementById('btn-lang')?.addEventListener('click', switchLanguage);
  document.getElementById('hamburger')?.addEventListener('click', toggleMenu);
  document.getElementById('btn-do-login')?.addEventListener('click', doLogin);
  document.getElementById('btn-close-login')?.addEventListener('click', closeAdminLogin);
  document.getElementById('btn-logout')?.addEventListener('click', doLogout);
  document.getElementById('adminPass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', e => switchAdminTab(e, btn.dataset.tab));
  });

  document.getElementById('btn-add-product')?.addEventListener('click', addProduct);
  document.getElementById('btn-bulk-upload')?.addEventListener('click', openBulkUpload);
  document.getElementById('btn-export-csv')?.addEventListener('click', exportProductsCSV);
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
  document.getElementById('btn-save-texts')?.addEventListener('click', saveSiteTexts);
  document.getElementById('btn-save-translations')?.addEventListener('click', saveAllTranslations);

  document.getElementById('btn-close-bulk')?.addEventListener('click', closeBulkUpload);
  document.getElementById('bulk-input')?.addEventListener('change', handleBulkFiles);
  document.getElementById('bulk-drop')?.addEventListener('click', () => document.getElementById('bulk-input')?.click());

  document.getElementById('trans-list')?.addEventListener('change', e => {
    const input = e.target.closest('input[data-key][data-lang]');
    if (input) window.updateTranslation(input);
  });

  document.getElementById('productModal')?.addEventListener('click', e => { if (e.target.id === 'productModal') closeProductModal(); });
  document.getElementById('btn-close-modal')?.addEventListener('click', closeProductModal);
  document.getElementById('btn-close-modal-2')?.addEventListener('click', closeProductModal);
  document.getElementById('btn-submit-budget')?.addEventListener('click', submitBudget);

  document.getElementById('info-ventajas-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action="remove-ventaja"]');
    if (btn) removeVentajaCard(parseInt(btn.dataset.index, 10));
  });

  initAdminProductEvents();
  initImageFallbacks();
}

const initApp = async () => {
  init();
  initMap();
  initWysiwyg();
  await initLanguage();
  applyTranslations();
  initInlineEvents();
  if (window.location.pathname.startsWith('/producto/')) handleProductRoute();
};

if (document.readyState === 'interactive' || document.readyState === 'complete') initApp();
else document.addEventListener('DOMContentLoaded', initApp);
