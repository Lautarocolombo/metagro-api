import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

// ── Configuración ───────────────────────────────────────────
const PRODUCTS_FILE = process.argv[2] || join(process.cwd(), 'scripts', 'products-bulk.json');
const BATCH_SIZE = 50; // Cantidad de productos por transacción

// Cargar variables de entorno desde backend/.env
const envPath = join(process.cwd(), 'backend', '.env');
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch {}

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
  console.error('ERROR: Define POSTGRES_URL en backend/.env o como variable de entorno.');
  process.exit(1);
}

// ── Validación de producto ──────────────────────────────────
function validateProduct(p, index) {
  const errors = [];
  if (!p || typeof p !== 'object') return [`Registro #${index}: no es un objeto válido`];
  if (!p.id && p.id !== 0) errors.push(`Registro #${index}: falta campo "id"`);
  if (!p.nombre && !p.name) errors.push(`Registro #${index}: falta campo "nombre" o "name"`);
  if (!p.categoria && !p.tag && !p.category) errors.push(`Registro #${index}: falta campo "categoria"`);
  return errors;
}

// Normalizar campos a nombres internos
function normalizeProduct(p) {
  const id = typeof p.id === 'number' ? p.id : (typeof p.sku === 'number' ? p.sku : null);
  const nombre = p.nombre || p.name || '';
  const descripcion = p.descripcion || p.description || p.desc || '';
  const categoria = p.categoria || p.tag || p.category || 'General';
  const imagen_url = p.imagen_url || p.imagenPrincipal || p.img || p.image || '';
  const imagenes_adicionales = Array.isArray(p.imagenes_adicionales)
    ? p.imagenes_adicionales
    : (Array.isArray(p.images) ? p.images : []);

  return { id, nombre, descripcion, categoria, imagen_url, imagenes_adicionales };
}

// ── Bulk Upload ─────────────────────────────────────────────
async function bulkUpload(products) {
  const pool = new Pool({ connectionString: POSTGRES_URL, ssl: { rejectUnauthorized: false } });
  const results = { success: 0, updated: 0, skipped: 0, errors: [] };

  console.log(`→ Iniciando carga masiva de ${products.length} productos...\n`);

  // Procesar en lotes de BATCH_SIZE
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    console.log(`  Lote ${batchNum}/${totalBatches} (${batch.length} productos)...`);

    await pool.query('BEGIN');

    for (const p of batch) {
      const validationErrors = validateProduct(p, i + batch.indexOf(p) + 1);
      if (validationErrors.length) {
        results.errors.push(...validationErrors);
        results.skipped++;
        continue;
      }

      const { id, nombre, descripcion, categoria, imagen_url, imagenes_adicionales } = normalizeProduct(p);

      try {
        // Upsert del producto principal
        const upsertQuery = `
          INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url)
          VALUES ($1, $2, $3, $4, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            categoria = EXCLUDED.categoria,
            nombre = EXCLUDED.nombre,
            descripcion = EXCLUDED.descripcion,
            especificaciones = EXCLUDED.especificaciones,
            imagen_url = EXCLUDED.imagen_url,
            updated_at = NOW()
          RETURNING id
        `;
        const result = await pool.query(upsertQuery, [id, categoria, nombre, descripcion, imagen_url]);

        if (result.rowCount === 1) {
          const existing = await pool.query('SELECT 1 FROM product_images WHERE product_id = $1 LIMIT 1', [id]);
          if (!existing.rowCount) {
            results.success++;
          } else {
            results.updated++;
          }
        }

        // Insertar imágenes variantes (si existen)
        if (imagenes_adicionales.length > 0) {
          await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);
          for (const imgUrl of imagenes_adicionales) {
            if (!imgUrl || typeof imgUrl !== 'string') continue;
            await pool.query(
              'INSERT INTO product_images (product_id, url) VALUES ($1, $2)',
              [id, imgUrl]
            );
          }
        }
      } catch (e) {
        results.errors.push(`Producto ID ${id || '?'}: ${e.message}`);
        results.skipped++;
      }
    }

    await pool.query('COMMIT');
  }

  await pool.end();
  return results;
}

// ── Ejecución ───────────────────────────────────────────────
async function main() {
  let products;
  try {
    const raw = readFileSync(PRODUCTS_FILE, 'utf8');
    const ext = PRODUCTS_FILE.split('.').pop().toLowerCase();

    if (ext === 'json') {
      products = JSON.parse(raw);
    } else if (ext === 'csv') {
      const lines = raw.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      products = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj = {};
        headers.forEach((h, i) => { obj[h] = values[i]; });
        return obj;
      });
    } else {
      console.error('Formato no soportado. Usa .json o .csv');
      process.exit(1);
    }

    if (!Array.isArray(products)) {
      console.error('El archivo debe contener un array de productos.');
      process.exit(1);
    }
  } catch (e) {
    console.error('Error leyendo archivo:', e.message);
    process.exit(1);
  }

  const startTime = Date.now();
  const results = await bulkUpload(products);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n═══════════════════════════════════════');
  console.log('       CARGA MASIVA FINALIZADA');
  console.log('═══════════════════════════════════════');
  console.log(`  Total procesados : ${products.length}`);
  console.log(`  Exitosos (nuevos): ${results.success}`);
  console.log(`  Actualizados     : ${results.updated}`);
  console.log(`  Omitidos/errores : ${results.skipped}`);
  console.log(`  Duración         : ${duration}s`);
  console.log('═══════════════════════════════════════');

  if (results.errors.length) {
    console.log('\n⚠️  Errores detectados:');
    results.errors.slice(0, 20).forEach(e => console.log(`  - ${e}`));
    if (results.errors.length > 20) console.log(`  ... y ${results.errors.length - 20} más`);
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
