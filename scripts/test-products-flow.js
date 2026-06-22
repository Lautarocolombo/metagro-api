import dotenv from 'dotenv';
dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:4000/api';
const TOKEN = process.env.MG_ADMIN_TOKEN || process.env.METAGRO_TOKEN || ''; // opcional

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function request(path, { method='GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const t = token ?? TOKEN;
  if (t) headers['x-mg-token'] = t;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} for ${method} ${path}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return { status: res.status, data };
}

async function main(){
  const producto = {
    id: Date.now(),
    name: `TEST Producto ${new Date().toISOString()}`,
    tag: 'TEST',
    desc: 'Producto creado para validar POST/DELETE contra PostgreSQL.',
    icon: '🧪',
    img: ''
  };

  console.log('API_BASE =', API_BASE);

  console.log('\n[1] Status DB (health)');
  try {
    const r = await request('/products-test/status');
    console.log('OK:', r.data);
  } catch (e) {
    console.log('WARN status no disponible/ok:', e.status, e.data ?? e.message);
  }

  console.log('\n[2] POST insertar producto');
  const post = await request('/products-test', { method: 'POST', body: producto });
  console.log('POST status=', post.status);
  console.log('POST data=', post.data);

  const insertedId = post.data?.id;
  if (!insertedId) throw new Error('No se recibió id del POST');

  console.log('\n[3] Confirmar presencia en DB vía GET (si existe)');
  try {
    const list = await request(`/products-test/${insertedId}`);
    console.log('GET single status ok:', list.data);
  } catch (e) {
    console.log('INFO no existe GET single o falló:', e.status, e.data ?? e.message);
  }

  console.log('\n[4] DELETE borrar producto');
  const del = await request(`/products-test/${insertedId}`, { method: 'DELETE' });
  console.log('DELETE status=', del.status);
  console.log('DELETE data=', del.data);

  console.log('\n[5] Confirmar ausencia');
  try {
    await request(`/products-test/${insertedId}`, { method: 'GET' });
    console.log('ERROR: el producto aún existe (GET no falló)');
  } catch (e) {
    console.log('OK: GET después de delete falló como se esperaba:', e.status);
  }

  console.log('\n✅ Flujo POST/DELETE contra PostgreSQL completado.');
}

main().catch(err => {
  console.error('\n❌ Test falló:', err.message);
  if (err.status) console.error('status=', err.status);
  if (err.data) console.error('data=', err.data);
  process.exit(1);
});

