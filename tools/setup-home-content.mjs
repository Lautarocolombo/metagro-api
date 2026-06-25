import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: new URL('../backend/.env', import.meta.url).pathname });

const url = process.env.POSTGRES_URL;
if (!url) {
  console.error('POSTGRES_URL no definido en backend/.env');
  process.exit(1);
}
const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });

const sql = `
CREATE TABLE IF NOT EXISTS home_content (
  id VARCHAR(100) PRIMARY KEY,
  valor TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL DEFAULT 'hero',
  descripcion TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS home_content_history (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(100) NOT NULL REFERENCES home_content(id) ON DELETE CASCADE,
  valor_anterior TEXT,
  valor_nuevo TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descripcion_campo TEXT,
  cambiado_por VARCHAR(255),
  ip_address VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_content_categoria ON home_content(categoria);
CREATE INDEX IF NOT EXISTS idx_home_content_history_content_id ON home_content_history(content_id);
CREATE INDEX IF NOT EXISTS idx_home_content_history_fecha ON home_content_history(created_at DESC);

INSERT INTO home_content (id, valor, categoria, descripcion) VALUES
  ('hero_title', 'Soluciones para el campo', 'hero', 'Título principal del hero'),
  ('hero_subtitle', 'Insumos ganaderos, alambrados y herramientas para tu estancia o chacra.', 'hero', 'Subtítulo del hero'),
  ('hero_btn_products', 'VER PRODUCTOS', 'hero', 'Botón ver productos'),
  ('hero_btn_contact', 'CONTACTARNOS', 'hero', 'Botón contactarnos'),
  ('hero_years', '43 AÑOS EN', 'hero', 'Badge años en el mercado'),
  ('benefit_rapida_titulo', 'Atención Rápida', 'beneficios', 'Tarjeta 1 - Título'),
  ('benefit_rapida_desc', 'Atendemos más rápido que la competencia. Tu tiempo en el campo vale.', 'beneficios', 'Tarjeta 1 - Descripción'),
  ('benefit_cta_titulo', 'Cuenta Corriente', 'beneficios', 'Tarjeta 2 - Título'),
  ('benefit_cta_desc', 'Crédito para clientes habituales. Comprá hoy y pagá cuando puedas.', 'beneficios', 'Tarjeta 2 - Descripción'),
  ('benefit_precios_titulo', 'Mejores Precios', 'beneficios', 'Tarjeta 3 - Título'),
  ('benefit_precios_desc', 'Precios competitivos respaldados por 43 años de trayectoria y volumen de compra.', 'beneficios', 'Tarjeta 3 - Descripción'),
  ('benefit_stock_titulo', 'Stock Permanente', 'beneficios', 'Tarjeta 4 - Título'),
  ('benefit_stock_desc', 'Amplia disponibilidad de productos para que no pares tu trabajo.', 'beneficios', 'Tarjeta 4 - Descripción'),
  ('benefit_exp_titulo', '43 Años de Experiencia', 'beneficios', 'Tarjeta 5 - Título'),
  ('benefit_exp_desc', 'Desde 1983 sirviendo al campo de Entre Ríos. Cartera de clientes fiel y reconocida.', 'beneficios', 'Tarjeta 5 - Descripción'),
  ('benefit_agro_titulo', 'Especialistas en el Agro', 'beneficios', 'Tarjeta 6 - Título'),
  ('benefit_agro_desc', 'Conocemos el campo. Asesoramiento técnico real para cada necesidad.', 'beneficios', 'Tarjeta 6 - Descripción')
ON CONFLICT (id) DO NOTHING;
`;

async function run() {
  await pool.query(sql);
  const count = await pool.query('SELECT COUNT(*) FROM home_content');
  console.log(`Tabla home_content lista. Registros: ${count.rows[0].count}`);
  await pool.end();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1) });
