const express = require('express')
const router = express.Router()
const { auth, requireRole } = require('../middleware/auth.middleware')
const upload = require('../middleware/upload.middleware')
const productosController = require('../controllers/productos.controller')
const { productSchema } = require('../validators/schemas')
const rateLimit = require('express-rate-limit')
const fs = require('fs')
const path = require('path')
const { uploadFile, getPublicUrl, isStorageConfigured } = require('../services/storage.service')

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body)
      next()
    } catch (e) {
      const issues = e.errors?.map(err => ({ path: err.path, message: err.message })) || [{ message: 'Invalid body' }]
      res.status(400).json({ error: 'Validation failed', issues })
    }
  }
}

function adminRoute(method, path, ...args) {
  return router[method](path, adminLimiter, ...args)
}

async function maybeUploadToS3(filePath, originalName) {
  if (!isStorageConfigured()) {
    return `/uploads/${path.basename(filePath)}`
  }
  try {
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(originalName).toLowerCase() || '.jpg'
    const key = `productos/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const url = await uploadFile(key, buffer, getMimeFromExt(ext))
    fs.unlinkSync(filePath)
    return url
  } catch (e) {
    console.error('[upload] S3 upload failed, falling back to local:', e.message)
    return `/uploads/${path.basename(filePath)}`
  }
}

function getMimeFromExt(ext) {
  const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' }
  return map[ext] || 'image/jpeg'
}

router.get('/products', productosController.listProducts)
adminRoute('post', '/products', auth, requireRole(['admin', 'editor']), validate(productSchema), productosController.createProduct)
adminRoute('put', '/products/:id', auth, requireRole(['admin', 'editor']), validate(productSchema), productosController.updateProduct)
adminRoute('delete', '/products/:id', auth, requireRole(['admin']), productosController.deleteProduct)
adminRoute('post', '/upload', auth, requireRole(['admin', 'editor']), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo requerido' })
  const url = await maybeUploadToS3(req.file.path, req.file.originalname)
  res.json({ url })
})
adminRoute('post', '/upload-many', auth, requireRole(['admin', 'editor']), upload.array('files', 100), async (req, res) => {
  const urls = await Promise.all((req.files || []).map(async f => {
    return await maybeUploadToS3(f.path, f.originalname)
  }))
  res.json({ urls })
})
adminRoute('get', '/backup', auth, requireRole(['admin']), productosController.getBackup)
adminRoute('post', '/backup', auth, requireRole(['admin']), productosController.postBackup)
adminRoute('post', '/sync-to-db', auth, requireRole(['admin']), productosController.syncToDb)
adminRoute('get', '/categories', auth, requireRole(['viewer']), productosController.getCategories)
adminRoute('get', '/products-test/status', auth, requireRole(['admin']), productosController.getProductsTestStatus)
adminRoute('post', '/products-test', auth, requireRole(['admin']), productosController.createProductTest)
adminRoute('get', '/products-test/:id', auth, requireRole(['admin']), productosController.getProductTest)
adminRoute('delete', '/products-test/:id', auth, requireRole(['admin']), productosController.deleteProductTest)
adminRoute('post', '/guardar-config', auth, requireRole(['admin']), productosController.saveConfig)

router.get('/v2/products', productosController.listProductsV2)
router.get('/v2/products/:id', productosController.getProduct)
router.post('/v2/budget', productosController.createBudget)

module.exports = router
