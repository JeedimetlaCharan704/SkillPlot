(function () {
  'use strict'

  var THEME_CYCLE = ['light', 'dark', 'system']
  var THEME_ICONS = { light: 'fa-solid fa-moon', dark: 'fa-solid fa-sun', system: 'fa-solid fa-circle-half-stroke' }
  var CHARTS = {}
  var currentResult = null
  var currentMode = 'demo'

  /* ===== THEME ===== */
  function initTheme () {
    var toggle = document.getElementById('dash-theme-toggle')
    if (!toggle) return
    function getMode () { return document.documentElement.getAttribute('data-theme-mode') || 'light' }
    function setMode (mode) {
      var eff = mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode
      document.documentElement.setAttribute('data-theme', eff)
      document.documentElement.setAttribute('data-theme-mode', mode)
      localStorage.setItem('skillpilot_theme', mode)
      var icon = toggle.querySelector('i')
      icon.className = THEME_ICONS[mode] || THEME_ICONS.light
      toggle.setAttribute('aria-label', 'Theme: ' + mode)
      updateChartsTheme(eff)
    }
    setMode(getMode())
    toggle.addEventListener('click', function () {
      var cur = getMode()
      var idx = THEME_CYCLE.indexOf(cur)
      setMode(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length])
    })
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (getMode() === 'system') setMode('system')
    })
  }

  function updateChartsTheme (theme) {
    var isDark = theme === 'dark'
    var tc = isDark ? '#94A3B8' : '#64748B'
    var gc = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
    Object.values(CHARTS).forEach(function (ch) {
      if (!ch || !ch.options) return
      if (ch.options.plugins && ch.options.plugins.legend) ch.options.plugins.legend.labels.color = tc
      if (ch.options.scales) Object.values(ch.options.scales).forEach(function (s) { if (s) { s.ticks.color = tc; s.grid.color = gc } })
      ch.update('none')
    })
  }

  function initSidebar () {
    var t = document.getElementById('dash-sidebar-toggle'); var s = document.getElementById('dash-sidebar')
    if (!t || !s) return
    t.addEventListener('click', function () { s.classList.toggle('open'); document.body.classList.toggle('sidebar-open') })
    s.querySelectorAll('.dash-sidebar-item').forEach(function (i) {
      i.addEventListener('click', function () {
        s.querySelectorAll('.dash-sidebar-item').forEach(function (x) { x.classList.remove('active') })
        this.classList.add('active')
        if (window.innerWidth <= 992) s.classList.remove('open')
      })
    })
  }

  function initLogout () {
    var btn = document.getElementById('dash-logout-btn')
    if (!btn) return
    btn.addEventListener('click', async function () {
      if (SessionManager) SessionManager.stop()
      var r = await AuthService.logout()
      window.location.href = (r.data && r.data.redirect) || 'login.html'
    })
  }

  function loadUser () {
    var user = Store.get('user')
    if (!user) return
    var el = document.getElementById('dash-user-name')
    if (el) el.textContent = user.name || 'User'
    var rel = document.getElementById('dash-user-role')
    if (rel) rel.textContent = user.role || 'student'
    var av = document.getElementById('dash-avatar')
    if (av) {
      var parts = (user.name || 'US').split(' ')
      av.textContent = (parts[0][0] || '') + (parts[1] ? parts[1][0] : parts[0][1] || '')
    }
  }

  function showSkeletons () { var el = document.querySelector('[data-skel]'); if (el) el.style.display = '' }
  function hideSkeletons () { var el = document.querySelector('[data-skel]'); if (el) el.style.display = 'none' }
  function showResults () { var el = document.getElementById('gh-results'); if (el) el.style.display = '' }

  /* ===== MODE ===== */
  function initMode () {
    var btns = document.querySelectorAll('#gh-mode-group .gh-mode-btn')
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active') })
        this.classList.add('active')
        currentMode = this.getAttribute('data-mode')
      })
    })
  }

  /* ===== RENDER: Mode Badge ===== */
  function renderModeBadge (mode) {
    var container = document.getElementById('gh-mode-badge-container')
    if (!container) return
    var labels = { demo: 'Demo Data', api: 'Live GitHub API', fallback: 'Fallback Data', failed: 'API Failed — Using Demo' }
    var label = labels[mode] || mode
    container.innerHTML = '<span class="gh-mode-badge ' + mode + '"><i class="fa-solid fa-circle-info"></i> ' + label + '</span>'
  }

  /* ===== RENDER: Profile Card ===== */
  function renderProfile (data) {
    var card = document.getElementById('gh-profile-card')
    if (!card) return
    card.style.display = ''
    card.innerHTML =
      '<div class="gh-avatar">' + (data.avatarUrl ? '<img src="' + esc(data.avatarUrl) + '" alt="' + esc(data.username) + '">' : '<i class="fa-brands fa-github"></i>') + '</div>' +
      '<div class="gh-profile-body">' +
        '<div class="gh-profile-name">' + esc(data.name || data.username) + ' <span style="font-weight:var(--weight-normal);color:var(--text-3)">@' + esc(data.username) + '</span></div>' +
        '<div class="gh-profile-bio">' + esc(data.bio || '') + '</div>' +
        '<div class="gh-profile-meta">' +
          (data.location ? '<span><i class="fa-solid fa-location-dot"></i>' + esc(data.location) + '</span>' : '') +
          (data.company ? '<span><i class="fa-solid fa-building"></i>' + esc(data.company) + '</span>' : '') +
          '<span><i class="fa-solid fa-calendar"></i>Joined ' + formatDate(data.joinedAt) + '</span>' +
        '</div>' +
      '</div>'
  }

  /* ===== RENDER: Stats ===== */
  function renderStats (data) {
    var grid = document.getElementById('gh-stats-grid')
    if (!grid) return
    grid.innerHTML =
      '<div class="gh-stat-card"><div class="gh-stat-label">Repositories</div><div class="gh-stat-value">' + (data.publicRepos || 0) + '</div><div class="gh-stat-sub">public repos</div></div>' +
      '<div class="gh-stat-card"><div class="gh-stat-label">Stars</div><div class="gh-stat-value">' + (data.totalStars || 0) + '</div><div class="gh-stat-sub">across repos</div></div>' +
      '<div class="gh-stat-card"><div class="gh-stat-label">Forks</div><div class="gh-stat-value">' + (data.totalForks || 0) + '</div><div class="gh-stat-sub">total forks</div></div>' +
      '<div class="gh-stat-card"><div class="gh-stat-label">Followers</div><div class="gh-stat-value">' + (data.followers || 0) + '</div><div class="gh-stat-sub">followers</div></div>' +
      '<div class="gh-stat-card"><div class="gh-stat-label">Contribution Score</div><div class="gh-stat-value" style="color:' + scoreColor(data.contributionScore || 0) + '">' + (data.contributionScore || 0) + '</div><div class="gh-stat-sub">out of 100</div></div>' +
      '<div class="gh-stat-card"><div class="gh-stat-label">Activity Score</div><div class="gh-stat-value" style="color:' + scoreColor(data.activityScore || 0) + '">' + (data.activityScore || 0) + '</div><div class="gh-stat-sub">out of 100</div></div>'
  }

  /* ===== CHARTS ===== */
  function renderCharts (result) {
    destroyCharts()
    var data = result.data
    var quality = result.quality
    var categories = result.categories
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var tc = isDark ? '#94A3B8' : '#64748B'
    var gc = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    var langColors = { JavaScript: '#F7DF1E', Python: '#3776AB', TypeScript: '#3178C6', HTML: '#E34F26', CSS: '#1572B6', Java: '#B07219', Others: '#6B7280' }

    // 1. Language Doughnut
    var ctxLang = document.getElementById('chart-lang-doughnut')
    if (ctxLang) {
      var langLabels = Object.keys(data.languageBreakdown || {})
      var langData = Object.values(data.languageBreakdown || {})
      var colors = langLabels.map(function (l) { return langColors[l] || '#6B7280' })
      CHARTS.lang = new Chart(ctxLang, {
        type: 'doughnut',
        data: { labels: langLabels, datasets: [{ data: langData, backgroundColor: colors, borderWidth: 1, borderColor: isDark ? '#1E293B' : '#fff' }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: tc, font: { size: 9 }, padding: 8 } } } }
      })
    }

    // 2. Quality Bar Chart
    var ctxQuality = document.getElementById('chart-quality-bar')
    if (ctxQuality) {
      var qLabels = quality.scores.slice(0, 8).map(function (s) { return s.name.length > 10 ? s.name.slice(0, 8) + '..' : s.name })
      var qData = quality.scores.slice(0, 8).map(function (s) { return s.score })
      var qColors = qData.map(function (v) { return v >= 70 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444' })
      CHARTS.quality = new Chart(ctxQuality, {
        type: 'bar',
        data: { labels: qLabels, datasets: [{ data: qData, backgroundColor: qColors, borderWidth: 0, borderRadius: 3 }] },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          scales: { x: { min: 0, max: 100, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, y: { ticks: { color: tc, font: { size: 8 } }, grid: { display: false } } },
          plugins: { legend: { display: false } }
        }
      })
    }

    // 3. Tech Category Radar
    var ctxRadar = document.getElementById('chart-tech-radar')
    if (ctxRadar) {
      var catLabels = Object.keys(categories).filter(function (c) { return c !== 'Other' })
      var catData = catLabels.map(function (c) { return categories[c].score })
      var radarColors = catData.map(function (v) { return v >= 60 ? '#10B981' : v >= 30 ? '#F59E0B' : '#EF4444' })
      CHARTS.radar = new Chart(ctxRadar, {
        type: 'radar',
        data: { labels: catLabels, datasets: [{ data: catData, backgroundColor: 'rgba(79,70,229,0.1)', borderColor: '#4F46E5', borderWidth: 2, pointBackgroundColor: radarColors, pointBorderColor: '#4F46E5', pointRadius: 4 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { r: { min: 0, max: 100, ticks: { color: tc, font: { size: 9 }, stepSize: 20 }, grid: { color: gc }, pointLabels: { color: tc, font: { size: 9 } } } },
          plugins: { legend: { display: false } }
        }
      })
    }

    // 4. Activity Timeline
    var ctxActivity = document.getElementById('chart-activity-line')
    if (ctxActivity) {
      var timeline = data.activityTimeline || []
      var actLabels = timeline.map(function (t) { return t.month || '' })
      var actData = timeline.map(function (t) { return t.contributions || 0 })
      var gradient = ctxActivity.getContext('2d').createLinearGradient(0, 0, 0, 240)
      gradient.addColorStop(0, 'rgba(79,70,229,0.25)')
      gradient.addColorStop(1, 'rgba(79,70,229,0.01)')
      CHARTS.activity = new Chart(ctxActivity, {
        type: 'line',
        data: { labels: actLabels, datasets: [{ data: actData, borderColor: '#4F46E5', backgroundColor: gradient, borderWidth: 2, fill: true, tension: 0.3, pointBackgroundColor: '#4F46E5', pointRadius: 3 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, x: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } } },
          plugins: { legend: { display: false } }
        }
      })
    }
  }

  function destroyCharts () {
    Object.values(CHARTS).forEach(function (c) { if (c) c.destroy() })
    CHARTS = {}
  }

  /* ===== RENDER: Quality ===== */
  function renderQuality (quality) {
    var grid = document.getElementById('gh-quality-grid')
    var avgEl = document.getElementById('gh-quality-avg')
    if (!grid) return
    if (avgEl) avgEl.textContent = 'Average: ' + quality.average + '/100'

    grid.innerHTML = quality.scores.map(function (s) {
      var color = s.score >= 70 ? '#10B981' : s.score >= 50 ? '#F59E0B' : '#EF4444'
      return '<div class="gh-quality-row">' +
        '<div><div class="gh-quality-name">' + esc(s.name) + '</div><div class="gh-quality-label">' + s.label + ' · ' + s.stars + ' stars · ' + (s.language || '') + '</div></div>' +
        '<div class="gh-quality-bar"><div class="gh-quality-bar-fill" style="width:' + s.score + '%;background:' + color + '"></div></div>' +
        '<span class="gh-quality-score" style="color:' + color + '">' + s.score + '</span>' +
      '</div>'
    }).join('')
  }

  /* ===== RENDER: Maturity ===== */
  function renderMaturity (maturity) {
    var grid = document.getElementById('gh-maturity-grid')
    var val = document.getElementById('gh-maturity-value')
    if (!grid) return
    if (val) val.textContent = maturity.score + '/100'

    grid.innerHTML = Object.values(maturity.factors).map(function (f) {
      var color = f.score >= 60 ? '#10B981' : f.score >= 40 ? '#F59E0B' : '#EF4444'
      return '<div class="gh-maturity-row">' +
        '<span class="gh-maturity-name">' + f.label + '</span>' +
        '<div class="gh-maturity-bar"><div class="gh-maturity-fill" style="width:' + f.score + '%;background:' + color + '"></div></div>' +
        '<span class="gh-maturity-score" style="color:' + color + '">' + f.score + '</span>' +
        '<span class="gh-maturity-desc">' + f.desc + '</span>' +
      '</div>'
    }).join('')
  }

  /* ===== RENDER: Categories ===== */
  function renderCategories (categories) {
    var grid = document.getElementById('gh-cat-grid')
    var count = document.getElementById('gh-cat-count')
    if (!grid) return
    var catIcons = { Frontend: 'fa-solid fa-window-maximize', Backend: 'fa-solid fa-server', 'Data Science': 'fa-solid fa-chart-bar', Cloud: 'fa-solid fa-cloud', DevOps: 'fa-solid fa-gears', Databases: 'fa-solid fa-database', Other: 'fa-solid fa-code' }
    var catColors = { Frontend: '#3B82F6', Backend: '#10B981', 'Data Science': '#8B5CF6', Cloud: '#F59E0B', DevOps: '#EF4444', Databases: '#06B6D4', Other: '#6B7280' }
    var cats = Object.keys(categories).filter(function (c) { return categories[c].count > 0 })
    if (count) count.textContent = cats.length + ' categories'

    grid.innerHTML = cats.map(function (c) {
      return '<div class="gh-cat-card">' +
        '<div class="gh-cat-icon" style="color:' + (catColors[c] || '#6B7280') + '"><i class="' + (catIcons[c] || 'fa-solid fa-code') + '"></i></div>' +
        '<div class="gh-cat-name">' + c + '</div>' +
        '<div class="gh-cat-count">' + categories[c].count + ' technologies · ' + categories[c].score + '/100</div>' +
      '</div>'
    }).join('')
  }

  /* ===== RENDER: Recruiter View ===== */
  function renderRecruiter (recruiter) {
    var grid = document.getElementById('gh-recruiter-grid')
    if (!grid) return
    grid.innerHTML =
      '<div class="gh-recruiter-card">' +
        '<div class="gh-recruiter-title"><i class="fa-solid fa-thumbs-up" style="color:#10B981"></i> Strongest Technical Areas</div>' +
        '<div class="gh-recruiter-list">' +
          (recruiter.strengths.length ? recruiter.strengths.map(function (s) { return '<div class="gh-recruiter-item"><i class="fa-solid fa-check-circle"></i>' + s + '</div>' }).join('') : '<div class="gh-recruiter-item" style="color:var(--text-3)">Insufficient data</div>') +
        '</div>' +
      '</div>' +
      '<div class="gh-recruiter-card">' +
        '<div class="gh-recruiter-title"><i class="fa-solid fa-triangle-exclamation" style="color:#F59E0B"></i> Areas to Improve</div>' +
        '<div class="gh-recruiter-list">' +
          (recruiter.weaknesses.length ? recruiter.weaknesses.map(function (w) { return '<div class="gh-recruiter-item"><i class="fa-solid fa-circle-exclamation"></i>' + w + '</div>' }).join('') : '<div class="gh-recruiter-item" style="color:var(--text-3)">No areas detected</div>') +
        '</div>' +
      '</div>' +
      '<div class="gh-recruiter-card">' +
        '<div class="gh-recruiter-title"><i class="fa-solid fa-star" style="color:#F59E0B"></i> Most Impressive Projects</div>' +
        '<div class="gh-recruiter-list">' +
          (recruiter.impressiveProjects.length ? recruiter.impressiveProjects.map(function (p) {
            return '<div class="gh-impressive-card"><div><div class="gh-impressive-name">' + esc(p.name) + '</div><div class="gh-impressive-reason">' + p.reason + ' · ' + p.stars + ' stars</div></div></div>'
          }).join('') : '<div class="gh-recruiter-item" style="color:var(--text-3)">No impressive projects yet</div>') +
        '</div>' +
      '</div>' +
      '<div class="gh-recruiter-card">' +
        '<div class="gh-recruiter-title"><i class="fa-solid fa-lightbulb" style="color:#8B5CF6"></i> Recommended Next Projects</div>' +
        '<div class="gh-recruiter-list">' +
          (recruiter.recommendedProjects.length ? recruiter.recommendedProjects.map(function (r) { return '<div class="gh-recruiter-item"><i class="fa-solid fa-arrow-right" style="color:#8B5CF6"></i>' + r + '</div>' }).join('') : '<div class="gh-recruiter-item" style="color:var(--text-3)">No recommendations</div>') +
        '</div>' +
      '</div>'
  }

  /* ===== EXPORTS ===== */
  function initExports () {
    document.getElementById('export-json').addEventListener('click', function () {
      if (!currentResult) return
      var content = GithubAnalyticsService.exportJSON(currentResult.data, currentResult.quality, currentResult.maturity, currentResult.recruiter)
      downloadFile(content, 'github-analytics.json', 'application/json')
      Toast.success('JSON exported')
    })
    document.getElementById('export-md').addEventListener('click', function () {
      if (!currentResult) return
      var content = GithubAnalyticsService.exportMarkdown(currentResult.data, currentResult.quality, currentResult.maturity, currentResult.recruiter)
      downloadFile(content, 'github-analytics.md', 'text/markdown')
      Toast.success('Markdown exported')
    })
    document.getElementById('export-pdf').addEventListener('click', function () {
      if (!currentResult) return
      var win = window.open('', '_blank')
      if (!win) { Toast.error('Please allow popups for PDF export'); return }
      win.document.write(GithubAnalyticsService.exportPDF(currentResult.data, currentResult.quality, currentResult.maturity, currentResult.recruiter))
      win.document.close(); win.focus()
      setTimeout(function () { win.print() }, 500)
    })
  }

  function downloadFile (content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a'); a.href = url; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  /* ===== HELPERS ===== */
  function esc (str) {
    if (typeof str !== 'string') return str || ''
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
  }
  function formatDate (d) {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) } catch (e) { return '' }
  }
  function scoreColor (s) { return s >= 60 ? '#10B981' : s >= 40 ? '#F59E0B' : '#EF4444' }

  /* ===== MAIN ANALYZE ===== */
  function runAnalysis () {
    var username = document.getElementById('gh-username').value.trim() || 'aryan-dev'
    var btn = document.getElementById('gh-analyze-btn')
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...'
    destroyCharts()
    showSkeletons()
    document.getElementById('gh-results').style.display = 'none'
    document.getElementById('gh-export-group').style.display = 'none'

    GithubAnalyticsService.analyze(username, currentMode).then(function (result) {
      currentResult = result
      hideSkeletons()
      renderModeBadge(result.mode)
      renderProfile(result.data)
      renderStats(result.data)
      renderCharts(result)
      renderQuality(result.quality)
      renderMaturity(result.maturity)
      renderCategories(result.categories)
      renderRecruiter(result.recruiter)
      showResults()
      document.getElementById('gh-export-group').style.display = ''
      btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-magnifying-glass-chart"></i> Analyze'
      Toast.success('GitHub analysis complete (' + result.mode + ' mode)')
    }).catch(function (e) {
      console.error('GitHub analysis error:', e)
      // Never show broken state — fallback to demo
      GithubAnalyticsService.analyze('', 'demo').then(function (fallback) {
        currentResult = fallback
        hideSkeletons()
        renderModeBadge('fallback')
        renderProfile(fallback.data)
        renderStats(fallback.data)
        renderCharts(fallback)
        renderQuality(fallback.quality)
        renderMaturity(fallback.maturity)
        renderCategories(fallback.categories)
        renderRecruiter(fallback.recruiter)
        showResults()
        document.getElementById('gh-export-group').style.display = ''
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-magnifying-glass-chart"></i> Analyze'
        Toast.warning('API failed — showing demo data')
      })
    })
  }

  /* ===== INIT ===== */
  function init () {
    initTheme(); initSidebar(); initLogout(); loadUser(); initMode(); initExports()

    if (!Store.get('user') && !Store.get('isLoggedIn') && typeof DemoProfile !== 'undefined' && DemoProfile) {
      Store.set('user', DemoProfile.user); Store.set('isLoggedIn', true); Store.set('userRole', 'student'); Store.set('isDemoProfile', true)
      var u = Store.get('user')
      u.github = DemoProfile.github; u.skills = DemoProfile.skills; u.projects = DemoProfile.projects
      Store.set('user', u)
    }

    document.getElementById('gh-analyze-btn').addEventListener('click', runAnalysis)
    document.getElementById('gh-username').addEventListener('keydown', function (e) { if (e.key === 'Enter') runAnalysis() })
    setTimeout(runAnalysis, 300)
  }

  document.addEventListener('DOMContentLoaded', init)
})()
