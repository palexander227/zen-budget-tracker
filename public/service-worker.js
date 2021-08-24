console.log("service worker is activated but not in full action!!")
// cache name to be used in storing the cached files
const cacheName = "zen-tracker-cache";
const cachedAssets = [
    "/index.html",
    "/index.js",
    "/index.css",
    "/manifest.webmanifest",
    "icons/icon-192x192.png",
    "icons/icon-512x512.png",
];

// Call install event
self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(cacheName)
        .then((cache) => cache.addAll(cachedAssets))
        .then(() => self.skipWaiting())
    );
});