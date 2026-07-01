const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { pool } = require('../config/db')

function login(req, res) {
  try {
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
    const role = 'admin'
    const accessToken = jwt.sign({ role, user: ADMIN_USER }, process.env.JWT_SECRET, { expiresIn: '15m' })
    const refreshToken = crypto.randomBytes(48).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    pool.query(
      'INSERT INTO refresh_tokens (token_hash, user_id, role, expires_at) VALUES ($1, $2, $3, $4)',
      [tokenHash, ADMIN_USER, role, expiresAt]
    ).catch(e => console.error('[auth] refresh token insert error:', e.message))
    res.json({ token: accessToken, refreshToken, expiresIn: 900 })
  } catch (e) {
    console.error('[auth] login error:', e)
    console.error('[auth] login error stack:', e.stack)
    res.status(500).json({ error: 'Server error', detail: e.message })
  }
}

async function refresh(req, res) {
  const { refreshToken } = req.body || {}
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token requerido' })
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  try {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()',
      [tokenHash]
    )
    const row = result.rows[0]
    if (!row) return res.status(401).json({ error: 'Refresh token inválido o expirado' })
    await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [row.id])
    const newAccessToken = jwt.sign({ role: row.role, user: row.user_id }, process.env.JWT_SECRET, { expiresIn: '15m' })
    const newRefreshToken = crypto.randomBytes(48).toString('hex')
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex')
    const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO refresh_tokens (token_hash, user_id, role, expires_at) VALUES ($1, $2, $3, $4)',
      [newHash, row.user_id, row.role, newExpires]
    )
    res.json({ token: newAccessToken, refreshToken: newRefreshToken, expiresIn: 900 })
  } catch (e) {
    console.error('[auth] refresh error:', e)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = { login, refresh }
