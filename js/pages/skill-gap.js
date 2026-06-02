(function () {
  'use strict'

  var CHARTS = {}
  var THEME_CYCLE = ['light', 'dark', 'system']
  var THEME_ICONS = { light: 'fa-solid fa-moon', dark: 'fa-solid fa-sun', system: 'fa-solid fa-circle-half-stroke' }
  var currentAnalysis = null

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

  /* ===== SKELETONS ===== */
  function showSkeletons () { document.querySelectorAll('[data-skel]').forEach(function (el) { if (el) el.style.display = '' }) }
  function hideSkeletons () { document.querySelectorAll('[data-skel]').forEach(function (el) { if (el) el.style.display = 'none' }) }

  /* ===== CAREER SELECTOR ===== */
  function initSelector () {
    var select = document.getElementById('target-career')
    if (!select) return
    var paths = window.CareerPaths || []
    select.innerHTML = paths.map(function (p) { return '<option value="' + p.id + '">' + p.title + '</option>' }).join('')
    select.addEventListener('change', function () { showPreview(this.value) })
    // Show preview for default
    showPreview(select.value)
  }

  function showPreview (id) {
    var preview = document.getElementById('career-preview')
    if (!preview) return
    var paths = window.CareerPaths || []
    var path = null
    for (var i = 0; i < paths.length; i++) { if (paths[i].id === id) { path = paths[i]; break } }
    if (!path) { preview.innerHTML = ''; return }
    preview.innerHTML =
      '<div class="sg-preview-title" style="color:' + (path.color || 'var(--primary)') + '"><i class="fa-solid ' + (path.icon || 'fa-briefcase') + '"></i> ' + path.title + '</div>' +
      '<p class="sg-preview-desc">' + (path.description || '') + '</p>' +
      '<div class="sg-preview-tags">' +
        '<span class="sg-preview-tag">' + (path.demandLevel || 'Medium') + ' demand</span>' +
        '<span class="sg-preview-tag">' + (path.difficulty || 'Intermediate') + '</span>' +
        '<span class="sg-preview-tag">₹' + ((path.salaryRange && path.salaryRange.min) || 0).toLocaleString() + '-' + ((path.salaryRange && path.salaryRange.max) || 0).toLocaleString() + '</span>' +
        '<span class="sg-preview-tag">' + (path.skills ? path.skills.length : 0) + ' skills</span>' +
      '</div>'
  }

  /* ===== MAIN ANALYZE ===== */
  async function runAnalysis () {
    var select = document.getElementById('target-career')
    var hoursInput = document.getElementById('hours-per-day')
    if (!select) return
    var roleId = select.value
    var hours = parseInt(hoursInput.value, 10) || 2
    if (hours < 1) hours = 1
    if (hours > 12) hours = 12
    hoursInput.value = hours

    showSkeletons()
    clearCharts()

    try {
      var analysis = await SkillService.analyzeGap(roleId, hours)
      if (analysis.error) { Toast.error(analysis.error); hideSkeletons(); return }
      currentAnalysis = analysis
      renderStats(analysis)
      renderTable(analysis)
      renderPriorityMatrix(analysis)
      renderTimeline(analysis)
      renderCharts(analysis)
      renderActions(analysis)
      renderSuggestions(analysis)
      renderSteps(analysis)
      initWhatIf(analysis)
      initExports(analysis)
      Toast.success('Skill gap analysis complete for ' + analysis.targetRole)
    } catch (e) {
      console.error('Skill gap error:', e)
      if (typeof ErrorBoundary !== 'undefined') {
        ErrorBoundary.show({ message: 'Skill gap analysis failed', detail: e.message, retry: runAnalysis, fallback: 'index.html' })
      } else { Toast.error('Analysis failed: ' + e.message) }
    }
    hideSkeletons()
  }

  function clearCharts () { Object.values(CHARTS).forEach(function (c) { if (c) c.destroy() }); CHARTS = {} }

  /* ===== STATS ===== */
  function renderStats (analysis) {
    var grid = document.getElementById('sg-stat-grid')
    if (!grid) return
    var gapColor = analysis.skillGapScore >= 70 ? '#10B981' : analysis.skillGapScore >= 45 ? '#F59E0B' : '#EF4444'
    var matchColor = analysis.careerMatch >= 60 ? '#10B981' : '#F59E0B'
    var readColor = analysis.readiness >= 60 ? '#10B981' : analysis.readiness >= 30 ? '#F59E0B' : '#EF4444'
    var timeDisplay = analysis.estimatedTime.months >= 1 ? analysis.estimatedTime.months + ' months' : analysis.estimatedTime.weeks >= 1 ? analysis.estimatedTime.weeks + ' weeks' : analysis.estimatedTime.days + ' days'

    grid.innerHTML = ''
    var stats = [
      { label: 'Skill Gap Score', value: analysis.skillGapScore + '/100', color: gapColor, sub: analysis.stats.missingCount + ' missing skills', conf: analysis.confidence },
      { label: 'Career Match', value: analysis.careerMatch + '%', color: matchColor, sub: 'vs ' + analysis.targetRole, conf: analysis.confidence },
      { label: 'Readiness', value: analysis.readiness + '%', color: readColor, sub: analysis.stats.acquiredCount + '/' + analysis.stats.totalRequired + ' skills acquired', conf: analysis.confidence },
      { label: 'Learning Time', value: timeDisplay, color: 'var(--text)', sub: analysis.estimatedTime.totalHours + ' hours @ ' + analysis.estimatedTime.hoursPerDay + ' hrs/day', conf: 'Estimated' }
    ]
    stats.forEach(function (s) {
      var card = document.createElement('div')
      card.className = 'sg-stat-card'
      card.innerHTML =
        '<div class="sg-stat-header"><span class="sg-stat-label">' + s.label + '</span><span class="sg-stat-conf"><i class="fa-solid fa-circle" style="color:' + (s.conf === 'High' ? '#10B981' : s.conf === 'Low' ? '#EF4444' : '#F59E0B') + ';font-size:6px"></i> ' + s.conf + '</span></div>' +
        '<div class="sg-stat-value" style="color:' + s.color + '">' + s.value + '</div>' +
        '<div class="sg-stat-sub">' + s.sub + '</div>'
      grid.appendChild(card)
    })
  }

  /* ===== SKILL TABLE ===== */
  var currentFilter = 'all'

  function renderTable (analysis) {
    var tbody = document.getElementById('sg-table-body')
    if (!tbody) return
    renderTableData(analysis.comparison)
    initTableFilters(analysis.comparison)
  }

  function renderTableData (data) {
    var tbody = document.getElementById('sg-table-body')
    if (!tbody) return
    var filtered = data.filter(function (item) {
      if (currentFilter === 'all') return true
      return item.status === currentFilter
    })
    tbody.innerHTML = filtered.map(function (item) {
      var gapColor = item.gap === 0 ? '#10B981' : item.gap >= 20 ? '#EF4444' : '#F59E0B'
      var gapWidth = Math.min(100, item.gap)
      var priority = item.gap >= 15 && item.weight >= 0.7 ? 'high' : item.gap >= 10 || item.weight >= 0.55 ? 'medium' : item.gap === 0 ? 'closed' : 'low'
      return '<tr>' +
        '<td><span class="sg-status-dot ' + item.status + '"></span>' + item.name + '</td>' +
        '<td style="color:var(--text-3);font-size:11px">' + item.category + '</td>' +
        '<td>' + item.currentLevel + '%</td>' +
        '<td>' + item.requiredLevel + '%</td>' +
        '<td><span class="sg-gap-bar"><span class="sg-gap-fill" style="width:' + gapWidth + '%;background:' + gapColor + '"></span></span>' + item.gap + '%</td>' +
        '<td><span class="sg-priority-badge ' + priority + '">' + priority + '</span></td>' +
        '<td style="color:var(--text-3)">' + item.estimatedHours + 'h</td>' +
        '<td style="color:var(--success);font-weight:var(--weight-semibold)">+' + item.impact + '</td>' +
      '</tr>'
    }).join('')
  }

  function initTableFilters (data) {
    var chips = document.querySelectorAll('.sg-chip')
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active') })
        this.classList.add('active')
        currentFilter = this.getAttribute('data-filter')
        renderTableData(data)
      })
    })
  }

  /* ===== PRIORITY MATRIX ===== */
  function renderPriorityMatrix (analysis) {
    var grid = document.getElementById('sg-priority-grid')
    if (!grid) return
    var pm = analysis.priorityMatrix
    var groups = [
      { key: 'high', label: 'High Impact', icon: 'fa-bolt', cls: 'high', items: pm.high || [] },
      { key: 'medium', label: 'Medium Impact', icon: 'fa-arrow-trend-up', cls: 'medium', items: pm.medium || [] },
      { key: 'low', label: 'Low Impact', icon: 'fa-arrow-right', cls: 'low', items: pm.low || [] }
    ]
    grid.innerHTML = groups.map(function (g) {
      return '<div class="sg-priority-group">' +
        '<div class="sg-priority-group-header">' +
          '<div class="sg-priority-icon ' + g.cls + '"><i class="fa-solid ' + g.icon + '"></i></div>' +
          '<span class="sg-priority-group-title">' + g.label + '</span>' +
          '<span class="sg-priority-group-count">' + g.items.length + ' items</span>' +
        '</div>' +
        (g.items.length ? g.items.map(function (item) {
          return '<div class="sg-priority-item"><span class="sg-item-name">' + item.name + '</span><span class="sg-item-gap">gap ' + item.gap + '%</span><span class="sg-item-hours">' + item.estimatedHours + 'h</span></div>'
        }).join('') : '<p style="font-size:11px;color:var(--text-3);margin:0">No items</p>') +
      '</div>'
    }).join('')
  }

  /* ===== TIMELINE ===== */
  function renderTimeline (analysis) {
    var container = document.getElementById('sg-timeline')
    if (!container) return
    var tl = analysis.timelinePlan
    var time = analysis.estimatedTime
    var groups = [
      { key: 'daily', label: 'Daily (< 2 weeks)', icon: 'fa-calendar-day', cls: 'daily', items: tl.daily || [] },
      { key: 'weekly', label: 'Weekly (2–6 weeks)', icon: 'fa-calendar-week', cls: 'weekly', items: tl.weekly || [] },
      { key: 'monthly', label: 'Monthly (1+ months)', icon: 'fa-calendar', cls: 'monthly', items: tl.monthly || [] }
    ]
    container.innerHTML = groups.map(function (g) {
      return '<div class="sg-timeline-card">' +
        '<div class="sg-timeline-header">' +
          '<div class="sg-timeline-icon ' + g.cls + '"><i class="fa-solid ' + g.icon + '"></i></div>' +
          '<span class="sg-timeline-title">' + g.label + '</span>' +
          '<span class="sg-timeline-count">' + g.items.length + ' skills</span>' +
        '</div>' +
        (g.items.length ? g.items.map(function (item) {
          return '<div class="sg-timeline-skill"><span class="sg-tl-name">' + item.name + '</span><span style="color:var(--text-3)">' + item.estimatedHours + 'h</span></div>'
        }).join('') : '<p style="font-size:11px;color:var(--text-3);margin:0">No skills in this range</p>') +
      '</div>'
    }).join('')

    // Also show total estimate
    var totalEl = document.createElement('div')
    totalEl.className = 'sg-timeline-card'
    totalEl.style.cssText = 'background:var(--primary-bg);border-color:var(--primary-light)'
    totalEl.innerHTML =
      '<div class="sg-timeline-header">' +
        '<div class="sg-timeline-icon daily" style="background:var(--primary-bg);color:var(--primary)"><i class="fa-solid fa-clock"></i></div>' +
        '<span class="sg-timeline-title">Total Estimated Time</span>' +
        '<span style="font-size:var(--text-sm);font-weight:var(--weight-bold);color:var(--primary)">' + time.totalHours + ' hours</span>' +
      '</div>' +
      '<p style="margin:var(--space-1) 0 0;font-size:11px;color:var(--text-3)">' + time.days + ' days at ' + time.hoursPerDay + ' hrs/day &middot; ' + time.weeks + ' weeks &middot; ' + time.months + ' months</p>'
    container.appendChild(totalEl)
  }

  /* ===== CHARTS ===== */
  function renderCharts (analysis) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var tc = isDark ? '#94A3B8' : '#64748B'
    var gc = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    var comp = analysis.comparison || []
    var acquired = comp.filter(function (c) { return c.status === 'acquired' })
    var partial = comp.filter(function (c) { return c.status === 'partial' })
    var missing = comp.filter(function (c) { return c.status === 'missing' })

    // 1. Skill Radar (current vs required)
    var ctxRadar = document.getElementById('chart-radar')
    if (ctxRadar) {
      var labels = comp.map(function (c) { return c.name.length > 10 ? c.name.slice(0, 8) + '..' : c.name })
      var currentData = comp.map(function (c) { return c.currentLevel })
      var requiredData = comp.map(function (c) { return c.requiredLevel })

      if (CHARTS.radar) CHARTS.radar.destroy()
      CHARTS.radar = new Chart(ctxRadar, {
        type: 'radar',
        data: {
          labels: labels,
          datasets: [
            { label: 'Current', data: currentData, backgroundColor: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(79,70,229,0.1)', borderColor: isDark ? '#818CF8' : '#4F46E5', borderWidth: 2, pointBackgroundColor: isDark ? '#818CF8' : '#4F46E5', pointRadius: 3 },
            { label: 'Required', data: requiredData, backgroundColor: 'transparent', borderColor: isDark ? '#F87171' : '#EF4444', borderWidth: 2, borderDash: [4, 2], pointBackgroundColor: isDark ? '#F87171' : '#EF4444', pointRadius: 3, pointStyle: 'rectRot' }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { color: tc, backdropColor: 'transparent', font: { size: 9 } }, grid: { color: gc }, pointLabels: { color: tc, font: { size: 9 } } } }, plugins: { legend: { position: 'bottom', labels: { color: tc, font: { size: 10 }, padding: 8 } } } }
      })
    }

    // 2. Gap Severity Bar
    var ctxGap = document.getElementById('chart-gap')
    if (ctxGap) {
      var gapLabels = comp.map(function (c) { return c.name.length > 10 ? c.name.slice(0, 8) + '..' : c.name })
      var gapData = comp.map(function (c) { return c.gap })
      var gapColors = gapData.map(function (g) { return g === 0 ? '#10B981' : g >= 20 ? '#EF4444' : '#F59E0B' })

      if (CHARTS.gap) CHARTS.gap.destroy()
      CHARTS.gap = new Chart(ctxGap, {
        type: 'bar',
        data: { labels: gapLabels, datasets: [{ data: gapData, backgroundColor: gapColors, borderWidth: 0, borderRadius: 3 }] },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          scales: {
            x: { min: 0, max: 100, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } },
            y: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } }
          },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return 'Gap: ' + ctx.parsed.x + '%' } } } }
        }
      })
    }

    // 3. Readiness Gauge
    var ctxGauge = document.getElementById('chart-gauge')
    if (ctxGauge) {
      var readVal = analysis.readiness || 0
      var readColor = readVal >= 70 ? '#10B981' : readVal >= 40 ? '#F59E0B' : '#EF4444'

      if (CHARTS.gauge) CHARTS.gauge.destroy()
      CHARTS.gauge = new Chart(ctxGauge, {
        type: 'doughnut',
        data: { labels: ['Readiness', 'Gap'], datasets: [{ data: [readVal, 100 - readVal], backgroundColor: [readColor, gc], borderWidth: 0, circumference: 270, rotation: 225 }] },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '75%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return ctx.parsed + '%' } } } }
        },
        plugins: [{
          afterDraw: function (chart) {
            var width = chart.width, height = chart.height, ctx = chart.ctx
            ctx.save()
            var cx = width / 2, cy = height / 2 + 8
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.font = '700 28px Inter, sans-serif'
            ctx.fillStyle = readColor
            ctx.fillText(readVal + '%', cx, cy - 10)
            ctx.font = '12px Inter, sans-serif'
            ctx.fillStyle = tc
            ctx.fillText('Readiness', cx, cy + 16)
            ctx.restore()
          }
        }]
      })
    }

    // 4. Learning Timeline Bar
    var ctxTimeline = document.getElementById('chart-timeline')
    if (ctxTimeline) {
      var tlDays = analysis.estimatedTime.days || 0
      var tlWeeks = analysis.estimatedTime.weeks || 0
      var tlMonths = analysis.estimatedTime.months || 0
      var highH = (analysis.priorityMatrix.high || []).reduce(function (s, i) { return s + i.estimatedHours }, 0)
      var medH = (analysis.priorityMatrix.medium || []).reduce(function (s, i) { return s + i.estimatedHours }, 0)
      var lowH = (analysis.priorityMatrix.low || []).reduce(function (s, i) { return s + i.estimatedHours }, 0)
      var totalH = Math.max(1, highH + medH + lowH)
      var colors = ['#EF4444', '#F59E0B', '#818CF8']

      if (CHARTS.timeline) CHARTS.timeline.destroy()
      CHARTS.timeline = new Chart(ctxTimeline, {
        type: 'bar',
        data: {
          labels: ['High', 'Medium', 'Low'],
          datasets: [{
            data: [highH, medH, lowH],
            backgroundColor: colors,
            borderWidth: 0,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: tc, font: { size: 10 } }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }
          },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: function (ctx) { return ctx.parsed.x + ' hours (' + Math.round(ctx.parsed.x / totalH * 100) + '%)' } } }
          }
        }
      })
    }
  }

  /* ===== ACTION PLAN ===== */
  function renderActions (analysis) {
    var grid = document.getElementById('sg-action-grid')
    var count = document.getElementById('action-count')
    if (!grid) return

    var plan = analysis.actionPlan || []
    if (count) count.textContent = plan.length + ' actions'

    grid.innerHTML = plan.map(function (a) {
      var rankClass = 'r' + a.rank
      var bgColor = analysis.careerPath && analysis.careerPath.color ? analysis.careerPath.color : 'var(--primary)'
      var priorityColor = a.priority === 'high' ? '#EF4444' : a.priority === 'medium' ? '#F59E0B' : '#818CF8'
      return '<div class="sg-action-card">' +
        '<div class="sg-action-rank ' + rankClass + '" style="' + (a.rank <= 3 ? '' : 'background:' + priorityColor) + '">' + a.rank + '</div>' +
        '<h4 class="sg-action-title">' + a.action + '</h4>' +
        '<div class="sg-action-impact"><i class="fa-solid fa-arrow-up"></i> ' + a.impact + '</div>' +
        '<p class="sg-action-reason">' + a.reason + '</p>' +
        '<div class="sg-action-meta"><span>' + a.hours + ' hours</span><span style="color:' + priorityColor + '">' + a.priority + '</span><span>Confidence: ' + a.confidence + '</span></div>' +
      '</div>'
    }).join('')
  }

  /* ===== SUGGESTIONS ===== */
  function renderSuggestions (analysis) {
    var container = document.getElementById('sg-suggestions')
    if (!container) return
    container.innerHTML = (analysis.suggestions || []).map(function (s) {
      return '<div class="sg-suggestion"><i class="fa-solid fa-lightbulb"></i>' + s + '</div>'
    }).join('')
  }

  /* ===== STEPS ===== */
  function renderSteps (analysis) {
    var container = document.getElementById('sg-steps')
    var toggle = document.getElementById('toggle-steps')
    if (!container) return
    var steps = (analysis.calculation && analysis.calculation.steps) || []
    var formula = (analysis.calculation && analysis.calculation.formula) || ''
    if (!steps.length) { if (toggle) toggle.style.display = 'none'; return }
    if (toggle) {
      toggle.style.display = ''
      toggle.onclick = function () {
        container.classList.toggle('hidden')
        this.textContent = container.classList.contains('hidden') ? 'Show Steps' : 'Hide Steps'
      }
    }
    container.innerHTML = '<ol class="sg-steps-list">' + steps.map(function (s, i) {
      return '<li data-step="' + (i + 1) + '">' + s + '</li>'
    }).join('') + '</ol>' + (formula ? '<div class="sg-steps-formula">' + formula + '</div>' : '')
  }

  /* ===== WHAT IF ===== */
  var whatIfSkillData = null

  function initWhatIf (analysis) {
    var skillList = document.getElementById('whatif-skills-list')
    if (skillList) {
      var allSkills = (window.SkillsDB || []).map(function (s) { return s.name }).sort()
      skillList.innerHTML = allSkills.map(function (s) { return '<option value="' + s + '">' + s + '</option>' }).join('')
    }

    var range = document.getElementById('whatif-level')
    var rangeVal = document.getElementById('whatif-level-val')
    if (range && rangeVal) {
      range.addEventListener('input', function () { rangeVal.textContent = this.value })
    }

    var btn = document.getElementById('whatif-btn')
    if (btn) {
      btn.onclick = function () { runWhatIf(analysis) }
    }
  }

  function runWhatIf (baseAnalysis) {
    var skillInput = document.getElementById('whatif-skill')
    var levelInput = document.getElementById('whatif-level')
    if (!skillInput || !levelInput) return

    var skillName = skillInput.value.trim()
    var skillLevel = parseInt(levelInput.value, 10) || 70
    if (!skillName) { Toast.warning('Enter a skill name'); return }

    var result = SkillService.whatIf(baseAnalysis, { name: skillName, level: skillLevel })
    if (!result) { Toast.error('What-if calculation failed'); return }

    var container = document.getElementById('sg-whatif-results')
    if (!container) return

    var deltaGap = result.skillGapScore - baseAnalysis.skillGapScore
    var deltaReady = result.readiness - baseAnalysis.readiness
    var deltaHours = baseAnalysis.estimatedTime.totalHours - result.estimatedTime.totalHours

    var oldAcquired = baseAnalysis.stats.acquiredCount
    var newAcquired = result.stats.acquiredCount
    var oldMissing = baseAnalysis.stats.missingCount
    var newMissing = result.stats.missingCount

    container.innerHTML =
      '<div class="sg-whatif-result-grid">' +
        '<div class="sg-whatif-result-item"><span class="sg-whatif-result-label">Skill Gap</span><span class="sg-whatif-result-value" style="color:' + (deltaGap > 0 ? '#10B981' : deltaGap < 0 ? '#EF4444' : 'var(--text)') + '">' + result.skillGapScore + '</span><span class="sg-whatif-delta ' + (deltaGap > 0 ? 'positive' : deltaGap < 0 ? 'negative' : 'neutral') + '">(' + (deltaGap > 0 ? '+' : '') + deltaGap + ')</span></div>' +
        '<div class="sg-whatif-result-item"><span class="sg-whatif-result-label">Readiness</span><span class="sg-whatif-result-value" style="color:' + (deltaReady > 0 ? '#10B981' : deltaReady < 0 ? '#EF4444' : 'var(--text)') + '">' + result.readiness + '%</span><span class="sg-whatif-delta ' + (deltaReady > 0 ? 'positive' : deltaReady < 0 ? 'negative' : 'neutral') + '">(' + (deltaReady > 0 ? '+' : '') + deltaReady + ')</span></div>' +
        '<div class="sg-whatif-result-item"><span class="sg-whatif-result-label">Acquired</span><span class="sg-whatif-result-value">' + newAcquired + '/' + result.stats.totalRequired + '</span><span class="sg-whatif-delta ' + (newAcquired > oldAcquired ? 'positive' : 'neutral') + '">(' + (newAcquired - oldAcquired) + ')</span></div>' +
        '<div class="sg-whatif-result-item"><span class="sg-whatif-result-label">Missing</span><span class="sg-whatif-result-value">' + newMissing + '</span><span class="sg-whatif-delta ' + (newMissing < oldMissing ? 'positive' : newMissing > oldMissing ? 'negative' : 'neutral') + '">(' + (newMissing - oldMissing) + ')</span></div>' +
      '</div>' +
      '<div class="sg-whatif-impact-list">' +
        (result.actionPlan && result.actionPlan.length ? result.actionPlan.slice(0, 4).map(function (a) {
          return '<div class="sg-whatif-impact-item"><span style="font-weight:var(--weight-semibold);color:var(--text);min-width:28px">#' + a.rank + '</span><span style="flex:1">' + a.action + '</span><span style="color:var(--success);font-weight:var(--weight-semibold)">' + a.impact + '</span></div>'
        }).join('') : '') +
      '</div>' +
      '<p style="font-size:10px;color:var(--text-3);margin:var(--space-2) 0 0;text-align:center">What if: ' + skillName + ' → ' + skillLevel + '% &middot; Learning time: ' + result.estimatedTime.totalHours + ' hours (was ' + baseAnalysis.estimatedTime.totalHours + ')</p>'

    Toast.success('What-if: ' + skillName + ' at ' + skillLevel + '% applied')
  }

  /* ===== EXPORTS ===== */
  function initExports (analysis) {
    var pdfBtn = document.getElementById('export-pdf')
    var jsonBtn = document.getElementById('export-json')
    var mdBtn = document.getElementById('export-md')

    if (jsonBtn) {
      jsonBtn.onclick = function () {
        var json = SkillService.exportJSON(analysis)
        downloadFile(json, 'skill-gap-analysis.json', 'application/json')
        Toast.success('JSON exported')
      }
    }

    if (mdBtn) {
      mdBtn.onclick = function () {
        var md = SkillService.exportMarkdown(analysis)
        downloadFile(md, 'skill-gap-analysis.md', 'text/markdown')
        Toast.success('Markdown exported')
      }
    }

    if (pdfBtn) {
      pdfBtn.onclick = function () { exportPDF(analysis) }
    }
  }

  function downloadFile (content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a')
    a.href = url; a.download = filename
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  function exportPDF (analysis) {
    var win = window.open('', '_blank')
    if (!win) { Toast.error('Please allow popups for PDF export'); return }
    var html = SkillService.exportPDF(analysis)
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(function () { win.print() }, 500)
  }

  /* ===== INIT ===== */
  function init () {
    initTheme()
    initSidebar()
    initLogout()
    loadUser()
    initSelector()

    // Init demo profile if needed
    var user = Store.get('user')
    if (!user && typeof DemoProfile !== 'undefined' && DemoProfile) {
      Store.set('user', DemoProfile.user)
      Store.set('isLoggedIn', true)
      Store.set('userRole', 'student')
      Store.set('isDemoProfile', true)
      if (DemoProfile.skills) {
        var u = Store.get('user')
        u.skills = DemoProfile.skills
        u.projects = DemoProfile.projects || []
        u.certifications = DemoProfile.certifications || []
        u.badges = DemoProfile.badges || []
        Store.set('user', u)
      }
      loadUser()
    }

    var analyzeBtn = document.getElementById('analyze-btn')
    if (analyzeBtn) analyzeBtn.addEventListener('click', runAnalysis)

    // Auto-run on first load
    setTimeout(runAnalysis, 300)
  }

  document.addEventListener('DOMContentLoaded', init)
})()
