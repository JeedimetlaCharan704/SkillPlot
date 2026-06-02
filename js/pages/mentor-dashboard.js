(function () {
  'use strict'

  var THEME_CYCLE = ['light', 'dark', 'system']
  var THEME_ICONS = { light: 'fa-solid fa-moon', dark: 'fa-solid fa-sun', system: 'fa-solid fa-circle-half-stroke' }
  var CHARTS = {}
  var students = []
  var risks = []
  var analytics = null
  var insights = null
  var overview = null
  var debounceTimer = null

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

  function showSkeletons () { var el = document.querySelector('[data-skel]'); if (el) el.style.display = '' }
  function hideSkeletons () { var el = document.querySelector('[data-skel]'); if (el) el.style.display = 'none' }

  function openModal (id) { var m = document.getElementById(id); if (m) { m.classList.add('open'); m.setAttribute('aria-hidden', 'false') } }
  function closeModal (id) { var m = document.getElementById(id); if (m) { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true') } }

  /* ===== OVERVIEW ===== */
  function renderOverview () {
    var grid = document.getElementById('md-overview')
    if (!grid) return
    var items = [
      { label: 'Total Students', value: overview.totalStudents, sub: 'enrolled' },
      { label: 'Avg Readiness', value: overview.avgReadiness + '%', sub: 'cohort average', color: overview.avgReadiness >= 60 ? '#10B981' : overview.avgReadiness >= 40 ? '#F59E0B' : '#EF4444' },
      { label: 'Avg Placement', value: overview.avgPlacement + '%', sub: 'probability', color: overview.avgPlacement >= 60 ? '#10B981' : overview.avgPlacement >= 40 ? '#F59E0B' : '#EF4444' },
      { label: 'Avg Resume', value: overview.avgResume + '%', sub: 'score', color: overview.avgResume >= 60 ? '#10B981' : overview.avgResume >= 40 ? '#F59E0B' : '#EF4444' },
      { label: 'Active Learners', value: overview.activeLearners, sub: 'last 30 days', color: '#3B82F6' },
      { label: 'At Risk', value: overview.atRisk, sub: 'high/critical', color: overview.atRisk > 0 ? '#EF4444' : '#10B981' }
    ]
    grid.innerHTML = items.map(function (item) {
      return '<div class="md-stat-card"><div class="md-stat-label">' + item.label + '</div>' +
        '<div class="md-stat-value" style="color:' + (item.color || 'var(--text)') + '">' + item.value + '</div>' +
        '<div class="md-stat-sub">' + item.sub + '</div></div>'
    }).join('')
  }

  /* ===== TABLE ===== */
  function renderTable () {
    var tbody = document.getElementById('md-table-body')
    if (!tbody) return
    var search = (document.getElementById('md-search').value || '').toLowerCase()
    var filter = document.getElementById('md-filter').value

    var filtered = students.filter(function (s) {
      if (filter !== 'all' && s.riskLevel !== filter) return false
      if (search && s.name.toLowerCase().indexOf(search) === -1 && s.email.toLowerCase().indexOf(search) === -1) return false
      return true
    })

    tbody.innerHTML = filtered.map(function (s) {
      var riskColor = s.riskLevel === 'low' ? '#10B981' : s.riskLevel === 'medium' ? '#F59E0B' : s.riskLevel === 'high' ? '#EF4444' : '#DC2626'
      var rColor = s.readiness >= 60 ? '#10B981' : s.readiness >= 40 ? '#F59E0B' : '#EF4444'
      var pColor = s.placementProbability >= 60 ? '#10B981' : s.placementProbability >= 40 ? '#F59E0B' : '#EF4444'
      var rsColor = s.resumeScore >= 60 ? '#10B981' : s.resumeScore >= 40 ? '#F59E0B' : '#EF4444'
      return '<tr>' +
        '<td class="md-clickable" data-student="' + s.id + '"><strong>' + s.name + '</strong></td>' +
        '<td style="color:' + rColor + '">' + s.readiness + '%</td>' +
        '<td style="color:' + pColor + '">' + s.placementProbability + '%</td>' +
        '<td style="color:' + rsColor + '">' + s.resumeScore + '%</td>' +
        '<td>' + s.profileStrength + '%</td>' +
        '<td><span class="md-risk-badge ' + s.riskLevel + '" style="background:' + riskColor + '15;color:' + riskColor + '">' + s.riskLevel + '</span></td>' +
        '<td><button class="md-action-btn" data-student="' + s.id + '">View</button></td>' +
      '</tr>'
    }).join('')

    // Click handlers
    tbody.querySelectorAll('[data-student]').forEach(function (el) {
      el.addEventListener('click', function () {
        var id = this.getAttribute('data-student')
        showStudentDetail(id)
      })
    })
  }

  /* ===== CHARTS ===== */
  function renderCharts () {
    destroyCharts()
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var tc = isDark ? '#94A3B8' : '#64748B'
    var gc = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
    var colors = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899', '#06B6D4']

    // Readiness
    var ctxR = document.getElementById('chart-readiness')
    if (ctxR && analytics.readinessDist.length) {
      CHARTS.readiness = new Chart(ctxR, {
        type: 'bar',
        data: { labels: analytics.readinessDist.map(function (d) { return d.label }), datasets: [{ data: analytics.readinessDist.map(function (d) { return d.value }), backgroundColor: colors, borderWidth: 0, borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, x: { ticks: { color: tc, font: { size: 10 } }, grid: { display: false } } }, plugins: { legend: { display: false } } }
      })
    }

    // Placement
    var ctxP = document.getElementById('chart-placement')
    if (ctxP && analytics.placementDist.length) {
      CHARTS.placement = new Chart(ctxP, {
        type: 'doughnut',
        data: { labels: analytics.placementDist.map(function (d) { return d.label }), datasets: [{ data: analytics.placementDist.map(function (d) { return d.value }), backgroundColor: colors, borderWidth: 1, borderColor: isDark ? '#1E293B' : '#fff' }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'bottom', labels: { color: tc, font: { size: 9 } } } } }
      })
    }

    // Skill
    var ctxS = document.getElementById('chart-skill')
    if (ctxS && analytics.skillDist.length) {
      CHARTS.skill = new Chart(ctxS, {
        type: 'bar',
        data: { labels: analytics.skillDist.map(function (d) { return d.label }), datasets: [{ data: analytics.skillDist.map(function (d) { return d.value }), backgroundColor: colors, borderWidth: 0, borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, x: { ticks: { color: tc, font: { size: 10 } }, grid: { display: false } } }, plugins: { legend: { display: false } } }
      })
    }

    // Career
    var ctxC = document.getElementById('chart-career')
    if (ctxC && analytics.careerDist.length) {
      CHARTS.career = new Chart(ctxC, {
        type: 'bar',
        data: { labels: analytics.careerDist.map(function (d) { return d.label.length > 12 ? d.label.slice(0, 10) + '..' : d.label }), datasets: [{ data: analytics.careerDist.map(function (d) { return d.value }), backgroundColor: colors.slice(0, analytics.careerDist.length), borderWidth: 0, borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { color: tc, font: { size: 9 } }, grid: { color: gc } }, y: { ticks: { color: tc, font: { size: 9 } }, grid: { display: false } } }, plugins: { legend: { display: false } } }
      })
    }
  }

  function destroyCharts () { Object.values(CHARTS).forEach(function (c) { if (c) c.destroy() }); CHARTS = {} }

  /* ===== TOP TALENT ===== */
  function renderTalent (talent) {
    var grid = document.getElementById('md-talent')
    if (!grid) return
    grid.innerHTML =
      (talent.highestReadiness ? '<div class="md-talent-card"><div class="md-talent-icon"><i class="fa-solid fa-crown"></i></div><div class="md-talent-name">' + talent.highestReadiness.name + '</div><div class="md-talent-label">Highest Readiness</div><div class="md-talent-value">' + talent.highestReadiness.readiness + '%</div></div>' : '') +
      (talent.highestGithub ? '<div class="md-talent-card"><div class="md-talent-icon"><i class="fa-brands fa-github"></i></div><div class="md-talent-name">' + talent.highestGithub.name + '</div><div class="md-talent-label">Best GitHub Activity</div><div class="md-talent-value">' + (talent.highestGithub.githubActivity || 0) + '</div></div>' : '') +
      (talent.bestPortfolio ? '<div class="md-talent-card"><div class="md-talent-icon"><i class="fa-solid fa-briefcase"></i></div><div class="md-talent-name">' + talent.bestPortfolio.name + '</div><div class="md-talent-label">Best Portfolio</div><div class="md-talent-value">' + talent.bestPortfolio.profileStrength + '%</div></div>' : '') +
      (talent.strongestResume ? '<div class="md-talent-card"><div class="md-talent-icon"><i class="fa-solid fa-file-lines"></i></div><div class="md-talent-name">' + talent.strongestResume.name + '</div><div class="md-talent-label">Strongest Resume</div><div class="md-talent-value">' + talent.strongestResume.resumeScore + '%</div></div>' : '')
  }

  /* ===== INSIGHTS ===== */
  function renderInsights () {
    var grid = document.getElementById('md-insights-grid')
    if (!grid) return
    grid.innerHTML =
      '<div class="md-insight-card"><div class="md-insight-title"><i class="fa-solid fa-arrow-trend-down" style="color:#EF4444"></i> Most Common Weaknesses</div>' +
        (insights.mostCommonWeaknesses.length ? insights.mostCommonWeaknesses.map(function (w) { return '<div class="md-insight-item">' + w.skill + '<span>' + w.count + ' missing</span></div>' }).join('') : '<div class="md-insight-item" style="color:var(--text-3)">No data</div>') +
      '</div>' +
      '<div class="md-insight-card"><div class="md-insight-title"><i class="fa-solid fa-star" style="color:#10B981"></i> Most Requested Skills</div>' +
        (insights.mostRequestedSkills.length ? insights.mostRequestedSkills.map(function (s) { return '<div class="md-insight-item">' + s.skill + '<span>' + s.count + ' students</span></div>' }).join('') : '<div class="md-insight-item" style="color:var(--text-3)">No data</div>') +
      '</div>' +
      '<div class="md-insight-card"><div class="md-insight-title"><i class="fa-solid fa-certificate" style="color:#F59E0B"></i> Most Valuable Certifications</div>' +
        insights.mostValuableCertifications.map(function (c) { return '<div class="md-insight-item">' + c.name + '<span>' + c.demand + '</span></div>' }).join('') +
      '</div>' +
      '<div class="md-insight-card"><div class="md-insight-title"><i class="fa-solid fa-arrows-left-right" style="color:#8B5CF6"></i> Most Common Skill Gaps</div>' +
        insights.mostCommonGaps.map(function (g) { return '<div class="md-insight-item">' + g.skill + '<span>' + g.studentsMissing + ' need this</span></div>' }).join('') +
      '</div>'
  }

  /* ===== RISKS ===== */
  function renderRisks () {
    var grid = document.getElementById('md-risk-grid')
    var count = document.getElementById('md-risk-count')
    if (!grid) return
    var atRisk = risks.filter(function (r) { return r.riskLevel === 'high' || r.riskLevel === 'critical' })
    if (count) count.textContent = atRisk.length + ' at-risk · ' + risks.reduce(function (s, r) { return s + r.riskCount }, 0) + ' total flags'

    grid.innerHTML = atRisk.map(function (r) {
      return '<div class="md-risk-student">' +
        '<div class="md-risk-header" onclick="var n=this.nextElementSibling;n.style.display=n.style.display===\'none\'?\'\':\'none\'">' +
          '<span class="md-risk-name">' + r.studentName + ' <span class="md-risk-badge ' + r.riskLevel + '" style="font-size:9px">' + r.riskCount + ' flags</span></span>' +
          '<i class="fa-solid fa-chevron-down" style="font-size:10px;color:var(--text-3)"></i>' +
        '</div>' +
        '<div class="md-risk-tags" style="display:none">' +
          r.risks.map(function (risk) { return '<span class="md-risk-tag">' + risk.label + '</span>' }).join('') +
        '</div>' +
      '</div>'
    }).join('')
  }

  /* ===== BULK ACTIONS ===== */
  function renderBulk (bulk) {
    renderBulkGrid('md-bulk-plans', bulk.learningPlans)
    renderBulkGrid('md-bulk-certs', bulk.recommendedCertifications)
    renderBulkGrid('md-bulk-projects', bulk.suggestedProjects)
  }

  function renderBulkGrid (id, items) {
    var grid = document.getElementById(id)
    if (!grid) return
    grid.innerHTML = items.map(function (item) {
      return '<div class="md-bulk-card"><div class="md-bulk-title">' + item.title + '</div>' +
        '<div class="md-bulk-desc">' + item.desc + '</div>' +
        '<div class="md-bulk-students">' + (item.students || item.students === 0 ? item.students + ' students' : item.students || '') + '</div>' +
      '</div>'
    }).join('')
  }

  /* ===== STUDENT DETAIL ===== */
  function showStudentDetail (id) {
    var student = null
    for (var i = 0; i < students.length; i++) {
      if (students[i].id === id) { student = students[i]; break }
    }
    if (!student) return

    document.getElementById('student-modal-title').textContent = student.name
    var body = document.getElementById('student-modal-body')
    var rColor = student.readiness >= 60 ? '#10B981' : student.readiness >= 40 ? '#F59E0B' : '#EF4444'
    var pColor = student.placementProbability >= 60 ? '#10B981' : student.placementProbability >= 40 ? '#F59E0B' : '#EF4444'
    var rsColor = student.resumeScore >= 60 ? '#10B981' : student.resumeScore >= 40 ? '#F59E0B' : '#EF4444'

    body.innerHTML =
      '<div class="md-detail-grid">' +
        '<div class="md-detail-stat"><div class="md-detail-stat-value" style="color:' + rColor + '">' + student.readiness + '%</div><div class="md-detail-stat-label">Readiness</div></div>' +
        '<div class="md-detail-stat"><div class="md-detail-stat-value" style="color:' + pColor + '">' + student.placementProbability + '%</div><div class="md-detail-stat-label">Placement</div></div>' +
        '<div class="md-detail-stat"><div class="md-detail-stat-value" style="color:' + rsColor + '">' + student.resumeScore + '%</div><div class="md-detail-stat-label">Resume</div></div>' +
        '<div class="md-detail-stat"><div class="md-detail-stat-value">' + student.profileStrength + '%</div><div class="md-detail-stat-label">Profile Strength</div></div>' +
      '</div>' +
      '<div style="margin-top:var(--space-3)"><span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text)">Career Interest: ' + (student.careerInterest || 'Undecided') + '</span></div>' +
      '<div style="margin-top:var(--space-2)"><span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text)">Skills</span>' +
        '<div class="md-detail-list">' + (student.skills || []).map(function (s) { return '<span>' + s + '</span>' }).join('') + '</div></div>' +
      '<div style="margin-top:var(--space-2)"><span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text)">Skill Gaps</span>' +
        '<div class="md-detail-list">' + (student.weakSkills || []).map(function (w) { return '<span style="background:#EF444415;color:#EF4444">' + w + '</span>' }).join('') + '</div></div>' +
      '<div style="margin-top:var(--space-2)"><span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text)">Stats</span>' +
        '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-top:var(--space-1)">' +
          '<span style="font-size:10px;color:var(--text-3)">Projects: ' + (student.projectsCount || 0) + '</span>' +
          '<span style="font-size:10px;color:var(--text-3)">Certs: ' + (student.certificationsCount || 0) + '</span>' +
          '<span style="font-size:10px;color:var(--text-3)">Internships: ' + (student.internshipsCount || 0) + '</span>' +
          '<span style="font-size:10px;color:var(--text-3)">GitHub: ' + (student.hasGithub ? 'Connected' : 'Not connected') + '</span>' +
        '</div></div>' +
      (student.learningHistory && student.learningHistory.length ? '<div style="margin-top:var(--space-2)"><span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text)">Learning History</span>' +
        '<div class="md-detail-timeline">' + student.learningHistory.map(function (h) { return '<div class="md-detail-tl-item"><span class="md-detail-tl-date">' + (h.date || '') + '</span> ' + (h.title || '') + '</div>' }).join('') + '</div></div>' : '')
    openModal('student-modal')
  }

  /* ===== EXPORTS ===== */
  function initExports () {
    document.getElementById('export-json').addEventListener('click', function () {
      downloadFile(MentorService.exportJSON(students, overview, risks, analytics), 'mentor-report.json', 'application/json')
      Toast.success('JSON exported')
    })
    document.getElementById('export-md').addEventListener('click', function () {
      downloadFile(MentorService.exportMarkdown(students, overview, risks, analytics, insights), 'mentor-report.md', 'text/markdown')
      Toast.success('Markdown exported')
    })
    document.getElementById('export-csv').addEventListener('click', function () {
      downloadFile(MentorService.exportCSV(students), 'mentor-roster.csv', 'text/csv')
      Toast.success('CSV exported')
    })
    document.getElementById('export-pdf').addEventListener('click', function () {
      var win = window.open('', '_blank')
      if (!win) { Toast.error('Please allow popups for PDF export'); return }
      win.document.write(MentorService.exportPDF(students, overview, risks, analytics, insights))
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

  /* ===== DEBOUNCED RENDER ===== */
  window.debouncedRender = function () {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(renderTable, 200)
  }

  /* ===== MAIN RENDER ===== */
  function renderDashboard () {
    showSkeletons()
    destroyCharts()

    try {
      students = MentorService.getStudents()
      if (!students || !students.length) { Toast.error('No student data found'); hideSkeletons(); return }

      overview = MentorService.getOverview(students)
      risks = MentorService.detectRisks(students)
      analytics = MentorService.getCohortAnalytics(students)
      insights = MentorService.getInsights(analytics)
      var talent = MentorService.getTopTalent(students)
      var bulk = MentorService.generateBulkActions(students)

      renderOverview()
      renderTable()
      renderCharts()
      renderTalent(talent)
      renderInsights()
      renderRisks()
      renderBulk(bulk)

      // Search and filter listeners
      document.getElementById('md-search').addEventListener('input', window.debouncedRender)
      document.getElementById('md-filter').addEventListener('change', renderTable)

      // Modal close
      document.querySelectorAll('.pr-modal-close, [data-close="student-modal"]').forEach(function (btn) {
        btn.addEventListener('click', function () { closeModal('student-modal') })
      })
      document.getElementById('student-modal').addEventListener('click', function (e) { if (e.target === this) closeModal('student-modal') })

      hideSkeletons()
      Toast.success(students.length + ' students loaded')
    } catch (e) {
      console.error('Mentor dashboard error:', e)
      if (typeof ErrorBoundary !== 'undefined') {
        ErrorBoundary.show({ message: 'Mentor dashboard failed', detail: e.message, retry: renderDashboard, fallback: 'index.html' })
      } else { Toast.error('Render failed: ' + e.message) }
      hideSkeletons()
    }
  }

  /* ===== INIT ===== */
  function init () {
    initTheme(); initSidebar(); initLogout(); initExports()
    document.getElementById('dash-user-name').textContent = 'Dr. Patel'
    document.getElementById('dash-user-role').textContent = 'Mentor'

    setTimeout(renderDashboard, 300)
  }

  document.addEventListener('DOMContentLoaded', init)
})()
