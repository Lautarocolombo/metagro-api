const http = require('http');

const BASE = process.argv[2] || 'http://localhost:4000';
let passed = 0;
let failed = 0;

function request(path, opts = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const req = http.request(url, { method: opts.method || 'GET', headers: opts.headers || {} }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        let data;
        try { data = JSON.parse(body) } catch { data = body }
        resolve({ status: res.statusCode, data })
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

async function run() {
  console.log(`\nTestuite Metagro API — ${BASE}\n`);

  const health = await request('/api/health');
  if (health.status === 200 && health.data.ok) { console.log('GET /api/health → 200 OK'); passed++ }
  else { console.log('GET /api/health falló:', health.status, health.data); failed++ }

  const products = await request('/api/products');
  if (products.status === 200 && Array.isArray(products.data)) {
    console.log(`GET /api/products → 200 OK (${products.data.length} productos)`);
    passed++;
    if (products.data.length > 0) {
      const p = products.data[0];
      if (p.name && p.img) console.log(`   Primer producto: "${p.name}" | img: ${p.img}`);
      else { console.log('   Producto sin name o img'); failed++ }
    }
  } else {
    console.log('GET /api/products falló:', products.status, products.data); failed++;
  }

  if (products.data.length > 0) {
    const imgPath = products.data[0].img;
    if (imgPath) {
      const imgUrl = imgPath.startsWith('http') ? imgPath : imgPath.startsWith('/') ? `${BASE}${imgPath}` : `${BASE}/${imgPath}`;
      const img = await new Promise((resolve) => {
        const req = http.get(imgUrl, res => {
          res.on('data', () => {});
          res.on('end', () => resolve({ status: res.statusCode }));
        });
        req.on('error', () => resolve({ status: 0 }));
      });
      if (img.status === 200) { console.log(`GET ${imgPath} → 200 OK`); passed++ }
      else { console.log(`GET ${imgPath} → ${img.status}`); failed++ }
    }
  }

  const loginBody = JSON.stringify({ username: 'metagro', password: 'montealegre22' })
  const login = await request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginBody
  });
  let token = null;
  if (login.status === 200 && login.data && login.data.token) {
    console.log('POST /api/admin/login → 200 OK (token obtenido)');
    token = login.data.token;
    passed++;
  } else {
    console.log('POST /api/admin/login falló:', login.status, login.data);
    failed++;
  }

  const cats = await request('/api/categories', {
    headers: token ? { 'x-mg-token': token } : {}
  });
  if (cats.status === 200 && Array.isArray(cats.data)) {
    console.log(`GET /api/categories → 200 OK (${cats.data.length} categorías)`); passed++;
  } else {
    console.log('GET /api/categories falló:', cats.status, cats.data); failed++;
  }

  const backup = await request('/api/backup', {
    headers: token ? { 'x-mg-token': token } : {}
  });
  if (backup.status === 200 && Array.isArray(backup.data)) {
    console.log(`GET /api/backup → 200 OK (${backup.data.length} items)`); passed++;
  } else {
    console.log('GET /api/backup falló:', backup.status, backup.data); failed++;
  }

  console.log(`\nResultado: ${passed}  ${failed}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Error:', e); process.exit(1) });
