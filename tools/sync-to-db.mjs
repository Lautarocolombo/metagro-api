import fs from 'fs';
import path from 'path';
import https from 'https';

const envPath = path.join(process.cwd(), '.env');
const env = fs.readFileSync(envPath, 'utf8');
const userMatch = env.match(/ADMIN_USER=(.+)/);
const passMatch = env.match(/ADMIN_PASS=(.+)/);

if (!userMatch || !passMatch) {
  console.error('ADMIN_USER o ADMIN_PASS no encontrados en .env');
  process.exit(1);
}

const username = userMatch[1].trim();
const password = passMatch[1].trim();
const apiUrl = process.argv[2] || 'https://metagro-api-ds6r.onrender.com';

function request(endpoint, method, data, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(apiUrl);
    url.pathname = endpoint;
    const body = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(body);
    }
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers
    };
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  const loginRes = await request('/api/admin/login', 'POST', { username, password });
  if (loginRes.status !== 200 || !loginRes.data.token) {
    console.error('Error en login:', loginRes.status, loginRes.data);
    process.exit(1);
  }
  const token = loginRes.data.token;
  console.log('Login exitoso');

  const productsPath = path.join(process.cwd(), 'backend', 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  console.log(`Sincronizando ${products.length} productos con ${apiUrl}...`);
  const syncRes = await request('/api/sync-to-db', 'POST', products, {
    'Authorization': `Bearer ${token}`
  });
  console.log('Status:', syncRes.status);
  console.log('Response:', JSON.stringify(syncRes.data, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
