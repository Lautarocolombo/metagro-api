const fs = require('fs')
const path = require('path')
require('dotenv').config()

const ADMIN_USER = process.env.ADMIN_USER || 'metagro'
const ADMIN_PASS = process.env.ADMIN_PASS || 'montealegre22'
const DATA_DIR = path.join(__dirname, 'data')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')

function readProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) return []
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'))
  } catch (e) { return [] }
}

function writeProducts(data) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2))
}

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Uso: node backup.js /ruta/a/archivo.json')
  process.exit(1)
}

try {
  const content = fs.readFileSync(inputPath, 'utf8')
  const data = JSON.parse(content)
  writeProducts(data)
  console.log(`Respaldo aplicado: ${data.length} productos cargados.`)
} catch (e) {
  console.error('Error al procesar el archivo:', e.message)
  process.exit(1)
}
