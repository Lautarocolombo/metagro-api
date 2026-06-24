const fs = require('fs');
const products = JSON.parse(fs.readFileSync('backend/data/products.json', 'utf8'));
const jsVar = 'window.DEFAULT_PRODUCTS = ' + JSON.stringify(products, null, 2) + ';';
const appJs = fs.readFileSync('js/app.js', 'utf8');
const updated = appJs.replace(
  /window\.DEFAULT_PRODUCTS\s*=\s*\[[\s\S]*?\]\s*;/,
  jsVar
);
fs.writeFileSync('js/app.js', updated, 'utf8');
console.log(`Inyectados ${products.length} productos en window.DEFAULT_PRODUCTS`);
