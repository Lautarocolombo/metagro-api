// home.js — Lógica de home, textos del sitio, dashboard, ventajas y configuración local
// Dependencias: config.js (APP_CONFIG), api.js (api, showToast, showError, escapeHtml)
// Dependencias de app.js: openProductModal, saveLocal, updateUnsavedIndicator, hasUnsavedChanges

const VENTAJAS_CONFIG = [
  { key: 'rapida',  icon: '⚡', defaultTitulo: 'Atención Rápida',     defaultDesc: 'Atendemos más rápido que la competencia. Tu tiempo en el campo vale.' },
  { key: 'cta',     icon: '🤝', defaultTitulo: 'Cuenta Corriente',    defaultDesc: 'Crédito para clientes habituales. Comprá hoy y pagá cuando puedas.' },
  { key: 'precios', icon: '💰', defaultTitulo: 'Mejores Precios',     defaultDesc: 'Precios competitivos respaldados por 43 años de trayectoria y volumen de compra.' },
  { key: 'stock',   icon: '📦', defaultTitulo: 'Stock Permanente',    defaultDesc: 'Amplia disponibilidad de productos para que no pares tu trabajo.' },
  { key: 'exp',     icon: '🏆', defaultTitulo: '43 Años de Experiencia', defaultDesc: 'Desde 1983 sirviendo al campo de Entre Ríos. Cartera de clientes fiel y reconocida.' },
  { key: 'agro',    icon: '🌿', defaultTitulo: 'Especialistas en el Agro', defaultDesc: 'Asesoramiento técnico real para cada necesidad del campo.' },
];

const SITE_TEXTS_FALLBACKS = Object.fromEntries(
  VENTAJAS_CONFIG.flatMap((v, i) => [
    [`vent_card_${i + 1}_icon`, v.icon],
    [`vent_card_${i + 1}_titulo`, v.defaultTitulo.toUpperCase()],
    [`vent_card_${i + 1}_desc`, v.defaultDesc],
  ]).concat([
    ['hero_linea_1', 'SIEMPRE JUNTO'],
    ['hero_linea_2', 'AL CAMPO.'],
    ['hero_desc', 'Insumos para la agroganadería, alambrados, molinos, aguadas y ferretería. Atención personalizada, precios competitivos y cuenta corriente para nuestros clientes.'],
    ['hero_numero', '43'],
    ['hero_etiqueta', 'AÑOS EN EL MERCADO'],
    ['vent_eyebrow', 'POR QUÉ ELEGIRNOS'],
    ['vent_titulo_1', 'VENTAJAS'],
    ['vent_titulo_2', 'METAGRO'],
    ['cont_eyebrow', 'CONTACTO'],
    ['cont_titulo_1', '¿NECESITAS UN PRODUCTO?'],
    ['cont_titulo_2', 'CONSULTANOS.'],
    ['cont_desc', 'Ya sea para tu estancia, chacra o trabajo profesional, en Metagro SRL te asesoramos sin compromiso. Respondemos rapido por WhatsApp o por telefono.'],
    ['footer_tagline', 'Siempre junto al campo • Desde 1983'],
  ])
);

const HERO_CONTENT_IDS = ['hero_linea_1', 'hero_linea_2', 'hero_desc', 'hero_numero', 'hero_etiqueta'];
const VENT_TITLE_IDS = ['vent_eyebrow', 'vent_titulo_1', 'vent_titulo_2'];

function getStorageHistory() {
  try { return JSON.parse(localStorage.getItem('mg_site_texts_history') || '[]'); } catch { return []; }
}

function addHistoryEntry(prev, next) {
  const history = getStorageHistory();
  const changes = [];
  const keys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);
  for (const key of keys) {
    const oldV = (prev && prev[key]) || '';
    const newV = (next && next[key]) || '';
    if (oldV !== newV) changes.push({ key, oldVal: oldV, newVal: newV });
  }
  if (!changes.length) return;
  history.unshift({ date: new Date().toISOString(), changes });
  if (history.length > 50) history.length = 50;
  localStorage.setItem('mg_site_texts_history', JSON.stringify(history));
  loadHistory();
}

let _siteTextsCache = null;

function getSiteTexts() {
  if (_siteTextsCache) return _siteTextsCache;
  try {
    const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Object.keys(parsed).length) {
        _siteTextsCache = { ...SITE_TEXTS_FALLBACKS, ...parsed };
        return _siteTextsCache;
      }
    }
  } catch { /* ignore */ }
  return SITE_TEXTS_FALLBACKS;
}

function invalidateSiteTextsCache() {
  _siteTextsCache = null;
}

function g(key) {
  const texts = getSiteTexts();
  return texts[key] || SITE_TEXTS_FALLBACKS[key] || '';
}

function qs(selector, ctx = document) { return ctx.querySelector(selector) || null; }
function qsa(selector, ctx = document) { return Array.from(ctx.querySelectorAll(selector)); }

async function loadSiteTextsIntoTab() {
  try {
    const heroLinea1El = qs('#txt-hero-linea-1');
    const heroLinea2El = qs('#txt-hero-linea-2');
    const heroDescEl    = qs('#txt-hero-desc');
    const heroNumeroEl  = qs('#txt-hero-numero');
    const heroEtiquetaEl = qs('#txt-hero-etiqueta');

    if (heroLinea1El) heroLinea1El.value = g('hero_linea_1');
    if (heroLinea2El) heroLinea2El.value = g('hero_linea_2');
    if (heroDescEl) heroDescEl.innerText = g('hero_desc');
    if (heroNumeroEl)  heroNumeroEl.value  = g('hero_numero');
    if (heroEtiquetaEl) heroEtiquetaEl.value = g('hero_etiqueta');

    const ventEyebrowEl  = qs('#txt-vent-eyebrow');
    const ventTitulo1El  = qs('#txt-vent-titulo-1');
    const ventTitulo2El  = qs('#txt-vent-titulo-2');
    if (ventEyebrowEl) ventEyebrowEl.value = g('vent_eyebrow');
    if (ventTitulo1El) ventTitulo1El.value = g('vent_titulo_1');
    if (ventTitulo2El) ventTitulo2El.value = g('vent_titulo_2');

    const grid = qs('#info-ventajas-grid');
    if (!grid) return;
    const ventajasCards = VENTAJAS_CONFIG.map((v, i) => ({
      icon: g(`vent_card_${i + 1}_icon`) || v.icon,
      titulo: g(`vent_card_${i + 1}_titulo`),
      descripcion: g(`vent_card_${i + 1}_desc`),
    }));

    grid.innerHTML = ventajasCards.map((c, idx) => `
      <div class="ventaja-card" data-index="${idx}">
        <div class="ventaja-card-header">
          <span class="ventaja-card-num">Tarjeta #${idx + 1}</span>
          <button data-action="remove-ventaja" data-index="${idx}" class="btn-remove-card">🗑️ Eliminar</button>
        </div>
        <label class="admin-label">Icono (emoji)</label>
        <input class="admin-input ventaja-icon" data-index="${idx}" value="${escapeHtml(c.icon || '')}" placeholder="?" />
        <label class="admin-label">Título</label>
        <input class="admin-input ventaja-titulo" data-index="${idx}" value="${escapeHtml(c.titulo || '')}" placeholder="Atención Rápida" />
        <label class="admin-label">Descripción</label>
        <div class="admin-textarea wysiwyg ventaja-desc" data-index="${idx}" contenteditable="true">${escapeHtml(c.descripcion || '')}</div>
      </div>
    `).join('');
    initWysiwyg();
  } catch {
    showToast('Error al cargar los textos', 'error');
    const grid = qs('#info-ventajas-grid');
    if (grid) grid.style.background = '#c0392b';
  }
}

function addVentajaCard() {
  const grid = qs('#info-ventajas-grid');
  if (!grid) return;
  const newIndex = grid.querySelectorAll('.ventaja-card').length;
  grid.insertAdjacentHTML('beforeend', `
    <div class="ventaja-card" data-index="${newIndex}">
      <div class="ventaja-card-header">
        <span class="ventaja-card-num">Tarjeta #${newIndex + 1}</span>
        <button data-action="remove-ventaja" data-index="${newIndex}" class="btn-remove-card">🗑️ Eliminar</button>
      </div>
      <label class="admin-label">Icono (emoji)</label>
      <input class="admin-input ventaja-icon" data-index="${newIndex}" value="" placeholder="⚡" />
      <label class="admin-label">Título</label>
      <input class="admin-input ventaja-titulo" data-index="${newIndex}" value="" placeholder="Nuevo beneficio" />
      <label class="admin-label">Descripción</label>
      <div class="admin-textarea wysiwyg ventaja-desc" data-index="${newIndex}" contenteditable="true"></div>
    </div>
  `);
  initWysiwyg();
}

function removeVentajaCard(index) {
  const card = qs(`.ventaja-card[data-index="${index}"]`);
  if (card) card.remove();
}

async function saveSiteTexts() {
  const texts = { ...getSiteTexts() };

  const getVal = (id, key) => {
    const el = qs(`#${id}`);
    if (!el) return;
    texts[key] = el.tagName === 'DIV' ? (el.innerText || el.textContent || '') : el.value;
  };

  HERO_CONTENT_IDS.forEach((id, i) => {
    const keys = ['hero_linea_1', 'hero_linea_2', 'hero_desc', 'hero_numero', 'hero_etiqueta'];
    getVal(`txt-hero-${['linea-1', 'linea-2', 'desc', 'numero', 'etiqueta'][i]}`, keys[i]);
  });
  VENT_TITLE_IDS.forEach((id, i) => {
    getVal(`txt-vent-${['eyebrow', 'titulo-1', 'titulo-2'][i]}`, id);
  });

  const grid = qs('#info-ventajas-grid');
  if (grid) {
    const cards = qsa('.ventaja-card', grid).map((card, i) => ({
      icon: qs('.ventaja-icon', card)?.value || '',
      titulo: qs('.ventaja-titulo', card)?.value || '',
      descripcion: qs('.ventaja-desc', card)?.innerText || qs('.ventaja-desc', card)?.value || '',
    })).filter(c => c.titulo.trim());

    cards.forEach((c, i) => {
      texts[`vent_card_${i + 1}_icon`] = c.icon;
      texts[`vent_card_${i + 1}_titulo`] = c.titulo;
      texts[`vent_card_${i + 1}_desc`] = c.descripcion;
    });
    for (let i = cards.length + 1; i <= 6; i++) {
      delete texts[`vent_card_${i}_icon`];
      delete texts[`vent_card_${i}_titulo`];
      delete texts[`vent_card_${i}_desc`];
    }
  }

  const prevTexts = getSiteTexts();
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS, JSON.stringify(texts));
  invalidateSiteTextsCache();
  addHistoryEntry(prevTexts, texts);
  fetchAndApplyTexts();
  await Promise.allSettled(
    Object.entries(texts).map(([key, value]) =>
      api(`/site-texts/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      }).catch(e => ({ status: 'rejected', reason: e }))
    )
  );
  showToast('✓ Todos los textos guardados');
}

function loadHistory() {
  // Busca en ambos IDs posibles por compatibilidad
  const container = qs('#leyendas-history') || qs('#info-history');
  if (!container) return;
  const history = getStorageHistory();
  if (!history.length) {
    container.innerHTML = '<p class="admin-empty">Sin cambios registrados</p>';
    return;
  }
  container.innerHTML = history.map(entry => {
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString('es-AR') + ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return `<div style="margin-bottom:1rem;padding-bottom:.8rem;border-bottom:1px solid #222;">
      <div style="color:#aaa;font-size:.75rem;margin-bottom:.4rem;">📅 ${dateStr}</div>
      ${entry.changes.map(c => {
        const label = c.key.replace(/_/g, ' ').toUpperCase();
        return `<div style="margin-bottom:.4rem;padding:.4rem;background:#111;border-left:2px solid var(--yellow);font-size:.82rem;">
          <strong style="color:var(--yellow);">${escapeHtml(label)}</strong><br/>
          <span style="color:#888;">Antes:</span> ${escapeHtml(c.oldVal || '(vacío)')}<br/>
          <span style="color:#4caf50;">Ahora:</span> ${escapeHtml(c.newVal || '(vacío)')}
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
}

async function loadDashboard() {
  try {
    const token = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['x-mg-token'] = token;
    const res = await fetch(`${APP_CONFIG.API_BASE}/analytics/dashboard`, { headers });
    const data = await res.json();
    if (!data.ok) throw new Error('Failed to load dashboard');
    const stats = data.stats || {};
    qs('#dash-products').textContent = stats.products || 0;
    qs('#dash-views').textContent = (stats.views || 0).toLocaleString();
    qs('#dash-budgets').textContent = stats.budgets || 0;
    qs('#dash-changes').textContent = stats.changes7d || 0;
    if (window.Chart) {
      if (window.topProductsChart) window.topProductsChart.destroy();
      if (window.topSearchesChart) window.topSearchesChart.destroy();
      const topProducts = (data.topProducts || []).slice(0, 5);
      const topSearches = (data.topSearches || []).slice(0, 5);
      window.topProductsChart = new Chart(qs('#chart-top-products'), {
        type: 'bar',
        data: {
          labels: topProducts.map(p => p.name || `Producto ${p.id}`),
          datasets: [{ label: 'Visitas', data: topProducts.map(p => p.visits || 0), backgroundColor: '#F5C800' }],
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#aaa' } }, x: { ticks: { color: '#aaa' } } } },
      });
      window.topSearchesChart = new Chart(qs('#chart-top-searches'), {
        type: 'bar',
        data: {
          labels: topSearches.map(s => s.q || ''),
          datasets: [{ label: 'Búsquedas', data: topSearches.map(s => parseInt(s.c || 0)), backgroundColor: '#27ae60' }],
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { color: '#aaa' } }, x: { ticks: { color: '#aaa' } } } },
      });
    }
  } catch (e) { console.error('[dashboard] error:', e); }
}

function fetchAndApplyTexts() {
  const heroTitle = qs('.hero-title');
  if (heroTitle) heroTitle.innerHTML = `${escapeHtml(g('hero_linea_1'))}<br/>${escapeHtml(g('hero_linea_2'))}`;

  const f = (sel, val) => { const el = qs(sel); if (el) el.textContent = val; };
  f('.hero-desc', g('hero_desc'));
  f('.hero-eyebrow', g('hero_eyebrow'));

  const heroBtns = qsa('.hero-actions a');
  if (heroBtns[0]) heroBtns[0].textContent = g('hero_btn1') || 'Ver Productos';
  if (heroBtns[1]) heroBtns[1].textContent = g('hero_btn2') || 'Contactarnos';

  f('.stat-number', g('hero_numero'));
  f('.stat-label', g('hero_etiqueta'));

  const ventEyebrow = qs('#ventajas .section-label');
  if (ventEyebrow) ventEyebrow.textContent = g('vent_eyebrow');

  const ventTitulo = qs('#ventajas .section-title');
  if (ventTitulo) ventTitulo.innerHTML = `${escapeHtml(g('vent_titulo_1'))} <span>${escapeHtml(g('vent_titulo_2'))}</span>`;

  qsa('.vent-item').forEach((item, i) => {
    qs('.vent-title', item) && (item.querySelector('.vent-title').textContent = g(`vent_card_${i + 1}_titulo`));
    qs('.vent-desc', item) && (item.querySelector('.vent-desc').textContent = g(`vent_card_${i + 1}_desc`));
    const iconEl = qs('.vent-icon', item);
    if (iconEl && VENTAJAS_CONFIG[i]) iconEl.textContent = VENTAJAS_CONFIG[i].icon || '';
  });

  f('#contacto .section-label', g('cont_eyebrow'));
  const contTitle = qs('#contacto .section-title');
  if (contTitle) contTitle.innerHTML = `${escapeHtml(g('cont_titulo_1'))}<br/>${escapeHtml(g('cont_titulo_2'))}`;
  f('.cta-desc', g('cont_desc'));
  f('.footer-tagline', g('footer_tagline'));
}

function applyRoleVisibility() {
  const role = sessionStorage.getItem('mg_admin_role') || 'admin';
  qsa('[data-role]').forEach(el => el.style.display = el.dataset.role.split(',').includes(role) ? '' : 'none');
}

function doLogout() {
  if (hasUnsavedChanges && !confirm('Tenés cambios sin guardar. ¿Estás seguro que querés salir?')) return;
  hasUnsavedChanges = false;
  updateUnsavedIndicator();
  sessionStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
  sessionStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  qs('#adminPanel')?.classList.remove('open');
}

function updateProductSEO(p) {
  if (!p) return;
  const base = window.location.origin;
  const title = p.seo?.title || `${p.name || 'Producto'} | Metagro SRL`;
  const desc = p.seo?.description || p.desc || 'Insumos para el agro en Gualeguay, Entre Ríos.';
  const img = p.seo?.image || p.img || '';
  const url = p.seo?.url || `${base}/productos/${p.id}`;

  document.title = title;

  const setMeta = (attr, content) => {
    const isProp = attr.startsWith('property');
    const name = isProp ? attr.slice(9) : attr.slice(5);
    let el = qs(`[${attr}]`);
    if (!el) { el = document.createElement(isProp ? 'meta' : 'meta'); el.setAttribute(name, name); document.head.appendChild(el); }
    el.content = content;
  };

  setMeta('name="description"', desc);
  setMeta('property="og:title"', title);
  setMeta('property="og:description"', desc);

  const ogImg = qs('meta[property="og:image"]');
  if (ogImg) ogImg.content = img; else { const m = document.createElement('meta'); m.setAttribute('property', 'og:image'); m.content = img; document.head.appendChild(m); }

  const canonical = qs('link[rel="canonical"]');
  if (canonical) canonical.href = url;
}

function openProductModal(p) {
  updateProductSEO(p);
  qs('#modalName').textContent = p.name || '';
  qs('#modalDesc').textContent = p.desc || '';
  qs('#modalTag').textContent = p.tag || 'Producto';
  const imgWrap = qs('#modalImage');
  if (p.img) {
    imgWrap.innerHTML = `<img src="${encodeImgPath(p.img)}" alt="${escapeHtml(p.name || '')}" data-icon="${escapeHtml(p.icon || '📦')}" />`;
  } else {
    imgWrap.innerHTML = `<span style="font-size:4rem">${escapeHtml(p.icon || '📦')}</span>`;
  }
  const cfg = (() => { try { return JSON.parse(localStorage.getItem('mg_config') || '{}'); } catch { return {}; } })();
  const waNum = cfg.wa || '5403444466919';
  qs('#modalWa').href = `https://wa.me/${waNum}?text=${encodeURIComponent(`Hola Metagro! Quiero consultar por: ${p.name || 'producto'}. ¿Tienen stock y precio?`)}`;
  qs('#productModal').classList.add('open');
}

function closeProductModal() { qs('#productModal')?.classList.remove('open'); }

async function submitBudget() {
  const cliente   = qs('#budget-cliente')?.value?.trim();
  const email     = qs('#budget-email')?.value?.trim();
  const cantidad  = parseInt(qs('#budget-cantidad')?.value || '1', 10);
  const notas     = qs('#budget-notas')?.value?.trim() || '';
  const productName = qs('#modalName')?.textContent || '';
  if (!cliente || !email) { showToast('Por favor completá nombre y email', 'error'); return; }
  try {
    const res = await api('/v2/budget', {
      method: 'POST',
      body: JSON.stringify({ cliente, email, items: [{ name: productName, qty: cantidad, obs: notas }], notas }),
    });
    const data = await res.json();
    if (data.ok) { showToast('✓ Presupuesto solicitado correctamente'); closeProductModal(); }
    else showToast('Error al enviar presupuesto', 'error');
  } catch { showToast('Error de conexión', 'error'); }
}

function syncLocalInfoToInputs() {
  const cfg = (() => { try { return JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS) || '{}'); } catch { return {}; } })();
  const map = {
    'cfg-tel': 'tel', 'cfg-wa': 'wa', 'cfg-horario1': 'horario1',
    'cfg-horario2': 'horario2', 'cfg-dir': 'dir', 'cfg-wamsg': 'wamsg',
    'cfg-admin-user': 'adminUser',
  };
  for (const [id, key] of Object.entries(map)) {
    const el = qs(`#${id}`);
    if (el && cfg[key]) el.value = cfg[key];
  }
}

async function saveLocalInfo() {
  const adminPass = qs('#cfg-admin-pass')?.value || '';
  const cfg = {
    tel: qs('#cfg-tel')?.value || '',
    wa:  qs('#cfg-wa')?.value || '',
    horario1: qs('#cfg-horario1')?.value || '',
    horario2: qs('#cfg-horario2')?.value || '',
    dir:  qs('#cfg-dir')?.value || '',
    wamsg: qs('#cfg-wamsg')?.value || '',
  };
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS, JSON.stringify(cfg));
  invalidateSiteTextsCache();
  try {
    const payload = adminPass ? { ...cfg, adminPass } : cfg;
    await api('/guardar-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } catch {
    showToast('No se pudo guardar la config en el servidor', 'error');
  }
  qs('#cfg-admin-pass').value = '';
  const msg = qs('#save-msg-local');
  if (msg) { msg.classList.add('show'); setTimeout(() => msg.classList.remove('show'), 2000); }
}

// Expuesto globalmente para app.js
window.home = { getSiteTexts, fetchAndApplyTexts, syncLocalInfoToInputs, saveSiteTexts, applyLocalConfig, SITE_TEXTS_FALLBACKS };

function applyLocalConfig() {
  const cfg = (() => { try { return JSON.parse(localStorage.getItem('mg_config') || '{}'); } catch { return {}; } })();
  const waBase = 'https://wa.me/' + (cfg.wa || '5403444466919') + '?text=' + encodeURIComponent(cfg.wamsg || 'Hola Metagro!');
  qsa('[data-wa-href]').forEach(el => { el.href = waBase; });
  qsa('[data-tel-href]').forEach(el => {
    el.href = 'tel:+' + (cfg.tel || '5403444466919').replace(/\D/g, '');
    if (el.childNodes.length === 1 && el.firstChild.nodeType === 3) {
      el.textContent = cfg.tel || '03444 - 466919';
    }
  });
  const dirEl = qs('[data-dir-text]');
  if (dirEl && cfg.dir) dirEl.textContent = cfg.dir;
  const horEl = qs('[data-horario-text]');
  if (horEl && cfg.horario1 && cfg.horario2) {
    horEl.innerHTML = escapeHtml(cfg.horario1 || '') + '<br/>' + escapeHtml(cfg.horario2 || '');
  }
}

window.home = { getSiteTexts, fetchAndApplyTexts, syncLocalInfoToInputs, saveSiteTexts, applyLocalConfig, SITE_TEXTS_FALLBACKS };
