import pool from './lib/pg.js';

function json(res, status, payload) {
  res.status(status).json(payload);
}

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products_test (
      id BIGINT PRIMARY KEY,
      name TEXT NOT NULL,
      tag TEXT,
      "desc" TEXT,
      img TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

async function upsert(product) {
  const { id, name, tag, desc, img } = product;
  await ensureTable();
  await pool.query(
    `INSERT INTO products_test (id, name, tag, "desc", img) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, tag = EXCLUDED.tag, "desc" = EXCLUDED."desc", img = EXCLUDED.img;`,
    [id, name, tag ?? null, desc ?? null, img ?? null]
  );
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-mg-token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers['x-mg-token'] || '';
  const expected = process.env.MG_TOKEN || process.env.METAGRO_TOKEN || 'metagro_campo1983';
  if (!token || token !== expected) return json(res, 401, { error: 'Unauthorized' });

  const path = req.url || '';
  try {
    if (req.method === 'GET' && path.endsWith('/status')) {
      await pool.query('SELECT 1 as ok');
      return json(res, 200, { ok: true, db: 'connected' });
    }

    const idMatch = path.match(/\/products-test\/(\d+)(?:\b|\?|#|$)/);

    if (req.method === 'GET' && idMatch) {
      const id = Number(idMatch[1]);
      await ensureTable();
      const r = await pool.query('SELECT * FROM products_test WHERE id=$1', [id]);
      if (r.rows.length === 0) return json(res, 404, { error: 'Not found' });
      return json(res, 200, r.rows[0]);
    }

    if (req.method === 'POST' && !idMatch) {
      const body = req.body ?? {};
      if (!body.name) return json(res, 400, { error: 'name is required' });
      const id = typeof body.id === 'number' ? body.id : Number(body.id || Date.now());
      await upsert({ id, name: body.name, tag: body.tag, desc: body.desc, img: body.img });
      const r = await pool.query('SELECT * FROM products_test WHERE id=$1', [id]);
      return json(res, 201, r.rows[0]);
    }

    if (req.method === 'DELETE' && idMatch) {
      const id = Number(idMatch[1]);
      await ensureTable();
      await pool.query('DELETE FROM products_test WHERE id=$1', [id]);
      return json(res, 200, { ok: true, deletedId: id });
    }

    return json(res, 404, { error: 'Not found' });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: 'DB error', detail: String(e?.message || e) });
  }
}
