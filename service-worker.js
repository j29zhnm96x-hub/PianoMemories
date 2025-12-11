const CACHE_NAME = 'pianomemories-cache-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];
// also cache app icons (place your provided PNG as icon-192.png and icon-512.png in /icons)
// also accept a single favicon.png as a fallback (user-provided)
CORE_ASSETS.push('/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-apple.png', '/icons/favicon.png');

self.addEventListener('install', event => {
  // Install: attempt to cache core assets but tolerate missing resources (e.g. icons)
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const url of CORE_ASSETS) {
      try {
        const resp = await fetch(url, {cache: 'no-store'});
        if (resp && resp.ok) {
          await cache.put(url, resp.clone());
        } else {
          // skip non-ok responses to avoid aborting install
          console.warn('SW: skipping cache for', url, 'status=', resp && resp.status);
        }
      } catch (e) {
        console.warn('SW: failed to fetch', url, e && e.message);
      }
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => cached);
    })
  );
});
