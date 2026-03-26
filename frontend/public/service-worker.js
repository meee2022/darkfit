/* =============================================
   DARK FIT — Service Worker v2
   Features: Offline caching, Push Notifications
============================================= */

const CACHE_VERSION = "darkfit-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// App shell — core files that must be cached for offline
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Max items in dynamic cache (prevents unbounded memory growth)
const MAX_DYNAMIC_ITEMS = 100;
const MAX_IMAGE_ITEMS = 60;

/* ============ INSTALL ============ */
self.addEventListener("install", (event) => {
  console.log("[SW] Installing v2...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

/* ============ ACTIVATE ============ */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== IMAGE_CACHE)
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

/* ============ FETCH STRATEGIES ============ */

// Trim cache to max size
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return trimCache(cacheName, maxItems);
  }
}

// Network-first: Try network, fallback to cache (for API / dynamic content)
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      trimCache(cacheName, MAX_DYNAMIC_ITEMS);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

// Cache-first: Try cache, fallback to network (for images and static)
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      trimCache(cacheName, MAX_IMAGE_ITEMS);
    }
    return response;
  } catch {
    // Return placeholder for images
    return new Response("", { status: 404 });
  }
}

// Stale-while-revalidate: Serve from cache, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin Convex API calls
  if (event.request.method !== "GET") return;

  // Skip Convex WebSocket and API calls (they need real-time data)
  if (url.hostname.includes("convex.cloud") || url.hostname.includes("convex.dev")) return;

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith("http")) return;

  // Images — cache-first (CDN images, exercise GIFs)
  if (
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/) ||
    url.hostname.includes("image.mux.com") ||
    url.hostname.includes("exercisedb") ||
    url.hostname.includes("raw.githubusercontent.com")
  ) {
    event.respondWith(cacheFirst(event.request, IMAGE_CACHE));
    return;
  }

  // Fonts — cache-first
  if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // App shell (HTML, JS, CSS) — stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(event.request, DYNAMIC_CACHE));
    return;
  }

  // Everything else — network first
  event.respondWith(networkFirst(event.request, DYNAMIC_CACHE));
});

/* ============ PUSH NOTIFICATIONS ============ */
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  let data = {
    title: "DARK FIT",
    body: "لديك تحديث جديد!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-72.png",
    tag: "darkfit-notification",
    data: { url: "/" },
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/icon-72.png",
    tag: data.tag || "darkfit-notification",
    vibrate: [100, 50, 100, 50, 200],
    data: data.data || { url: "/" },
    actions: [
      { action: "open", title: "فتح التطبيق" },
      { action: "dismiss", title: "تجاهل" },
    ],
    dir: "rtl",
    lang: "ar",
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

/* ============ NOTIFICATION CLICK ============ */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});

/* ============ BACKGROUND SYNC (future) ============ */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-workouts") {
    console.log("[SW] Background sync: workouts");
    // Future: sync cached offline workout logs
  }
});

/* ============ PERIODIC NOTIFICATION SCHEDULING ============ */
// This handles scheduled local notifications via postMessage from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATION") {
    const { title, body, delay, tag, url } = event.data;

    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-72.png",
        tag: tag || "darkfit-scheduled",
        vibrate: [100, 50, 100],
        data: { url: url || "/" },
        dir: "rtl",
        lang: "ar",
      });
    }, delay || 0);
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
