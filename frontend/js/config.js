// Configuración centralizada de la aplicación
window.APP_CONFIG = {
  API_BASE:
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:4000/api'
      : window.location.origin + '/api',
  ITEMS_PER_PAGE: 24,
  FALLBACK_PRODUCTS_URL: '/products.json',
  FALLBACK_HOME_URL: '/home-content.json',
  STORAGE_KEYS: {
    PRODUCTS: 'mg_products',
    LANG: 'mg_lang',
    SITE_TEXTS: 'mg_site_texts',
    ADMIN_TOKEN: 'mg_admin_token',
    REFRESH_TOKEN: 'mg_refresh_token',
  },
  RETRY_DELAY_BASE: 2000,
  FETCH_TIMEOUT: 6000,
  MAX_RETRIES: 3,
};
