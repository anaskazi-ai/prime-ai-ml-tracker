// Service Worker for Apna College Prime AI/ML Classroom Tracker
// Provides 100% Offline Capability, Instant Shell Boot & Asset Caching

const CACHE_NAME = 'prime-ai-ml-tracker-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './course_catalog.json',
  './manifest.json',
  './app_icon.ico'
];

// Install: Cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell for 100% offline access');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER cache video stream or desktop folder launcher
  if (url.pathname.startsWith('/api/stream') || url.pathname.startsWith('/api/open-folder')) {
    return; // Pass through directly to local loopback server
  }

  // 2. API requests (catalog, progress): Network first with fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        // If offline and request is /api/catalog, return cached static catalog
        if (url.pathname === '/api/catalog') {
          const cachedCat = await caches.match('./course_catalog.json');
          if (cachedCat) return cachedCat;
        }
        return new Response(JSON.stringify({ offline: true, error: 'Offline - local server or network unavailable' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 3. Static assets & Shell: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed (offline); cachedResponse will be returned
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
