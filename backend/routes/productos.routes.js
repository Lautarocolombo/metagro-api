const express = require('express')
const router = express.Router()
const { auth } = require('../middleware/auth.middleware')
const upload = require('../middleware/upload.middleware')
const productosController = require('../controllers/productos.controller')

router.get('/products', productosController.listProducts)
router.post('/products', auth, productosController.createProduct)
router.put('/products/:id', auth, productosController.updateProduct)
router.delete('/products/:id', auth, productosController.deleteProduct)
router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo requerido' })
  res.json({ url: `/uploads/${req.file.filename}` })
})
router.post('/upload-many', auth, upload.array('files', 100), (req, res) => {
  const urls = (req.files || []).map(f => `/uploads/${f.filename}`)
  res.json({ urls })
})
router.get('/backup', auth, productosController.getBackup)
router.post('/backup', auth, productosController.postBackup)
router.post('/sync-to-db', auth, productosController.syncToDb)
router.get('/categories', auth, productosController.getCategories)
router.get('/products-test/status', auth, productosController.getProductsTestStatus)
router.post('/products-test', auth, productosController.createProductTest)
router.get('/products-test/:id', auth, productosController.getProductTest)
router.delete('/products-test/:id', auth, productosController.deleteProductTest)
router.post('/guardar-config', auth, productosController.saveConfig)

module.exports = router
