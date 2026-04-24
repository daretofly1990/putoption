const CACHE = 'qqq-v5';
const ASSETS = [
  '/putoption/index.html',
  '/putoption/manifest.json',
  '/putoption/qqq-hist.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  // Network-first for the app shell and history JSON so users get fresh data;
  // fall back to cache when offline.
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('/index.html') || url.pathname.endsWith('/qqq-hist.json') || url.pathname.endsWith('/putoption/')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy).catch(()=>{}));
        return r;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('/putoption/index.html')))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).catch(() => caches.match('/putoption/index.html'))));
});
