// home.js — Lógica de home, textos del sitio, dashboard, ventajas y configuración local
// Dependencias: config.js (APP_CONFIG), api.js (api, showToast, showError, escapeHtml)

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
  'vent_card_6_desc': 'Conocemos el campo. Asesoramiento técnico real para cada necesidad.',
  'cont_eyebrow': 'CONTACTO',
  'cont_titulo_1': '¿NECESITAS UN PRODUCTO?',
  'cont_titulo_2': 'CONSULTANOS.',
  'cont_desc': 'Ya sea para tu estancia, chacra o trabajo profesional, en Metagro SRL te asesoramos sin compromiso. Respondemos rapido por WhatsApp o por telefono.',
  'footer_tagline': 'Siempre junto al campo • Desde 1983'
};

const HOME_CONTENT_JSON = [
  { "id": "hero_title", "valor": "Soluciones para el campo", "categoria": "hero", "descripcion": "Título principal del hero" },
  { "id": "hero_subtitle", "valor": "Insumos ganaderos, alambrados y herramientas para tu estancia o chacra.", "categoria": "hero", "descripcion": "Subtítulo del hero" },
  { "id": "hero_btn_products", "valor": "VER PRODUCTOS", "categoria": "hero", "descripcion": "Botón ver productos" },
  { "id": "hero_btn_contact", "valor": "CONTACTARNOS", "categoria": "hero", "descripcion": "Botón contactarnos" },
  { "id": "hero_years", "valor": "43 AÑOS EN", "categoria": "hero", "descripcion": "Badge años en el mercado" },
  { "id": "benefit_rapida_titulo", "valor": "Atención Rápida", "categoria": "beneficios", "descripcion": "Tarjeta 1 - Título" },
  { "id": "benefit_rapida_desc", "valor": "Atendemos más rápido que la competencia. Tu tiempo en el campo vale.", "categoria": "beneficios", "descripcion": "Tarjeta 1 - Descripción" },
  { "id": "benefit_cta_titulo", "valor": "Cuenta Corriente", "categoria": "beneficios", "descripcion": "Tarjeta 2 - Título" },
  { "id": "benefit_cta_desc", "valor": "Crédito para clientes habituales. Comprá hoy y pagá cuando puedas.", "categoria": "beneficios", "descripcion": "Tarjeta 2 - Descripción" },
  { "id": "benefit_precios_titulo", "valor": "Mejores Precios", "categoria": "beneficios", "descripcion": "Tarjeta 3 - Título" },
  { "id": "benefit_precios_desc", "valor": "Precios competitivos respaldados por 43 años de trayectoria y volumen de compra.", "categoria": "beneficios", "descripcion": "Tarjeta 3 - Descripción" },
  { "id": "benefit_stock_titulo", "valor": "Stock Permanente", "categoria": "beneficios", "descripcion": "Tarjeta 4 - Título" },
  { "id": "benefit_stock_desc", "valor": "Amplia disponibilidad de productos para que no pares tu trabajo.", "categoria": "beneficios", "descripcion": "Tarjeta 4 - Descripción" },
  { "id": "benefit_exp_titulo", "valor": "43 Años de Experiencia", "categoria": "beneficios", "descripcion": "Tarjeta 5 - Título" },
  { "id": "benefit_exp_desc", "valor": "Desde 1983 sirviendo al campo de Entre Ríos. Cartera de clientes fiel y reconocida.", "categoria": "beneficios", "descripcion": "Tarjeta 5 - Descripción" },
  { "id": "benefit_agro_titulo", "valor": "Especialistas en el Agro", "categoria": "beneficios", "descripcion": "Tarjeta 6 - Título" },
  { "id": "benefit_agro_desc", "valor": "Conocemos el campo. Asesoramiento técnico real para cada necesidad.", "categoria": "beneficios", "descripcion": "Tarjeta 6 - Descripción" },
  { "id": "guardar-config", "valor": "{\"tel\":\"03444 – 466919\",\"wa\":\"5403444466919\",\"horario1\":\"Lunes a Viernes: 8:00 – 12:00 / 15:00 – 19:00\",\"horario2\":\"Sábados: 8:00 – 12:00\",\"dir\":\"Gualeguay, Entre Ríos · Argentina · CP 2840\",\"wamsg\":\"Hola Metagro! Quiero consultar sobre sus productos.\",\"adminUser\":\"metagro\",\"adminPass\":\"montealegre22\"}", "categoria": "config", "descripcion": "Configuración guardada" }
];

function getSiteTexts() {
  try {
    const raw = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Object.keys(parsed).length) return parsed;
    }
  } catch(e) { /* ignore */ }
  const homeMap = {};
  (HOME_CONTENT_JSON || []).forEach(row => { homeMap[row.id] = row.valor; });
  const merged = { ...SITE_TEXTS_FALLBACKS, ...homeMap };
  return merged;
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
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS, JSON.stringify(texts));
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
    const token = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['x-mg-token'] = token;
    const res = await fetch(`${APP_CONFIG.API_BASE}/analytics/dashboard`, { headers });
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
  sessionStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
  sessionStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
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
  const waNum = (() => { try { return JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS) || '{}').wa || '5403444466919'; } catch(e) { return '5403444466919'; } })();
  const waText = encodeURIComponent(`Hola Metagro! Quiero consultar por: ${p.name || 'producto'}. ¿Tienen stock y precio?`);
  document.getElementById('modalWa').href = `https://wa.me/${waNum}?text=${waText}`;
  document.getElementById('productModal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

function syncFromDB() {
  const btn = document.getElementById('btn-sync-db');
  if (btn) btn.textContent = 'Sincronizando...';
  localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.PRODUCTS);
  useApi = true;
  fetchProducts().then(() => {
    originalProducts = JSON.parse(JSON.stringify(products));
    renderAdminProducts();
    const countEl = document.getElementById('prod-count-bar');
    if (countEl) countEl.textContent = products.length + ' productos cargados';
    if (btn) btn.textContent = 'Sincronizar DB';
    showToast('✓ ' + products.length + ' productos cargados desde la DB');
  });
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

function syncLocalInfoToInputs() {
  const cfg = (() => { try { return JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS) || '{}'); } catch (e) { return {}; } })();
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
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS, JSON.stringify(safe));
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

function applyLocalConfig() {
  const cfg = (() => { try { return JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SITE_TEXTS) || '{}'); } catch(e) { return {}; } })();
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
