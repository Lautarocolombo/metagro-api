const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : (process.env.NODE_ENV === 'production'
    ? ['https://metagro.com.ar', 'https://www.metagro.com.ar', 'https://metagro-srl.vercel.app', 'https://metagro.vercel.app', 'https://*.vercel.app']
    : ['http://localhost:*', 'http://127.0.0.1:*']);

function isWildcardMatch(pattern, originStr) {
  if (!pattern || !originStr) return pattern === '*';
  if (pattern === '*') return true;
  if (pattern === originStr) return true;
  const i = pattern.indexOf('*');
  if (i === -1) return false;
  const prefix = pattern.slice(0, i);
  const suffix = pattern.slice(i + 1);
  return originStr.startsWith(prefix) && originStr.endsWith(suffix);
}

const corsOptions = {
  origin: (origin, cb) => cb(null, true),
  credentials: true
};

function csrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin || req.headers.referer || '';
  if (!ALLOWED_ORIGINS.some(o => isWildcardMatch(o, origin))) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  next();
}

module.exports = { corsOptions, csrf, ALLOWED_ORIGINS };
