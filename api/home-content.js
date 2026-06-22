import pool from '../api/lib/pg.js';

function isAuth(req) {
  const header = req.headers['x-mg-token'] || '';
  const token = process.env.MG_TOKEN || process.env.METAGRO_TOKEN || '';
  if (!token || !header) return false;
  if (header === token) return true;
  try {
    const jwt = await import('jsonwebtoken');
    return !!jwt.default.verify(header, process.env.JWT_SECRET || '');
  } catch { return false; }
}

async function read(req, res) {
  try {
    const result = await pool.query('SELECT * FROM home_content ORDER BY categoria, id');
    const map = {};
    result.rows.forEach(r => { map[r.id] = r; });
    return res.status(200).json({ ok: true, data: map });
  } catch (e) {
    console.error('[home-content] GET error:', e);
    return res.status(500).json({ error: 'Error leyendo home_content' });
  }
}

async function update(req, res) {
  if (!isAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { changes, usuario, ip_address } = body;

    if (!Array.isArray(changes)) {
      return res.status(400).json({ error: 'changes debe ser un array' });
    }

    const result = await pool.query('BEGIN');

    for (const c of changes) {
      if (!c.id || !c.nuevo) continue;

      const current = await pool.query('SELECT * FROM home_content WHERE id = $1 FOR UPDATE', [c.id]);
      if (!current.rows.length) continue;

      const row = current.rows[0];
      const anterior = row.valor;

      if (anterior === c.nuevo) continue;

      await pool.query(
        'UPDATE home_content SET valor = $1, updated_at = NOW() WHERE id = $2',
        [c.nuevo, c.id]
      );

      await pool.query(
        `INSERT INTO home_content_history
          (content_id, valor_anterior, valor_nuevo, categoria, descripcion_campo, cambiado_por, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [c.id, anterior, c.nuevo, row.categoria, row.descripcion, usuario || null, ip_address || null]
      );
    }

    await pool.query('COMMIT');

    const updated = await pool.query('SELECT * FROM home_content ORDER BY categoria, id');
    return res.status(200).json({
      ok: true,
      message: `${changes.filter(c => c.nuevo).length} campos actualizados`,
      data: Object.fromEntries(updated.rows.map(r => [r.id, r]))
    });
  } catch (e) {
    console.error('[home-content] UPDATE error:', e);
    try { await pool.query('ROLLBACK'); } catch {}
    return res.status(500).json({ error: e.message });
  }
}

async function history(req, res) {
  try {
    if (!isAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
    const result = await pool.query(
      `SELECT h.*, c.descripcion as campo_descripcion
       FROM home_content_history h
       JOIN home_content c ON c.id = h.content_id
       ORDER BY h.created_at DESC
       LIMIT 200`
    );
    return res.status(200).json({ ok: true, data: result.rows });
  } catch (e) {
    console.error('[home-content] history error:', e);
    return res.status(500).json({ error: 'Error leyendo historial' });
  }
}

async function restore(req, res) {
  if (!isAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { history_id, usuario, ip_address } = body;

    const record = await pool.query('SELECT * FROM home_content_history WHERE id = $1', [history_id]);
    if (!record.rows.length) return res.status(404).json({ error: 'Registro no encontrado' });

    const rec = record.rows[0];
    const previous = await pool.query('SELECT * FROM home_content WHERE id = $1 FOR UPDATE', [rec.content_id]);
    if (!previous.rows.length) return res.status(404).json({ error: 'Contenido no encontrado' });

    await pool.query('BEGIN');
    await pool.query(
      'UPDATE home_content SET valor = $1, updated_at = NOW() WHERE id = $2',
      [rec.valor_anterior, rec.content_id]
    );
    await pool.query(
      `INSERT INTO home_content_history
        (content_id, valor_anterior, valor_nuevo, categoria, descripcion_campo, cambiado_por, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [rec.content_id, rec.valor_nuevo, rec.valor_anterior, rec.categoria, rec.descripcion_campo, usuario || null, ip_address || null]
    );
    await pool.query('COMMIT');

    return res.status(200).json({ ok: true, message: 'Versión anterior restaurada' });
  } catch (e) {
    console.error('[home-content] restore error:', e);
    try { await pool.query('ROLLBACK'); } catch {}
    return res.status(500).json({ error: e.message });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production'
    ? 'https://metagro-srl.vercel.app'
    : 'http://localhost:4000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-mg-token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    if (pathname === '/api/home-content' && req.method === 'GET') return read(req, res);
    if (pathname === '/api/home-content' && req.method === 'POST') return update(req, res);
    if (pathname === '/api/home-content/history' && req.method === 'GET') return history(req, res);
    if (pathname === '/api/home-content/restore' && req.method === 'POST') return restore(req, res);
  } catch (e) {
    console.error('[home-content] handler error:', e);
    return res.status(500).json({ error: e.message });
  }

  return res.status(404).json({ error: 'Not found' });
}
