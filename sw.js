const CACHE = 'qqq-v4';
const ASSETS = [
  '/putoption/index.html',
  '/putoption/manifest.json',
  '/putoption/icons/icon-192.png',
  '/putoption/icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => { self.clients.claim(); });
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
});
