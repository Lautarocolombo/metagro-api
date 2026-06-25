const multer = require('multer')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, '..', 'data', 'uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  }
})

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true)
    cb(new Error('Tipo de archivo no permitido. Subí una imagen JPG/PNG/WebP.'))
  }
})

module.exports = upload
