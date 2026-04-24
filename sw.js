const CACHE = 'qqq-v8';
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
  const req = e.request;
  const url = new URL(req.url);

  // Only handle GETs — never intercept POST/PUT etc.
  if (req.method !== 'GET') return;

  // Cross-origin (quote APIs, news, proxies) — always go straight to network,
  // never cache. This is critical: caching Finnhub/Yahoo responses makes QQQ
  // quotes stale forever.
  if (url.origin !== self.location.origin) return;

  // Same-origin app shell and data files — network-first, cache fallback.
  e.respondWith(
    fetch(req).then(r => {
      // Only cache successful responses for our own known assets
      if (r && r.ok) {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(req, copy).catch(()=>{}));
      }
      return r;
    }).catch(() => caches.match(req).then(c => c || caches.match('/putoption/index.html')))
  );
});
