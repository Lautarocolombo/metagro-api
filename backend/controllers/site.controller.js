const { pool } = require('../config/db')
const { siteTextSchema, siteChangeSchema } = require('../validators/schemas')
const { getPublicUrl } = require('../services/storage.service')

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
    const parsed = siteTextSchema.parse(req.body)
    const { key, value } = parsed
    const section = key.startsWith('hero_') ? 'hero' : key.startsWith('vent_') ? 'ventajas' : key.startsWith('cont_') ? 'contacto' : 'root'

    await pool.query(
      'INSERT INTO site_texts (section, key, value, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (key) DO UPDATE SET value = $3, updated_at = NOW()',
      [section, key, value]
    )
    await pool.query(
      'INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)',
      ['site_texts', `Texto actualizado: ${key}`, JSON.stringify({ key, value }), req?.user?.username || 'anonimo', req?.ip || req?.connection?.remoteAddress || null]
    )

    res.json({ ok: true })
  } catch (e) {
    if (e.name === 'ZodError') return res.status(400).json({ error: 'Validación fallida', issues: e.errors })
    console.error('[site-texts] PUT error:', e)
    res.status(500).json({ error: e.message })
  }
}

async function createSiteChange(req, res) {
  try {
    const parsed = siteChangeSchema.parse(req.body)
    const { tipo, descripcion, datos } = parsed

    const usuario = req?.user?.username || (req.headers['x-mg-token'] ? 'admin' : 'anonimo')
    await pool.query(
      'INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [tipo, descripcion, datos ? JSON.stringify(datos) : null, usuario, req?.ip || req?.connection?.remoteAddress || null]
    )

    res.json({ ok: true })
  } catch (e) {
    if (e.name === 'ZodError') return res.status(400).json({ error: 'Validación fallida', issues: e.errors })
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

async function getTranslations(req, res) {
  try {
    const lang = req.query.lang || 'es'
    const result = await pool.query('SELECT id, value FROM translations WHERE lang = $1', [lang])
    const map = {}
    result.rows.forEach(r => { map[r.id] = r.value })
    res.json({ ok: true, translations: map })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function batchUpdateTranslations(req, res) {
  try {
    const { translations } = req.body || {}
    if (!translations || typeof translations !== 'object') {
      return res.status(400).json({ error: 'Formato inválido' })
    }
    const entries = []
    for (const [id, langs] of Object.entries(translations)) {
      if (typeof langs === 'object' && langs.es) {
        entries.push({ id, lang: 'es', value: langs.es })
      }
      if (typeof langs === 'object' && langs.en) {
        entries.push({ id, lang: 'en', value: langs.en })
      }
    }
    if (entries.length) {
      const values = entries.map((e, idx) => `($1, $2, $${3 + idx * 3}, $${4 + idx * 3})`).join(', ')
      const params = entries.flatMap(e => [e.id, e.lang, e.value])
      await pool.query(`INSERT INTO translations (id, lang, value) VALUES ${values} ON CONFLICT (id, lang) DO UPDATE SET value = EXCLUDED.value`, params)
    }
    res.json({ ok: true })
  } catch (e) {
    console.error('[translations] batch update error:', e)
    res.status(500).json({ error: e.message })
  }
}

async function getAnalytics(req, res) {
  try {
    const stats = await require('../services/analytics.service').getDashboardStats()
    res.json({ ok: true, stats })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function getTopSearches(req, res) {
  try {
    const top = await require('../services/analytics.service').getTopSearches()
    res.json({ ok: true, top })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function getDashboard(req, res) {
  try {
    const { getDashboardStats, getTopSearches } = require('../services/analytics.service')
    const { getTopProducts, getVisits } = require('../services/cache.service')
    const stats = await getDashboardStats()
    const topProducts = await getTopProducts(10)
    const productsWithVisits = await Promise.all(topProducts.map(async p => ({
      id: p.id,
      visits: p.visits
    })))
    const topSearches = await getTopSearches()
    res.json({
      ok: true,
      stats,
      topProducts: productsWithVisits,
      topSearches
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = {
  getSiteTexts,
  updateSiteText,
  createSiteChange,
  getSiteChanges,
  getAnalytics,
  getTopSearches,
  getDashboard,
  getTranslations,
  batchUpdateTranslations,
  getPublicUrl
}
