const CACHE = 'skillpilot-v1'

const PRECACHE_URLS = [
  '/login.html',
  '/index.html',
  '/profile.html',
  '/register.html',
  '/reset-password.html',
  '/oauth-callback.html',
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
  '/css/pages/dashboard.css',
  '/css/pages/profile.css',
  '/css/pages/admin.css',
  '/css/pages/login.css',
  '/css/pages/resume-analyzer.css',
  '/css/pages/placement.css',
  '/css/pages/skill-gap.css',
  '/css/pages/github-analytics.css',
  '/css/pages/portfolio-builder.css',
  '/css/pages/internships.css',
  '/js/config.js',
  '/js/store/store.js',
  '/js/services/api.service.js',
  '/js/services/auth.service.js',
  '/js/services/resume.service.js',
  '/js/services/career.service.js',
  '/js/services/skill.service.js',
  '/js/services/placement.service.js',
  '/js/services/analytics.service.js',
  '/js/services/recruiter.service.js',
  '/js/services/github-analytics.service.js',
  '/js/services/profile.service.js',
  '/js/data/demo-profile.js',
  '/js/data/career-paths.js',
  '/js/data/skills-db.js',
  '/js/data/companies.js',
  '/js/data/placement-data.js',
  '/js/utils/kpi.js',
  '/js/route-guard.js',
  '/js/auth.js',
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
