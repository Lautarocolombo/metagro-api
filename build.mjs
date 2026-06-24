import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify } from 'html-minifier-terser';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;

const SRC = path.join(root, 'index.html');
const DIST = path.join(root, 'dist');
const ASSETS = ['productos', 'image', 'logo', 'api', 'backend', 'sql'];

const options = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  sortClassName: true,
  useShortDoctype: true,
  minifyJS: true,
  minifyCSS: true,
};

async function build() {
  await fs.mkdir(DIST, { recursive: true });

  const html = await fs.readFile(SRC, 'utf8');
  const minified = await minify(html, options);
  await fs.writeFile(path.join(DIST, 'index.html'), minified);

  for (const asset of ASSETS) {
    const src = path.join(root, asset);
    const dst = path.join(DIST, asset);
    try {
      await fs.cp(src, dst, { recursive: true });
    } catch (e) {
      if (e.code !== 'ENOENT') console.warn(`[build] No se pudo copiar ${asset}:`, e.message);
    }
  }

  for (const file of ['package.json', 'vercel.json']) {
    const src = path.join(root, file);
    const dst = path.join(DIST, file);
    try { await fs.copyFile(src, dst); } catch {}
  }

  console.log(`[build] dist/ generado (${(await fs.stat(path.join(DIST, 'index.html'))).size} bytes)`);
}

build().catch((e) => {
  console.error('[build] Error:', e);
  process.exit(1);
});
