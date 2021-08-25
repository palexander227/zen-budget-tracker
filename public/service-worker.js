const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
  ];
  
  const Zen_Tracker_cache = "Zen-tracker-cache-v1";
  const Zen_Files_Cache = "Zen-files-cache-v1";
  
  // running the install event to help store our assets inside the browser cache
  self.addEventListener("install", function (evt) {
    evt.waitUntil(
      caches.open(Zen_Tracker_cache).then((cache) => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });
  
  // Using activate event to clean up old cache and update if there are new additions to our files
  self.addEventListener("activate", function (evt) {
    evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== Zen_Tracker_cache && key !== Zen_Files_Cache) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  // fetching the cached files for offline usage
  self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches
          .open(Zen_Files_Cache)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                // clone and store response in the cache if the fetch request is successful
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
                return response;
              })
              .catch((err) => {
                // Get the files from cache is network fails and request is unsuccessful
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      fetch(evt.request).catch(function () {
        return caches.match(evt.request).then(function (response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get("accept").includes("text/html")) {
            // returning cached home page for all html pages
            return caches.match("/");
          }
        });
      })
    );
  });