// Script para contar productos, detectar y eliminar duplicados en la BD PostgreSQL
// Uso: node tools/db-dedup.cjs [--dry-run]
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde backend/.env manualmente
const envPath = path.join(__dirname, '..', 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = val;
}

// Cargar pg desde backend/node_modules
const { Pool } = require(path.join(__dirname, '..', 'backend', 'node_modules', 'pg'));

const dryRun = process.argv.includes('--dry-run');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 10000,
});

function normalize(s) {
  return (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('=== CONEXIÓN A BASE DE DATOS ===');
    console.log('Estado: CONECTADA\n');

    // 1) Conteo total
    const totalRes = await client.query('SELECT count(*)::int AS total FROM productos_ganaderos');
    const total = totalRes.rows[0].total;
    console.log(`=== CONTEO DE PRODUCTOS ===`);
    console.log(`Total de productos en BD: ${total}\n`);

    // 2) Listar todos para análisis
    const allRes = await client.query(
      'SELECT id, categoria, nombre, imagen_url FROM productos_ganaderos ORDER BY id'
    );
    const rows = allRes.rows;
    console.log(`=== PRODUCTOS POR CATEGORÍA ===`);
    const byCat = {};
    for (const r of rows) {
      const c = r.categoria || '(sin categoría)';
      byCat[c] = (byCat[c] || 0) + 1;
    }
    Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .forEach(([c, n]) => console.log(`  ${c}: ${n}`));
    console.log('');

    // 3) Detectar duplicados por nombre normalizado
    const groups = {};
    for (const r of rows) {
      const key = normalize(r.nombre);
      if (!key) continue;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }

    const dupGroups = Object.values(groups).filter((g) => g.length > 1);
    console.log(`=== DETECCIÓN DE DUPLICADOS (por nombre) ===`);
    console.log(`Grupos de duplicados encontrados: ${dupGroups.length}`);
    let totalDups = 0;
    for (const g of dupGroups) {
      console.log(`\n  Nombre: "${g[0].nombre}" (${g.length} registros)`);
      for (const r of g) {
        console.log(`    - id=${r.id} | cat="${r.categoria}" | img="${r.imagen_url}"`);
      }
      totalDups += g.length - 1;
    }
    console.log(`\nTotal de registros duplicados a eliminar: ${totalDups}\n`);

    // 4) Eliminar duplicados (mantener el de menor id)
    if (totalDups === 0) {
      console.log('=== RESULTADO ===');
      console.log('No hay duplicados. No se requiere acción.\n');
    } else if (dryRun) {
      console.log('=== MODO DRY-RUN ===');
      console.log('No se eliminó nada. Ejecuta sin --dry-run para aplicar cambios.\n');
    } else {
      console.log('=== ELIMINANDO DUPLICADOS ===');
      let deleted = 0;
      for (const g of dupGroups) {
        const keepId = Math.min(...g.map((r) => r.id));
        const removeIds = g.map((r) => r.id).filter((id) => id !== keepId);
        for (const id of removeIds) {
          await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
          await client.query('DELETE FROM productos_ganaderos WHERE id = $1', [id]);
          console.log(`  Eliminado id=${id} (mantenido id=${keepId} para "${g[0].nombre}")`);
          deleted++;
        }
      }
      console.log(`\nTotal eliminados: ${deleted}\n`);

      const finalRes = await client.query('SELECT count(*)::int AS total FROM productos_ganaderos');
      console.log(`=== CONTEO FINAL ===`);
      console.log(`Productos en BD después de limpieza: ${finalRes.rows[0].total}\n`);
    }

    // 5) Verificar duplicados restantes por imagen_url
    const imgDupsRes = await client.query(
      `SELECT imagen_url, count(*)::int AS n, array_agg(id ORDER BY id) AS ids
       FROM productos_ganaderos
       WHERE imagen_url IS NOT NULL AND imagen_url <> ''
       GROUP BY imagen_url
       HAVING count(*) > 1
       ORDER BY n DESC`
    );
    console.log(`=== DUPLICADOS POR IMAGEN (referencia) ===`);
    if (imgDupsRes.rows.length === 0) {
      console.log('No hay productos que compartan la misma imagen principal.\n');
    } else {
      console.log(`Se encontraron ${imgDupsRes.rows.length} grupos de imágenes repetidas:`);
      for (const r of imgDupsRes.rows) {
        console.log(`  ${r.imagen_url} -> ids: ${r.ids.join(', ')}`);
      }
      console.log('');
    }
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();