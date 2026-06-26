require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const compression = require('compression')
const winston = require('winston')
require('winston-daily-rotate-file')
const Sentry = require('@sentry/node')
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

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1
  })
}

const originalConsoleError = console.error
console.error = (...args) => {
  logger.error(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
  originalConsoleError.apply(console, args)
}

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
  ? ['https://metagro.com.ar', 'https://www.metagro.com.ar']
  : ['http://localhost:*', 'http://127.0.0.1:*', 'http://localhost:4000', 'http://127.0.0.1:4000', 'http://localhost:3000', 'http://localhost:5173', 'file://'];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.some(o => origin === o || (o.endsWith('*') && origin.startsWith(o.slice(0, -1))))) {
      cb(null, true);
    } else {
      cb(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: process.env.NODE_ENV === 'production'
        ? ["'self'", "https://api.openstreetmap.org"]
        : ["'self'", "http://localhost:*", "http://127.0.0.1:*", "https://api.openstreetmap.org"],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
}))
app.use(cors(corsOptions))
app.use(compression())
app.use(express.json({ limit: '50mb' }))

const { languageMiddleware } = require('./middleware/language.middleware')
app.use(languageMiddleware)

if (process.env.SENTRY_DSN) {
  app.use(Sentry.requestHandler())
}

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
const ADMIN_TOKEN = process.env.METAGRO_TOKEN

if (!JWT_SECRET && !ADMIN_TOKEN) {
  logger.error('[STARTUP] JWT_SECRET y METAGRO_TOKEN NO configurados. El servidor arrancará en modo solo lectura.')
} else if (!JWT_SECRET) {
  logger.warn('[STARTUP] JWT_SECRET no configurado. Defínelo en .env para mayor seguridad.')
} else if (!ADMIN_TOKEN) {
  logger.warn('[STARTUP] METAGRO_TOKEN no configurado. Defínelo en .env o no podrás autenticar.')
}

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS translations (
      id VARCHAR(100) PRIMARY KEY,
      lang VARCHAR(10) NOT NULL DEFAULT 'es',
      value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_translations_lang ON translations(lang)`);

  const rows = await pool.query('SELECT count(*) as total FROM home_content');
  const count = parseInt(rows.rows[0].total, 10);
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

  const transRows = await pool.query('SELECT count(*) as total FROM translations');
  const transCount = parseInt(transRows.rows[0].total, 10);
  if (transCount === 0) {
    await pool.query(`
      INSERT INTO translations (id, lang, value) VALUES
        ('hero.linea1', 'es', 'SIEMPRE JUNTO'),
        ('hero.linea2', 'es', 'AL CAMPO.'),
        ('hero.desc', 'es', 'Insumos para la agroganadería, alambrados, molinos, aguadas y ferretería.'),
        ('vent.eyebrow', 'es', 'POR QUÉ ELEGIRNOS'),
        ('vent.title.1', 'es', 'VENTAJAS'),
        ('vent.title.2', 'es', 'METAGRO'),
        ('cont.eyebrow', 'es', 'CONTACTO'),
        ('cont.title.1', 'es', '¿NECESITÁS UN PRODUCTO?'),
        ('cont.title.2', 'es', 'CONSULTANOS.'),
        ('cont.desc', 'es', 'Asesoramiento sin compromiso por WhatsApp o teléfono.'),
        ('nav.products', 'es', 'PRODUCTOS'),
        ('nav.about', 'es', 'NOSOTROS'),
        ('nav.location', 'es', 'LOCAL'),
        ('nav.contact', 'es', 'CONTACTO'),
        ('hero.eyebrow', 'es', 'Gualeguay, Entre Ríos · Desde 1983'),
        ('hero.products', 'es', 'Ver Productos'),
        ('products.label', 'es', 'Lo que ofrecemos'),
        ('ventajas.label', 'es', 'Por qué elegirnos'),
        ('info.label', 'es', 'Dónde encontrarnos'),
        ('contacto.label', 'es', 'Contacto'),
        ('hero.linea1', 'en', 'ALWAYS WITH'),
        ('hero.linea2', 'en', 'THE COUNTRYSIDE.'),
        ('hero.desc', 'en', 'Supplies for livestock farming, fencing, windmills, water troughs, and hardware.'),
        ('vent.eyebrow', 'en', 'WHY CHOOSE US'),
        ('vent.title.1', 'en', 'ADVANTAGES'),
        ('vent.title.2', 'en', 'METAGRO'),
        ('cont.eyebrow', 'en', 'CONTACT'),
        ('cont.title.1', 'en', 'DO YOU NEED A PRODUCT?'),
        ('cont.title.2', 'en', 'CONTACT US.'),
        ('cont.desc', 'en', 'Free advice via WhatsApp or phone.'),
        ('nav.products', 'en', 'PRODUCTS'),
        ('nav.about', 'en', 'ABOUT US'),
        ('nav.location', 'en', 'LOCATION'),
        ('nav.contact', 'en', 'CONTACT'),
        ('hero.eyebrow', 'en', 'Gualeguay, Entre Ríos · Since 1983'),
        ('hero.products', 'en', 'View Products'),
        ('products.label', 'en', 'What we offer'),
        ('ventajas.label', 'en', 'Why choose us'),
        ('info.label', 'en', 'Where to find us'),
        ('contacto.label', 'en', 'Contact')
    `);
  }
}

initDb().catch(err => console.error('[DB] init error:', err));

const { scheduledBackup } = require('./services/backup.service')
let lastBackupDate = null;
async function maybeRunScheduledBackup() {
  const date = new Date();
  const hour = date.getHours();
  const dateStr = date.toDateString();
  if (dateStr !== lastBackupDate && hour === 3) {
    lastBackupDate = dateStr;
    try {
      await scheduledBackup({})
      logger.info('[backup] scheduled backup completed')
    } catch (e) {
      logger.error('[backup] scheduled backup failed:', e)
    }
  }
}
setInterval(maybeRunScheduledBackup, 60 * 60 * 1000)

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
app.use('/api', require('./routes/health.routes'))
app.use('/api', require('./routes/seo.routes'))

app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', err)
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err)
  }
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

if (process.env.SENTRY_DSN) {
  app.use(Sentry.errorHandler())
}

async function shutdown() {
  logger.info('Cerrando servidor...')
  await pool.end()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

const { backupDatabase } = require('./services/backup.service')

const dbBackupEnabled = process.env.DB_BACKUP_ENABLED === 'true' && process.env.DATABASE_URL

setInterval(async () => {
  if (!dbBackupEnabled) return
  const now = new Date()
  if (now.getHours() === 3 && now.getMinutes() === 0) {
    logger.info('Iniciando backup programado de DB + S3')
    try {
      await backupDatabase()
    } catch (e) {
      logger.error('Backup programado falló:', e)
    }
  }
}, 60 * 1000)

app.listen(PORT, () => logger.info(`Metagro API on :${PORT}`))