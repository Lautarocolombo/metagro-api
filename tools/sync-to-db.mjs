import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), 'backend', '.env');
const env = fs.readFileSync(envPath, 'utf8');
const match = env.match(/METAGRO_TOKEN=(.+)/);

if (!match) {
  console.error('METAGRO_TOKEN no encontrado en backend/.env');
  process.exit(1);
}

const token = match[1].trim();

async function main() {
  const res = await fetch('http://localhost:4000/api/sync-to-db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mg-token': token
    }
  });

  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
