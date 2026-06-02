(function () {
  'use strict'

  var CHARTS = {}
  var THEME_CYCLE = ['light', 'dark', 'system']
  var THEME_ICONS = { light: 'fa-solid fa-moon', dark: 'fa-solid fa-sun', system: 'fa-solid fa-circle-half-stroke' }
  var currentPrediction = null

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

  /* ===== MAIN PREDICT ===== */
  async function runPrediction () {
    showSkeletons()
    clearCharts()

    try {
      var result = await PlacementService.predict()
      if (result.error) { Toast.error(result.error); hideSkeletons(); return }
      currentPrediction = result
      renderOverview(result)
      renderFactors(result)
      renderGauge(result)
      renderCharts(result)
      renderSalary(result)
      renderCompanies(result)
      renderRecruiter(result)
      renderImprovements(result)
      renderScenarios(result)
      renderSteps(result)
      initExports(result)
      Toast.success('Placement forecast updated')
    } catch (e) {
      console.error('Placement error:', e)
      if (typeof ErrorBoundary !== 'undefined') {
        ErrorBoundary.show({ message: 'Placement prediction failed', detail: e.message, retry: runPrediction, fallback: 'index.html' })
      } else { Toast.error('Prediction failed: ' + e.message) }
    }
    hideSkeletons()
  }

  function clearCharts () { Object.values(CHARTS).forEach(function (c) { if (c) c.destroy() }); CHARTS = {} }

  /* ===== OVERVIEW ===== */
  function renderOverview (result) {
    var grid = document.getElementById('pl-overview-grid')
    if (!grid) return
    var cls = result.classification
    var salary = result.salaryEstimate.likely

    grid.innerHTML = ''
    var items = [
      { label: 'Placement Probability', value: result.probability + '%', color: cls.color, sub: cls.label, badge: cls.label, badgeBg: cls.color },
      { label: 'Hiring Confidence', value: result.confidence, color: result.confidence === 'High' ? '#10B981' : result.confidence === 'Low' ? '#EF4444' : '#F59E0B', sub: 'Based on profile completeness' },
      { label: 'Likely Salary', value: '₹' + Math.round(salary.min / 100000) + 'L - ₹' + Math.round(salary.max / 100000) + 'L', color: 'var(--text)', sub: 'Entry: ₹' + Math.round(result.salaryEstimate.entry.min / 100000) + 'L' },
      { label: 'Market Access', value: result.eligibleCompanyCount + '/' + result.totalCompanies, color: 'var(--text)', sub: 'companies you qualify for' }
    ]

    items.forEach(function (item) {
      var card = document.createElement('div')
      card.className = 'pl-stat-card'
      card.innerHTML =
        '<div class="pl-stat-header"><span class="pl-stat-label">' + item.label + '</span></div>' +
        '<div class="pl-stat-value" style="color:' + item.color + '">' + item.value + '</div>' +
        (item.badge ? '<span class="pl-class-badge" style="background:' + item.badgeBg + '20;color:' + item.badgeBg + '">' + item.badge + '</span>' : '') +
        '<div class="pl-stat-sub">' + item.sub + '</div>'
      grid.appendChild(card)
    })
  }

  /* ===== FACTORS ===== */
  function renderFactors (result) {
    var container = document.getElementById('pl-factors')
    if (!container) return
    container.innerHTML = result.factorBreakdown.map(function (f) {
      var color = f.score >= 80 ? '#10B981' : f.score >= 55 ? '#F59E0B' : '#EF4444'
      return '<div class="pl-factor-row">' +
        '<div class="pl-factor-info"><div class="pl-factor-name">' + f.factor + '</div><div class="pl-factor-meta"><span>' + Math.round(f.weight * 100) + '% weight</span><span>max ' + f.maxPossible + ' pts</span></div></div>' +
        '<div class="pl-factor-bar"><div class="pl-factor-fill" style="width:' + f.score + '%;background:' + color + '"></div></div>' +
        '<span class="pl-factor-score" style="color:' + color + '">' + f.score + '</span>' +
        '<span class="pl-factor-weight">+' + f.weighted + '</span>' +
        '<span class="pl-factor-impact ' + f.impact + '">' + f.impact + '</span>' +
      '</div>'
    }).join('')
  }

  /* ===== GAUGE ===== */
  function renderGauge (result) {
    var ctx = document.getElementById('chart-gauge')
    var detail = document.getElementById('pl-gauge-detail')
    if (!ctx) return

    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var tc = isDark ? '#94A3B8' : '#64748B'
    var gc = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
    var prob = result.probability
    var cls = result.classification

    if (CHARTS.gauge) CHARTS.gauge.destroy()
    CHARTS.gauge = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: ['Probability', 'Remaining'], datasets: [{ data: [prob, 100 - prob], backgroundColor: [cls.color, gc], borderWidth: 0, circumference: 270, rotation: 225 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return ctx.parsed + '%' } } } } },
      plugins: [{
        afterDraw: function (chart) {
          var w = chart.width, h = chart.height, c = chart.ctx
          c.save()
          var cx = w / 2, cy = h / 2 + 6
          c.textAlign = 'center'; c.textBaseline = 'middle'
          c.font = '700 32px Inter, sans-serif'
          c.fillStyle = cls.color
          c.fillText(prob + '%', cx, cy - 16)
          c.font = '600 13px Inter, sans-serif'
          c.fillStyle = tc
          c.fillText(cls.label, cx, cy + 16)
          c.restore()
        }
      }]
    })

    if (detail) {
      detail.innerHTML = '<p class="pl-gauge-class" style="color:' + cls.color + '">' + cls.label + '</p><p class="pl-gauge-desc">' + cls.desc + '</p>'
    }
  }

  /* ===== CHARTS ===== */
  function renderCharts (result) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var tc = isDark ? '#94A3B8' : '#64748B'
    var gc = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    // 1. Employability Breakdown (horizontal bar of factor scores)
    var ctxBreakdown = document.getElementById('chart-breakdown')
    if (ctxBreakdown) {
      var bLabels = result.factorBreakdown.map(function (f) { return f.factor })
      var bData = result.factorBreakdown.map(function (f) { return f.score })
      var bColors = bData.map(function (v) { return v >= 80 ? '#10B981' : v >= 55 ? '#F59E0B' : '#EF4444' })

      if (CHARTS.breakdown) CHARTS.breakdown.destroy()
      CHARTS.breakdown = new Chart(ctxBreakdown, {
        type: 'bar',
        data: { labels: bLabels, datasets: [{ data: bData, backgroundColor: bColors, borderWidth: 0, borderRadius: 3 }] },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          scales: { x: { min: 0, max: 100, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, y: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } } },
          plugins: { legend: { display: false } }
        }
      })
    }

    // 2. Salary Range
    var ctxSalary = document.getElementById('chart-salary')
    if (ctxSalary) {
      var sal = result.salaryEstimate
      if (CHARTS.salary) CHARTS.salary.destroy()
      CHARTS.salary = new Chart(ctxSalary, {
        type: 'bar',
        data: {
          labels: ['Entry', 'Likely', 'Stretch'],
          datasets: [{
            data: [Math.round(sal.entry.min / 100000), Math.round(sal.likely.min / 100000), Math.round(sal.stretch.min / 100000)],
            backgroundColor: [isDark ? '#475569' : '#94A3B8', isDark ? '#818CF8' : '#4F46E5', isDark ? '#34D399' : '#10B981'],
            borderWidth: 0, borderRadius: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { color: tc, font: { size: 9 }, callback: function (v) { return '₹' + v + 'L' } }, grid: { color: gc } },
            x: { ticks: { color: tc, font: { size: 10 } }, grid: { display: false } }
          },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { var ranges = [sal.entry, sal.likely, sal.stretch]; var r = ranges[ctx.dataIndex]; return '₹' + Math.round(r.min / 100000) + 'L - ₹' + Math.round(r.max / 100000) + 'L' } } } }
        }
      })
    }

    // 3. Company Match
    var ctxCompany = document.getElementById('chart-company')
    if (ctxCompany) {
      var topCos = result.companyMatches.slice(0, 10)
      var coLabels = topCos.map(function (c) { return c.name.length > 12 ? c.name.slice(0, 10) + '..' : c.name })
      var coData = topCos.map(function (c) { return c.matchScore })
      var coColors = topCos.map(function (c) { return c.eligible ? '#10B981' : '#EF4444' })

      if (CHARTS.company) CHARTS.company.destroy()
      CHARTS.company = new Chart(ctxCompany, {
        type: 'bar',
        data: { labels: coLabels, datasets: [{ data: coData, backgroundColor: coColors, borderWidth: 0, borderRadius: 3 }] },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          scales: { x: { min: 0, max: 100, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, y: { ticks: { color: tc, font: { size: 8 } }, grid: { display: false } } },
          plugins: { legend: { display: false } }
        }
      })
    }

    // 4. Impact Analysis (remaining potential per factor)
    var ctxImpact = document.getElementById('chart-impact')
    if (ctxImpact) {
      var impLabels = result.factorBreakdown.map(function (f) { return f.factor.length > 8 ? f.factor.slice(0, 6) + '..' : f.factor })
      var impData = result.factorBreakdown.map(function (f) { return f.remaining })
      var impColors = impData.map(function (v) { return v > 10 ? '#EF4444' : v > 5 ? '#F59E0B' : '#10B981' })

      if (CHARTS.impact) CHARTS.impact.destroy()
      CHARTS.impact = new Chart(ctxImpact, {
        type: 'bar',
        data: { labels: impLabels, datasets: [{ data: impData, backgroundColor: impColors, borderWidth: 0, borderRadius: 3 }] },
        options: {
          responsive: true, maintainAspectRatio: false, indexAxis: 'y',
          scales: { x: { beginAtZero: true, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, y: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } } },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return '+' + ctx.parsed.x + ' potential points' } } } }
        }
      })
    }
  }

  /* ===== SALARY ===== */
  function renderSalary (result) {
    var grid = document.getElementById('pl-salary-grid')
    var badge = document.getElementById('salary-premium-badge')
    if (!grid) return
    var sal = result.salaryEstimate

    if (badge && sal.premiumApplied) badge.textContent = 'Skill Premium: +' + sal.premiumPercent + '%'

    grid.innerHTML = ''
    var tiers = [
      { key: 'entry', label: 'Entry (Conservative)', cls: 'entry', badge: 'Pessimistic', badgeCls: 'pessimistic' },
      { key: 'likely', label: 'Likely (Realistic)', cls: 'likely', badge: 'Realistic', badgeCls: 'realistic' },
      { key: 'stretch', label: 'Stretch (Optimistic)', cls: 'stretch', badge: 'Optimistic', badgeCls: 'optimistic' }
    ]
    tiers.forEach(function (t) {
      var range = sal[t.key]
      var card = document.createElement('div')
      card.className = 'pl-salary-card ' + t.cls
      card.innerHTML =
        '<div class="pl-salary-label">' + t.label + '</div>' +
        '<div class="pl-salary-amount">₹' + Math.round(range.min / 100000) + 'L - ₹' + Math.round(range.max / 100000) + 'L</div>' +
        '<span class="pl-salary-range">₹' + range.min.toLocaleString() + ' - ₹' + range.max.toLocaleString() + '</span>' +
        '<span class="pl-salary-badge ' + t.badgeCls + '">' + t.badge + '</span>'
      grid.appendChild(card)
    })
  }

  /* ===== COMPANIES ===== */
  function renderCompanies (result) {
    var grid = document.getElementById('pl-company-grid')
    var count = document.getElementById('company-count')
    if (!grid) return
    if (count) count.textContent = result.eligibleCompanyCount + '/' + result.totalCompanies + ' eligible'

    grid.innerHTML = result.companyMatches.slice(0, 6).map(function (c) {
      var cls = c.eligible ? 'eligible' : 'ineligible'
      var matchColor = c.matchScore >= 70 ? '#10B981' : c.matchScore >= 50 ? '#F59E0B' : '#EF4444'
      return '<div class="pl-company-card ' + cls + '">' +
        '<div class="pl-company-header"><span class="pl-company-name">' + c.name + '</span><span class="pl-company-match" style="color:' + matchColor + '">' + c.matchScore + '%</span></div>' +
        '<div class="pl-company-industry">' + c.industry + ' · ' + c.type + '</div>' +
        '<div class="pl-company-detail">' + (c.roles || []).slice(0, 2).join(', ') + '</div>' +
        '<div class="pl-company-sal">₹' + c.salaryRange.min.toLocaleString() + ' - ₹' + c.salaryRange.max.toLocaleString() + '</div>' +
        '<div class="pl-company-reason">' + c.reasoning + '</div>' +
        (c.missingSkills.length ? '<div class="pl-company-missing">' + c.missingSkills.map(function (s) { return '<span class="pl-company-missing-chip">' + s + '</span>' }).join('') + '</div>' : '') +
      '</div>'
    }).join('')
  }

  /* ===== RECRUITER VIEW ===== */
  function renderRecruiter (result) {
    var container = document.getElementById('pl-recruiter')
    if (!container) return
    var rv = result.recruiterView

    container.innerHTML =
      '<div class="pl-recruiter-card contact">' +
        '<div class="pl-recruiter-title"><i class="fa-solid fa-thumbs-up" style="color:var(--success)"></i> Why Recruiters Would Contact You</div>' +
        rv.reasonsToContact.map(function (r) { return '<div class="pl-recruiter-item"><span style="color:var(--success)">✓</span>' + r + '</div>' }).join('') +
      '</div>' +
      '<div class="pl-recruiter-card reject">' +
        '<div class="pl-recruiter-title"><i class="fa-solid fa-triangle-exclamation" style="color:var(--error)"></i> Why Recruiters Might Reject You</div>' +
        rv.reasonsToReject.map(function (r) { return '<div class="pl-recruiter-item"><span style="color:var(--error)">✗</span>' + r + '</div>' }).join('') +
      '</div>' +
      (rv.highestImpact ? '<div class="pl-recruiter-card impact">' +
        '<div class="pl-recruiter-title"><i class="fa-solid fa-bolt" style="color:var(--primary)"></i> Highest Impact Improvement</div>' +
        '<div class="pl-impact-highlight"><p><strong>' + rv.highestImpact.factor + '</strong>: ' + rv.highestImpact.suggestion + ' <span style="font-weight:var(--weight-bold)">' + rv.highestImpact.impact + '</span></p></div>' +
      '</div>' : '')
  }

  /* ===== IMPROVEMENTS ===== */
  function renderImprovements (result) {
    var container = document.getElementById('pl-improvements')
    if (!container) return
    var imps = result.improvements
    if (!imps.length) {
      container.innerHTML = '<p style="font-size:var(--text-xs);color:var(--text-3);text-align:center;padding:var(--space-3)">No improvements needed — your profile is strong across all factors.</p>'
      return
    }
    container.innerHTML = imps.map(function (i) {
      return '<div class="pl-improvement-card">' +
        '<div class="pl-imp-header"><span class="pl-imp-area">' + i.area + '</span><span class="pl-imp-impact">' + i.impact + '</span></div>' +
        '<div class="pl-imp-suggestions">' + i.suggestions.join('; ') + '</div>' +
      '</div>'
    }).join('')
  }

  /* ===== SCENARIOS ===== */
  function renderScenarios (result) {
    var grid = document.getElementById('pl-scenario-grid')
    var resultContainer = document.getElementById('pl-scenario-result')
    if (!grid) return

    grid.innerHTML = result.scenarios.map(function (sc) {
      return '<button class="pl-scenario-btn" data-scenario="' + sc.id + '"><span class="sc-label">' + sc.label + '</span><span class="sc-desc">' + sc.description + '</span></button>'
    }).join('')

    grid.querySelectorAll('.pl-scenario-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var scId = this.getAttribute('data-scenario')
        var sc = null
        for (var i = 0; i < result.scenarios.length; i++) {
          if (result.scenarios[i].id === scId) { sc = result.scenarios[i]; break }
        }
        if (!sc || !resultContainer) return

        var sim = sc.result
        var baseProb = result.probability
        var delta = sim.probability - baseProb
        var dClass = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'
        var deltaColor = delta > 0 ? '#10B981' : delta < 0 ? '#EF4444' : 'var(--text-3)'

        // Update factor list
        var factorHtml = sim.factors.map(function (f) {
          var color = f.score >= 80 ? '#10B981' : f.score >= 55 ? '#F59E0B' : '#EF4444'
          return '<div class="pl-scenario-result-item"><span class="pl-scenario-rl">' + f.factor + '</span><span class="pl-scenario-rv" style="color:' + color + '">' + f.score + '</span><span class="pl-scenario-rd ' + (f.score >= 55 ? 'positive' : f.score < 40 ? 'negative' : 'neutral') + '">+' + f.weighted + '</span></div>'
        }).join('')

        resultContainer.innerHTML =
          '<div class="pl-scenario-result-grid">' +
            '<div class="pl-scenario-result-item"><span class="pl-scenario-rl">Probability</span><span class="pl-scenario-rv" style="color:' + deltaColor + '">' + sim.probability + '%</span><span class="pl-scenario-rd ' + dClass + '">(' + (delta > 0 ? '+' : '') + delta + ')</span></div>' +
            '<div class="pl-scenario-result-item"><span class="pl-scenario-rl">Classification</span><span class="pl-scenario-rv" style="font-size:var(--text-sm);color:' + sim.classification.color + '">' + sim.classification.label + '</span></div>' +
            factorHtml +
          '</div>' +
          '<p style="font-size:10px;color:var(--text-3);text-align:center;margin:0">Scenario: ' + sc.label + ' — ' + sc.description + '</p>'
      })
    })
  }

  /* ===== STEPS ===== */
  function renderSteps (result) {
    var container = document.getElementById('pl-steps')
    var toggle = document.getElementById('toggle-steps')
    if (!container) return
    var steps = (result.calculation && result.calculation.steps) || []
    var formula = (result.calculation && result.calculation.formula) || ''
    if (!steps.length) { if (toggle) toggle.style.display = 'none'; return }
    if (toggle) {
      toggle.style.display = ''
      toggle.onclick = function () {
        container.classList.toggle('hidden')
        this.textContent = container.classList.contains('hidden') ? 'Show' : 'Hide'
      }
    }
    container.innerHTML = '<ol class="pl-steps-list">' + steps.map(function (s, i) {
      return '<li data-step="' + (i + 1) + '">' + s + '</li>'
    }).join('') + '</ol>' + (formula ? '<div class="pl-steps-formula">' + formula + '</div>' : '')
  }

  /* ===== EXPORTS ===== */
  function initExports (result) {
    var pdfBtn = document.getElementById('export-pdf')
    var jsonBtn = document.getElementById('export-json')
    var mdBtn = document.getElementById('export-md')

    if (jsonBtn) jsonBtn.onclick = function () { downloadFile(PlacementService.exportJSON(result), 'placement-forecast.json', 'application/json'); Toast.success('JSON exported') }
    if (mdBtn) mdBtn.onclick = function () { downloadFile(PlacementService.exportMarkdown(result), 'placement-forecast.md', 'text/markdown'); Toast.success('Markdown exported') }
    if (pdfBtn) pdfBtn.onclick = function () {
      var win = window.open('', '_blank')
      if (!win) { Toast.error('Please allow popups for PDF export'); return }
      win.document.write(PlacementService.exportPDF(result))
      win.document.close(); win.focus()
      setTimeout(function () { win.print() }, 500)
    }
  }

  function downloadFile (content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a'); a.href = url; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  /* ===== INIT ===== */
  function init () {
    initTheme(); initSidebar(); initLogout(); loadUser()

    // Load demo profile if needed
    if (!Store.get('user') && !Store.get('isLoggedIn') && typeof DemoProfile !== 'undefined' && DemoProfile) {
      Store.set('user', DemoProfile.user); Store.set('isLoggedIn', true); Store.set('userRole', 'student'); Store.set('isDemoProfile', true)
      var u = Store.get('user')
      u.skills = DemoProfile.skills; u.projects = DemoProfile.projects; u.certifications = DemoProfile.certifications; u.badges = DemoProfile.badges
      Store.set('user', u)
      loadUser()
    }

    var btn = document.getElementById('predict-btn')
    if (btn) btn.addEventListener('click', runPrediction)
    setTimeout(runPrediction, 300)
  }

  document.addEventListener('DOMContentLoaded', init)
})()
