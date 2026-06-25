import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const PRODUCTS_DIR = path.join(process.cwd(), 'productos');

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

function findImage(productName) {
  const tokens = normalize(productName).split(' ').filter(Boolean);
  const files = fs.readdirSync(PRODUCTS_DIR);
  let best = null;
  let bestScore = 0;
  for (const file of files) {
    const base = normalize(path.basename(file, path.extname(file)));
    const score = tokens.filter(t => base.includes(t)).length;
    if (score > bestScore) {
      bestScore = score;
      best = file;
    }
  }
  return bestScore >= Math.max(1, Math.ceil(tokens.length * 0.6)) ? `productos/${best}` : null;
}

(async () => {
  const env = readEnv();
  const pool = new Pool({ connectionString: env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });

  const { rows } = await pool.query('SELECT id, nombre, imagen_url FROM productos_ganaderos ORDER BY id');
  let updated = 0;
  let skipped = 0;
  for (const row of rows) {
    if (row.imagen_url && row.imagen_url.startsWith('productos/')) {
      skipped++;
      continue;
    }
    const img = findImage(row.nombre);
    if (img) {
      await pool.query('UPDATE productos_ganaderos SET imagen_url = $1 WHERE id = $2', [img, row.id]);
      updated++;
    } else {
      skipped++;
    }
  }
  console.log(`Actualizados: ${updated} | Sin imagen coincidente: ${skipped} | Total revisados: ${rows.length}`);
  await pool.end();
})();
