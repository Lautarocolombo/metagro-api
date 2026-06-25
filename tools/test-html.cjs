const fs = require('fs');
const path = require('path');

const htmlPath = path.join(process.cwd(), 'frontend', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const ok = [
  ['lang="es"', html.includes('lang="es"')],
  ['meta description', html.includes('name="description"')],
  ['meta robots', html.includes('name="robots"')],
  ['stylesheet main.css', html.includes('href="styles/main.css"')],
  ['script app.js', html.includes('src="js/app.js"')],
];

const failed = ok.filter(([, v]) => !v).map(([k]) => k);
if (failed.length) {
  console.error('HTML validation failed:', failed.join(', '));
  process.exit(1);
}
console.log(`HTML validation OK. Checks: ${ok.length}`);