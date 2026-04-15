---
layout: null
permalink: /sw.js
---
{% include build_version.html %}

const CACHE_VERSION = 'anonlab-{{ build_version }}';
const CACHE_NAME = `anonlab-cache-${CACHE_VERSION}`;

const ASSETS = [
  '/',
  '/index.html',
  '/style.css?v={{ build_version }}',
  '/script.js?v={{ build_version }}',
  '/favicon.png?v={{ build_version }}',
  '/envelope.png',
  '/support.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('anonlab-cache-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // HTML sempre dalla rete
  if (req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Asset: cache first
  event.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req)
    )
  );
});
