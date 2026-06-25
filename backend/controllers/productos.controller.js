const pool = require('../data/pool')

function registrarCambio(tipo, descripcion, datos, req) {
  try {
    const usuario = 'admin'
    const ip = req.ip || req.connection.remoteAddress || null
    pool.query(
      'INSERT INTO site_changes (tipo, descripcion, datos, usuario, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [tipo, descripcion, datos ? JSON.stringify(datos) : null, usuario, ip]
    )
  } catch (e) {
    console.error('[registrarCambio] error:', e)
  }
}

async function listProducts(req, res) {
  try {
    const result = await pool.query('SELECT id, categoria, nombre, descripcion, especificaciones, imagen_url FROM productos_ganaderos ORDER BY id')
    const products = result.rows.map(r => ({
      id: r.id,
      name: r.nombre || 'Producto',
      tag: r.categoria || 'General',
      desc: r.descripcion || '',
      icon: '',
      img: r.imagen_url || '',
      imagen_url: r.imagen_url || '',
      images: r.imagen_url ? [r.imagen_url] : [],
      especificaciones: r.especificaciones || ''
    }))
    res.json(products)
  } catch (e) {
    console.error('[api/products] error:', e)
    res.json([])
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
      [req.body.tag || req.body.categoria || 'General', req.body.name || '', req.body.desc || '', req.body.desc || '', mainImg]
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
      [req.body.tag || req.body.categoria || 'General', req.body.name || '', req.body.desc || '', req.body.desc || '', mainImg, productId]
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
        [p.tag || p.categoria || 'General', p.name || '', p.desc || '', p.desc || '', p.img || p.imagen_url || '']
      )
      count++
    }
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
        [p.tag || p.categoria || 'General', p.name || '', p.desc || '', p.desc || '', p.img || p.imagen_url || '']
      )
      inserted++
    }
    const countResult = await pool.query('SELECT count(*) as total FROM productos_ganaderos')
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
      ['config', 'Configuración actualizada', JSON.stringify(cfg), 'admin', req.ip || req.connection.remoteAddress || null]
    )

    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
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
  saveConfig
}
