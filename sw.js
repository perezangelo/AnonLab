const CACHE_NAME = 'anonlab-cache-v2';

// Forza il Service Worker a diventare attivo immediatamente senza attendere
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Cancella le vecchie cache all'avvio
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Intercetta la richiesta di main.js e la richiede saltando la cache del browser
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('main.js')) {
        event.respondWith(
            fetch(event.request, { cache: 'no-store' }).catch(() => {
                return caches.match(event.request);
            })
        );
    }
});
