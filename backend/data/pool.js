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

const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const dbUrl = sanitizeDbUrl(rawUrl);
if (!dbUrl) {
  console.error('[DB] ERROR: No se encontró DATABASE_URL ni POSTGRES_URL.');
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
  console.error('[DB] Pool error:', err);
});

module.exports = { pool };
