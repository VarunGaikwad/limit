const CACHE_NAME = "limit-finance-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/dashboard",
  "/dashboard/transaction",
  "/dashboard/wallet",
  "/dashboard/budget",
  "/dashboard/tag",
  "/manifest.json",
  "/icon.png",
  "/icon-512.png",
];

// Cache on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

// Activate - cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  return self.clients.claim();
});

// Fetch - Network falling back to cache strategy
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests (like Supabase API) to avoid opaque cache issues for now,
  // or handle them specifically if needed.
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful, clone it and put in cache
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // If network fails, try the cache
        return caches.match(event.request);
      }),
  );
});
