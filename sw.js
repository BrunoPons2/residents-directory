const NO_STORE_PATHS = [
  '/data/residents.csv',
  '/documents/',
  '/photos/thumb/',
  '/photos/profile/',
];

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const shouldBypassCache = NO_STORE_PATHS.some(path => url.pathname.includes(path));

  if (shouldBypassCache) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
  }
});
