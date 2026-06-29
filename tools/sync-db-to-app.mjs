import https from 'https';

const apiUrl = 'https://metagro-api-ds6r.onrender.com';
const outPath = 'backend/data/products.json';

function fetchAllProducts() {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/products', apiUrl);
    let data = '';
    https.get(url.href, (res) => {
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON: ' + e.message));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Descargando productos desde Render...');
  const products = await fetchAllProducts();
  console.log(`Productos recibidos: ${products.length}`);
  const fs = await import('fs');
  fs.writeFileSync(outPath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`Guardado en: ${outPath}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
