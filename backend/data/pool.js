const { Pool } = require('pg');

function sanitizeDbUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.delete('channel_binding');
    u.searchParams.set('sslmode', 'require');
    return u.toString();
  } catch {
    return url.replace(/[&?]channel_binding=[^&]*/g, '').replace(/[&?]sslmode=[^&]*/g, '') + '&sslmode=require';
  }
}

const rawUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const dbUrl = sanitizeDbUrl(rawUrl);
if (!dbUrl) {
  console.error('[DB] ERROR: No se encontró DATABASE_URL ni POSTGRES_URL.');
} else {
  let safeHost = 'unknown';
  try {
    safeHost = new URL(rawUrl).hostname;
  } catch (_) {}
  console.log('[DB] Usando base de datos:', safeHost);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: rawUrl && (rawUrl.includes('neon.tech') || rawUrl.includes('render.com') || rawUrl.includes('sslmode=require'))
    ? { rejectUnauthorized: false }
    : false,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err.code, err.message);
});

module.exports = { pool };

async function checkDbConnection() {
  try {
    const result = await pool.query('SELECT NOW() as now, version() as version');
    console.log('[DB] Conexión OK:', result.rows[0]);
    return true;
  } catch (e) {
    console.error('[DB] ERROR de conexión:', e.code, e.message);
    return false;
  }
}

// Testear conexión al iniciar
checkDbConnection().then(ok => {
  console.log('[DB] Test de conexión:', ok ? 'EXITOSO' : 'FALLIDO');
});

setInterval(() => checkDbConnection().then(ok => {
  if (!ok) console.warn('[DB] Reintentando conexión...');
}), 30000);

module.exports = { pool, checkDbConnection, sanitizeDbUrl };
