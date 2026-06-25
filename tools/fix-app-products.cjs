const fs = require('fs');
const path = require('path');

const file = path.join('C:\\Users\\Lautaro Colombo\\Desktop\\Proyectos\\proyectos en armados\\metagro 2.1\\frontend\\js\\app.js');
let text = fs.readFileSync(file, 'utf8');

const startMarker = 'window.DEFAULT_PRODUCTS = [';
const startIdx = text.indexOf(startMarker);
if (startIdx === -1) {
  console.log('No DEFAULT_PRODUCTS found');
  process.exit(0);
}

const endMarker = '];\n\nlet products = [];';
const endIdx = text.indexOf(endMarker, startIdx);
if (endIdx === -1) {
  console.log('End marker not found');
  process.exit(1);
}

const endPos = endIdx + endMarker.length;
text = text.slice(0, startIdx) + text.slice(endPos);

// Fix puerto API 4001 -> 4000
text = text.replace('http://localhost:4001/api', 'http://localhost:4000/api');

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed DEFAULT_PRODUCTS and API port in app.js');
