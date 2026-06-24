import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PRODUCTS_FILE = join(process.cwd(), 'backend', 'data', 'products.json');
const OUTPUT_FILE = join(process.cwd(), 'sql', 'seed-productos.sql');

const products = JSON.parse(readFileSync(PRODUCTS_FILE, 'utf8'));

const lines = ['BEGIN;'];

for (const p of products) {
  const allImages = Array.isArray(p.images) ? p.images : (p.img ? [p.img] : []);
  const mainImg = allImages[0] || '';
  const variants = allImages.slice(1);

  lines.push(`-- Producto ${p.id}: ${p.nombre || p.name}`);
  lines.push(
    `INSERT INTO productos_ganaderos (id, categoria, nombre, descripcion, especificaciones, imagen_url) VALUES (` +
    `${p.id}, '${(p.tag || p.categoria || 'General').replace(/'/g, "''")}', '${(p.nombre || p.name).replace(/'/g, "''")}', '${(p.desc || p.descripcion || '').replace(/'/g, "''")}', '${(p.desc || p.descripcion || '').replace(/'/g, "''")}', '${mainImg.replace(/'/g, "''")}'` +
    `) ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url;`
  );

  if (variants.length > 0) {
    lines.push(`DELETE FROM product_images WHERE product_id = ${p.id};`);
    for (const img of variants) {
      lines.push(`INSERT INTO product_images (product_id, url) VALUES (${p.id}, '${img.replace(/'/g, "''")}');`);
    }
  }
}

lines.push('COMMIT;');

const sql = lines.join('\n');
writeFileSync(OUTPUT_FILE, sql, 'utf8');
console.log(`SQL generado en: ${OUTPUT_FILE}`);
console.log(`Total: ${products.length} productos`);
console.log(`Tamaño: ${Buffer.byteLength(sql, 'utf8') / 1024 | 0} KB`);
