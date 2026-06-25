var CACHE_NAME = 'wheel-game-v2';
var ASSETS = [
  'wheel-game.html',
  'manifest.json',
  'icon-192.jpg',
  'icon-512.jpg',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(name) {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      return fetch(event.request).then(function(networkResponse) {
        var cacheable = event.request.method === 'GET' &&
          event.request.url.startsWith(self.location.origin) &&
          !event.request.url.includes('chrome-extension');
        if (cacheable) {
          var clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      }).catch(function() {
        if (event.request.mode === 'navigate') {
          return caches.match('wheel-game.html');
        }
        return new Response('غير متصل حاليا', { status: 503 });
      });
    })
  );
});
