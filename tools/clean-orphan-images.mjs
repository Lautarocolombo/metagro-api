const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { uploadFile, getPublicUrl, isStorageConfigured, deleteFile } = require('./backend/services/storage.service')

const PRODUCTOS_DIR = path.join(__dirname, 'frontend', 'productos')
const UPLOAD_DIR = path.join(__dirname, 'backend', 'data', 'uploads')

async function cleanOrphanImages() {
  if (!isStorageConfigured()) {
    console.log('S3 no configurado. Configurá S3_ACCESS_KEY_ID y S3_SECRET_ACCESS_KEY en .env')
    process.exit(1)
  }
  const usedUrls = new Set()
  const dbPath = path.join(__dirname, 'backend', 'data', 'products.json')
  if (fs.existsSync(dbPath)) {
    try {
      const products = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      products.forEach(p => {
        if (p.img) usedUrls.add(p.img)
        if (p.imagen_url) usedUrls.add(p.imagen_url)
        if (Array.isArray(p.images)) p.images.forEach(img => { if (img) usedUrls.add(img) })
      })
    } catch (e) {
      console.warn('No se pudo leer products.json, se usarán solo los archivos locales')
    }
  }
  if (fs.existsSync(PRODUCTOS_DIR)) {
    const files = fs.readdirSync(PRODUCTOS_DIR)
    files.forEach(f => {
      const localPath = path.join(PRODUCTOS_DIR, f)
      usedUrls.add(localPath)
      usedUrls.add(`/productos/${f}`)
      usedUrls.add(`productos/${f}`)
    })
  }
  if (fs.existsSync(UPLOAD_DIR)) {
    const files = fs.readdirSync(UPLOAD_DIR)
    files.forEach(f => {
      const localPath = path.join(UPLOAD_DIR, f)
      usedUrls.add(localPath)
      usedUrls.add(`/uploads/${f}`)
      usedUrls.add(`uploads/${f}`)
    })
  }
  console.log(`Se encontraron ${usedUrls.size} referencias de imágenes en uso`)
}

cleanOrphanImages().catch(e => {
  console.error('Error fatal:', e)
  process.exit(1)
})
