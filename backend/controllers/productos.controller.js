const pool = require('../config/db')
const { recordEvent } = require('../services/analytics.service')
const { getProducts, setProducts, invalidateProducts, getVisits, recordVisit, redis } = require('../services/cache.service')
const { sendBudgetEmail } = require('../services/pdf.service')
const { sendWhatsAppText } = require('../services/whatsapp.service')

function registrarCambio(tipo, descripcion, datos, req) {
  try {
    const usuario = req?.user?.username || 'anonimo'
    const ip = req?.ip || req?.connection?.remoteAddress || null
    pool.query(
      'INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [tipo, descripcion, datos ? JSON.stringify(datos) : null, usuario, ip]
    )
  } catch (e) {
    console.error('[registrarCambio] error:', e)
  }
}

async function buildProductRow(r) {
  const img = r.imagen_url || ''
  const base = 'https://metagro.com.ar'
  const seoImage = img.startsWith('http') ? img : (img ? (base + (img.startsWith('/') ? img : '/' + img)) : base + '/logo/Logo.jpg')
  return {
    id: r.id,
    name: r.nombre || 'Producto',
    tag: r.categoria || 'General',
    desc: r.descripcion || '',
    icon: '',
    img,
    imagen_url: img,
    images: img ? [img] : [],
    especificaciones: r.especificaciones || '',
    seo: {
      title: `${r.nombre || 'Producto'} | Metagro SRL`,
      description: `${r.descripcion || 'Producto'} - Metagro SRL, insumos para el agro en Gualeguay, Entre Ríos.`,
      image: seoImage,
      url: `${base}/productos/${r.id}-${(r.nombre || '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
    }
  }
}

async function listProducts(req, res) {
  try {
    const result = await pool.query('SELECT id, categoria, nombre, descripcion, especificaciones, imagen_url FROM productos_ganaderos ORDER BY id')
    const products = await Promise.all(result.rows.map(buildProductRow))
    res.json(products)
  } catch (e) {
    console.error('[api/products] error:', e)
    res.json([])
  }
}

async function listProductsV2(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)))
    const categoria = typeof req.query.categoria === 'string' ? req.query.categoria.trim() : null
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : null
    const sort = ['id', 'nombre', 'categoria', 'updated_at'].includes(req.query.sort) ? req.query.sort : 'id'
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC'

    const conditions = []
    const params = []

    if (categoria) {
      conditions.push(`categoria ILIKE $${params.length + 1}`)
      params.push(`%${categoria}%`)
    }
    if (search) {
      conditions.push(`(nombre ILIKE $${params.length + 1} OR descripcion ILIKE $${params.length + 1} OR especificaciones ILIKE $${params.length + 1})`)
      params.push(`%${search}%`)
    }

    const whereStr = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const orderStr = `ORDER BY ${sort} ${order}`

    const countSql = `SELECT count(*) as total FROM productos_ganaderos ${whereStr}`
    const countRes = await pool.query(countSql, params)
    const total = parseInt(countRes.rows[0].total, 10)

    const offset = (page - 1) * limit
    const dataSql = `SELECT id, categoria, nombre, descripcion, especificaciones, imagen_url FROM productos_ganaderos ${whereStr} ${orderStr} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    const dataRes = await pool.query(dataSql, [...params, limit, offset])

    const items = await Promise.all(dataRes.rows.map(buildProductRow))
    res.json({ page, limit, total, items })
  } catch (e) {
    console.error('[api/v2/products] error:', e)
    res.status(500).json({ error: 'Server error', detail: e.message })
  }
}

async function getProduct(req, res) {
  try {
    const result = await pool.query('SELECT * FROM productos_ganaderos WHERE id = $1', [parseInt(req.params.id, 10)])
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' })
    const imgs = await pool.query('SELECT url FROM product_images WHERE product_id = $1 ORDER BY id', [parseInt(req.params.id, 10)])
    const p = await buildProductRow(result.rows[0])
    p.images = [p.imagen_url, ...imgs.rows.map(i => i.url)].filter(Boolean)
    res.json(p)

    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const key = `wa:product:${req.params.id}:${ip}`
    const notified = await redis.get(key)
    if (!notified) {
      await recordVisit(req.params.id)
      await recordEvent('product_view', { productId: req.params.id, name: p.name }, req)
      try {
        await redis.setex(key, 3600, '1')
        const waMsg = `🔔 Consulta web: "${p.name}" fue visto en el sitio.`
        await sendWhatsAppText(process.env.WHATSAPP_ADMIN || '5403444466919', waMsg)
      } catch (e) {
        console.error('[wa] failed to send product view notification:', e.message)
      }
    }
  } catch (e) {
    res.status(500).json({ error: 'Server error', detail: e.message })
  }
}

async function createProduct(req, res) {
  try {
    const images = Array.isArray(req.body.images)
      ? req.body.images.filter(Boolean)
      : (req.body.img ? [req.body.img] : [])
    const mainImg = images[0] || ''
    const variantImages = images.slice(1)
    const result = await pool.query(
      'INSERT INTO productos_ganaderos (categoria, nombre, descripcion, especificaciones, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.body.tag || req.body.categoria || 'General', req.body.name || '', req.body.desc || '', req.body.especificaciones || '', mainImg]
    )
    const productId = result.rows[0].id
    if (variantImages.length > 0) {
      for (const img of variantImages) {
        await pool.query('INSERT INTO product_images (product_id, url) VALUES ($1, $2)', [productId, img])
      }
    }
    const product = {
      id: productId,
      name: req.body.name || '',
      tag: req.body.tag || req.body.categoria || 'General',
      desc: req.body.desc || '',
      icon: '📦',
      img: mainImg,
      images,
      categoria: req.body.tag || req.body.categoria || 'General',
      imagen_url: mainImg
    }
    registrarCambio('producto_nuevo', `Producto creado: ${product.name}`, { id: product.id, name: product.name }, req)
    invalidateProducts()
    res.status(201).json(product)
  } catch (e) {
    console.error('[POST /api/products] error:', e)
    res.status(400).json({ error: 'Bad request', detail: e.message })
  }
}

async function updateProduct(req, res) {
  try {
    const productId = parseInt(req.params.id)
    const images = Array.isArray(req.body.images)
      ? req.body.images.filter(Boolean)
      : (req.body.img ? [req.body.img] : [])
    const mainImg = images[0] || ''
    const variantImages = images.slice(1)
    await pool.query(
      'UPDATE productos_ganaderos SET categoria = $1, nombre = $2, descripcion = $3, especificaciones = $4, imagen_url = $5 WHERE id = $6',
      [req.body.tag || req.body.categoria || 'General', req.body.name || '', req.body.desc || '', req.body.especificaciones || '', mainImg, productId]
    )
    if (variantImages.length > 0) {
      await pool.query('DELETE FROM product_images WHERE product_id = $1', [productId])
      for (const img of variantImages) {
        await pool.query('INSERT INTO product_images (product_id, url) VALUES ($1, $2)', [productId, img])
      }
    }
    const product = {
      id: productId,
      name: req.body.name || '',
      tag: req.body.tag || req.body.categoria || 'General',
      desc: req.body.desc || '',
      icon: '📦',
      img: mainImg,
      images,
      categoria: req.body.tag || req.body.categoria || 'General',
      imagen_url: mainImg
    }
    const cambios = Object.keys(req.body)
    registrarCambio('producto_editado', `Producto editado: ${product.name} (${cambios.join(', ')})`, { id: product.id, cambios }, req)
    invalidateProducts()
    res.json(product)
  } catch (e) {
    console.error('[PUT /api/products/:id] error:', e)
    res.status(400).json({ error: 'Bad request', detail: e.message })
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = parseInt(req.params.id)
    await pool.query('DELETE FROM product_images WHERE product_id = $1', [productId])
    await pool.query('DELETE FROM productos_ganaderos WHERE id = $1', [productId])
    registrarCambio('producto_eliminado', `Producto eliminado ID ${productId}`, { id: productId }, req)
    invalidateProducts()
    res.json({ ok: true })
  } catch (e) {
    console.error('[DELETE /api/products/:id] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
}

async function getCategories(req, res) {
  try {
    const result = await pool.query('SELECT DISTINCT categoria FROM productos_ganaderos WHERE categoria IS NOT NULL ORDER BY categoria')
    res.json(result.rows.map(r => r.categoria))
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
}

async function getBackup(req, res) {
  try {
    const result = await pool.query('SELECT id, categoria, nombre, descripcion, especificaciones, imagen_url FROM productos_ganaderos ORDER BY id')
    const data = result.rows.map(r => ({
      id: r.id,
      tag: r.categoria,
      name: r.nombre,
      desc: r.descripcion,
      img: r.imagen_url,
      imagen_url: r.imagen_url,
      especificaciones: r.especificaciones
    }))
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename=metagro-products.json')
    res.send(JSON.stringify(data, null, 2))
  } catch (e) {
    res.status(500).json({ error: 'Server error', detail: e.message })
  }
}

async function postBackup(req, res) {
  try {
    const body = Array.isArray(req.body) ? req.body : []
    let count = 0
    for (const p of body) {
      await pool.query(
        'INSERT INTO productos_ganaderos (categoria, nombre, descripcion, especificaciones, imagen_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url',
        [p.tag || p.categoria || 'General', p.name || '', p.desc || '', p.especificaciones || '', p.img || p.imagen_url || '']
      )
      count++
    }
    invalidateProducts()
    res.json({ ok: true, count })
  } catch (e) {
    res.status(500).json({ error: 'Server error', detail: e.message })
  }
}

async function syncToDb(req, res) {
  try {
    const products = Array.isArray(req.body) ? req.body : []
    let inserted = 0
    for (const p of products) {
      await pool.query(
        'INSERT INTO productos_ganaderos (categoria, nombre, descripcion, especificaciones, imagen_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET categoria = EXCLUDED.categoria, nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, especificaciones = EXCLUDED.especificaciones, imagen_url = EXCLUDED.imagen_url',
        [p.tag || p.categoria || 'General', p.name || '', p.desc || '', p.especificaciones || '', p.img || p.imagen_url || '']
      )
      inserted++
    }
    const countResult = await pool.query('SELECT count(*) as total FROM productos_ganaderos')
    invalidateProducts()
    res.json({ ok: true, inserted, total: parseInt(countResult.rows[0].total) })
  } catch (e) {
    console.error('[sync-to-db] error:', e)
    res.status(500).json({ error: 'Server error', detail: e.message })
  }
}

async function getProductsTestStatus(req, res) {
  try {
    await pool.query('SELECT 1')
    const result = await pool.query('SELECT count(*) as total FROM productos_ganaderos')
    res.json({ ok: true, db: 'connected', total: parseInt(result.rows[0].total) })
  } catch (e) {
    res.status(500).json({ ok: false, db: 'disconnected', error: e.message })
  }
}

async function createProductTest(req, res) {
  try {
    const data = req.body || {}
    const result = await pool.query(
      'INSERT INTO productos_ganaderos (categoria, nombre, descripcion, especificaciones, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [data.tag || data.categoria || 'TEST', data.name || '', data.desc || '', data.desc || '', data.img || '']
    )
    const id = result.rows[0].id
    res.status(201).json({ ok: true, id })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function getProductTest(req, res) {
  try {
    const result = await pool.query('SELECT * FROM productos_ganaderos WHERE id = $1', [parseInt(req.params.id)])
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' })
    res.json(result.rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function deleteProductTest(req, res) {
  try {
    await pool.query('DELETE FROM product_images WHERE product_id = $1', [parseInt(req.params.id)])
    await pool.query('DELETE FROM productos_ganaderos WHERE id = $1', [parseInt(req.params.id)])
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function saveConfig(req, res) {
  try {
    const cfg = req.body || {}
    const fs = require('fs')
    const path = require('path')
    fs.writeFileSync(path.join(require('path').join(__dirname, '..', 'data'), 'config.json'), JSON.stringify(cfg, null, 2))

    await pool.query(
      'INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)',
      ['config', 'Configuración actualizada', JSON.stringify(cfg), req.user?.username || 'anonimo', req.ip || req.connection.remoteAddress || null]
    )

    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function createBudget(req, res) {
  try {
    const data = req.body || {}
    const cliente = data.cliente || 'Consumidor Final'
    const items = Array.isArray(data.items) ? data.items : []
    const notas = data.notas || ''
    const email = typeof data.email === 'string' ? data.email.trim() : null
    const telefono = data.telefono || null

    await recordEvent('budget', { cliente, items, notas, email }, req)

    let budgetId = null
    try {
      const result = await pool.query(
        `INSERT INTO budgets (cliente, email, telefono, items, notas, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
        [cliente, email, telefono, JSON.stringify(items), notas]
      )
      budgetId = result.rows[0]?.id
    } catch (dbError) {
      console.error('[budget] DB insert error:', dbError)
    }

    if (email) {
      await sendBudgetEmail({ to: email, data: { cliente, items, notas }, budgetId })
      await sendWhatsAppText(process.env.WHATSAPP_ADMIN || '5403444466919', `Nuevo presupuesto #${budgetId || '?'} de ${cliente} (${email}) por: ${items.map(i => `${i.name || i.nombre || 'Producto'} x${i.qty || 1}`).join(', ')}`)
    }

    res.status(201).json({ ok: true, id: budgetId, message: 'Presupuesto generado' })
  } catch (e) {
    console.error('[POST /api/v2/budget] error:', e)
    res.status(400).json({ error: 'Bad request', detail: e.message })
  }
}

module.exports = {
  registrarCambio,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBackup,
  postBackup,
  syncToDb,
  getProductsTestStatus,
  createProductTest,
  getProductTest,
  deleteProductTest,
  saveConfig,
  listProductsV2,
  getProduct,
  createBudget
}
