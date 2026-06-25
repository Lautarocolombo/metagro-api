const pool = require('../data/pool')

async function getHomeContent(req, res) {
  try {
    const result = await pool.query('SELECT * FROM home_content ORDER BY categoria, id')
    const map = {}
    result.rows.forEach(r => { map[r.id] = r })
    res.json({ ok: true, data: map })
  } catch (e) {
    console.error('[home-content] GET error:', e)
    res.status(500).json({ error: e.message })
  }
}

async function postHomeContent(req, res) {
  try {
    const { changes, usuario, ip_address } = req.body
    if (!Array.isArray(changes)) return res.status(400).json({ error: 'changes debe ser array' })

    await pool.query('BEGIN')
    for (const c of changes) {
      if (!c.id || !c.nuevo) continue
      const current = await pool.query('SELECT * FROM home_content WHERE id = $1 FOR UPDATE', [c.id])
      if (!current.rows.length) continue
      const row = current.rows[0]
      const anterior = row.valor
      if (anterior === c.nuevo) continue
      await pool.query('UPDATE home_content SET valor = $1, updated_at = NOW() WHERE id = $2', [c.nuevo, c.id])
      await pool.query(
        'INSERT INTO home_content_history (content_id, valor_anterior, valor_nuevo, categoria, descripcion_campo, cambiado_por, ip_address) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [c.id, anterior, c.nuevo, row.categoria, row.descripcion, usuario || null, ip_address || null]
      )
    }
    await pool.query('COMMIT')

    const updated = await pool.query('SELECT * FROM home_content ORDER BY categoria, id')
    const map = {}
    updated.rows.forEach(r => { map[r.id] = r })
    res.json({ ok: true, message: `${changes.filter(c => c.nuevo).length} campos actualizados`, data: map })
  } catch (e) {
    console.error('[home-content] POST error:', e)
    try { await pool.query('ROLLBACK') } catch (_e) { /* rollback fallido */ }
    res.status(500).json({ error: e.message })
  }
}

async function getHomeContentHistory(req, res) {
  try {
    const result = await pool.query(
      'SELECT h.*, c.descripcion as campo_descripcion FROM home_content_history h JOIN home_content c ON c.id = h.content_id ORDER BY h.created_at DESC LIMIT 200'
    )
    res.json({ ok: true, data: result.rows })
  } catch (e) {
    console.error('[home-content] history error:', e)
    res.status(500).json({ error: e.message })
  }
}

async function restoreHomeContent(req, res) {
  try {
    const { history_id, usuario, ip_address } = req.body
    const record = await pool.query('SELECT * FROM home_content_history WHERE id = $1', [history_id])
    if (!record.rows.length) return res.status(404).json({ error: 'No encontrado' })
    const rec = record.rows[0]
    await pool.query('BEGIN')
    await pool.query('UPDATE home_content SET valor = $1, updated_at = NOW() WHERE id = $2', [rec.valor_anterior, rec.content_id])
    await pool.query(
      'INSERT INTO home_content_history (content_id, valor_anterior, valor_nuevo, categoria, descripcion_campo, cambiado_por, ip_address) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [rec.content_id, rec.valor_nuevo, rec.valor_anterior, rec.categoria, rec.descripcion_campo, usuario || null, ip_address || null]
    )
    await pool.query('COMMIT')

    res.json({ ok: true, message: 'Versión restaurada' })
  } catch (e) {
    console.error('[home-content] restore error:', e)
    try { await pool.query('ROLLBACK') } catch (_e) { /* rollback fallido */ }
    res.status(500).json({ error: e.message })
  }
}

module.exports = {
  getHomeContent,
  postHomeContent,
  getHomeContentHistory,
  restoreHomeContent
}
