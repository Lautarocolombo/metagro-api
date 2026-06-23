import { readFileSync, writeFileSync } from 'fs';

const indexPath = 'C:/Users/Lautaro Colombo/Desktop/Proyectos/proyectos en armados/metagro 2.1/index.html';
const sqlFile = 'C:/Users/Lautaro Colombo/Desktop/Proyectos/proyectos en armados/metagro 2.1/sql/seed-productos-all.sql';

const content = readFileSync(indexPath, 'utf8');
const sql = readFileSync(sqlFile, 'utf8');

// Parsear productos del SQL
const productRegex = /INSERT INTO productos_ganaderos \(id, categoria, nombre, descripcion, especificaciones, imagen_url\) VALUES \((\d+), '([^']*)', '([^']*)', '([^']*)', '([^']*)', '([^']*)'\)/g;
const products = [];
let match;

while ((match = productRegex.exec(sql)) !== null) {
  products.push({
    id: parseInt(match[1]),
    categoria: match[2],
    nombre: match[3],
    imagen: match[6]
  });
}

// Ordenar por ID
products.sort((a, b) => a.id - b.id);

// Generar array de productos para DEFAULT_PRODUCTS
const productsStr = products.map((p, i) => {
  const comma = i < products.length - 1 ? ',' : '';
  return `  {
    "id": ${p.id},
    "name": "${p.nombre}",
    "tag": "${p.categoria}",
    "desc": "",
    "icon": "",
    "img": "${p.imagen}",
    "imagen_url": "${p.imagen}",
    "images": [
      "${p.imagen}"
    ]
  }${comma}`;
}).join('\n');

// Reemplazar DEFAULT_PRODUCTS en index.html
const defaultMatch = content.match(/window\.DEFAULT_PRODUCTS\s*=\s*\[([\s\S]*?)\];/);
if (!defaultMatch) {
  console.error('No se encontró DEFAULT_PRODUCTS');
  process.exit(1);
}

const newContent = content.replace(
  /window\.DEFAULT_PRODUCTS\s*=\s*\[[\s\S]*?\];/,
  `window.DEFAULT_PRODUCTS = [
${productsStr}
];`
);

writeFileSync(indexPath, newContent, 'utf8');
console.log(`DEFAULT_PRODUCTS actualizado con ${products.length} productos`);
