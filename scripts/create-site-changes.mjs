import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const envPath = join(process.cwd(), 'backend', '.env');
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch {}

const url = process.env.POSTGRES_URL;
if (!url) { console.error('ERROR: Define POSTGRES_URL en backend/.env'); process.exit(1); }

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function migrate() {
  console.log('→ Creando tabla site_changes...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_changes (
      id SERIAL PRIMARY KEY,
      tipo VARCHAR(50) NOT NULL,
      descripcion TEXT NOT NULL,
      datos JSONB,
      usuario VARCHAR(100),
      ip_address VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_site_changes_created_at ON site_changes(created_at DESC)');
  console.log('✓ Tabla site_changes creada');
  await pool.end();
}

migrate().catch(e => { console.error(e); process.exit(1) });
