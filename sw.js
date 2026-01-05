const CACHE_NAME = 'sophia-recrut-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Stratégie simple : Network first, fallback to cache si nécessaire
  // Pour cette démo, on laisse le navigateur gérer la plupart du cache HTTP standard
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});