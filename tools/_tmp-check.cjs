const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const env = {};
fs.readFileSync(path.join(process.cwd(), 'backend', '.env'), 'utf8')
  .split('\n')
  .forEach(line => {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });

const pool = new Pool({
  connectionString: env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const count = await pool.query('SELECT count(*) as n FROM productos_ganaderos');
  const imgs = await pool.query("SELECT count(*) as n FROM productos_ganaderos WHERE imagen_url IS NOT NULL AND imagen_url != ''");
  const extras = await pool.query('SELECT count(*) as n FROM product_images');
  const files = fs.readdirSync(path.join(process.cwd(), 'frontend', 'productos'));

  console.log('PG productos =', count.rows[0].n);
  console.log('PG con imagen_url =', imgs.rows[0].n);
  console.log('PG imagenes extra =', extras.rows[0].n);
  console.log('Carpeta frontend/productos =', files.length);

  await pool.end();
})().catch(e => {
  console.error(e);
  process.exit(1);
});
