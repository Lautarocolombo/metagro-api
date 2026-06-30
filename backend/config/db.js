const { pool } = require('../data/pool');

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos_ganaderos (
      id SERIAL PRIMARY KEY,
      categoria VARCHAR(100),
      nombre VARCHAR(255),
      descripcion TEXT,
      especificaciones TEXT,
      imagen_url VARCHAR(500)
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS translations (
      id VARCHAR(100) PRIMARY KEY,
      lang VARCHAR(10) NOT NULL DEFAULT 'es',
      value TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_translations_lang ON translations(lang)`);

  const { rows } = await pool.query('SELECT count(*) as total FROM home_content');
  if (parseInt(rows[0].total, 10) === 0) {
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

  const transRows = await pool.query('SELECT count(*) as total FROM translations');
  if (parseInt(transRows.rows[0].total, 10) === 0) {
    await pool.query(`
      INSERT INTO translations (id, lang, value) VALUES
        ('hero.linea1', 'es', 'SIEMPRE JUNTO'),
        ('hero.linea2', 'es', 'AL CAMPO.'),
        ('hero.desc', 'es', 'Insumos para la agroganadería, alambrados, molinos, aguadas y ferretería.'),
        ('vent.eyebrow', 'es', 'POR QUÉ ELEGIRNOS'),
        ('vent.title.1', 'es', 'VENTAJAS'),
        ('vent.title.2', 'es', 'METAGRO'),
        ('cont.eyebrow', 'es', 'CONTACTO'),
        ('cont.title.1', 'es', '¿NECESITAS UN PRODUCTO?'),
        ('cont.title.2', 'es', 'CONSULTANOS.'),
        ('cont.desc', 'es', 'Asesoramiento sin compromiso por WhatsApp o teléfono.'),
        ('nav.products', 'es', 'PRODUCTOS'),
        ('nav.about', 'es', 'NOSOTROS'),
        ('nav.location', 'es', 'LOCAL'),
        ('nav.contact', 'es', 'CONTACTO'),
        ('hero.eyebrow', 'es', 'Gualeguay, Entre Ríos · Desde 1983'),
        ('hero.products', 'es', 'Ver Productos'),
        ('products.label', 'es', 'Lo que ofrecemos'),
        ('ventajas.label', 'es', 'Por qué elegirnos'),
        ('info.label', 'es', 'Dónde encontrarnos'),
        ('contacto.label', 'es', 'Contacto'),
        ('hero.linea1', 'en', 'ALWAYS WITH'),
        ('hero.linea2', 'en', 'THE COUNTRYSIDE.'),
        ('hero.desc', 'en', 'Supplies for livestock farming, fencing, windmills, water troughs, and hardware.'),
        ('vent.eyebrow', 'en', 'WHY CHOOSE US'),
        ('vent.title.1', 'en', 'ADVANTAGES'),
        ('vent.title.2', 'en', 'METAGRO'),
        ('cont.eyebrow', 'en', 'CONTACT'),
        ('cont.title.1', 'en', 'DO YOU NEED A PRODUCT?'),
        ('cont.title.2', 'en', 'CONTACT US.'),
        ('cont.desc', 'en', 'Free advice via WhatsApp or phone.'),
        ('nav.products', 'en', 'PRODUCTS'),
        ('nav.about', 'en', 'ABOUT US'),
        ('nav.location', 'en', 'LOCATION'),
        ('nav.contact', 'en', 'CONTACT'),
        ('hero.eyebrow', 'en', 'Gualeguay, Entre Ríos · Since 1983'),
        ('hero.products', 'en', 'View Products'),
        ('products.label', 'en', 'What we offer'),
        ('ventajas.label', 'en', 'Why choose us'),
        ('info.label', 'en', 'Where to find us'),
        ('contacto.label', 'en', 'Contact')
    `);
  }
}

module.exports = { pool, initDb };
