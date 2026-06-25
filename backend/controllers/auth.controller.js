const jwt = require('jsonwebtoken')

function login(req, res) {
  const { username, password } = req.body || {}
  const ADMIN_USER = process.env.ADMIN_USER
  const ADMIN_PASS = process.env.ADMIN_PASS
  if (!ADMIN_USER || !ADMIN_PASS) {
    return res.status(500).json({ error: 'Credenciales de admin no configuradas en el servidor.' })
  }
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET no configurado en el servidor.' })
  }
  const token = jwt.sign({ role: 'admin', user: ADMIN_USER }, process.env.JWT_SECRET, { expiresIn: '8h' })
  res.json({ token })
}

module.exports = { login }
