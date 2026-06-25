// Sincroniza los productos reales de la BD hacia frontend/js/app.js (window.DEFAULT_PRODUCTS)
// Uso: node tools/sync-db-to-app.cjs
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

const { Pool } = require(path.join(__dirname, '..', 'backend', 'node_modules', 'pg'));

const appJsPath = path.join(__dirname, '..', 'frontend', 'js', 'app.js');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 10000,
});

(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Conectado a BD. Obteniendo productos...');

    const res = await client.query(
      'SELECT id, categoria, nombre, descripcion, imagen_url FROM productos_ganaderos ORDER BY id'
    );
    const rows = res.rows;
    console.log(`Productos obtenidos: ${rows.length}`);

    // Generar el bloque DEFAULT_PRODUCTS
    const items = rows.map((r) => {
      const obj = {
        id: r.id,
        name: r.nombre || 'Producto',
        tag: r.categoria || 'General',
        desc: r.descripcion || 'Consultá disponibilidad y precio en Metagro SRL.',
        img: r.imagen_url || '',
      };
      // Serializar con 2 espacios de indentación (como el original)
      const inner = Object.entries(obj)
        .map(([k, v]) => `    "${k}": ${JSON.stringify(v)}`)
        .join(',\n');
      return `  {\n${inner}\n  }`;
    });

    const newBlock = `window.DEFAULT_PRODUCTS = [\n${items.join(',\n')}\n];`;

    // Leer app.js actual
    let appJs = fs.readFileSync(appJsPath, 'utf8');

    // Reemplazar el bloque existente
    const pattern = /window\.DEFAULT_PRODUCTS\s*=\s*\[[\s\S]*?\]\s*;/;
    if (!pattern.test(appJs)) {
      console.error('ERROR: No se encontró window.DEFAULT_PRODUCTS en app.js');
      process.exit(1);
    }

    appJs = appJs.replace(pattern, newBlock);

    // Guardar
    fs.writeFileSync(appJsPath, appJs, 'utf8');
    console.log(`✅ app.js actualizado con ${rows.length} productos reales de la BD.`);
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
})();