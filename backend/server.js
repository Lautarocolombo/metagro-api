require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
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
    if (!JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET no configurado en el servidor.' })
    try {
      jwt.verify(header, JWT_SECRET)
      return next()
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }
  if (header === ADMIN_TOKEN) return next()
  if (!JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET no configurado en el servidor.' })
  try {
    jwt.verify(header, JWT_SECRET)
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

async function initDb() {
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos_ganaderos (
      id SERIAL PRIMARY KEY,
      categoria VARCHAR(100),
      nombre VARCHAR(255),
      descripcion TEXT,
      especificaciones TEXT,
      imagen_url VARCHAR(500)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id BIGSERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES productos_ganaderos(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt_text TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos_ganaderos(categoria)');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS home_content (
      id VARCHAR(100) PRIMARY KEY,
      valor TEXT,
      categoria VARCHAR(100),
      descripcion TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS home_content_history (
      id SERIAL PRIMARY KEY,
      content_id VARCHAR(100) NOT NULL,
      valor_anterior TEXT,
      valor_nuevo TEXT,
      categoria VARCHAR(100),
      descripcion_campo TEXT,
      cambiado_por VARCHAR(255),
      ip_address VARCHAR(50),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_texts (
      key VARCHAR(100) PRIMARY KEY,
      section VARCHAR(50),
      value TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_changes (
      id SERIAL PRIMARY KEY,
      tipo VARCHAR(100),
      descripcion TEXT,
      datos TEXT,
      usuario VARCHAR(255),
      ip_address VARCHAR(50),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_site_texts_key ON site_texts(key)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_site_changes_tipo ON site_changes(tipo)');

  const rows = await pool.query('SELECT count(*) FROM home_content');
  const count = parseInt(rows.rows[0].count, 10);
  if (count === 0) {
    await pool.query(`
      INSERT INTO home_content (id, valor, categoria, descripcion) VALUES
        ('telefono', '03444 – 466919', 'contacto', 'Teléfono'),
        ('whatsapp', '5403444466919', 'contacto', 'WhatsApp'),
        ('mensaje-wa', 'Hola Metagro! Quiero consultar sobre sus productos.', 'contacto', 'Mensaje WhatsApp'),
        ('horario-semana', 'Lunes a Viernes: 8:00 – 12:00 / 15:00 – 19:00', 'horario', 'Horario semana'),
        ('horario-sabado', 'Sábados: 8:00 – 12:00', 'horario', 'Horario sábado'),
        ('direccion', 'Gualeguay, Entre Ríos · Argentina · CP 2840', 'ubicacion', 'Dirección')
    `);
  }
  await pool.end();
}
initDb().catch(err => console.error('[DB] init error:', err));

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

app.get('/api/products', async (req, res) => {
  try {
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } })
    const result = await pool.query('SELECT id, categoria, nombre, descripcion, especificaciones, imagen_url FROM productos_ganaderos ORDER BY id')
    const products = result.rows.map(r => ({
      id: r.id,
      name: r.nombre || 'Producto',
      tag: r.categoria || 'General',
      desc: r.descripcion || '',
      icon: '',
      img: r.imagen_url || '',
      imagen_url: r.imagen_url || '',
      images: r.imagen_url ? [r.imagen_url] : [],
      especificaciones: r.especificaciones || ''
    }))
    await pool.end()
    res.json(products)
  } catch (e) {
    console.error('[api/products] error:', e)
    res.json(readProducts())
  }
})

function registrarCambio(tipo, descripcion, datos, req) {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const usuario = 'admin';
    const ip = req.ip || req.connection.remoteAddress || null;
    pool.query(
      `INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)`,
      [tipo, descripcion, datos ? JSON.stringify(datos) : null, usuario, ip]
    );
    pool.end();
  } catch (e) {
    console.error('[registrarCambio] error:', e);
  }
}

app.post('/api/products', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const images = Array.isArray(req.body.images)
      ? req.body.images.filter(Boolean)
      : (req.body.img ? [req.body.img] : []);
    const mainImg = images[0] || '';
    const variantImages = images.slice(1);
    const result = await pool.query(
      `INSERT INTO productos_ganaderos (categoria, nombre, descripcion, especificaciones, imagen_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [req.body.tag || req.body.categoria || 'General', req.body.name || '', req.body.desc || '', req.body.desc || '', mainImg]
    );
    const productId = result.rows[0].id;
    if (variantImages.length > 0) {
      for (const img of variantImages) {
        await pool.query('INSERT INTO product_images (product_id, url) VALUES ($1, $2)', [productId, img]);
      }
    }
    await pool.end();
    const product = {
      id: productId,
      name: req.body.name || '',
      tag: req.body.tag || req.body.categoria || 'General',
      desc: req.body.desc || '',
      icon: '📦',
      img: mainImg,
      images,
      categoria: req.body.tag || req.body.categoria || 'General',
      imagen_url: mainImg
    };
    registrarCambio('producto_nuevo', `Producto creado: ${product.name}`, { id: product.id, name: product.name }, req);
    res.status(201).json(product);
  } catch (e) {
    console.error('[POST /api/products] error:', e);
    res.status(400).json({ error: 'Bad request', detail: e.message });
  }
});

app.put('/api/products/:id', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const productId = parseInt(req.params.id);
    const images = Array.isArray(req.body.images)
      ? req.body.images.filter(Boolean)
      : (req.body.img ? [req.body.img] : []);
    const mainImg = images[0] || '';
    const variantImages = images.slice(1);
    await pool.query(
      `UPDATE productos_ganaderos
       SET categoria = $1, nombre = $2, descripcion = $3, especificaciones = $4, imagen_url = $5
       WHERE id = $6`,
      [req.body.tag || req.body.categoria || 'General', req.body.name || '', req.body.desc || '', req.body.desc || '', mainImg, productId]
    );
    if (variantImages.length > 0) {
      await pool.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
      for (const img of variantImages) {
        await pool.query('INSERT INTO product_images (product_id, url) VALUES ($1, $2)', [productId, img]);
      }
    }
    await pool.end();
    const product = {
      id: productId,
      name: req.body.name || '',
      tag: req.body.tag || req.body.categoria || 'General',
      desc: req.body.desc || '',
      icon: '📦',
      img: mainImg,
      images,
      categoria: req.body.tag || req.body.categoria || 'General',
      imagen_url: mainImg
    };
    const cambios = Object.keys(req.body);
    registrarCambio('producto_editado', `Producto editado: ${product.name} (${cambios.join(', ')})`, { id: product.id, cambios }, req);
    res.json(product);
  } catch (e) {
    console.error('[PUT /api/products/:id] error:', e);
    res.status(400).json({ error: 'Bad request', detail: e.message });
  }
});

app.delete('/api/products/:id', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const productId = parseInt(req.params.id);
    await pool.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    await pool.query('DELETE FROM productos_ganaderos WHERE id = $1', [productId]);
    await pool.end();
    registrarCambio('producto_eliminado', `Producto eliminado ID ${productId}`, { id: productId }, req);
    res.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /api/products/:id] error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

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

app.get('/api/health', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    await pool.query('SELECT 1');
    await pool.end();
    res.json({ ok: true, db: 'connected' });
  } catch (e) {
    res.status(503).json({ ok: false, db: 'disconnected', error: e.message });
  }
});

app.get('/api/categories', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const result = await pool.query('SELECT DISTINCT categoria FROM productos_ganaderos WHERE categoria IS NOT NULL ORDER BY categoria');
    await pool.end();
    res.json(result.rows.map(r => r.categoria));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/products-test/status', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    await pool.query('SELECT 1');
    const result = await pool.query('SELECT count(*) as total FROM productos_ganaderos');
    await pool.end();
    res.json({ ok: true, db: 'connected', total: parseInt(result.rows[0].total) });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'disconnected', error: e.message });
  }
});

app.post('/api/products-test', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const data = req.body || {};
    const result = await pool.query(
      `INSERT INTO productos_ganaderos (categoria, nombre, descripcion, especificaciones, imagen_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [data.tag || data.categoria || 'TEST', data.name || '', data.desc || '', data.desc || '', data.img || '']
    );
    const id = result.rows[0].id;
    await pool.end();
    res.status(201).json({ ok: true, id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/products-test/:id', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const result = await pool.query('SELECT * FROM productos_ganaderos WHERE id = $1', [parseInt(req.params.id)]);
    await pool.end();
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/products-test/:id', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    await pool.query('DELETE FROM productos_ganaderos WHERE id = $1', [parseInt(req.params.id)]);
    await pool.end();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/guardar-config', auth, async (req, res) => {
  try {
    const cfg = req.body || {};
    fs.writeFileSync(path.join(DATA_DIR, 'config.json'), JSON.stringify(cfg, null, 2));
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    await pool.query(
      `INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)`,
      ['config', 'Configuración actualizada', JSON.stringify(cfg), 'admin', req.ip || req.connection.remoteAddress || null]
    );
    await pool.end();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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

app.get('/api/site-texts', async (req, res) => {
  try {
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } })
    const result = await pool.query('SELECT key, value FROM site_texts')
    const texts = {}
    result.rows.forEach(r => { texts[r.key] = r.value })
    await pool.end()
    res.json({ ok: true, texts })
  } catch (e) {
    console.error('[site-texts] GET error:', e)
    res.status(500).json({ error: e.message })
  }
})

app.put('/api/site-texts/:key', auth, async (req, res) => {
  try {
    const { key } = req.params
    const { value } = req.body
    if (!key) return res.status(400).json({ error: 'key requerida' })
    const section = key.startsWith('hero_') ? 'hero' : key.startsWith('vent_') ? 'ventajas' : key.startsWith('cont_') ? 'contacto' : 'root'
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } })
    await pool.query(
      `INSERT INTO site_texts (section, key, value, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (key) DO UPDATE SET value = $3, updated_at = NOW()`,
      [section, key, value]
    )
    await pool.query(
      `INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)`,
      ['site_texts', `Texto actualizado: ${key}`, JSON.stringify({ key, value }), 'admin', req.ip || req.connection.remoteAddress || null]
    )
    await pool.end()
    res.json({ ok: true })
  } catch (e) {
    console.error('[site-texts] PUT error:', e)
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/site-changes', auth, async (req, res) => {
  try {
    const { tipo, descripcion, datos } = req.body;
    if (!tipo || !descripcion) return res.status(400).json({ error: 'tipo y descripcion requeridos' });
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const usuario = req.headers['x-mg-token'] ? 'admin' : 'anonimo';
    await pool.query(
      `INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)`,
      [tipo, descripcion, datos ? JSON.stringify(datos) : null, usuario, req.ip || req.connection.remoteAddress || null]
    );
    await pool.end();
    res.json({ ok: true });
  } catch (e) {
    console.error('[site-changes] POST error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/site-changes', auth, async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
    const result = await pool.query('SELECT * FROM site_changes ORDER BY created_at DESC LIMIT 100');
    await pool.end();
    res.json({ ok: true, cambios: result.rows });
  } catch (e) {
    console.error('[site-changes] GET error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Metagro API on :${PORT}`))
