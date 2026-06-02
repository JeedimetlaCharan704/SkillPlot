const CACHE = 'skillpilot-v1'

const PRECACHE_URLS = [
  '/login.html',
  '/index.html',
  '/profile.html',
  '/resume-analyzer.html',
  '/skill-gap-analyzer.html',
  '/placement-predictor.html',
  '/github-analytics.html',
  '/portfolio-builder.html',
  '/mentor-dashboard.html',
  '/internships.html',
  '/brand-checker.html',
  '/admin.html',
  '/css/variables.css',
  '/css/reset.css',
  '/css/base.css',
  '/css/style.css',
  '/css/components.css',
  '/css/animations.css',
  '/css/responsive.css',
  '/js/store/store.js',
  '/js/services/api.service.js',
  '/js/route-guard.js',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    ))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    return
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, clone))
        }
        return response
      }).catch(() => cached)
      return cached || fetchPromise
    })
  )
})
