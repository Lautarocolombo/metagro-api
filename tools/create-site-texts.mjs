import { readFileSync } from 'fs'
import { join } from 'path'
import { Pool } from 'pg'

const envPath = join(process.cwd(), 'backend', '.env')
try {
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  })
} catch {}

const url = process.env.POSTGRES_URL
if (!url) { console.error('ERROR: Define POSTGRES_URL en backend/.env'); process.exit(1) }

const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } })

async function migrate() {
  console.log('→ Creando tabla site_texts...')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_texts (
      id SERIAL PRIMARY KEY,
      section VARCHAR(50) NOT NULL,
      key VARCHAR(100) NOT NULL,
      value TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await pool.query('ALTER TABLE site_texts DROP CONSTRAINT IF EXISTS site_texts_unique_section_key')
  await pool.query('ALTER TABLE site_texts ADD UNIQUE (key)')
  console.log('✓ Tabla site_texts creada/actualizada')

  const count = await pool.query('SELECT COUNT(*) FROM site_texts')
  if (count.rows[0].count > 0) {
    console.log(`→ Ya existen ${count.rows[0].count} textos. No se inserta el seed.`)
  } else {
    console.log('→ Insertando textos iniciales...')
    const texts = [
      ['hero', 'hero_linea_1', 'SIEMPRE JUNTO'],
      ['hero', 'hero_linea_2', 'AL CAMPO.'],
      ['hero', 'hero_numero', '43'],
      ['hero', 'hero_etiqueta', 'AÑOS EN EL MERCADO'],
      ['hero', 'hero_desc', 'Insumos para la agroganadería, alambrados, molinos, aguadas y ferretería. Atención personalizada, precios competitivos y cuenta corriente para nuestros clientes.'],
      ['ventajas', 'vent_eyebrow', 'POR QUÉ ELEGIRNOS'],
      ['ventajas', 'vent_titulo_1', 'VENTAJAS'],
      ['ventajas', 'vent_titulo_2', 'METAGRO'],
      ['ventajas', 'vent_card_1_titulo', 'ATENCIÓN RÁPIDA'],
      ['ventajas', 'vent_card_1_desc', 'Atendemos más rápido que la competencia. Tu tiempo en el campo vale.'],
      ['ventajas', 'vent_card_2_titulo', 'CUENTA CORRIENTE'],
      ['ventajas', 'vent_card_2_desc', 'Crédito para clientes habituales. Comprá hoy y pagá cuando puedas.'],
      ['ventajas', 'vent_card_3_titulo', 'MEJORES PRECIOS'],
      ['ventajas', 'vent_card_3_desc', 'Precios competitivos respaldados por 43 años de trayectoria y volumen de compra.'],
      ['ventajas', 'vent_card_4_titulo', 'STOCK PERMANENTE'],
      ['ventajas', 'vent_card_4_desc', 'Amplia disponibilidad de productos para que no pares tu trabajo.'],
      ['ventajas', 'vent_card_5_titulo', '43 AÑOS DE EXPERIENCIA'],
      ['ventajas', 'vent_card_5_desc', 'Desde 1983 sirviendo al campo de Entre Ríos. Cartera de clientes fiel y reconocida.'],
      ['ventajas', 'vent_card_6_titulo', 'ESPECIALISTAS EN EL AGRO'],
      ['ventajas', 'vent_card_6_desc', 'Asesoramiento técnico para agroganaderos, molineros y alambradores.'],
      ['contacto', 'cont_eyebrow', 'CONTACTO'],
      ['contacto', 'cont_titulo_1', '¿NECESITÁS UN PRODUCTO?'],
      ['contacto', 'cont_titulo_2', 'CONSULTANOS.'],
      ['contacto', 'cont_desc', 'Ya sea para tu estancia, chacra o trabajo profesional, en Metagro SRL te asesoramos sin compromiso. Respondemos rápido por WhatsApp o por teléfono.']
    ]
    for (const [section, key, value] of texts) {
      await pool.query(`INSERT INTO site_texts (section, key, value) VALUES ($1, $2, $3)`, [section, key, value])
    }
    console.log(`✓ ${texts.length} textos insertados`)
  }

  await pool.end()
}

migrate().catch(e => { console.error(e); process.exit(1) })
