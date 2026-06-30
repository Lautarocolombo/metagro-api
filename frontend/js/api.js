// API wrapper con AbortController y retry logic
// Dependencias: config.js (APP_CONFIG)

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
  if (token) headers['x-mg-token'] = token;
  const ctrl = opts.signal ? { signal: opts.signal } : {};
  const res = await fetch(APP_CONFIG.API_BASE + path, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    ...ctrl
  });
  if (!res.ok) throw new Error('API ' + res.status);
  return res;
}

async function tryRefreshToken() {
  const refreshToken = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${APP_CONFIG.API_BASE}/admin/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await res.json();
    if (data.token) {
      sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.ADMIN_TOKEN, data.token);
      if (data.refreshToken) sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      return true;
    }
  } catch (e) {
    console.error('[api] refresh failed:', e);
  }
  return false;
}
