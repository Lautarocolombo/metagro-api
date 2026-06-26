const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { uploadFile, getPublicUrl, isStorageConfigured } = require('./backend/services/storage.service')

const PRODUCTOS_DIR = path.join(__dirname, 'frontend', 'productos')
const UPLOAD_DIR = path.join(__dirname, 'backend', 'data', 'uploads')

async function processImage(filePath, originalName) {
  if (!isStorageConfigured()) {
    console.log(`[skip] S3 no configurado, omitiendo: ${originalName}`)
    return null
  }
  try {
    const buffer = await sharp(filePath)
      .jpeg({ quality: 85 })
      .toBuffer()
    const ext = path.extname(originalName).toLowerCase() || '.jpg'
    const baseName = path.basename(originalName, ext)
    const key = `productos/${baseName.replace(/[^a-zA-Z0-9_-]/g, '-')}${ext}`
    const url = await uploadFile(key, buffer, 'image/jpeg')
    console.log(`[ok] Subido: ${originalName} -> ${url}`)
    return url
  } catch (e) {
    console.error(`[error] Falló ${originalName}:`, e.message)
    return null
  }
}

async function migrateProductImages() {
  if (!isStorageConfigured()) {
    console.log('S3 no configurado. Configurá S3_ACCESS_KEY_ID y S3_SECRET_ACCESS_KEY en .env')
    process.exit(1)
  }
  const files = []
  if (fs.existsSync(PRODUCTOS_DIR)) {
    const productFiles = fs.readdirSync(PRODUCTOS_DIR)
    productFiles.forEach(f => files.push({ dir: PRODUCTOS_DIR, file: f }))
  }
  if (fs.existsSync(UPLOAD_DIR)) {
    const uploadFiles = fs.readdirSync(UPLOAD_DIR)
    uploadFiles.forEach(f => files.push({ dir: UPLOAD_DIR, file: f }))
  }
  console.log(`Encontradas ${files.length} imágenes para procesar`)
  const results = []
  for (const { dir, file } of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (!stat.isFile()) continue
    const url = await processImage(fullPath, file)
    if (url) results.push({ original: file, url })
  }
  const outPath = path.join(__dirname, 'migration-results.json')
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.log(`\nMigración completada. ${results.length} imágenes subidas.`)
  console.log(`Resultados guardados en: ${outPath}`)
}

migrateProductImages().catch(e => {
  console.error('Error fatal:', e)
  process.exit(1)
})
