import { readFileSync, writeFileSync } from 'fs';

const indexPath = 'C:/Users/Lautaro Colombo/Desktop/Proyectos/proyectos en armados/metagro 2.1/index.html';
const content = readFileSync(indexPath, 'utf8');

const defaultMatch = content.match(/window\.DEFAULT_PRODUCTS\s*=\s*\[([\s\S]*?)\];/);
if (!defaultMatch) {
  console.error('No se encontró DEFAULT_PRODUCTS');
  process.exit(1);
}

let productsStr = defaultMatch[1];

// Agregar comas después de cada producto excepto el último
// Buscar patrones como "]\n  {" y agregar coma después del ]
productsStr = productsStr.replace(/\]\n\s*\{/g, '],\n  {');

const newContent = content.replace(
  /window\.DEFAULT_PRODUCTS\s*=\s*\[([\s\S]*?)\];/,
  `window.DEFAULT_PRODUCTS = [${productsStr}];`
);

writeFileSync(indexPath, newContent);
console.log('Comas agregadas correctamente');
