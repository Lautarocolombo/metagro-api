const pool = require('../data/pool')

async function getSiteTexts(req, res) {
  try {
    const result = await pool.query('SELECT key, value FROM site_texts')
    const texts = {}
    result.rows.forEach(r => { texts[r.key] = r.value })
    res.json({ ok: true, texts })
  } catch (e) {
    console.error('[site-texts] GET error:', e)
    res.status(500).json({ error: e.message })
  }
}

async function updateSiteText(req, res) {
  try {
    const { key } = req.params
    const { value } = req.body
    if (!key) return res.status(400).json({ error: 'key requerida' })
    const section = key.startsWith('hero_') ? 'hero' : key.startsWith('vent_') ? 'ventajas' : key.startsWith('cont_') ? 'contacto' : 'root'

    await pool.query(
      'INSERT INTO site_texts (section, key, value, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (key) DO UPDATE SET value = $3, updated_at = NOW()',
      [section, key, value]
    )
    await pool.query(
      'INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)',
      ['site_texts', `Texto actualizado: ${key}`, JSON.stringify({ key, value }), 'admin', req.ip || req.connection.remoteAddress || null]
    )
    res.json({ ok: true })
  } catch (e) {
    console.error('[site-texts] PUT error:', e)
    res.status(500).json({ error: e.message })
  }
}

async function createSiteChange(req, res) {
  try {
    const { tipo, descripcion, datos } = req.body
    if (!tipo || !descripcion) return res.status(400).json({ error: 'tipo y descripcion requeridos' })

    const usuario = req.headers['x-mg-token'] ? 'admin' : 'anonimo'
    await pool.query(
      'INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [tipo, descripcion, datos ? JSON.stringify(datos) : null, usuario, req.ip || req.connection.remoteAddress || null]
    )

    res.json({ ok: true })
  } catch (e) {
    console.error('[site-changes] POST error:', e)
    res.status(500).json({ error: e.message })
  }
}

async function getSiteChanges(req, res) {
  try {
    const result = await pool.query('SELECT * FROM site_changes ORDER BY created_at DESC LIMIT 100')
    res.json({ ok: true, cambios: result.rows })
  } catch (e) {
    console.error('[site-changes] GET error:', e)
    res.status(500).json({ error: e.message })
  }
}

module.exports = {
  getSiteTexts,
  updateSiteText,
  createSiteChange,
  getSiteChanges
}
