const express = require('express')
const router = express.Router()
const pool = require('../config/db')

router.get('/sitemap.xml', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, updated_at FROM productos_ganaderos ORDER BY id')
    const products = result.rows
    let urls = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://metagro.com.ar/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://metagro.com.ar/#productos</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://metagro.com.ar/#contacto</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    products.forEach(p => {
      const slug = `${p.id}-${(p.nombre || '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
      urls += `
  <url>
    <loc>https://metagro.com.ar/producto/${slug}</loc>
    <lastmod>${new Date(p.updated_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })
    urls += `
</urlset>`
    res.setHeader('Content-Type', 'application/xml')
    res.send(urls)
  } catch (e) {
    res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>')
  }
})

router.get('/producto/:id/:slug?', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM productos_ganaderos WHERE id = $1', [id])
    const r = result.rows[0]
    if (!r) return res.status(404).json({ error: 'Producto no encontrado' })
    const img = r.imagen_url || ''
    const base = 'https://metagro.com.ar'
    const seoImage = img.startsWith('http') ? img : (img ? (base + (img.startsWith('/') ? img : '/' + img)) : base + '/logo/Logo.jpg')
    const seo = {
      title: `${r.nombre || 'Producto'} | Metagro SRL`,
      description: `${r.descripcion || 'Producto'} - Metagro SRL, insumos para el agro.`,
      image: seoImage,
      url: `${base}/producto/${id}-${(r.nombre || '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
    }
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: r.nombre || 'Producto',
      description: r.descripcion || '',
      image: seo.image,
      url: seo.url,
      brand: {
        '@type': 'Brand',
        name: 'Metagro SRL'
      }
    }
    res.setHeader('Content-Type', 'text/html')
    res.send(`<!DOCTYPE html><html lang="es"><head>
      <title>${seo.title}</title>
      <meta name="description" content="${seo.description}" />
      <meta property="og:title" content="${seo.title}" />
      <meta property="og:description" content="${seo.description}" />
      <meta property="og:image" content="${seo.image}" />
      <meta property="og:url" content="${seo.url}" />
      <meta property="og:type" content="website" />
      <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    </head><body>
      <p>Redirigiendo...</p>
      <script>window.location.replace('/index.html');</script>
    </body></html>`)
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
