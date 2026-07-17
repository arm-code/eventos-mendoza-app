self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Service worker básico passthrough.
  // Esto es necesario para que el navegador reconozca la aplicación como instalable (PWA).
  // No realiza caché activo de red para evitar conflictos.
});
