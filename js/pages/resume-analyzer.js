(function () {
  'use strict'

  var CHARTS = {}
  var THEME_CYCLE = ['light', 'dark', 'system']
  var THEME_ICONS = { light: 'fa-solid fa-moon', dark: 'fa-solid fa-sun', system: 'fa-solid fa-circle-half-stroke' }
  var SCORE_COLORS = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--success)', 'var(--warning)']
  var SCORE_NAMES = ['Resume Intelligence', 'ATS Compatibility', 'Technical Depth', 'Recruiter Appeal', 'Profile Completeness']
  var SCORE_KEYS = ['resumeScore', 'atsScore', 'technicalDepthScore', 'recruiterAppealScore', 'profileCompletenessScore']

  /* ===== THEME ===== */
  function initTheme () {
    var toggle = document.getElementById('dash-theme-toggle')
    if (!toggle) return

    function getThemeMode () {
      return document.documentElement.getAttribute('data-theme-mode') || 'light'
    }

    function setThemeMode (mode) {
      var effective = mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode
      document.documentElement.setAttribute('data-theme', effective)
      document.documentElement.setAttribute('data-theme-mode', mode)
      localStorage.setItem('skillpilot_theme', mode)
      var icon = toggle.querySelector('i')
      icon.className = THEME_ICONS[mode] || THEME_ICONS.light
      toggle.setAttribute('aria-label', 'Theme: ' + mode)
      updateChartsTheme(effective)
    }

    setThemeMode(getThemeMode())

    toggle.addEventListener('click', function () {
      var current = getThemeMode()
      var idx = THEME_CYCLE.indexOf(current)
      var next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]
      setThemeMode(next)
    })

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (getThemeMode() === 'system') setThemeMode('system')
    })
  }

  function updateChartsTheme (theme) {
    var isDark = theme === 'dark'
    var textColor = isDark ? '#94A3B8' : '#64748B'
    var gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    Object.values(CHARTS).forEach(function (chart) {
      if (!chart || !chart.options) return
      if (chart.options.plugins && chart.options.plugins.legend) {
        chart.options.plugins.legend.labels.color = textColor
      }
      if (chart.options.scales) {
        Object.values(chart.options.scales).forEach(function (scale) {
          if (scale) {
            scale.ticks.color = textColor
            scale.grid.color = gridColor
          }
        })
      }
      if (chart.options.plugins && chart.options.plugins.tooltip && chart.options.plugins.tooltip.callbacks) {
        // keep defaults
      }
      chart.update('none')
    })
  }

  /* ===== SIDEBAR ===== */
  function initSidebar () {
    var toggle = document.getElementById('dash-sidebar-toggle')
    var sidebar = document.getElementById('dash-sidebar')
    if (!toggle || !sidebar) return
    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open')
      document.body.classList.toggle('sidebar-open')
    })
    var items = sidebar.querySelectorAll('.dash-sidebar-item')
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        items.forEach(function (i) { i.classList.remove('active') })
        this.classList.add('active')
        if (window.innerWidth <= 992) sidebar.classList.remove('open')
      })
    })
  }

  /* ===== LOGOUT ===== */
  function initLogout () {
    var btn = document.getElementById('dash-logout-btn')
    if (!btn) return
    btn.addEventListener('click', async function () {
      if (SessionManager) SessionManager.stop()
      var result = await AuthService.logout()
      window.location.href = result.data.redirect || 'login.html'
    })
  }

  /* ===== USER ===== */
  function loadUser () {
    var user = Store.get('user')
    if (!user) return
    var el = document.getElementById('dash-user-name')
    if (el) el.textContent = user.name || 'User'
    var roleEl = document.getElementById('dash-user-role')
    if (roleEl) roleEl.textContent = user.role || 'student'
    var avatar = document.getElementById('dash-avatar')
    if (avatar) {
      var parts = (user.name || 'US').split(' ')
      avatar.textContent = (parts[0][0] || '') + (parts[1] ? parts[1][0] : parts[0][1] || '')
    }
  }

  /* ===== SKELETONS ===== */
  function showSkeletons () {
    document.querySelectorAll('[data-skel]').forEach(function (el) {
      if (el) el.style.display = ''
    })
  }

  function hideSkeletons () {
    document.querySelectorAll('[data-skel]').forEach(function (el) {
      if (el) el.style.display = 'none'
    })
  }

  /* ===== INPUT METHODS ===== */
  function initInput () {
    var textarea = document.getElementById('ra-textarea')
    var methods = document.querySelectorAll('.ra-input-method')

    methods.forEach(function (btn) {
      btn.addEventListener('click', function () {
        methods.forEach(function (m) { m.classList.remove('active') })
        this.classList.add('active')
        var method = this.getAttribute('data-method')
        if (method === 'demo') {
          textarea.value = ResumeService.DEMO_RESUME
          runAnalysis(textarea.value)
        } else if (method === 'paste') {
          textarea.value = ''
          textarea.focus()
        }
      })
    })

    // Upload handler
    var fileInput = document.getElementById('ra-file-upload')
    if (fileInput) {
      fileInput.addEventListener('change', function (e) {
        var file = e.target.files[0]
        if (!file) return
        var reader = new FileReader()
        reader.onload = function (evt) {
          textarea.value = evt.target.result
          methods.forEach(function (m) { m.classList.remove('active') })
          document.querySelector('[data-method="paste"]')?.classList.add('active')
          runAnalysis(textarea.value)
        }
        reader.readAsText(file)
      })
    }

    // Debounced text change
    var debounceTimer
    textarea.addEventListener('input', function () {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(function () {
        if (textarea.value.trim().length > 20) runAnalysis(textarea.value)
      }, 800)
    })

    // Load initial (demo is default)
    var activeMethod = document.querySelector('.ra-input-method.active')
    if (activeMethod && activeMethod.getAttribute('data-method') === 'demo') {
      textarea.value = ResumeService.DEMO_RESUME
      runAnalysis(textarea.value)
    }
  }

  /* ===== MAIN ANALYSIS ===== */
  var currentAnalysis = null

  async function runAnalysis (text) {
    if (!text || text.trim().length < 20) return

    showSkeletons()
    clearCharts()

    try {
      var analysis = await ResumeService.analyze(text)
      currentAnalysis = analysis

      renderScoreCards(analysis)
      renderKeywordAnalysis(analysis)
      renderSectionGrid(analysis)
      renderInsights(analysis)
      renderComparison(analysis)
      renderSteps(analysis)
      initCharts(analysis)
      updateExportButtons(analysis)

      var kwCount = document.getElementById('kw-count')
      if (kwCount) kwCount.textContent = analysis.keywordMatch.matched.length + ' found'

      Toast.success('Resume analysis complete')
    } catch (e) {
      console.error('Analysis error:', e)
      showError(e)
    }

    hideSkeletons()
  }

  function showError (e) {
    if (typeof ErrorBoundary !== 'undefined') {
      ErrorBoundary.show({ message: 'Resume analysis failed', detail: e.message, retry: function () { runAnalysis(document.getElementById('ra-textarea')?.value) }, fallback: 'index.html' })
    } else {
      Toast.error('Analysis failed: ' + e.message)
    }
  }

  function clearCharts () {
    Object.values(CHARTS).forEach(function (c) { if (c) c.destroy() })
    CHARTS = {}
  }

  /* ===== RENDER SCORE CARDS ===== */
  function renderScoreCards (analysis) {
    var grid = document.getElementById('ra-score-grid')
    if (!grid) return

    grid.innerHTML = ''
    SCORE_KEYS.forEach(function (key, i) {
      var value = analysis[key] || 0
      var conf = key === 'resumeScore' ? analysis.confidence
        : key === 'atsScore' ? (value >= 70 ? 'High' : value >= 40 ? 'Medium' : 'Low')
        : key === 'technicalDepthScore' ? (value >= 70 ? 'High' : value >= 40 ? 'Medium' : 'Low')
        : key === 'recruiterAppealScore' ? (value >= 70 ? 'High' : value >= 40 ? 'Medium' : 'Low')
        : key === 'profileCompletenessScore' ? (value >= 70 ? 'High' : value >= 40 ? 'Medium' : 'Low')
        : 'Medium'
      var color = value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444'

      var card = document.createElement('div')
      card.className = 'ra-score-card'
      card.innerHTML =
        '<div class="ra-score-header"><span class="ra-score-label">' + SCORE_NAMES[i] + '</span><span class="ra-score-conf"><i class="fa-solid fa-circle" style="color:' + (conf === 'High' ? '#10B981' : conf === 'Low' ? '#EF4444' : '#F59E0B') + ';font-size:6px"></i> ' + conf + '</span></div>' +
        '<div class="ra-score-value" style="color:' + color + '">' + value + '<span style="font-size:var(--text-sm);color:var(--text-3)">/100</span></div>' +
        '<div class="ra-score-bar"><div class="ra-score-fill" style="width:' + value + '%;background:' + color + '"></div></div>'
      grid.appendChild(card)
    })
  }

  /* ===== RENDER KEYWORD ANALYSIS ===== */
  function renderKeywordAnalysis (analysis) {
    var container = document.getElementById('ra-keyword-categories')
    if (!container) return

    var byCategory = analysis.keywordMatch.byCategory || {}
    var cats = Object.keys(byCategory)

    if (!cats.length) {
      container.innerHTML = '<p style="color:var(--text-3);text-align:center;padding:var(--space-4)">No keywords detected. Try pasting a more detailed resume.</p>'
      return
    }

    container.innerHTML = ''
    var orderedCats = ['Programming Languages', 'Frontend', 'Backend', 'Databases', 'AI & Data Science', 'Cloud & DevOps', 'Dev Tools']
    orderedCats.forEach(function (cat) {
      if (!byCategory[cat]) return
      renderKeywordCategory(container, cat, byCategory[cat])
    })
    cats.forEach(function (cat) {
      if (orderedCats.indexOf(cat) >= 0) return
      renderKeywordCategory(container, cat, byCategory[cat])
    })
  }

  function renderKeywordCategory (container, name, items) {
    var div = document.createElement('div')
    div.className = 'ra-kw-category'
    div.innerHTML =
      '<div class="ra-kw-category-header"><span class="ra-kw-category-name">' + name + '</span><span class="ra-kw-category-count">' + items.length + '</span></div>' +
      '<div class="ra-kw-chips">' + items.map(function (item) {
        var cls = item.importance && item.importance > 0.7 ? 'ra-kw-chip high-value' : 'ra-kw-chip found'
        return '<span class="' + cls + '">' + item.keyword + (item.count > 1 ? ' <span style="opacity:0.6">×' + item.count + '</span>' : '') + '</span>'
      }).join('') + '</div>'
    container.appendChild(div)
  }

  /* ===== RENDER SECTION GRID ===== */
  function renderSectionGrid (analysis) {
    var grid = document.getElementById('ra-section-grid')
    if (!grid) return

    var sections = analysis.sections || { present: [], missing: [], weak: [] }
    var allSects = ['Education', 'Skills', 'Projects', 'Experience', 'Certifications', 'Achievements', 'Summary', 'Publications']
    var icons = {
      Education: 'fa-graduation-cap', Skills: 'fa-code', Projects: 'fa-diagram-project',
      Experience: 'fa-briefcase', Certifications: 'fa-certificate', Achievements: 'fa-trophy',
      Summary: 'fa-file-pen', Publications: 'fa-book'
    }

    grid.innerHTML = ''
    allSects.forEach(function (s) {
      var status = sections.missing.indexOf(s) >= 0 ? 'missing' : sections.weak.indexOf(s) >= 0 ? 'weak' : 'present'
      var statusLabel = status === 'present' ? 'Present' : status === 'weak' ? 'Weak' : 'Missing'

      var item = document.createElement('div')
      item.className = 'ra-section-item'
      item.innerHTML =
        '<div class="ra-section-icon ' + status + '"><i class="fa-solid ' + (icons[s] || 'fa-file-lines') + '"></i></div>' +
        '<span class="ra-section-name">' + s + '</span>' +
        '<span class="ra-section-status ' + status + '">' + statusLabel + '</span>'
      grid.appendChild(item)
    })
  }

  /* ===== INSIGHTS ===== */
  function renderInsights (analysis) {
    var container = document.getElementById('ra-insights')
    if (!container) return

    container.innerHTML = ''

    // Strengths
    ;(analysis.strengths || []).slice(0, 3).forEach(function (s) {
      container.innerHTML +=
        '<div class="ra-insight-card"><div class="ra-insight-header"><div class="ra-insight-icon strength"><i class="fa-solid fa-thumbs-up"></i></div><span class="ra-insight-title">Strength</span></div><p class="ra-insight-text">' + s + '</p></div>'
    })

    // Weaknesses
    ;(analysis.weaknesses || []).slice(0, 3).forEach(function (s) {
      container.innerHTML +=
        '<div class="ra-insight-card"><div class="ra-insight-header"><div class="ra-insight-icon weakness"><i class="fa-solid fa-triangle-exclamation"></i></div><span class="ra-insight-title">Weakness</span></div><p class="ra-insight-text">' + s + '</p></div>'
    })

    // Suggestions
    ;(analysis.suggestions || []).slice(0, 3).forEach(function (s) {
      container.innerHTML +=
        '<div class="ra-insight-card"><div class="ra-insight-header"><div class="ra-insight-icon impact"><i class="fa-solid fa-lightbulb"></i></div><span class="ra-insight-title">Impact Suggestion</span></div><p class="ra-insight-text">' + s + '</p></div>'
    })
  }

  /* ===== COMPARISON (Career Match) ===== */
  async function renderComparison (analysis) {
    var container = document.getElementById('ra-compare')
    if (!container) return

    try {
      var resumeAnalysis = Store.get('resumeAnalysis')
      if (!resumeAnalysis) return

      var matchedSkills = (resumeAnalysis.keywordMatch?.matched || []).map(function (m) { return { name: m.keyword, level: 70, category: m.category || 'General' } })

      // Save and restore user skills to avoid polluting Store
      var savedUser = JSON.parse(JSON.stringify(Store.get('user')))
      var careerResult
      try {
        careerResult = await CareerService.getRecommendationsForSkills(matchedSkills)
      } finally {
        if (savedUser) Store.set('user', savedUser)
      }
      var recs = (careerResult?.recommendations || []).slice(0, 3)

      container.innerHTML = ''
      recs.forEach(function (rec) {
        var matchClass = rec.matchPercentage >= 70 ? 'high' : rec.matchPercentage >= 50 ? 'med' : 'low'
        var missingSkills = (rec.requiredSkills || []).filter(function (s) { return !s.acquired })
        var matchColor = rec.matchPercentage >= 70 ? '#10B981' : rec.matchPercentage >= 50 ? '#F59E0B' : '#EF4444'

        var card = document.createElement('div')
        card.className = 'ra-compare-card'
        card.innerHTML =
          '<div class="ra-compare-header"><span class="ra-compare-title">' + rec.title + '</span><span class="ra-compare-match" style="color:' + matchColor + '">' + rec.matchPercentage + '%</span></div>' +
          '<p class="ra-compare-detail">' + (rec.description || '') + '</p>' +
          '<p class="ra-compare-detail" style="margin-bottom:var(--space-2)">₹' + (rec.salaryRange?.min || 0).toLocaleString() + ' - ₹' + (rec.salaryRange?.max || 0).toLocaleString() + ' &middot; ' + (rec.difficulty?.label || 'Medium') + ' &middot; ' + (rec.demandLevel || 'Medium') + ' demand</p>' +
          (missingSkills.length ? '<div class="ra-compare-skills">' + missingSkills.slice(0, 6).map(function (s) { return '<span class="ra-kw-chip missing">' + s.name + '</span>' }).join('') + (missingSkills.length > 6 ? '<span class="ra-kw-chip missing">+' + (missingSkills.length - 6) + '</span>' : '') + '</div>' : '<p class="ra-compare-detail" style="color:var(--success)">All required skills present</p>')
        container.appendChild(card)
      })
    } catch (e) {
      container.innerHTML = '<p style="color:var(--text-3);text-align:center;padding:var(--space-3)">Career comparison unavailable</p>'
    }
  }

  /* ===== CALCULATION STEPS ===== */
  function renderSteps (analysis) {
    var container = document.getElementById('ra-steps')
    var toggle = document.getElementById('toggle-steps')
    if (!container) return

    var steps = analysis.calculation?.steps || []
    var formula = analysis.calculation?.formula || ''

    if (!steps.length) {
      if (toggle) toggle.style.display = 'none'
      return
    }

    if (toggle) {
      toggle.style.display = ''
      toggle.addEventListener('click', function () {
        container.classList.toggle('hidden')
        this.textContent = container.classList.contains('hidden') ? 'Show' : 'Hide'
      })
    }

    container.innerHTML = '<ol class="ra-steps-list">' + steps.map(function (s, i) {
      return '<li data-step="' + (i + 1) + '">' + s + '</li>'
    }).join('') + '</ol>' + (formula ? '<div class="ra-steps-formula">' + formula + '</div>' : '')
  }

  /* ===== CHARTS ===== */
  function initCharts (analysis) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var textColor = isDark ? '#94A3B8' : '#64748B'
    var gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    var matched = analysis.keywordMatch?.matched || []
    var byCategory = analysis.keywordMatch?.byCategory || {}
    var sections = analysis.sections || { present: [], missing: [], weak: [] }

    // 1. Skill Distribution Doughnut
    var ctxDist = document.getElementById('chart-skill-dist')
    if (ctxDist) {
      var catNames = Object.keys(byCategory)
      var catCounts = catNames.map(function (k) { return byCategory[k].length })
      var doughnutColors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']

      if (CHARTS.skillDist) CHARTS.skillDist.destroy()
      CHARTS.skillDist = new Chart(ctxDist, {
        type: 'doughnut',
        data: {
          labels: catNames,
          datasets: [{ data: catCounts, backgroundColor: doughnutColors.slice(0, catNames.length), borderWidth: 0 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 10 }, padding: 8 } } }
        }
      })
    }

    // 2. ATS Compatibility Gauge
    var ctxAts = document.getElementById('chart-ats')
    if (ctxAts) {
      var atsVal = analysis.atsScore || 0
      var atsColor = atsVal >= 80 ? '#10B981' : atsVal >= 60 ? '#F59E0B' : '#EF4444'

      if (CHARTS.ats) CHARTS.ats.destroy()
      CHARTS.ats = new Chart(ctxAts, {
        type: 'doughnut',
        data: { labels: ['ATS Score', 'Remaining'], datasets: [{ data: [atsVal, 100 - atsVal], backgroundColor: [atsColor, gridColor], borderWidth: 0, circumference: 270, rotation: 225 }] },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '75%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: function (ctx) { return ctx.parsed + '%' } } }
          }
        },
        plugins: [{
          afterDraw: function (chart) {
            var width = chart.width, height = chart.height, ctx = chart.ctx
            ctx.save()
            var cx = width / 2, cy = height / 2 + 8
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = '700 28px Inter, sans-serif'
            ctx.fillStyle = atsColor
            ctx.fillText(atsVal + '%', cx, cy - 10)
            ctx.font = '12px Inter, sans-serif'
            ctx.fillStyle = textColor
            ctx.fillText('ATS Score', cx, cy + 16)
            ctx.restore()
          }
        }]
      })
    }

    // 3. Section Coverage Bar
    var ctxSections = document.getElementById('chart-sections')
    if (ctxSections) {
      var allSects = ['Education', 'Skills', 'Projects', 'Experience', 'Certifications', 'Achievements', 'Summary', 'Publications']
      var sectionScores = allSects.map(function (s) {
        if (sections.missing.indexOf(s) >= 0) return 0
        if (sections.weak.indexOf(s) >= 0) return 50
        return 100
      })
      var barColors = sectionScores.map(function (v) {
        return v >= 80 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444'
      })

      if (CHARTS.sections) CHARTS.sections.destroy()
      CHARTS.sections = new Chart(ctxSections, {
        type: 'bar',
        data: {
          labels: allSects,
          datasets: [{ data: sectionScores, backgroundColor: barColors, borderWidth: 0, borderRadius: 3 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: { min: 0, max: 100, ticks: { color: textColor, font: { size: 9 } }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { display: false } }
          },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { var l = ['Missing', 'Weak', 'Present']; return l[Math.round(ctx.parsed.x / 50)] || 'Present' } } } }
        }
      })
    }

    // 4. Quality Breakdown Radar
    var ctxQuality = document.getElementById('chart-quality')
    if (ctxQuality) {
      var radarLabels = ['Keywords', 'Sections', 'Format', 'Length', 'Technical\nDepth', 'Recruiter\nAppeal']
      var radarData = [
        Math.min(100, matched.length * 10),
        Math.round((sections.present.length / 8) * 100),
        analysis.formatScore || 0,
        analysis.lengthScore || 0,
        analysis.technicalDepthScore || 0,
        analysis.recruiterAppealScore || 0
      ]

      if (CHARTS.quality) CHARTS.quality.destroy()
      CHARTS.quality = new Chart(ctxQuality, {
        type: 'radar',
        data: {
          labels: radarLabels,
          datasets: [{
            data: radarData,
            backgroundColor: isDark ? 'rgba(129,140,248,0.2)' : 'rgba(79,70,229,0.15)',
            borderColor: isDark ? '#818CF8' : '#4F46E5',
            borderWidth: 2,
            pointBackgroundColor: isDark ? '#818CF8' : '#4F46E5',
            pointRadius: 3
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { r: { min: 0, max: 100, ticks: { color: textColor, backdropColor: 'transparent', font: { size: 9 } }, grid: { color: gridColor }, pointLabels: { color: textColor, font: { size: 10 } } } },
          plugins: { legend: { display: false } }
        }
      })
    }
  }

  /* ===== EXPORT ===== */
  function updateExportButtons (analysis) {
    var pdfBtn = document.getElementById('export-pdf')
    var jsonBtn = document.getElementById('export-json')
    var mdBtn = document.getElementById('export-md')

    if (jsonBtn) {
      jsonBtn.onclick = function () {
        var json = ResumeService.exportJSON(analysis)
        downloadFile(json, 'resume-analysis.json', 'application/json')
        Toast.success('JSON exported')
      }
    }

    if (mdBtn) {
      mdBtn.onclick = function () {
        var md = ResumeService.exportMarkdown(analysis)
        downloadFile(md, 'resume-analysis.md', 'text/markdown')
        Toast.success('Markdown exported')
      }
    }

    if (pdfBtn) {
      pdfBtn.onclick = function () {
        exportPDFReport(analysis)
      }
    }
  }

  function downloadFile (content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function exportPDFReport (analysis) {
    var user = Store.get('user') || {}
    var win = window.open('', '_blank')
    if (!win) {
      Toast.error('Please allow popups for PDF export')
      return
    }

    var byCategory = analysis.keywordMatch?.byCategory || {}
    var sections = analysis.sections || {}

    win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SkillPilot AI — Resume Analysis Report</title>')
    win.document.write('<style>')
    win.document.write('body{font-family:Inter,sans-serif;padding:40px;color:#1E293B;max-width:900px;margin:0 auto}')
    win.document.write('h1{font-size:28px;color:#4F46E5;margin-bottom:4px}')
    win.document.write('h2{font-size:18px;color:#1E293B;border-bottom:2px solid #E2E8F0;padding-bottom:8px;margin-top:32px}')
    win.document.write('.sub{color:#64748B;font-size:14px;margin-bottom:24px}')
    win.document.write('table{width:100%;border-collapse:collapse;margin-bottom:24px}')
    win.document.write('th{background:#F1F5F9;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748B}')
    win.document.write('td{padding:10px 12px;border-bottom:1px solid #E2E8F0;font-size:14px}')
    win.document.write('.section{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin-bottom:16px}')
    win.document.write('.footer{margin-top:32px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:12px;color:#94A3B8;text-align:center}')
    win.document.write('.chip{display:inline-block;background:#EEF2FF;color:#4F46E5;padding:2px 8px;border-radius:4px;font-size:11px;margin:2px;font-weight:500}')
    win.document.write('@media print{body{padding:20px}}')
    win.document.write('</style></head><body>')
    win.document.write('<h1>SkillPilot AI — Resume Analysis Report</h1>')
    win.document.write('<p class="sub">Generated for ' + (user.name || 'User') + ' &middot; ' + new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>')

    win.document.write('<h2>Scores</h2>')
    win.document.write('<table><thead><tr><th>Metric</th><th>Score</th></tr></thead><tbody>')
    SCORE_KEYS.forEach(function (key, i) {
      win.document.write('<tr><td><strong>' + SCORE_NAMES[i] + '</strong></td><td style="font-size:20px;font-weight:700;color:' + (analysis[key] >= 80 ? '#10B981' : analysis[key] >= 60 ? '#F59E0B' : '#EF4444') + '">' + analysis[key] + '/100</td></tr>')
    })
    win.document.write('</tbody></table>')

    win.document.write('<h2>Keyword Analysis</h2>')
    Object.keys(byCategory).forEach(function (cat) {
      win.document.write('<div class="section"><h3 style="margin:0 0 8px">' + cat + '</h3>')
      win.document.write(byCategory[cat].map(function (k) { return '<span class="chip">' + k.keyword + (k.count > 1 ? ' ×' + k.count : '') + '</span>' }).join(''))
      win.document.write('</div>')
    })

    win.document.write('<h2>Section Analysis</h2>')
    win.document.write('<table><thead><tr><th>Section</th><th>Status</th></tr></thead><tbody>')
    var allS = ['Education', 'Skills', 'Projects', 'Experience', 'Certifications', 'Achievements', 'Summary', 'Publications']
    allS.forEach(function (s) {
      var st = sections.missing.indexOf(s) >= 0 ? '❌ Missing' : sections.weak.indexOf(s) >= 0 ? '⚠️ Weak' : '✅ Present'
      win.document.write('<tr><td>' + s + '</td><td>' + st + '</td></tr>')
    })
    win.document.write('</tbody></table>')

    win.document.write('<h2>Strengths &amp; Weaknesses</h2>')
    ;(analysis.strengths || []).forEach(function (s) {
      win.document.write('<div class="section"><p style="margin:0;color:#10B981">✓ ' + s + '</p></div>')
    })
    ;(analysis.weaknesses || []).forEach(function (s) {
      win.document.write('<div class="section"><p style="margin:0;color:#EF4444">✗ ' + s + '</p></div>')
    })

    win.document.write('<h2>Suggestions</h2>')
    ;(analysis.suggestions || []).forEach(function (s) {
      win.document.write('<div class="section"><p style="margin:0">💡 ' + s + '</p></div>')
    })

    win.document.write('<h2>Calculation Steps</h2>')
    ;(analysis.calculation?.steps || []).forEach(function (s, i) {
      win.document.write('<div class="section"><p style="margin:0">' + (i + 1) + '. ' + s + '</p></div>')
    })

    win.document.write('<div class="footer">Generated by SkillPilot AI Resume Analyzer</div>')
    win.document.write('</body></html>')
    win.document.close()
    win.focus()

    setTimeout(function () { win.print() }, 500)
  }

  /* ===== RE-ANALYZE BUTTON ===== */
  function initAnalyzeButton () {
    var btn = document.getElementById('analyze-btn')
    if (!btn) return
    btn.addEventListener('click', function () {
      var textarea = document.getElementById('ra-textarea')
      if (textarea && textarea.value.trim().length > 20) runAnalysis(textarea.value)
      else Toast.warning('Enter resume text first (min 20 characters)')
    })
  }

  /* ===== INIT ===== */
  function init () {
    initTheme()
    initSidebar()
    initLogout()
    loadUser()
    initInput()
    initAnalyzeButton()
  }

  document.addEventListener('DOMContentLoaded', init)
})()
