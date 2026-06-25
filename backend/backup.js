const fs = require('fs')
const path = require('path')
require('dotenv').config()

const DATA_DIR = path.join(__dirname, 'data')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Uso: node backup.js /ruta/a/archivo.json')
  process.exit(1)
}

try {
  const content = fs.readFileSync(inputPath, 'utf8')
  const data = JSON.parse(content)
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2))
  console.log(`Respaldo aplicado: ${data.length} productos cargados.`) // eslint-disable-line no-console
} catch (e) {
  console.error('Error al procesar el archivo:', e.message) // eslint-disable-line no-console
  process.exit(1)
}
