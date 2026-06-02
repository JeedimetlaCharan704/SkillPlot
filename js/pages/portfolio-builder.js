(function () {
  'use strict'

  var THEME_CYCLE = ['light', 'dark', 'system']
  var THEME_ICONS = { light: 'fa-solid fa-moon', dark: 'fa-solid fa-sun', system: 'fa-solid fa-circle-half-stroke' }
  var currentTheme = 'modern-saas'
  var currentProfile = null
  var currentHealth = null
  var currentQuality = null
  var currentImprovements = null

  /* ===== THEME ===== */
  function initTheme () {
    var toggle = document.getElementById('dash-theme-toggle')
    if (!toggle) return
    function getMode () { return document.documentElement.getAttribute('data-theme-mode') || 'light' }
    function setMode (mode) {
      var eff = mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode
      document.documentElement.setAttribute('data-theme', eff)
      document.documentElement.setAttribute('data-theme-mode', mode)
      Store.set('theme', mode)
      var icon = toggle.querySelector('i')
      icon.className = THEME_ICONS[mode] || THEME_ICONS.light
      toggle.setAttribute('aria-label', 'Theme: ' + mode)
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
  function showResults () { var el = document.getElementById('pb-results'); if (el) el.style.display = '' }

  /* ===== THEME PREVIEWS ===== */
  function getThemePreviewStyle (id) {
    var styles = {
      'modern-saas': 'background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;border-radius:8px',
      'developer-minimal': 'background:#0F172A;color:#10B981;border:1px solid #1E293B;border-radius:8px',
      'data-scientist': 'background:linear-gradient(135deg,#EFF6FF,#DBEAFE);color:#3B82F6;border-radius:8px',
      'dark-professional': 'background:linear-gradient(135deg,#0B1121,#1A1F3A);color:#D4AF37;border-radius:8px'
    }
    return styles[id] || styles['modern-saas']
  }

  /* ===== RENDER: Health ===== */
  function renderHealth (profile, health) {
    var container = document.getElementById('pb-health')
    if (!container) return

    var color = health.score >= 70 ? '#10B981' : health.score >= 50 ? '#F59E0B' : '#EF4444'
    container.innerHTML =
      '<div class="pb-health-main">' +
        '<div class="pb-health-value" style="color:' + color + '">' + health.score + '</div>' +
        '<div class="pb-health-label">Portfolio Health Score</div>' +
        '<div class="pb-health-suggest">' + health.sections.filled + '/' + health.sections.total + ' sections complete</div>' +
      '</div>' +
      '<div class="pb-health-factors">' +
        Object.values(health.factors).map(function (f) {
          var c = f.score >= 60 ? '#10B981' : f.score >= 40 ? '#F59E0B' : '#EF4444'
          var bgColors = { contentQuality: '#8B5CF6', projectStrength: '#4F46E5', skillDiversity: '#3B82F6', technicalDepth: '#10B981', presentationQuality: '#F59E0B', completeness: '#06B6D4' }
          var bg = bgColors[Object.keys(health.factors).find(function (k) { return health.factors[k] === f })] || '#4F46E5'
          return '<div class="pb-factor-card">' +
            '<div class="pb-factor-icon" style="background:' + bg + '20;color:' + bg + '"><i class="fa-solid fa-chart-line"></i></div>' +
            '<div class="pb-factor-body"><div class="pb-factor-label">' + f.label + '</div><div class="pb-factor-bar"><div class="pb-factor-fill" style="width:' + Math.round(f.score / f.max * 100) + '%;background:' + c + '"></div></div></div>' +
            '<span class="pb-factor-score" style="color:' + c + '">' + f.score + '</span>' +
          '</div>'
        }).join('') +
      '</div>'
  }

  /* ===== RENDER: Themes ===== */
  function renderThemes () {
    var container = document.getElementById('pb-themes')
    if (!container) return
    var themes = PortfolioBuilderService.THEMES

    container.innerHTML = Object.values(themes).map(function (t) {
      return '<div class="pb-theme-card ' + (t.id === currentTheme ? 'active' : '') + '" data-theme="' + t.id + '">' +
        '<div class="pb-theme-preview" style="' + getThemePreviewStyle(t.id) + '"><i class="fa-solid fa-palette"></i></div>' +
        '<div class="pb-theme-name">' + t.name + '</div>' +
        '<div class="pb-theme-desc">' + t.desc + '</div>' +
      '</div>'
    }).join('')

    container.querySelectorAll('.pb-theme-card').forEach(function (card) {
      card.addEventListener('click', function () {
        container.querySelectorAll('.pb-theme-card').forEach(function (c) { c.classList.remove('active') })
        this.classList.add('active')
        currentTheme = this.getAttribute('data-theme')
        renderPreview()
      })
    })
  }

  /* ===== RENDER: Preview ===== */
  function renderPreview () {
    var iframe = document.getElementById('pb-preview-frame')
    if (!iframe) return
    var html = PortfolioBuilderService.generateHTML(currentProfile, currentTheme)
    iframe.srcdoc = html
  }

  /* ===== RENDER: Issues ===== */
  function renderIssues (quality) {
    var container = document.getElementById('pb-issues')
    if (!container) return
    container.innerHTML = quality.issues.map(function (issue) {
      var color = issue.severity === 'high' ? '#EF4444' : issue.severity === 'medium' ? '#F59E0B' : '#3B82F6'
      var iconColor = issue.severity === 'high' ? '#EF444415' : issue.severity === 'medium' ? '#F59E0B15' : '#3B82F615'
      return '<div class="pb-issue-card">' +
        '<div class="pb-issue-icon" style="background:' + iconColor + ';color:' + color + '"><i class="' + (issue.icon || 'fa-solid fa-circle-exclamation') + '"></i></div>' +
        '<div class="pb-issue-body"><div class="pb-issue-label">' + issue.label + '</div><div class="pb-issue-desc">' + issue.desc + '</div></div>' +
        '<span class="pb-issue-gain">' + issue.gain + '</span>' +
        '<span class="pb-issue-priority ' + issue.severity + '">' + issue.severity + '</span>' +
      '</div>'
    }).join('')
  }

  /* ===== RENDER: Improvements ===== */
  function renderImprovements (improvements) {
    var container = document.getElementById('pb-improvements')
    if (!container) return
    var priorityColors = { High: '#EF4444', Medium: '#F59E0B', Low: '#3B82F6' }
    container.innerHTML = improvements.map(function (imp) {
      return '<div class="pb-improvement-card">' +
        '<div class="pb-imp-header"><span class="pb-imp-label">' + imp.label + '</span><span class="pb-imp-gain">' + imp.gain + '</span></div>' +
        '<div class="pb-imp-reason">' + imp.reason + '</div>' +
        '<div style="margin-top:var(--space-1);display:flex;gap:var(--space-1);align-items:center">' +
          '<span style="font-size:9px;padding:1px 6px;border-radius:6px;background:' + (priorityColors[imp.priority] || '#6B7280') + '20;color:' + (priorityColors[imp.priority] || '#6B7280') + '">' + imp.priority + '</span>' +
        '</div>' +
      '</div>'
    }).join('')
  }

  /* ===== EXPORTS ===== */
  function initExports () {
    document.getElementById('export-json').addEventListener('click', function () {
      var content = PortfolioBuilderService.exportJSON(currentProfile, currentHealth, currentQuality, currentImprovements)
      downloadFile(content, 'portfolio-report.json', 'application/json')
      Toast.success('JSON exported')
    })
    document.getElementById('export-md').addEventListener('click', function () {
      var content = PortfolioBuilderService.exportMarkdown(currentProfile, currentHealth, currentQuality, currentImprovements)
      downloadFile(content, 'portfolio-report.md', 'text/markdown')
      Toast.success('Markdown exported')
    })
    document.getElementById('export-html').addEventListener('click', function () {
      var content = PortfolioBuilderService.generateHTML(currentProfile, currentTheme)
      downloadFile(content, 'portfolio.html', 'text/html')
      Toast.success('HTML exported')
    })
    document.getElementById('export-pdf').addEventListener('click', function () {
      var content = PortfolioBuilderService.exportPDF(currentProfile, currentHealth, currentQuality, currentImprovements)
      var win = window.open('', '_blank')
      if (!win) { Toast.error('Please allow popups for PDF export'); return }
      win.document.write(content)
      win.document.close(); win.focus()
      setTimeout(function () { win.print() }, 500)
    })
    document.getElementById('open-portfolio-btn').addEventListener('click', function () {
      var html = PortfolioBuilderService.generateHTML(currentProfile, currentTheme)
      var win = window.open('', '_blank')
      if (!win) { Toast.error('Please allow popups'); return }
      win.document.write(html)
      win.document.close()
      win.focus()
    })
    document.getElementById('save-html-btn').addEventListener('click', function () {
      var content = PortfolioBuilderService.generateHTML(currentProfile, currentTheme)
      downloadFile(content, 'portfolio.html', 'text/html')
      Toast.success('HTML saved')
    })
  }

  function downloadFile (content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a'); a.href = url; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  /* ===== BUILD ===== */
  function buildPortfolio () {
    showSkeletons()
    document.getElementById('pb-results').style.display = 'none'
    document.getElementById('pb-export-group').style.display = 'none'

    try {
      currentProfile = PortfolioBuilderService.getProfile()
      if (!currentProfile) { Toast.error('No profile data found'); hideSkeletons(); return }

      currentHealth = PortfolioBuilderService.calculateHealth(currentProfile)
      currentQuality = PortfolioBuilderService.evaluateQuality(currentProfile)
      currentImprovements = PortfolioBuilderService.generateImprovements(currentHealth, currentQuality)

      renderHealth(currentProfile, currentHealth)
      renderThemes()
      renderPreview()
      renderIssues(currentQuality)
      renderImprovements(currentImprovements)

      hideSkeletons()
      showResults()
      document.getElementById('pb-export-group').style.display = ''
      Toast.success('Portfolio generated — ready to preview')
    } catch (e) {
      console.error('Portfolio build error:', e)
      if (typeof ErrorBoundary !== 'undefined') {
        ErrorBoundary.show({ message: 'Portfolio build failed', detail: e.message, retry: buildPortfolio, fallback: 'index.html' })
      } else { Toast.error('Build failed: ' + e.message) }
      hideSkeletons()
    }
  }

  /* ===== INIT ===== */
  function init () {
    initTheme(); initSidebar(); initLogout(); loadUser(); initExports()

    setTimeout(buildPortfolio, 300)
  }

  document.addEventListener('DOMContentLoaded', init)
})()
