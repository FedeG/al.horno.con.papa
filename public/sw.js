// Al Horno Con Papá — Service Worker
const CACHE = 'ahcp-v1';
const OFFLINE_URL = '/offline.html';

// Recursos a precachear al instalar
const PRECACHE = ['/', OFFLINE_URL];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch strategies ───────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache = await caches.open(CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(OFFLINE_URL);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo same-origin
  if (url.origin !== self.location.origin) return;

  // Navigation → network first, fallback a cache, luego offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // TODO: ignorar peticiones de analytics
  if (url.hostname.includes('google-analytics') || url.hostname.includes('googletagmanager.com')) {
    return;
  }

  // Static assets (JS, CSS, imágenes, fuentes) → cache first
  event.respondWith(cacheFirst(request));
});
