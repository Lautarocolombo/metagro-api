const jwt = require('jsonwebtoken')

function extractToken(req) {
  // Preferimos el esquema que usa tu frontend actual
  const xMg = req.headers['x-mg-token']
  if (typeof xMg === 'string' && xMg.trim()) return xMg.trim()

  // Compatibilidad: Authorization: Bearer <token>
  const auth = req.headers['authorization']
  if (typeof auth === 'string') {
    const m = auth.match(/^Bearer\s+(.+)$/i)
    if (m && m[1]) return m[1].trim()
    // Compatibilidad extra: Authorization: <token>
    if (!auth.toLowerCase().startsWith('bearer ')) return auth.trim()
  }

  return ''
}

function auth(req, res, next) {
  const header = extractToken(req)
  if (!header) return res.status(401).json({ error: 'Unauthorized' })

  const JWT_SECRET = process.env.JWT_SECRET
  const ADMIN_TOKEN = process.env.METAGRO_TOKEN

  // Caso 1: token hardcodeado
  if (ADMIN_TOKEN && header === ADMIN_TOKEN) return next()

  // Caso 2: token JWT
  if (!JWT_SECRET) return res.status(500).json({ error: 'JWT_SECRET no configurado en el servidor.' })
  try {
    jwt.verify(header, JWT_SECRET)
    return next()
  } catch (_e) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

module.exports = { auth }

