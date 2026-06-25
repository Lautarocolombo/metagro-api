import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

function readEnv() {
  const env = {};
  fs.readFileSync(path.join(process.cwd(), 'backend', '.env'), 'utf8')
    .split('\n')
    .forEach(line => {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  return env;
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function extractProductsFromAppJs() {
  const appJsPath = path.join(process.cwd(), 'frontend', 'js', 'app.js');
  const content = fs.readFileSync(appJsPath, 'utf8');
  const match = content.match(/window\.DEFAULT_PRODUCTS\s*=\s*(\[.*?\])\s*;/s);
  if (!match) {
    console.error('No se encontró window.DEFAULT_PRODUCTS en frontend/js/app.js');
    process.exit(1);
  }
  const products = JSON.parse(match[1]);
  return products.map(p => ({
    id: p.id,
    nombre: p.name || '',
    descripcion: p.desc || '',
    categoria: p.tag || 'General',
  }));
}

(async () => {
  const env = readEnv();
  const pool = new Pool({ connectionString: env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });

  const products = extractProductsFromAppJs();
  console.log(`Productos en app.js: ${products.length}`);

  // Get all current DB products
  const { rows: dbProducts } = await pool.query('SELECT id, nombre FROM productos_ganaderos ORDER BY id');
  console.log(`Productos actuales en DB: ${dbProducts.length}`);

  const appJsIds = new Set(products.map(p => p.id));
  const dbIds = new Set(dbProducts.map(p => p.id));

  // Find products in DB but not in app.js -> delete
  const toDelete = dbProducts.filter(p => !appJsIds.has(p.id));
  // Find products in app.js but not in DB -> insert
  const toInsert = products.filter(p => !dbIds.has(p.id));

  console.log(`A eliminar de DB: ${toDelete.length}`);
  console.log(`A insertar en DB: ${toInsert.length}`);

  // Delete extras
  if (toDelete.length > 0) {
    console.log('Eliminando productos sobrantes...');
    for (const p of toDelete) {
      await pool.query('DELETE FROM product_images WHERE product_id = $1', [p.id]);
      await pool.query('DELETE FROM productos_ganaderos WHERE id = $1', [p.id]);
    }
    console.log(`Eliminados ${toDelete.length} productos sobrantes.`);
  }

  // Insert missing with upsert
  if (toInsert.length > 0) {
    console.log('Insertando faltantes...');
    for (const p of toInsert) {
      await pool.query(
        `INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url)
         VALUES ($1, $2, $3, $4, $4, '')
         ON CONFLICT (id) DO UPDATE SET
          categoria = EXCLUDED.categoria,
          nombre = EXCLUDED.nombre,
          descripcion = EXCLUDED.descripcion,
          especificaciones = EXCLUDED.especificaciones`,
        [p.id, p.categoria, p.nombre, p.descripcion]
      );
    }
    console.log(`Insertados ${toInsert.length} productos faltantes.`);
  }

  // Normalize categories for existing products
  const appJsMap = new Map(products.map(p => [p.id, p]));
  const { rows: allDb } = await pool.query('SELECT id, categoria, nombre, descripcion FROM productos_ganaderos ORDER BY id');
  let normalized = 0;
  for (const row of allDb) {
    const canonical = appJsMap.get(row.id);
    if (canonical && (row.categoria !== canonical.categoria || row.nombre !== canonical.nombre || row.descripcion !== canonical.descripcion)) {
      await pool.query(
        'UPDATE productos_ganaderos SET categoria = $1, nombre = $2, descripcion = $3 WHERE id = $4',
        [canonical.categoria, canonical.nombre, canonical.descripcion, row.id]
      );
      normalized++;
    }
  }
  console.log(`Normalizados ${normalized} productos existentes.`);

  const { rows: finalCount } = await pool.query('SELECT count(*) as n FROM productos_ganaderos');
  console.log(`Total final en DB: ${finalCount[0].n}`);
  const { rows: imgCount } = await pool.query("SELECT count(*) as n FROM productos_ganaderos WHERE imagen_url IS NOT NULL AND imagen_url != ''");
  console.log(`Con imagen_url: ${imgCount[0].n}`);
  const { rows: extrasCount } = await pool.query('SELECT count(*) as n FROM product_images');
  console.log(`Imagenes extra: ${extrasCount[0].n}`);

  await pool.end();
})();
