// Minimal service worker for offline caching (prototype)
const CACHE_NAME = 'residents-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './data/residents.csv'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((resp)=>{
      // Cache new GET requests
      if (e.request.method === 'GET') {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request, copy)).catch(()=>{});
      }
      return resp;
    }).catch(()=>cached))
  );
});
