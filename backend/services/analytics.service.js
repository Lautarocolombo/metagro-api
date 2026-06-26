const pool = require('../data/pool')
const { getTopProducts, getVisits, redis } = require('./cache.service')

async function recordEvent(tipo, datos = {}, req) {
  try {
    const usuario = req?.user?.username || null
    const ip = req?.ip || req?.connection?.remoteAddress || null
    await pool.query(
      'INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [tipo, datos.descripcion || tipo, JSON.stringify(datos), usuario, ip]
    )
  } catch (e) {
    console.error('[analytics] error:', e.message)
  }
}

async function getDashboardStats() {
  try {
    const products = await pool.query('SELECT count(*) as total FROM productos_ganaderos')
    const categories = await pool.query('SELECT count(DISTINCT categoria) as total FROM productos_ganaderos')
    const images = await pool.query('SELECT count(*) as total FROM product_images')
    const changes = await pool.query("SELECT count(*) as total FROM site_changes WHERE created_at > NOW() - INTERVAL '7 days'")
    const budgets = await pool.query('SELECT count(*) as total FROM budgets')
    let totalVisits = 0
    try {
      const keys = await redis.keys('metagro:visits:product:*')
      const values = await Promise.all(keys.map(k => redis.get(k).catch(() => 0)))
      totalVisits = values.reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0)
    } catch (e) {
      totalVisits = 0
    }
    return {
      products: parseInt(products.rows[0].total),
      categories: parseInt(categories.rows[0].total),
      images: parseInt(images.rows[0].total),
      changes7d: parseInt(changes.rows[0].total),
      budgets: parseInt(budgets.rows[0].total),
      views: totalVisits
    }
  } catch (e) {
    return { products: 0, categories: 0, images: 0, changes7d: 0, budgets: 0, views: 0 }
  }
}

async function getTopSearches() {
  try {
    const res = await pool.query("SELECT datos->>'query' as q, count(*) as c FROM site_changes WHERE tipo = 'search' AND created_at > NOW() - INTERVAL '30 days' GROUP BY q ORDER BY c DESC LIMIT 10")
    return res.rows
  } catch (e) {
    return []
  }
}

module.exports = { recordEvent, getDashboardStats, getTopSearches }
