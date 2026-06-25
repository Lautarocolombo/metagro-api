const CACHE = 'metagro-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/app.js',
  '/fonts/fonts.css',
  '/logo/Logo.jpg',
  '/image/imagen 1.jpeg',
  '/image/imagen 2.jpeg',
  '/image/imagen 3.jpeg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
