const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const header = req.headers['x-mg-token'] || ''
  if (!header) return res.status(401).json({ error: 'Unauthorized' })
  const JWT_SECRET = process.env.JWT_SECRET
  const ADMIN_TOKEN = process.env.METAGRO_TOKEN
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

module.exports = { auth }
