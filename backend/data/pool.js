const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error('[Pool] ERROR: No se encontró DATABASE_URL ni POSTGRES_URL. El servidor no puede conectarse a la base de datos.');
}
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[Pool] Unexpected error:', err);
});

module.exports = pool;
