const CACHE_NAME = "atria-ai-v2";
const CACHE_STATIC = [
  "/",
  "/index.html",
  "/chat.html",
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"
];

// Instala e faz cache dos recursos estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache apenas os arquivos locais — externos podem falhar
      return cache.addAll(["/index.html", "/chat.html"]).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estratégia: Network First para API, Cache First para assets estáticos
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API do backend — sempre vai para a rede, nunca cacheia
  if (url.hostname.includes("workers.dev") || url.pathname.startsWith("/api")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Fontes e CDN — Cache First (ficam offline)
  if (
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("cdnjs.cloudflare.com")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Arquivos locais (HTML, CSS, JS) — Network First com fallback cache
  // Exclui requisições POST e endpoints de API dinâmica
  if (url.origin === self.location.origin) {
    // Nunca cacheia POST, PUT, DELETE ou endpoints de API dinâmica
    if (event.request.method !== "GET" || url.pathname === "/chat" || url.pathname.startsWith("/chat/")) {
      event.respondWith(fetch(event.request));
      return;
    }
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Todo o resto — direto para a rede
  event.respondWith(fetch(event.request));
});

// Push notifications (preparado para uso futuro)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || "Atria AI", {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-96.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/chat.html" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/chat.html")
  );
});
