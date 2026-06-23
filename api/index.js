import pool, { initDb } from './lib/pg.js';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const corsMiddleware = cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://metagro-srl.vercel.app', 'https://metagro.com', 'https://www.metagro.com']
    : ['http://localhost:4000', 'http://127.0.0.1:4000'],
  credentials: true
});

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const MG_TOKEN = process.env.MG_TOKEN || process.env.METAGRO_TOKEN || '';

if (!JWT_SECRET) throw new Error('[API] JWT_SECRET no definido');
if (!ADMIN_USER || !ADMIN_PASS) throw new Error('[API] ADMIN_USER/ADMIN_PASS no definidos');

const DEFAULT_ICON = '📦';

initDb().catch(err => {
  console.error('[API] Error inicializando DB:', err);
  process.exit(1);
});

function productRowToJson(row, extraImages = []) {
  const imagen = row.imagen_url || '';
  const images = [imagen, ...extraImages].filter(Boolean);
  return {
    id: row.id,
    name: row.nombre,
    tag: row.categoria || '',
    desc: row.descripcion || '',
    icon: DEFAULT_ICON,
    img: imagen,
    images,
    variants: [],
    precio: null,
    stock: null,
    categoria: row.categoria || '',
    imagen_url: imagen,
  };
}

export default function handler(req, res) {
  corsMiddleware(req, res, () => {
    (async () => {
      const method = req.method || 'GET';
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      let pathname = url.pathname;
      if (pathname.startsWith('/api')) pathname = pathname.slice(4) || '/';

      if (pathname === '/admin/login' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const { username, password } = JSON.parse(body);
            if (username !== ADMIN_USER || password !== ADMIN_PASS) {
              return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            const token = jwt.sign({ role: 'admin', user: ADMIN_USER }, JWT_SECRET, { expiresIn: '8h' });
            res.status(200).json({ token });
          } catch (e) {
            res.status(400).json({ error: 'Bad request' });
          }
        });
        return;
      }

      const isAuth = () => {
        const header = req.headers['x-mg-token'] || '';
        if (!header) return false;
        if (MG_TOKEN && header === MG_TOKEN) return true;
        try { jwt.verify(header, JWT_SECRET); return true }
        catch (e) { return false }
      };

      if (pathname === '/health' && method === 'GET') {
        try {
          await pool.query('SELECT 1');
          return res.status(200).json({ ok: true, db: 'connected' });
        } catch (e) {
          return res.status(503).json({ ok: false, db: 'disconnected', error: e.message });
        }
      }

      if (pathname === '/categories' && method === 'GET') {
        try {
          const result = await pool.query(
            'SELECT DISTINCT categoria FROM productos_ganaderos WHERE categoria IS NOT NULL ORDER BY categoria'
          );
          return res.status(200).json(result.rows.map(r => r.categoria));
        } catch (e) {
          return res.status(500).json({ error: 'Server error' });
        }
      }

      if (pathname === '/products' && method === 'GET') {
        try {
          const result = await pool.query('SELECT * FROM productos_ganaderos ORDER BY categoria, id');
          const products = [];
          for (const row of result.rows) {
            const imgs = await pool.query('SELECT url FROM product_images WHERE product_id = $1 ORDER BY id', [row.id]);
            products.push(productRowToJson(row, imgs.rows.map(r => r.url)));
          }
          return res.status(200).json(products);
        } catch (e) {
          return res.status(500).json({ error: 'Server error', detail: e.message });
        }
      }


      if (pathname === '/site-texts' && method === 'GET') {
        try {
          const result = await pool.query('SELECT key, value FROM site_texts');
          const texts = {};
          result.rows.forEach(r => { texts[r.key] = r.value });
          return res.status(200).json({ ok: true, texts });
        } catch (e) {
          return res.status(500).json({ error: e.message });
        }
      }

      if (pathname === '/site-texts' && method === 'PUT') {
        if (!isAuth()) return res.status(401).json({ error: 'Unauthorized' });
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const putMatch = req.url.match(/^\/api\/site-texts\/([^?]+)/);
            const key = putMatch ? decodeURIComponent(putMatch[1]) : '';
            if (!key) return res.status(400).json({ error: 'key requerida' });
            const data = JSON.parse(body || '{}');
            const value = data.value ?? '';
            const section = key.startsWith('hero_') ? 'hero' : key.startsWith('vent_') ? 'ventajas' : key.startsWith('cont_') ? 'contacto' : 'root';
            await pool.query(
              `INSERT INTO site_texts (section, key, value, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (key) DO UPDATE SET value = $3, updated_at = NOW()`,
              [section, key, value]
            );
            return res.status(200).json({ ok: true });
          } catch (e) {
            return res.status(500).json({ error: e.message });
          }
        });
        return;
      }

      if (!isAuth()) return res.status(401).json({ error: 'Unauthorized' });

      if (pathname === '/products' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const productId = typeof data.id === 'number' ? data.id : null;

            const allImages = Array.isArray(data.images)
              ? data.images.filter(Boolean)
              : (data.img ? [data.img] : []);
            const mainImg = allImages[0] || '';
            const variantImages = allImages.slice(1);

            const result = await pool.query(
              `INSERT INTO productos_ganaderos
                 (id, categoria, nombre, descripcion, especificaciones, imagen_url)
                VALUES (COALESCE($1, nextval('productos_ganaderos_id_seq')), $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO UPDATE SET
                 categoria = EXCLUDED.categoria,
                 nombre = EXCLUDED.nombre,
                 descripcion = EXCLUDED.descripcion,
                 especificaciones = EXCLUDED.especificaciones,
                 imagen_url = EXCLUDED.imagen_url
                RETURNING id`,
              [productId, data.tag || data.categoria || 'General', data.name || '', data.desc || '', data.desc || '', mainImg]
            );

            const finalId = result.rows[0].id;

            if (variantImages.length > 0) {
              await pool.query('DELETE FROM product_images WHERE product_id = $1', [finalId]);
              for (const img of variantImages) {
                await pool.query('INSERT INTO product_images (product_id, url) VALUES ($1, $2)', [finalId, img]);
              }
            }

            const out = {
              id: finalId,
              name: data.name || '',
              tag: data.tag || data.categoria || 'General',
              desc: data.desc || '',
              icon: DEFAULT_ICON,
              img: mainImg,
              images: allImages,
              variants: [],
              precio: null,
              stock: null,
              categoria: data.tag || data.categoria || 'General',
            };
            return res.status(201).json(out);
          } catch (e) {
            return res.status(400).json({ error: 'Bad request', detail: e.message });
          }
        });
        return;
      }

      const putMatch = pathname.match(/^\/products\/(\d+)$/);
      if (putMatch && method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const productId = parseInt(putMatch[1]);

            const allImages = Array.isArray(data.images)
              ? data.images.filter(Boolean)
              : (data.img ? [data.img] : []);
            const mainImg = allImages[0] || '';
            const variantImages = allImages.slice(1);

            await pool.query(
              `UPDATE productos_ganaderos
                 SET categoria = $1, nombre = $2, descripcion = $3, especificaciones = $4, imagen_url = $5
                 WHERE id = $6`,
              [
                data.tag || data.categoria || 'General',
                data.name || '',
                data.desc || '',
                data.especificaciones || data.specifications || data.desc || '',
                mainImg,
                productId
              ]
            );

            if (variantImages.length > 0) {
              await pool.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
              for (const img of variantImages) {
                await pool.query('INSERT INTO product_images (product_id, url) VALUES ($1, $2)', [productId, img]);
              }
            }

            const out = {
              id: productId,
              name: data.name || '',
              tag: data.tag || data.categoria || 'General',
              desc: data.desc || '',
              icon: DEFAULT_ICON,
              img: mainImg,
              images: allImages,
              variants: [],
              precio: null,
              stock: null,
              categoria: data.tag || data.categoria || 'General',
            };
            return res.status(200).json(out);
          } catch (e) {
            return res.status(400).json({ error: 'Bad request', detail: e.message });
          }
        });
        return;
      }

      const imgDelMatch = pathname.match(/^\/images\/(\d+)$/);
      if (imgDelMatch && method === 'DELETE') {
        try {
          await pool.query('DELETE FROM product_images WHERE id = $1', [parseInt(imgDelMatch[1])]);
          return res.status(200).json({ ok: true });
        } catch (e) {
          return res.status(500).json({ error: 'Server error' });
        }
      }

      const delMatch = pathname.match(/^\/products\/(\d+)$/);
      if (delMatch && method === 'DELETE') {
        try {
          await pool.query('DELETE FROM productos_ganaderos WHERE id = $1', [parseInt(delMatch[1])]);
          return res.status(200).json({ ok: true });
        } catch (e) {
          return res.status(500).json({ error: 'Server error' });
        }
      }

      if (pathname === '/backup' && method === 'GET') {
        try {
          const result = await pool.query('SELECT * FROM productos_ganaderos ORDER BY id');
          const products = [];
          for (const row of result.rows) {
            const imgs = await pool.query('SELECT url FROM product_images WHERE product_id = $1 ORDER BY id', [row.id]);
            const imagen = row.imagen_url || '';
            const images = [imagen, ...imgs.rows.map(r => r.url)].filter(Boolean);
            products.push(productRowToJson(row, images));
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', 'attachment; filename=metagro-products.json');
          return res.status(200).json(products);
        } catch (e) {
          return res.status(500).json({ error: 'Server error' });
        }
      }

      if (pathname === '/backup' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            let count = 0;
            for (const p of Array.isArray(data) ? data : []) {
              const productId = typeof p.id === 'number' ? p.id : null;
              const allImages = Array.isArray(p.images) ? p.images : (p.img ? [p.img] : []);
              const mainImg = allImages[0] || '';
              const variantImages = allImages.slice(1);

              const r = await pool.query(
                `INSERT INTO productos_ganaderos
                   (id, categoria, nombre, descripcion, especificaciones, imagen_url)
                  VALUES (COALESCE($1, nextval('productos_ganaderos_id_seq')), $2, $3, $4, $5, $6)
                  ON CONFLICT (id) DO UPDATE SET
                   categoria = EXCLUDED.categoria,
                   nombre = EXCLUDED.nombre,
                   descripcion = EXCLUDED.descripcion,
                   especificaciones = EXCLUDED.especificaciones,
                   imagen_url = EXCLUDED.imagen_url
                  RETURNING id`,
                [productId, p.tag || p.categoria || 'General', p.name || '', p.desc || '', p.desc || '', mainImg]
              );

              const finalId = r.rows[0].id;

              if (variantImages.length > 0) {
                await pool.query('DELETE FROM product_images WHERE product_id = $1', [finalId]);
                for (const img of variantImages) {
                  await pool.query('INSERT INTO product_images (product_id, url) VALUES ($1, $2)', [finalId, img]);
                }
              }
              count++;
            }
            return res.status(200).json({ ok: true, count });
          } catch (e) {
            return res.status(400).json({ error: 'Bad request', detail: e.message });
          }
        });
        return;
      }

      if (pathname === '/migrate-images' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { password } = JSON.parse(body || '{}');
            if (password !== process.env.MIGRATE_KEY || !process.env.MIGRATE_KEY) {
              return res.status(403).json({ error: 'Forbidden' });
            }
            const result = await pool.query('SELECT id, imagen_url FROM productos_ganaderos');
            let migrated = 0;
            for (const row of result.rows) {
              if (!row.imagen_url || !row.imagen_url.startsWith('data:')) continue;
              await pool.query('UPDATE productos_ganaderos SET imagen_url = $1 WHERE id = $2', [row.imagen_url, row.id]);
              migrated++;
            }
            return res.status(200).json({ ok: true, migrated });
          } catch (e) {
            return res.status(500).json({ error: 'Server error', detail: e.message });
          }
        });
        return;
      }

      const testStatusMatch = pathname.match(/^\/products-test\/?$/);
      if (testStatusMatch && method === 'GET') {
        try {
          await pool.query('SELECT 1');
          const result = await pool.query('SELECT count(*) as total FROM productos_ganaderos');
          return res.status(200).json({ ok: true, db: 'connected', total: parseInt(result.rows[0].total) });
        } catch (e) {
          return res.status(500).json({ ok: false, db: 'disconnected', error: e.message });
        }
      }

      const testIdMatch = pathname.match(/^\/products-test\/(\d+)$/);
      if (pathname === '/products-test' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const result = await pool.query(
              `INSERT INTO productos_ganaderos (categoria, nombre, descripcion, especificaciones, imagen_url)
               VALUES ($1, $2, $3, $4, $5) RETURNING id`,
              [data.tag || data.categoria || 'TEST', data.name || '', data.desc || '', data.desc || '', data.img || '']
            );
            const id = result.rows[0].id;
            return res.status(201).json({ ok: true, id });
          } catch (e) {
            return res.status(400).json({ error: 'Bad request', detail: e.message });
          }
        });
        return;
      }

      if (testIdMatch && method === 'GET') {
        try {
          const result = await pool.query('SELECT * FROM productos_ganaderos WHERE id = $1', [parseInt(testIdMatch[1])]);
          if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
          return res.status(200).json(result.rows[0]);
        } catch (e) {
          return res.status(500).json({ error: 'Server error' });
        }
      }

      if (testIdMatch && method === 'DELETE') {
        try {
          await pool.query('DELETE FROM productos_ganaderos WHERE id = $1', [parseInt(testIdMatch[1])]);
          return res.status(200).json({ ok: true });
        } catch (e) {
          return res.status(500).json({ error: 'Server error' });
        }
      }

      if (pathname === '/guardar-config' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            await pool.query(
              `INSERT INTO home_content (id, valor, categoria, descripcion) VALUES
                ('guardar-config', $1, 'config', 'Configuración guardada')
                ON CONFLICT (id) DO UPDATE SET valor = EXCLUDED.valor, updated_at = NOW()`,
              [JSON.stringify(data)]
            );
            return res.status(200).json({ ok: true });
          } catch (e) {
            return res.status(400).json({ error: 'Bad request', detail: e.message });
          }
        });
        return;
      }

      res.status(404).json({ error: 'Not found' });
    })();
  });
}
