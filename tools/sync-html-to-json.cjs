const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/window\.DEFAULT_PRODUCTS\s*=\s*\[([\s\S]*?)\]\s*;/);
if (!m) {
  console.log('No encontrado DEFAULT_PRODUCTS');
  process.exit(1);
}
const jsonStr = '[' + m[1] + ']';
const products = JSON.parse(jsonStr);
fs.writeFileSync('backend/data/products.json', JSON.stringify(products, null, 2), 'utf8');
console.log(`Actualizados ${products.length} productos en backend/data/products.json`);
