const jwt = require('jsonwebtoken')

function extractToken(req) {
  const xMg = req.headers['x-mg-token']
  if (typeof xMg === 'string' && xMg.trim()) return xMg.trim()
  const auth = req.headers['authorization']
  if (typeof auth === 'string') {
    const m = auth.match(/^Bearer\s+(.+)$/i)
    if (m && m[1]) return m[1].trim()
    if (!auth.toLowerCase().startsWith('bearer ')) return auth.trim()
  }
  return ''
}

function auth(req, res, next) {
  const header = extractToken(req)
  if (!header) return res.status(401).json({ error: 'Unauthorized' })

  const JWT_SECRET = process.env.JWT_SECRET
  const ADMIN_TOKEN = process.env.METAGRO_TOKEN

  if (!JWT_SECRET && !ADMIN_TOKEN) {
    return res.status(500).json({ error: 'Servicio no disponible: credenciales de autenticación no configuradas.' })
  }

  if (ADMIN_TOKEN && header === ADMIN_TOKEN) {
    req.user = { username: 'admin', role: 'admin', source: 'token' }
    return next()
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'Servicio no disponible: JWT_SECRET no configurado.' })
  }
  try {
    const decoded = jwt.verify(header, JWT_SECRET)
    req.user = { username: decoded.user || decoded.sub || 'jwt-user', role: decoded.role || 'admin', source: 'jwt' }
    return next()
  } catch (_e) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

function requireRole(role) {
  if (typeof role === 'string') role = [role]
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if (!role.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}

module.exports = { auth, requireRole }
