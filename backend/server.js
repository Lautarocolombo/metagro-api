require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const jwt = require('jsonwebtoken')
const app = express()

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? ['https://metagro-srl.vercel.app']
  : ['http://localhost:4000', 'http://127.0.0.1:4000', 'http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: ALLOWED_ORIGINS,
  credentials: true
};

app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intente más tarde.' }
})
app.use(generalLimiter)

const PORT = process.env.PORT || 4000
const DATA_DIR = path.join(__dirname, 'data')
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) console.warn('[WARN] JWT_SECRET no configurado. Defínelo en .env para mayor seguridad.')
const ADMIN_TOKEN = process.env.METAGRO_TOKEN
if (!ADMIN_TOKEN) console.warn('[WARN] METAGRO_TOKEN no configurado. Defínelo en .env o no podrás autenticar.')
const ADMIN_USER = process.env.ADMIN_USER
const ADMIN_PASS = process.env.ADMIN_PASS

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    cb(null, name)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'))
  }
})

function auth(req, res, next) {
  const header = req.headers['x-mg-token'] || ''
  if (!header) return res.status(401).json({ error: 'Unauthorized' })
  if (!ADMIN_TOKEN) {
    try {
      jwt.verify(header, JWT_SECRET || 'metagro-secret')
      return next()
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }
  if (header === ADMIN_TOKEN) return next()
  try {
    jwt.verify(header, JWT_SECRET || 'metagro-secret')
    return next()
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

function ensureDirs() {
  [DATA_DIR, UPLOAD_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
  })
}
ensureDirs()

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

function sanitizeProduct(product) {
  return {
    ...product,
    name: sanitizeString(product.name || ''),
    tag: sanitizeString(product.tag || ''),
    desc: sanitizeString(product.desc || ''),
    img: sanitizeString(product.img || ''),
    icon: sanitizeString(product.icon || '📦'),
  };
}

function readProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) return []
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'))
    return data.map(p => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : (p.img ? [p.img] : []),
    }));
  } catch (e) { return [] }
}

function writeProducts(data) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2))
}

const PRODUCTOS_DIR = path.join(__dirname, '..', 'productos')
app.use('/productos', express.static(PRODUCTOS_DIR, {
  maxAge: '1d',
  immutable: true,
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
}))
app.use('/uploads', express.static(UPLOAD_DIR, {
  maxAge: '1d',
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=86400')
}))
app.use(express.static(path.join(__dirname, '..'), {
  maxAge: '1h',
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=3600')
}))

app.post('/api/admin/login', authLimiter, (req, res) => {
  const { username, password } = req.body || {}
  if (!ADMIN_USER || !ADMIN_PASS) {
    return res.status(500).json({ error: 'Credenciales de admin no configuradas en el servidor.' })
  }
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET no configurado en el servidor.' })
  }
  const token = jwt.sign({ role: 'admin', user: ADMIN_USER }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token })
})

app.get('/api/products', (req, res) => res.json(readProducts()))

app.post('/api/products', auth, (req, res) => {
  const products = readProducts()
  const images = Array.isArray(req.body.images)
    ? req.body.images.filter(Boolean)
    : (req.body.img ? [req.body.img] : []);
  const product = sanitizeProduct({ id: Date.now(), ...req.body, images })
  if (!product.img && product.images.length) product.img = product.images[0];
  products.push(product)
  writeProducts(products)
  res.status(201).json(product)
})

app.put('/api/products/:id', auth, (req, res) => {
  const products = readProducts()
  const idx = products.findIndex(p => String(p.id) === String(req.params.id))
  if (idx < 0) return res.status(404).json({ error: 'Not found' })
  const images = Array.isArray(req.body.images)
    ? req.body.images.filter(Boolean)
    : (req.body.img ? [req.body.img] : []);
  products[idx] = sanitizeProduct({ ...products[idx], ...req.body, id: products[idx].id, images })
  if (!products[idx].img && images.length) products[idx].img = images[0];
  writeProducts(products)
  res.json(products[idx])
})

app.delete('/api/products/:id', auth, (req, res) => {
  const products = readProducts()
  const p = products.find(p => String(p.id) === String(req.params.id))
  if (!p) return res.status(404).json({ error: 'Not found' })
  if (p.img && p.img.startsWith('/uploads/')) {
    const f = path.join(__dirname, p.img)
    if (fs.existsSync(f)) fs.unlinkSync(f)
  }
  writeProducts(products.filter(item => String(item.id) !== String(req.params.id)))
  res.json({ ok: true })
})

app.post('/api/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo requerido' })
  res.json({ url: `/uploads/${req.file.filename}` })
})

app.post('/api/upload-many', auth, upload.array('files', 100), (req, res) => {
  const urls = (req.files || []).map(f => `/uploads/${f.filename}`)
  res.json({ urls })
})

app.get('/api/backup', auth, (req, res) => {
  const data = readProducts()
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', 'attachment; filename=metagro-products.json')
  res.send(JSON.stringify(data, null, 2))
})

app.post('/api/backup', auth, (req, res) => {
  const body = Array.isArray(req.body) ? req.body : []
  const count = body.length
  writeProducts(body.map(p => ({ id: typeof p.id === 'number' ? p.id : Date.now(), ...p })))
  res.json({ ok: true, count })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

// ---- Home Content API (solo auth) ----
app.get('/api/home-content', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const result = await pool.query('SELECT * FROM home_content ORDER BY categoria, id');
    const map = {};
    result.rows.forEach(r => { map[r.id] = r; });
    await pool.end();
    res.json({ ok: true, data: map });
  } catch (e) {
    console.error('[home-content] GET error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/home-content', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const { changes, usuario, ip_address } = req.body;
    if (!Array.isArray(changes)) return res.status(400).json({ error: 'changes debe ser array' });

    await pool.query('BEGIN');
    for (const c of changes) {
      if (!c.id || !c.nuevo) continue;
      const current = await pool.query('SELECT * FROM home_content WHERE id = $1 FOR UPDATE', [c.id]);
      if (!current.rows.length) continue;
      const row = current.rows[0];
      const anterior = row.valor;
      if (anterior === c.nuevo) continue;
      await pool.query('UPDATE home_content SET valor = $1, updated_at = NOW() WHERE id = $2', [c.nuevo, c.id]);
      await pool.query(
        `INSERT INTO home_content_history (content_id, valor_anterior, valor_nuevo, categoria, descripcion_campo, cambiado_por, ip_address) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [c.id, anterior, c.nuevo, row.categoria, row.descripcion, usuario || null, ip_address || null]
      );
    }
    await pool.query('COMMIT');

    const updated = await pool.query('SELECT * FROM home_content ORDER BY categoria, id');
    const map = {};
    updated.rows.forEach(r => { map[r.id] = r; });
    await pool.end();
    res.json({ ok: true, message: `${changes.filter(c => c.nuevo).length} campos actualizados`, data: map });
  } catch (e) {
    console.error('[home-content] POST error:', e);
    try { await pool.query('ROLLBACK'); } catch {}
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/home-content/history', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const result = await pool.query(
      `SELECT h.*, c.descripcion as campo_descripcion FROM home_content_history h JOIN home_content c ON c.id = h.content_id ORDER BY h.created_at DESC LIMIT 200`
    );
    await pool.end();
    res.json({ ok: true, data: result.rows });
  } catch (e) {
    console.error('[home-content] history error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/home-content/restore', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const { history_id, usuario, ip_address } = req.body;
    const record = await pool.query('SELECT * FROM home_content_history WHERE id = $1', [history_id]);
    if (!record.rows.length) return res.status(404).json({ error: 'No encontrado' });
    const rec = record.rows[0];
    await pool.query('BEGIN');
    await pool.query('UPDATE home_content SET valor = $1, updated_at = NOW() WHERE id = $2', [rec.valor_anterior, rec.content_id]);
    await pool.query(
      `INSERT INTO home_content_history (content_id, valor_anterior, valor_nuevo, categoria, descripcion_campo, cambiado_por, ip_address) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [rec.content_id, rec.valor_nuevo, rec.valor_anterior, rec.categoria, rec.descripcion_campo, usuario || null, ip_address || null]
    );
    await pool.query('COMMIT');
    await pool.end();
    res.json({ ok: true, message: 'Versión restaurada' });
  } catch (e) {
    console.error('[home-content] restore error:', e);
    try { await pool.query('ROLLBACK'); } catch {}
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Metagro API on :${PORT}`))
