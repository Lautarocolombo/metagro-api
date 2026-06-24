import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const indexPath = path.join(repoRoot, '..', 'index.html');
const outPath = path.join(repoRoot, 'default_products.json');

const html = fs.readFileSync(indexPath, 'utf8');

// 1) Localizamos el inicio del array
const startMarker = 'window.DEFAULT_PRODUCTS =';
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) throw new Error('No se encontró window.DEFAULT_PRODUCTS');

const openBracketIdx = html.indexOf('[', startIdx);
if (openBracketIdx === -1) throw new Error('No se encontró el [ del DEFAULT_PRODUCTS');

// 2) Parseo simple por balanceo de corchetes para capturar SOLO el array
let depth = 0;
let inString = false;
let stringQuote = null;
let escaped = false;

let endIdx = -1;
for (let i = openBracketIdx; i < html.length; i++) {
  const ch = html[i];

  if (inString) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (ch === stringQuote) {
      inString = false;
      stringQuote = null;
    }
    continue;
  }

  if (ch === '"' || ch === "'" || ch === '`') {
    inString = true;
    stringQuote = ch;
    continue;
  }

  if (ch === '[') depth++;
  if (ch === ']') depth--;

  if (depth === 0) {
    endIdx = i;
    break;
  }
}

if (endIdx === -1) throw new Error('No se pudo balancear corchetes para capturar array');

const arrayLiteral = html.slice(openBracketIdx, endIdx + 1);

// 3) Convertimos literal JS a JSON ejecutando en sandbox.
const sandbox = { window: {} };
// eslint-disable-next-line no-new-func
const fn = new Function('sandbox', `with (sandbox) { window.DEFAULT_PRODUCTS = ${arrayLiteral}; }`);
fn(sandbox);

const products = sandbox.window.DEFAULT_PRODUCTS;
if (!Array.isArray(products)) throw new Error('DEFAULT_PRODUCTS no es array');

fs.writeFileSync(outPath, JSON.stringify(products, null, 2), 'utf8');
console.log(`OK: ${products.length} productos -> ${outPath}`);

