import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos_ganaderos (
      id SERIAL PRIMARY KEY,
      categoria VARCHAR(100),
      nombre VARCHAR(255),
      descripcion TEXT,
      especificaciones TEXT,
      imagen_url VARCHAR(500),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id BIGSERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES productos_ganaderos(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt_text TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos_ganaderos(categoria)');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS home_content (
      id VARCHAR(100) PRIMARY KEY,
      valor TEXT,
      categoria VARCHAR(100),
      descripcion TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS home_content_history (
      id SERIAL PRIMARY KEY,
      content_id VARCHAR(100) NOT NULL,
      valor_anterior TEXT,
      valor_nuevo TEXT,
      categoria VARCHAR(100),
      descripcion_campo TEXT,
      cambiado_por VARCHAR(255),
      ip_address VARCHAR(50),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS configuracion_web (
      clave VARCHAR(100) PRIMARY KEY,
      valor TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_texts (
      key VARCHAR(100) PRIMARY KEY,
      section VARCHAR(50),
      value TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_changes (
      id SERIAL PRIMARY KEY,
      tipo VARCHAR(100),
      descripcion TEXT,
      datos TEXT,
      usuario VARCHAR(255),
      ip_address VARCHAR(50),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_site_texts_key ON site_texts(key)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_site_changes_tipo ON site_changes(tipo)');

  const rows = await pool.query('SELECT count(*) FROM home_content');
  const count = parseInt(rows.rows[0].count, 10);
  if (count === 0) {
    await pool.query(`
      INSERT INTO home_content (id, valor, categoria, descripcion) VALUES
        ('telefono', '03444 – 466919', 'contacto', 'Teléfono'),
        ('whatsapp', '5403444466919', 'contacto', 'WhatsApp'),
        ('mensaje-wa', 'Hola Metagro! Quiero consultar sobre sus productos.', 'contacto', 'Mensaje WhatsApp'),
        ('horario-semana', 'Lunes a Viernes: 8:00 – 12:00 / 15:00 – 19:00', 'horario', 'Horario semana'),
        ('horario-sabado', 'Sábados: 8:00 – 12:00', 'horario', 'Horario sábado'),
        ('direccion', 'Gualeguay, Entre Ríos · Argentina · CP 2840', 'ubicacion', 'Dirección')
    `);
  }
}

export default pool;
