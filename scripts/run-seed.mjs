import { readFileSync } from 'fs';
import { Pool } from 'pg';

function loadEnv() {
  try {
    const envPath = 'C:/Users/Lautaro Colombo/Desktop/Proyectos/proyectos en armados/metagro 2.1/backend/.env';
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...valParts] = trimmed.split('=');
      if (key && valParts.length) {
        process.env[key.trim()] = valParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (e) {
    console.warn('No se pudo leer .env del backend, se usará POSTGRES_URL del sistema.');
  }
}

loadEnv();

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
  console.error('ERROR: Definí POSTGRES_URL en backend/.env o como variable de entorno.');
  process.exit(1);
}

const sql = readFileSync('sql/seed-productos-all.sql', 'utf8');

const pool = new Pool({ connectionString: POSTGRES_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✓ Seed ejecutado correctamente.');
    
    const res = await client.query('SELECT count(*) FROM productos_ganaderos');
    console.log('Productos en la DB:', res.rows[0].count);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error ejecutando seed:', e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
