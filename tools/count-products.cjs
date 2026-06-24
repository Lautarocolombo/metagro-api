const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/window\.DEFAULT_PRODUCTS\s*=\s*\[([\s\S]*?)\]\s*;/);
if (!m) {
  console.log('No encontrado');
  process.exit(1);
}
const items = m[0].match(/\{\s*"id"/g);
console.log('Total en DEFAULT_PRODUCTS:', items ? items.length : 0);
