require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const winston = require('winston')
const pool = require('./data/pool')
const app = express()

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
})

if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.DailyRotateFile({
    dirname: path.join(__dirname, 'logs'),
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  }))
}

const originalConsoleError = console.error
console.error = (...args) => {
  logger.error(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
  originalConsoleError.apply(console, args)
}

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? ['https://metagro.com.ar', 'https://www.metagro.com.ar']
  : ['http://localhost:4000', 'http://127.0.0.1:4000', 'http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: ALLOWED_ORIGINS,
  credentials: true
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.openstreetmap.org"],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
}))
app.use(cors(corsOptions))
app.use(compression())
app.use(express.json({ limit: '50mb' }))

app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  next()
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(generalLimiter)

const PORT = process.env.PORT || 4000
const DATA_DIR = path.join(__dirname, 'data')
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads')

function csrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin || req.headers.referer || '';
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));
  if (!allowed) return res.status(403).json({ error: 'Origin not allowed' });
  next();
}

app.use(csrf)

let JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) console.warn('[WARN] JWT_SECRET no configurado. Defínelo en .env para mayor seguridad.')
const ADMIN_TOKEN = process.env.METAGRO_TOKEN
if (!ADMIN_TOKEN) console.warn('[WARN] METAGRO_TOKEN no configurado. Defínelo en .env o no podrás autenticar.')

function ensureDirs() {
  [DATA_DIR, UPLOAD_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
  })
}
ensureDirs()

async function initDb() {
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
}

initDb().catch(err => console.error('[DB] init error:', err));

const PRODUCTOS_DIR = path.join(__dirname, '..', 'frontend', 'productos')
app.use('/productos', express.static(PRODUCTOS_DIR, {
  maxAge: '1d',
  immutable: true,
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
}))
app.use('/uploads', express.static(UPLOAD_DIR, {
  maxAge: '1d',
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=86400')
}))
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  maxAge: '1h',
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=3600')
}))

app.use('/api/admin', require('./routes/auth.routes'))
app.use('/api', require('./routes/productos.routes'))
app.use('/api', require('./routes/home.routes'))
app.use('/api', require('./routes/site.routes'))

app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', err)
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Archivo demasiado grande (máximo 5MB).' })
  }
  if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(413).json({ error: 'Demasiados archivos en la solicitud.' })
  }
  if (err && err.message && err.message.includes('Tipo de archivo no permitido')) {
    return res.status(415).json({ error: err.message })
  }
  res.status(500).json({ error: 'Server error' })
})

app.listen(PORT, () => logger.info(`Metagro API on :${PORT}`))