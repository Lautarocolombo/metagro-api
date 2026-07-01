require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const Sentry = require('@sentry/node');
const logger = require('./config/logger');
const { corsOptions, csrf, ALLOWED_ORIGINS } = require('./config/cors');
const { pool, initDb } = require('./config/db');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1
  });
}

const app = express();
app.set('trust proxy', 1);

app.use(require('helmet')({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: process.env.NODE_ENV === 'production'
        ? ["'self'", "https://api.openstreetmap.org", "https://tile.openstreetmap.org", "https://*.tile.openstreetmap.org", "https://cdn.jsdelivr.net", "https://metagro-api-ds6r.onrender.com", "https://*.google.com", "https://*.googleapis.com"]
        : ["'self'", "http://localhost:*", "http://127.0.0.1:*", "https://api.openstreetmap.org", "https://tile.openstreetmap.org", "https://cdn.jsdelivr.net"],
      frameSrc: ["'self'", "https://www.google.com", "https://www.googleusercontent.com", "https://maps.google.com", "https://*.google.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(require('cors')(corsOptions));
app.options('*', require('cors')(corsOptions));

app.use((req, res, next) => {
  const origin = req.headers.origin || 'no-origin';
  logger.info(`[REQUEST] ${req.method} ${req.path} from ${origin}`);
  next();
});

app.use(compression());
app.use(express.json({ limit: '1mb' }));

const { languageMiddleware } = require('./middleware/language.middleware');
app.use(languageMiddleware);

if (process.env.SENTRY_DSN) {
  app.use(Sentry.requestHandler());
}

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

app.use(csrf);

const PORT = process.env.PORT || 10000;
const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
global.startTime = Date.now();

function ensureDirs() {
  [DATA_DIR, UPLOAD_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}
ensureDirs();

let JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_TOKEN = process.env.METAGRO_TOKEN;

if (!JWT_SECRET && !ADMIN_TOKEN) {
  logger.error('[STARTUP] JWT_SECRET y METAGRO_TOKEN NO configurados. El servidor arrancará en modo solo lectura.');
} else if (!JWT_SECRET) {
  logger.warn('[STARTUP] JWT_SECRET no configurado. Defínelo en .env para mayor seguridad.');
} else if (!ADMIN_TOKEN) {
  logger.warn('[STARTUP] METAGRO_TOKEN no configurado. Defínelo en .env o no podrás autenticar.');
}

initDb().catch(err => {
  console.error('[DB] init error (non-fatal, server continues):', err.message);
  setTimeout(() => initDb().catch(e => console.error('[DB] retry error:', e.message)), 5000);
});

const { scheduledBackup } = require('./services/backup.service');
let lastBackupDate = null;
async function maybeRunScheduledBackup() {
  const date = new Date();
  const hour = date.getHours();
  const dateStr = date.toDateString();
  if (dateStr !== lastBackupDate && hour === 3) {
    lastBackupDate = dateStr;
    try {
      await scheduledBackup({});
      logger.info('[backup] scheduled backup completed');
    } catch (e) {
      logger.error('[backup] scheduled backup failed:', e);
    }
  }
}
setInterval(maybeRunScheduledBackup, 60 * 60 * 1000);

const PRODUCTOS_DIR = path.join(__dirname, '..', 'frontend', 'productos');
app.use('/productos', express.static(PRODUCTOS_DIR, {
  maxAge: '1d',
  immutable: true,
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
}));
app.use('/uploads', express.static(UPLOAD_DIR, {
  maxAge: '1d',
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=86400')
}));
app.use(express.static(path.join(__dirname, '..', 'frontend'), {
  maxAge: '1h',
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=3600')
}));

app.use('/api/admin', require('./routes/auth.routes'));
app.use('/api', require('./routes/productos.routes'));
app.use('/api', require('./routes/home.routes'));
app.use('/api', require('./routes/site.routes'));
app.use('/api', require('./routes/health.routes'));
app.use('/api', require('./routes/seo.routes'));

app.get('/api', (req, res) => res.json({ ok: true, service: 'metagro-api', version: process.env.npm_package_version || '2.2.0' }));
app.get('/api/healthz', (req, res) => res.json({ ok: true, uptime: Math.floor((Date.now() - (global.startTime || Date.now())) / 1000) }));

process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando...');
  pool.end().then(() => process.exit(0)).catch(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando...');
  pool.end().then(() => process.exit(0)).catch(() => process.exit(0));
});

app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', err);
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Archivo demasiado grande (máximo 5MB).' });
  }
  if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(413).json({ error: 'Demasiados archivos en la solicitud.' });
  }
  if (err && err.message && err.message.includes('Tipo de archivo no permitido')) {
    return res.status(415).json({ error: err.message });
  }
  res.status(500).json({ error: 'Server error' });
});

if (process.env.SENTRY_DSN) {
  app.use(Sentry.errorHandler());
}

async function shutdown() {
  logger.info('Cerrando servidor...');
  await pool.end();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('uncaughtException', (err) => {
  logger.error('[FATAL] Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('[FATAL] Unhandled rejection:', reason);
  process.exit(1);
});

const { backupDatabase } = require('./services/backup.service');
const dbBackupEnabled = process.env.DB_BACKUP_ENABLED === 'true' && process.env.DATABASE_URL;

setInterval(async () => {
  if (!dbBackupEnabled) return;
  const now = new Date();
  if (now.getHours() === 3 && now.getMinutes() === 0) {
    logger.info('Iniciando backup programado de DB + S3');
    try {
      await backupDatabase();
    } catch (e) {
      logger.error('Backup programado falló:', e);
    }
  }
}, 60 * 1000);

// Catch-all para errores no manejados (no cierra el servidor)
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err);
  // No cerramos el servidor para que Render lo mantenga vivo
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled rejection:', reason);
  // No cerramos el servidor para que Render lo mantenga vivo
});

app.listen(PORT, () => logger.info(`Metagro API on :${PORT}`));
