import pool from './lib/pg.js';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const corsMiddleware = cors({ origin: '*', credentials: true });

const JWT_SECRET = process.env.JWT_SECRET || 'metagro-secret-fallback';
const ADMIN_USER = process.env.ADMIN_USER || 'metagro';
const ADMIN_PASS = process.env.ADMIN_PASS || 'montealegre22';
const MG_TOKEN = process.env.MG_TOKEN || process.env.METAGRO_TOKEN || '';

const DEFAULT_PRODUCTS = [
  { "id": 1, "name": "08 10 Estiradora", "tag": "Maquinaria", "desc": "Equipo para estirado y mantenimiento de alambrados.", "icon": "🎭", "img": "productos/08-10-estiradora.jpg" },
  { "id": 11, "name": "Bebedero Cemento", "tag": "Bebederos", "desc": "Bebedero de cemento para ganado, resistente y durable.", "icon": "💧", "img": "productos/bebederos cemento.JPG" },
  { "id": 12, "name": "Bobinas Electropiolín", "tag": "Bobinas", "desc": "Electropiolín Rolin · Disponible en 250, 500, 750 y 1000 mts. Standard y Reforzada.", "icon": "🔄", "img": "productos/bobina 1000.jpg" },
  { "id": 16, "name": "Cable Subterráneo Rolin 1.8mm", "tag": "Cables", "desc": "Cable subterráneo de 1.8 mm para instalaciones eléctricas rurales.", "icon": "🔌", "img": "productos/Cable subterraneo Rolin 1.8mm.jpg" },
  { "id": 45, "name": "Torniquetes", "tag": "Torniquetes", "desc": "Torniquetes Nº 8 y Nº 9, en negro y zincado. Para alambados de más de 50 mts.", "icon": "🔗", "img": "productos/Torniquete Nº8 Negro.jpg" },
  { "id": 52, "name": "Varillas", "tag": "Varillas", "desc": "Varillas con rulos y varilla plástica para alambados.", "icon": "🌵", "img": "productos/Varilla Con 1 Rulo.jpg" },
  { "id": 59, "name": "Bisagras para Tranquera", "tag": "Tranqueras", "desc": "Bisagras resistentes para tranqueras de campo.", "icon": "🚪", "img": "" }
];

function defaultResJson(products) {
  return products.map(p => ({ ...p, images: Array.isArray(p.images) ? p.images : (p.img ? [p.img] : []) }));
}

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id BIGINT PRIMARY KEY,
      data JSONB NOT NULL
    )
  `);

  const result = await pool.query('SELECT COUNT(*) FROM products');
  if (Number(result.rows[0].count) === 0) {
    for (const p of DEFAULT_PRODUCTS) {
      await pool.query('INSERT INTO products (id, data) VALUES ($1, $2)', [p.id, p]);
    }
  }
}

initDb().catch(console.error);

export default function handler(req, res) {
  corsMiddleware(req, res, () => {
    (async () => {
      const method = req.method || 'GET';
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = url.pathname;

      if (pathname === '/api/admin/login' && method === 'POST') {
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
        if (header === MG_TOKEN) return true;
        try { jwt.verify(header, JWT_SECRET); return true; }
        catch (e) { return false; }
      };

      if (pathname === '/api/products' && method === 'GET') {
        try {
          const result = await pool.query('SELECT data FROM products ORDER BY id');
          const products = result.rows.map(r => r.data);
          return res.status(200).json(defaultResJson(products));
        } catch (e) {
          return res.status(500).json({ error: 'Server error', detail: e.message });
        }
      }

      if (pathname === '/api/health' && method === 'GET') {
        return res.status(200).json({ ok: true });
      }

      if (!isAuth()) return res.status(401).json({ error: 'Unauthorized' });

      if (pathname === '/api/products' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const images = Array.isArray(data.images) ? data.images.filter(Boolean) : (data.img ? [data.img] : []);
            const product = { id: typeof data.id === 'number' ? data.id : Date.now(), ...data, images };
            if (!product.img && product.images.length) product.img = product.images[0];
            await pool.query('INSERT INTO products (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data', [product.id, product]);
            return res.status(201).json(product);
          } catch (e) {
            return res.status(400).json({ error: 'Bad request', detail: e.message });
          }
        });
        return;
      }

      const putMatch = pathname.match(/^\/api\/products\/(\d+)$/);
      if (putMatch && method === 'PUT') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const images = Array.isArray(data.images) ? data.images.filter(Boolean) : (data.img ? [data.img] : []);
            const product = { ...data, id: parseInt(putMatch[1]), images };
            if (!product.img && product.images.length) product.img = product.images[0];
            await pool.query('UPDATE products SET data = $1 WHERE id = $2', [product, product.id]);
            return res.status(200).json(product);
          } catch (e) {
            return res.status(400).json({ error: 'Bad request', detail: e.message });
          }
        });
        return;
      }

      const delMatch = pathname.match(/^\/api\/products\/(\d+)$/);
      if (delMatch && method === 'DELETE') {
        await pool.query('DELETE FROM products WHERE id = $1', [parseInt(delMatch[1])]);
        return res.status(200).json({ ok: true });
      }

      if (pathname === '/api/backup' && method === 'GET') {
        try {
          const result = await pool.query('SELECT data FROM products ORDER BY id');
          const products = result.rows.map(r => defaultResJson(r.data));
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', 'attachment; filename=metagro-products.json');
          return res.status(200).json(products);
        } catch (e) {
          return res.status(500).json({ error: 'Server error' });
        }
      }

      if (pathname === '/api/backup' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            for (const p of Array.isArray(data) ? data : []) {
              const product = { id: typeof p.id === 'number' ? p.id : Date.now(), ...p };
              await pool.query('INSERT INTO products (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data', [product.id, product]);
            }
            return res.status(200).json({ ok: true, count: Array.isArray(data) ? data.length : 0 });
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
