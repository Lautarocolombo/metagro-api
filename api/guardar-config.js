import pool from './lib/pg.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET
const MG_TOKEN = process.env.MG_TOKEN || process.env.METAGRO_TOKEN || ''

if (!JWT_SECRET) throw new Error('[guardar-config] JWT_SECRET no definido')

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
    ? 'https://metagro.com.ar'
    : 'http://localhost:4000',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-mg-token',
}

function isAuth(req) {
  const header = req.headers['x-mg-token'] || ''
  if (!header) return false
  if (MG_TOKEN && header === MG_TOKEN) return true
  try { jwt.verify(header, JWT_SECRET); return true }
  catch (e) { return false }
}

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!isAuth(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'POST') {
    const { clave, valor } = req.body ?? {}
    try {
      if (!clave) return res.status(400).json({ error: 'clave requerida' })
      await pool.query(
        'INSERT INTO configuracion_web (clave, valor) VALUES ($1, $2) ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor',
        [clave, valor]
      )
      return res.status(200).json({ success: true, mensaje: 'Guardado correctamente' })
    } catch (error) {
      console.error('[guardar-config] POST error:', error)
      return res.status(500).json({ error: 'Error en la base de datos' })
    }
  }

  if (req.method === 'GET') {
    try {
      const resultado = await pool.query('SELECT clave, valor FROM configuracion_web')
      return res.status(200).json(resultado.rows)
    } catch (error) {
      console.error('[guardar-config] GET error:', error)
      return res.status(500).json({ error: 'Error al leer la base de datos' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
