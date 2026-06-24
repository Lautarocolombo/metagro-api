import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const envPath = join(process.cwd(), 'backend', '.env');
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m)     process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch {}

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
  console.error('ERROR: Define POSTGRES_URL en backend/.env');
  process.exit(1);
}

const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
const match = html.match(/window\.DEFAULT_PRODUCTS\s*=\s*(\[.*?\]);/s);
if (!match) {
  console.error('No se encontró window.DEFAULT_PRODUCTS en index.html');
  process.exit(1);
}

const products = JSON.parse(match[1]);
console.log(`→ Extrayendo ${products.length} productos de index.html...\n`);

const pool = new Pool({ connectionString: POSTGRES_URL, ssl: { rejectUnauthorized: false } });

async function seed() {
  let success = 0, updated = 0, errors = 0;

  for (const p of products) {
    try {
      const allImages = Array.isArray(p.images) ? p.images : (p.img ? [p.img] : []);
      const mainImg = allImages[0] || '';

      await pool.query(
        `INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           categoria = EXCLUDED.categoria,
           nombre = EXCLUDED.nombre,
           descripcion = EXCLUDED.descripcion,
           especificaciones = EXCLUDED.especificaciones,
           imagen_url = EXCLUDED.imagen_url`,
        [p.id, p.tag || 'General', p.name || '', p.desc || '', p.desc || '', mainImg]
      );

      await pool.query('DELETE FROM product_images WHERE product_id = $1', [p.id]);
      for (const img of allImages) {
        if (!img || typeof img !== 'string') continue;
        await pool.query('INSERT INTO product_images (product_id, url) VALUES ($1, $2)', [p.id, img]);
      }

      success++;
      process.stdout.write(`\r  Procesados: ${success + updated + errors}/${products.length}`);
    } catch (e) {
      errors++;
      console.error(`\n  ✗ ID ${p.id}: ${e.message}`);
    }
  }

  const count = await pool.query('SELECT COUNT(*) FROM productos_ganaderos');
  console.log(`\n\n✅ Seed completado. Total en DB: ${count.rows[0].count}`);
  await pool.end();
}

seed().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
