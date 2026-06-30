// Traducciones y lógica de idioma
// Dependencias: config.js (APP_CONFIG)

let currentLang = 'es';
let translations = {};

function detectLanguage() {
  const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.LANG);
  if (saved) return saved;
  const navLang = (navigator.language || navigator.userLanguage || 'es').split('-')[0];
  return ['es', 'en'].includes(navLang) ? navLang : 'es';
}

async function fetchTranslations(lang) {
  try {
    const res = await fetch(`${APP_CONFIG.API_BASE}/translations?lang=${lang}`);
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
  localStorage.setItem(APP_CONFIG.STORAGE_KEYS.LANG, currentLang);
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
