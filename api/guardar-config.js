import pool from './lib/pg.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { clave, valor } = req.body ?? {};
    try {
      const query = `
        INSERT INTO configuracion_web (clave, valor)
        VALUES ($1, $2)
        ON CONFLICT (clave)
        DO UPDATE SET valor = EXCLUDED.valor;
      `;
      await pool.query(query, [clave, valor]);
      return res.status(200).json({ success: true, mensaje: 'Guardado correctamente' });
    } catch (error) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
  }

  if (req.method === 'GET') {
    try {
      const resultado = await pool.query('SELECT clave, valor FROM configuracion_web');
      return res.status(200).json(resultado.rows);
    } catch (error) {
      return res.status(500).json({ error: 'Error al leer la base de datos' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
