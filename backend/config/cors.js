const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : (process.env.NODE_ENV === 'production'
    ? ['https://metagro.com.ar', 'https://www.metagro.com.ar', 'https://metagro-srl.vercel.app', 'https://metagro.vercel.app', 'https://*.vercel.app']
    : ['http://localhost:*', 'http://127.0.0.1:*']);

const corsOptions = {
  origin: (origin, cb) => {
    const originStr = typeof origin === 'string' ? origin : (origin === null ? 'null' : String(origin));
    const isAllowed = !origin || ALLOWED_ORIGINS.some(o => {
      if (o === '*') return true;
      if (o === originStr) return true;
      if (o.endsWith('*')) return originStr.startsWith(o.slice(0, -1));
      return false;
    }) || (process.env.NODE_ENV === 'production' && originStr.endsWith('.vercel.app'));
    if (isAllowed) {
      cb(null, true);
    } else {
      console.log('[CORS] Blocked origin:', originStr);
      cb(new Error('Origin not allowed by CORS'));
    }
  },
  credentials: true
};

function csrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin || req.headers.referer || '';
  if (!ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  next();
}

module.exports = { corsOptions, csrf, ALLOWED_ORIGINS };
