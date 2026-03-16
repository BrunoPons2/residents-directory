// Minimal service worker for offline caching (prototype)
const CACHE_NAME = 'residents-pwa-v7';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  if (
    url.pathname.includes('/data/residents.csv') ||
    url.pathname.includes('/photos/')
  ) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
    return;
  }
});

  if (url.pathname.includes('/photos/')) {
    e.respondWith(
      caches.open('photo-cache').then(cache =>
        cache.match(e.request).then(resp => {
          return resp || fetch(e.request).then(networkResp => {
            cache.put(e.request, networkResp.clone());
            return networkResp;
          });
        })
      )
    );
  }
});
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
