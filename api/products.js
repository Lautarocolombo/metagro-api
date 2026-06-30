import pool from '../backend/data/pool.js'
import fs from 'fs'
import path from 'path'
import os from 'os'
import multer from 'multer'
import cookie from 'cookie'
import { setCors, setReqMeta, applyAuth, applyRole, parseBody, setLangCookie } from './serverless-utils.js'
import { uploadFile, isStorageConfigured } from '../backend/services/storage.service.js'
import { listProducts, createProduct, updateProduct, deleteProduct, getProduct, getCategories, listProductsV2, getBackup, postBackup, syncToDb, getProductsTestStatus, createProductTest, getProductTest, deleteProductTest, saveConfig } from '../backend/controllers/productos.controller.js'
import { productSchema } from '../backend/validators/schemas.js'

const uploadTmp = multer({
  dest: path.join(os.tmpdir(), 'metagro-uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    if (ALLOWED.has(file.mimetype)) return cb(null, true)
    cb(new Error('Tipo de archivo no permitido'))
  }
})

function validate(schema, req, res) {
  try { schema.parse(req.body) } catch (e) {
    const issues = e.errors?.map(err => ({ path: err.path, message: err.message })) || [{ message: 'Invalid body' }]
    res.status(400).json({ error: 'Validation failed', issues })
    return true
  }
  return false
}

export default async function handler(req, res) {
  if (setCors(req, res)) {
    if (req.method === 'OPTIONS') return res.status(204).end()
    return res.status(403).json({ error: 'Origin not allowed' })
  }

  setLangCookie(req, res)
  const url = new URL(req.url, `http://${req.headers.host}`)
  const parts = url.pathname.replace(/^\/api\/products?/, '').split('/').filter(Boolean)
  req.query = Object.fromEntries(url.searchParams.entries())
  setReqMeta(req)

  const contentType = req.headers['content-type'] || ''
  if (!contentType.includes('multipart/form-data') && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    req.body = await parseBody(req)
  }

  req.params = {}
  if (parts[0] && !isNaN(parts[0])) req.params.id = parts[0]

  if (req.method === 'GET' && !parts[0]) {
    if (req.query.page || req.query.limit || req.query.categoria || req.query.search) return listProductsV2(req, res)
    return listProducts(req, res)
  }

  if (req.method === 'POST' && !parts[0]) {
    if (await applyRole(req, res, ['admin', 'editor'])) return
    if (validate(productSchema, req, res)) return
    return createProduct(req, res)
  }

  if (parts[0] && req.method === 'GET') return getProduct(req, res)

  if (parts[0] && req.method === 'PUT') {
    if (await applyRole(req, res, ['admin', 'editor'])) return
    if (validate(productSchema, req, res)) return
    return updateProduct(req, res)
  }

  if (parts[0] && req.method === 'DELETE') {
    if (await applyRole(req, res, ['admin'])) return
    return deleteProduct(req, res)
  }

  if (parts[0] === 'categories' && req.method === 'GET') {
    if (await applyRole(req, res, ['viewer'])) return
    return getCategories(req, res)
  }

  if (parts[0] === 'backup' && req.method === 'GET') {
    if (await applyRole(req, res, ['admin'])) return
    return getBackup(req, res)
  }

  if (parts[0] === 'backup' && req.method === 'POST') {
    if (await applyRole(req, res, ['admin'])) return
    return postBackup(req, res)
  }

  if (parts[0] === 'sync-to-db' && req.method === 'POST') {
    if (await applyRole(req, res, ['admin'])) return
    return syncToDb(req, res)
  }

  if (parts[0] === 'upload' && req.method === 'POST') {
    if (await applyRole(req, res, ['admin', 'editor'])) return
    await new Promise((resolve, reject) => uploadTmp.single('file')(req, res, (err) => err ? reject(err) : resolve()))
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' })
    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg'
    const key = `productos/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' }
    let url = req.file.path
    if (isStorageConfigured()) {
      try {
        const buffer = fs.readFileSync(req.file.path)
        url = await uploadFile(key, buffer, map[ext] || 'image/jpeg')
        fs.unlinkSync(req.file.path)
      } catch (e) {
        console.error('[upload] S3 upload failed, falling back to local:', e.message)
      }
    }
    return res.json({ url })
  }

  if (parts[0] === 'upload-many' && req.method === 'POST') {
    if (await applyRole(req, res, ['admin', 'editor'])) return
    await new Promise((resolve, reject) => uploadTmp.array('files', 100)(req, res, (err) => err ? reject(err) : resolve()))
    const urls = await Promise.all((req.files || []).map(async f => {
      const ext = path.extname(f.originalname).toLowerCase() || '.jpg'
      const key = `productos/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
      const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' }
      let url = f.path
      if (isStorageConfigured()) {
        try {
          const buffer = fs.readFileSync(f.path)
          url = await uploadFile(key, buffer, map[ext] || 'image/jpeg')
          fs.unlinkSync(f.path)
        } catch (e) {
          console.error('[upload] S3 upload failed:', e.message)
        }
      }
      return url
    }))
    return res.json({ urls })
  }

  if (parts[0] === 'guardar-config' && req.method === 'POST') {
    if (await applyRole(req, res, ['admin'])) return
    return saveConfig(req, res)
  }

  if (parts[0] === 'products-test' && parts[1] === 'status' && req.method === 'GET') {
    if (await applyRole(req, res, ['admin'])) return
    return getProductsTestStatus(req, res)
  }

  if (parts[0] === 'products-test' && req.method === 'POST') {
    if (await applyRole(req, res, ['admin'])) return
    return createProductTest(req, res)
  }

  if (parts[0] === 'products-test' && parts[1] && req.method === 'GET') {
    if (await applyRole(req, res, ['admin'])) return
    return getProductTest(req, res)
  }

  if (parts[0] === 'products-test' && parts[1] && req.method === 'DELETE') {
    if (await applyRole(req, res, ['admin'])) return
    return deleteProductTest(req, res)
  }

  return res.status(404).json({ error: 'Not found' })
}
