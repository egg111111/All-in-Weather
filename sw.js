// install event
self.addEventListener("install", (e) => {
  console.log("[Service Worker] installed");
});

// activate event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName === 'oauth2-cache') {
            // 특정 캐시를 삭제
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  console.log("[Service Worker] Old caches cleared");
});


// fetch event
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // /oauth2/ 및 /login/oauth2/ 경로 제외
  if (url.pathname.startsWith('/oauth2/') || url.pathname.startsWith('/login/oauth2/')) {
    console.log("[Service Worker] Skipped fetch for: " + e.request.url);
    return; // 네트워크로만 요청 진행
  }

  // 기존 캐싱 로직
  console.log("[Service Worker] Fetched resource: " + e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

