(function () {
  'use strict'

  var CHARTS = {}
  var THEME_CYCLE = ['light', 'dark', 'system']
  var THEME_ICONS = { light: 'fa-solid fa-moon', dark: 'fa-solid fa-sun', system: 'fa-solid fa-circle-half-stroke' }

  /* ===== THEME (3-state, matches login) ===== */
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
      if (typeof Store !== 'undefined') Store.set('theme', mode)
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
      if (chart && chart.options) {
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
        chart.update('none')
      }
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
      if (typeof SessionManager !== 'undefined' && SessionManager) SessionManager.stop()
      var result = await AuthService.logout()
      window.location.href = result.data.redirect || 'login.html'
    })
  }

  /* ===== SKELETON HELPERS ===== */
  function showSkeletons () {
    document.querySelectorAll('[data-skel]').forEach(function (el) {
      el.style.display = ''
    })
  }

  function hideSkeletons () {
    document.querySelectorAll('[data-skel]').forEach(function (el) {
      el.style.display = 'none'
    })
  }

  /* ===== LOAD USER ===== */
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

    var subtitle = document.getElementById('dash-subtitle')
    if (subtitle) subtitle.textContent = 'Welcome back, ' + (user.name || 'there') + '. Here\'s your career snapshot.'

    var streakBadge = document.getElementById('dash-streak-count')
    var streak = Store.get('learningStreak')
    if (streakBadge && streak) streakBadge.textContent = streak.current || 0
  }

  /* ===== MAIN DATA LOAD ===== */
  async function loadDashboard () {
    showSkeletons()

    try {
      var results = await Promise.allSettled([
        AnalyticsService.computeDashboard(),
        CareerService.getRecommendations(),
        RecruiterService.compute(),
        PlacementService.predict(),
        (Store.get('resumeAnalysis') ? Promise.resolve(Store.get('resumeAnalysis')) : ResumeService.analyze('')),
        (function () { var cr = Store.get('careerRecommendations'); var target = cr && cr.topRecommendation ? cr.topRecommendation.id : null; return target ? SkillService.analyzeGap(target) : Promise.resolve(null) })(),
        Store.get('user')?.githubUsername ? GitHubService.fetchProfile(Store.get('user').githubUsername) : Promise.resolve(null)
      ])

      var dashboard = results[0].status === 'fulfilled' ? results[0].value : null
      var career = results[1].status === 'fulfilled' ? results[1].value : null
      var recruiter = results[2].status === 'fulfilled' ? results[2].value : null
      var placement = results[3].status === 'fulfilled' ? results[3].value : null
      var resume = results[4].status === 'fulfilled' ? results[4].value : null
      var skillGap = results[5].status === 'fulfilled' ? results[5].value : null
      var github = results[6].status === 'fulfilled' ? results[6].value : null

      renderKPIs(dashboard, recruiter, placement, resume)
      renderCharts(dashboard, skillGap, placement)
      renderCareerRecommendations(career)
      renderRecruiterView(recruiter)
      renderAchievements()
      renderImprovementEngine(dashboard, career, skillGap, resume)
    } catch (e) {
      console.error('Dashboard load error:', e)
      renderFallback()
    }

    hideSkeletons()
    var refresh = document.getElementById('dash-last-refresh')
    if (refresh) refresh.innerHTML = '<i class="fa-regular fa-clock"></i> Updated ' + new Date().toLocaleTimeString()
  }

  /* ===== FALLBACK IF SERVICES FAIL ===== */
  function renderFallback () {
    var user = Store.get('user')
    var skills = user?.skills || []
    var projects = user?.projects || []
    var certs = user?.certifications || []

    var skillLevels = skills.map(function (s) { return s.level })
    var avgSkill = skillLevels.length ? Math.round(skillLevels.reduce(function (a, b) { return a + b }, 0) / skillLevels.length) : 0

    var demoData = {
      careerReadiness: Math.min(95, avgSkill + 5),
      skillStrength: avgSkill,
      skillCount: skills.length,
      projectsCompleted: projects.filter(function (p) { return p.completed }).length,
      totalProjects: projects.length,
      certificationsCount: certs.length,
      streak: Store.get('learningStreak')?.current || 0
    }

    var history = KPI.loadHistory()

    var kpis = [
      KPI.make({ value: demoData.careerReadiness, label: 'Career Readiness', confidence: 'Medium', explanation: 'Based on ' + demoData.skillCount + ' skills with average proficiency of ' + avgSkill + '%.', suggestions: ['Complete more projects to boost readiness'], historyKey: 'careerReadiness', history7: KPI.getHistory('careerReadiness'), history30: KPI.getHistory('careerReadiness'), factors: [{ name: 'Skills', score: avgSkill, weight: 0.40 }, { name: 'Projects', score: Math.round((demoData.projectsCompleted / Math.max(1, demoData.totalProjects)) * 100), weight: 0.30 }, { name: 'Certifications', score: Math.min(100, certs.length * 25), weight: 0.20 }, { name: 'Resume', score: 72, weight: 0.10 }] }),
      KPI.make({ value: avgSkill, label: 'Skill Strength', confidence: 'Medium', explanation: 'Average across ' + demoData.skillCount + ' tracked skills.', suggestions: ['Focus on your weakest skill categories'], historyKey: 'recruiterScore', history7: KPI.getHistory('recruiterScore'), history30: KPI.getHistory('recruiterScore'), factors: [{ name: 'Technical Skills', score: avgSkill, weight: 0.25 }, { name: 'Projects', score: Math.round((demoData.projectsCompleted / Math.max(1, demoData.totalProjects)) * 100), weight: 0.20 }, { name: 'GitHub', score: 65, weight: 0.15 }, { name: 'Communication', score: 75, weight: 0.15 }, { name: 'Certifications', score: Math.min(100, certs.length * 25), weight: 0.15 }, { name: 'Resume', score: 72, weight: 0.10 }] }),
      KPI.make({ value: demoData.projectsCompleted * 20, label: 'Placement Probability', confidence: 'Low', explanation: demoData.projectsCompleted + ' of ' + demoData.totalProjects + ' projects completed.', suggestions: ['Complete remaining ' + (demoData.totalProjects - demoData.projectsCompleted) + ' project(s)'], historyKey: 'placementProb', history7: KPI.getHistory('placementProb'), history30: KPI.getHistory('placementProb'), factors: [{ name: 'Academics', score: 85, weight: 0.25 }, { name: 'Skills', score: avgSkill, weight: 0.30 }, { name: 'Projects', score: Math.round((demoData.projectsCompleted / Math.max(1, demoData.totalProjects)) * 100), weight: 0.20 }, { name: 'Certifications', score: Math.min(100, certs.length * 25), weight: 0.15 }, { name: 'Soft Skills', score: 75, weight: 0.10 }] }),
      KPI.make({ value: demoData.certificationsCount * 20, label: 'Resume Intelligence', confidence: 'Low', explanation: demoData.certificationsCount + ' certification(s) earned.', suggestions: ['Earn cloud or data science certifications'], historyKey: 'resumeScore', history7: KPI.getHistory('resumeScore'), history30: KPI.getHistory('resumeScore'), factors: [{ name: 'Keywords Match', score: 65, weight: 0.40 }, { name: 'Format Quality', score: 70, weight: 0.25 }, { name: 'Sections', score: 70, weight: 0.20 }, { name: 'Length', score: 80, weight: 0.15 }] })
    ]

    KPI.snapshot({ careerReadiness: demoData.careerReadiness, recruiterScore: avgSkill, placementProb: demoData.projectsCompleted * 20, resumeScore: demoData.certificationsCount * 20, skillStrength: avgSkill })

    var kpiGrid = document.getElementById('kpi-grid')
    kpiGrid.innerHTML = ''
    kpis.forEach(function (kpi) { KPI.renderCard(kpi, kpiGrid) })
    bindKpiDetails(kpis)

    renderFallbackCharts(demoData, skills)
    renderFallbackCareer()
    renderFallbackRecruiter(skills, projects, certs)
    renderAchievements()
    renderFallbackImprovements(skills)
  }

  /* ===== KPI RENDERING with Factors + History ===== */
  function renderKPIs (dashboard, recruiter, placement, resume) {
    var user = Store.get('user') || {}
    var skills = user.skills || []
    var projects = user.projects || []
    var certs = user.certifications || []
    var history = KPI.loadHistory()

    var careerReadiness = dashboard?.careerReadiness || 78
    var recruiterOverall = recruiter?.overall || 72
    var placementProb = placement?.probability || 76
    var resumeScore = resume?.resumeScore || 68

    var avgSkill = skills.length ? Math.round(skills.reduce(function (a, b) { return a + b.level }, 0) / skills.length) : 0
    var projRatio = projects.length ? projects.filter(function (p) { return p.completed }).length / projects.length : 0

    var kpis = [
      KPI.make({
        value: careerReadiness,
        label: 'Career Readiness',
        confidence: dashboard?.confidence || 'Medium',
        historyKey: 'careerReadiness',
        history7: KPI.getHistory('careerReadiness'),
        history30: KPI.getHistory('careerReadiness'),
        explanation: dashboard?.calculation?.steps?.[0] || 'Weighted score across skills, projects, certifications, and resume quality.',
        suggestions: dashboard?.suggestions || ['Strengthen high-weight skills for your target career path'],
        factors: [
          { name: 'Skills', score: avgSkill, weight: 0.40 },
          { name: 'Projects', score: Math.round(projRatio * 100), weight: 0.30 },
          { name: 'Certifications', score: Math.min(100, certs.length * 25), weight: 0.20 },
          { name: 'Resume', score: resumeScore, weight: 0.10 }
        ]
      }),
      KPI.make({
        value: recruiterOverall,
        label: 'Recruiter Readiness',
        confidence: recruiter?.confidence || 'Medium',
        historyKey: 'recruiterScore',
        history7: KPI.getHistory('recruiterScore'),
        history30: KPI.getHistory('recruiterScore'),
        explanation: recruiter?.calculation?.steps?.[0] || '6-factor weighted model: Technical, Projects, GitHub, Communication, Certifications, Resume.',
        suggestions: (recruiter?.suggestions || []).map(function (s) { return s.suggestion || s }),
        factors: [
          { name: 'Technical Skills', score: avgSkill, weight: 0.25 },
          { name: 'Projects', score: Math.round(projRatio * 100), weight: 0.20 },
          { name: 'GitHub', score: 65, weight: 0.15 },
          { name: 'Communication', score: (skills.find(function (s) { return s.name === 'Communication' })?.level) || 70, weight: 0.15 },
          { name: 'Certifications', score: Math.min(100, certs.length * 25), weight: 0.15 },
          { name: 'Resume', score: resumeScore, weight: 0.10 }
        ]
      }),
      KPI.make({
        value: placementProb,
        label: 'Placement Probability',
        confidence: placement?.confidence || 'Medium',
        historyKey: 'placementProb',
        history7: KPI.getHistory('placementProb'),
        history30: KPI.getHistory('placementProb'),
        explanation: placement?.calculation?.steps?.[0] || '5-factor model: Academics, Skills, Projects, Certifications, Soft Skills.',
        suggestions: (placement?.improvements || []).map(function (i) { return i.area + ': ' + (i.suggestions || []).join(', ') }),
        factors: [
          { name: 'Academics (CGPA)', score: Math.min(100, ((user.cgpa || 8.5) / 10) * 100), weight: 0.25 },
          { name: 'Skills', score: avgSkill, weight: 0.30 },
          { name: 'Projects', score: Math.round(projRatio * 100), weight: 0.20 },
          { name: 'Certifications', score: Math.min(100, certs.length * 25), weight: 0.15 },
          { name: 'Soft Skills', score: (skills.find(function (s) { return s.category === 'Soft Skills' })?.level) || 75, weight: 0.10 }
        ]
      }),
      KPI.make({
        value: resumeScore,
        label: 'Resume Intelligence',
        confidence: resume?.confidence || 'Low',
        historyKey: 'resumeScore',
        history7: KPI.getHistory('resumeScore'),
        history30: KPI.getHistory('resumeScore'),
        explanation: resume?.calculation?.steps?.[0] || 'ATS keyword match, format scoring, and section completeness analysis.',
        suggestions: resume?.suggestions || ['Add more industry keywords to improve ATS score'],
        factors: [
          { name: 'Keywords Match', score: resume?.atsScore || 65, weight: 0.40 },
          { name: 'Format Quality', score: resume?.formatScore || 70, weight: 0.25 },
          { name: 'Section Completeness', score: resume?.sections ? Math.round((resume.sections.present.length / Math.max(1, resume.sections.present.length + resume.sections.missing.length)) * 100) : 70, weight: 0.20 },
          { name: 'Length Optimization', score: resume?.lengthScore || 80, weight: 0.15 }
        ]
      })
    ]

    // Snapshot history
    KPI.snapshot({
      careerReadiness: careerReadiness,
      recruiterScore: recruiterOverall,
      placementProb: placementProb,
      resumeScore: resumeScore,
      skillStrength: avgSkill
    })

    var kpiGrid = document.getElementById('kpi-grid')
    kpiGrid.innerHTML = ''
    kpis.forEach(function (kpi) { KPI.renderCard(kpi, kpiGrid) })
    bindKpiDetails(kpis)
  }

  function bindKpiDetails (kpis) {
    document.querySelectorAll('.kpi-details-btn').forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        var kpi = kpis[i]
        if (!kpi) return
        openDrawer(kpi.label, kpi)
      })
    })
  }

  /* ===== CHARTS ===== */
  function renderCharts (dashboard, skillGap, placement) {
    var ctxRadar = document.getElementById('chart-radar')
    var ctxBar = document.getElementById('chart-bar')
    var ctxDoughnut = document.getElementById('chart-doughnut')
    var ctxGauge = document.getElementById('chart-gauge')

    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var textColor = isDark ? '#94A3B8' : '#64748B'
    var gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    // Skill Radar
    if (ctxRadar) {
      var userSkills = Store.get('user')?.skills || []
      var categories = {}
      userSkills.forEach(function (s) {
        var cat = s.category || 'Other'
        if (!categories[cat]) categories[cat] = []
        categories[cat].push(s.level)
      })
      var radarLabels = Object.keys(categories).slice(0, 8)
      var radarData = radarLabels.map(function (k) {
        var vals = categories[k]
        return Math.round(vals.reduce(function (a, b) { return a + b }, 0) / vals.length)
      })

      if (CHARTS.radar) CHARTS.radar.destroy()
      CHARTS.radar = new Chart(ctxRadar, {
        type: 'radar',
        data: {
          labels: radarLabels,
          datasets: [{
            label: 'Proficiency',
            data: radarData,
            backgroundColor: isDark ? 'rgba(129,140,248,0.2)' : 'rgba(79,70,229,0.15)',
            borderColor: isDark ? '#818CF8' : '#4F46E5',
            borderWidth: 2,
            pointBackgroundColor: isDark ? '#818CF8' : '#4F46E5',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { r: { min: 0, max: 100, ticks: { color: textColor, backdropColor: 'transparent' }, grid: { color: gridColor }, pointLabels: { color: textColor, font: { size: 11 } } } },
          plugins: { legend: { display: false } }
        }
      })
    }

    // Weekly Bar
    if (ctxBar) {
      var weekly = dashboard?.weeklyActivity || []
      var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      var barData = days.map(function (d, i) {
        var found = weekly[i]
        return found ? (found.learning || 0) + (found.projects || 0) : Math.floor(Math.random() * 5)
      })

      if (CHARTS.bar) CHARTS.bar.destroy()
      CHARTS.bar = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'Hours',
            data: barData,
            backgroundColor: isDark ? 'rgba(129,140,248,0.6)' : 'rgba(79,70,229,0.6)',
            borderColor: isDark ? '#818CF8' : '#4F46E5',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
            x: { ticks: { color: textColor }, grid: { display: false } }
          },
          plugins: { legend: { display: false } }
        }
      })
    }

    // Doughnut
    if (ctxDoughnut) {
      var userSkills2 = Store.get('user')?.skills || []
      var catMap = {}
      userSkills2.forEach(function (s) {
        var cat = s.category || 'Other'
        catMap[cat] = (catMap[cat] || 0) + 1
      })
      var doughnutLabels = Object.keys(catMap).slice(0, 6)
      var doughnutData = doughnutLabels.map(function (k) { return catMap[k] })
      var doughnutColors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

      if (CHARTS.doughnut) CHARTS.doughnut.destroy()
      CHARTS.doughnut = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
          labels: doughnutLabels,
          datasets: [{
            data: doughnutData,
            backgroundColor: doughnutColors.slice(0, doughnutLabels.length),
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 }, padding: 12 } }
          }
        }
      })
    }

    // Gauge (using a doughnut with custom cutout + needle)
    if (ctxGauge) {
      var gaugeVal = placement?.probability || 76
      var gaugeColor = gaugeVal >= 80 ? '#10B981' : gaugeVal >= 60 ? '#F59E0B' : '#EF4444'

      if (CHARTS.gauge) CHARTS.gauge.destroy()
      CHARTS.gauge = new Chart(ctxGauge, {
        type: 'doughnut',
        data: {
          labels: ['Probability', 'Remaining'],
          datasets: [{
            data: [gaugeVal, 100 - gaugeVal],
            backgroundColor: [gaugeColor, gridColor],
            borderWidth: 0,
            circumference: 270,
            rotation: 225
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: function (ctx) { return ctx.parsed + '%' } } }
          }
        }
      })

      var gaugeContainer = document.getElementById('chart-gauge-container')
      if (gaugeContainer) {
        var existing = gaugeContainer.querySelector('.gauge-center')
        if (existing) existing.remove()
        var center = document.createElement('div')
        center.className = 'gauge-center'
        center.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-55%);text-align:center'
        center.innerHTML = '<span style="font-size:2rem;font-weight:700;color:' + gaugeColor + '">' + gaugeVal + '%</span><br><span style="font-size:0.75rem;color:' + textColor + '">Placement</span>'
        gaugeContainer.querySelector('.chart-wrapper')?.appendChild(center)
      }
    }
  }

  function renderFallbackCharts (demoData, skills) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var textColor = isDark ? '#94A3B8' : '#64748B'
    var gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

    // Radar from skills
    var ctxRadar = document.getElementById('chart-radar')
    if (ctxRadar) {
      var cats = {}
      skills.forEach(function (s) {
        var c = s.category || 'Other'
        if (!cats[c]) cats[c] = []
        cats[c].push(s.level)
      })
      var radarLabels = Object.keys(cats).slice(0, 8)
      var radarData = radarLabels.map(function (k) { return Math.round(cats[k].reduce(function (a, b) { return a + b }, 0) / cats[k].length) })

      if (CHARTS.radar) CHARTS.radar.destroy()
      CHARTS.radar = new Chart(ctxRadar, {
        type: 'radar',
        data: {
          labels: radarLabels,
          datasets: [{ label: 'Proficiency', data: radarData, backgroundColor: 'rgba(79,70,229,0.15)', borderColor: '#4F46E5', borderWidth: 2, pointBackgroundColor: '#4F46E5', pointRadius: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { color: textColor, backdropColor: 'transparent' }, grid: { color: gridColor }, pointLabels: { color: textColor, font: { size: 11 } } } }, plugins: { legend: { display: false } } }
      })
    }

    // Bar from random weekly
    var ctxBar = document.getElementById('chart-bar')
    if (ctxBar) {
      if (CHARTS.bar) CHARTS.bar.destroy()
      CHARTS.bar = new Chart(ctxBar, {
        type: 'bar',
        data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ label: 'Hours', data: [3, 5, 2, 6, 4, 1, 2], backgroundColor: 'rgba(79,70,229,0.6)', borderColor: '#4F46E5', borderWidth: 1, borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }, x: { ticks: { color: textColor }, grid: { display: false } } }, plugins: { legend: { display: false } } }
      })
    }

    // Doughnut
    var ctxDoughnut = document.getElementById('chart-doughnut')
    if (ctxDoughnut) {
      var catMap = {}
      skills.forEach(function (s) {
        var c = s.category || 'Other'
        catMap[c] = (catMap[c] || 0) + 1
      })
      var doughnutLabels = Object.keys(catMap).slice(0, 6)
      var doughnutData = doughnutLabels.map(function (k) { return catMap[k] })

      if (CHARTS.doughnut) CHARTS.doughnut.destroy()
      CHARTS.doughnut = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: { labels: doughnutLabels, datasets: [{ data: doughnutData, backgroundColor: ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 }, padding: 12 } } } }
      })
    }

    // Gauge
    var ctxGauge = document.getElementById('chart-gauge')
    if (ctxGauge) {
      var gaugeVal = demoData.careerReadiness || 76
      var gaugeColor = gaugeVal >= 80 ? '#10B981' : gaugeVal >= 60 ? '#F59E0B' : '#EF4444'

      if (CHARTS.gauge) CHARTS.gauge.destroy()
      CHARTS.gauge = new Chart(ctxGauge, {
        type: 'doughnut',
        data: { labels: ['Score', 'Remaining'], datasets: [{ data: [gaugeVal, 100 - gaugeVal], backgroundColor: [gaugeColor, gridColor], borderWidth: 0, circumference: 270, rotation: 225 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return ctx.parsed + '%' } } } } }
      })
    }
  }

  /* ===== CAREER RECOMMENDATIONS ===== */
  function renderCareerRecommendations (career) {
    var grid = document.getElementById('career-grid')
    if (!grid) return

    var recs = career?.recommendations || []
    var top3 = recs.slice(0, 3)

    if (!top3.length) {
      renderFallbackCareer()
      return
    }

    grid.innerHTML = ''
    top3.forEach(function (rec) {
      var matchClass = rec.matchPercentage >= 70 ? 'high' : rec.matchPercentage >= 50 ? 'med' : 'low'
      var missingSkills = (rec.requiredSkills || []).filter(function (s) { return !s.acquired })

      var card = document.createElement('div')
      card.className = 'career-card'
      card.innerHTML =
        '<div class="career-card-header">' +
          '<h3 class="career-card-title">' + rec.title + '</h3>' +
          '<div class="career-card-match"><span class="career-match-value ' + matchClass + '">' + rec.matchPercentage + '%</span><span class="career-match-label">Match</span></div>' +
        '</div>' +
        '<div class="career-card-details">' +
          '<div class="career-detail-item"><span class="career-detail-label">Salary</span><span class="career-detail-value">₹' + ((rec.salaryRange?.min || 0) / 100000).toFixed(1) + 'L - ₹' + ((rec.salaryRange?.max || 0) / 100000).toFixed(1) + 'L</span></div>' +
          '<div class="career-detail-item"><span class="career-detail-label">Demand</span><span class="career-detail-value">' + (rec.demandLevel || 'Moderate') + '</span></div>' +
          '<div class="career-detail-item"><span class="career-detail-label">Difficulty</span><span class="career-detail-value">' + (rec.difficulty?.label || 'Medium') + '</span></div>' +
          '<div class="career-detail-item"><span class="career-detail-label">Skills Gap</span><span class="career-detail-value">' + missingSkills.length + ' missing</span></div>' +
        '</div>' +
        (missingSkills.length ? '<div class="career-card-skills">' + missingSkills.slice(0, 4).map(function (s) { return '<span class="career-skill-chip missing">' + s.name + '</span>' }).join('') + (missingSkills.length > 4 ? '<span class="career-skill-chip">+' + (missingSkills.length - 4) + '</span>' : '') + '</div>' : '')
      grid.appendChild(card)
    })
  }

  function renderFallbackCareer () {
    var grid = document.getElementById('career-grid')
    if (!grid) return

    var fallbackRecs = [
      { title: 'Data Scientist', matchPercentage: 78, salaryRange: { min: 800, max: 2500 }, demandLevel: 'Very High', difficulty: { label: 'Hard' }, requiredSkills: [{ name: 'Deep Learning', acquired: false }, { name: 'TensorFlow', acquired: false }, { name: 'Statistics', acquired: false }] },
      { title: 'Full Stack Developer', matchPercentage: 72, salaryRange: { min: 600, max: 1800 }, demandLevel: 'High', difficulty: { label: 'Medium' }, requiredSkills: [{ name: 'DevOps', acquired: false }, { name: 'System Design', acquired: false }] },
      { title: 'AI Engineer', matchPercentage: 65, salaryRange: { min: 1000, max: 3000 }, demandLevel: 'Very High', difficulty: { label: 'Hard' }, requiredSkills: [{ name: 'MLOps', acquired: false }, { name: 'PyTorch', acquired: false }, { name: 'Kubernetes', acquired: false }] }
    ]

    grid.innerHTML = ''
    fallbackRecs.forEach(function (rec) {
      var matchClass = rec.matchPercentage >= 70 ? 'high' : 'med'
      var missing = rec.requiredSkills || []
      var card = document.createElement('div')
      card.className = 'career-card'
      card.innerHTML =
        '<div class="career-card-header">' +
          '<h3 class="career-card-title">' + rec.title + '</h3>' +
          '<div class="career-card-match"><span class="career-match-value ' + matchClass + '">' + rec.matchPercentage + '%</span><span class="career-match-label">Match</span></div>' +
        '</div>' +
        '<div class="career-card-details">' +
          '<div class="career-detail-item"><span class="career-detail-label">Salary</span><span class="career-detail-value">₹' + rec.salaryRange.min + 'K - ₹' + rec.salaryRange.max + 'K</span></div>' +
          '<div class="career-detail-item"><span class="career-detail-label">Demand</span><span class="career-detail-value">' + rec.demandLevel + '</span></div>' +
          '<div class="career-detail-item"><span class="career-detail-label">Difficulty</span><span class="career-detail-value">' + rec.difficulty.label + '</span></div>' +
          '<div class="career-detail-item"><span class="career-detail-label">Skills Gap</span><span class="career-detail-value">' + missing.length + ' missing</span></div>' +
        '</div>' +
        (missing.length ? '<div class="career-card-skills">' + missing.slice(0, 4).map(function (s) { return '<span class="career-skill-chip missing">' + s.name + '</span>' }).join('') + '</div>' : '')
      grid.appendChild(card)
    })
  }

  /* ===== RECRUITER VIEW ===== */
  function renderRecruiterView (recruiter) {
    var grid = document.getElementById('recruiter-grid')
    var badge = document.getElementById('recruiter-overall-badge')
    if (!grid) return

    var breakdown = recruiter?.breakdown || []
    if (!breakdown.length) {
      renderFallbackRecruiter()
      return
    }

    if (badge) badge.textContent = 'Overall: ' + (recruiter.overall || 0) + '/100'

    grid.innerHTML = ''
    breakdown.forEach(function (item) {
      var color = item.score >= 80 ? 'var(--success)' : item.score >= 60 ? 'var(--warning)' : 'var(--error)'
      var card = document.createElement('div')
      card.className = 'recruiter-card'
      card.innerHTML =
        '<div class="recruiter-card-header">' +
          '<h4 class="recruiter-card-name">' + (item.name || 'Metric') + '</h4>' +
          '<span class="recruiter-card-score" style="color:' + color + '">' + Math.round(item.score) + '</span>' +
        '</div>' +
        '<div class="recruiter-card-bar"><div class="recruiter-card-fill" style="width:' + item.score + '%;background:' + color + '"></div></div>' +
        '<p class="recruiter-card-explanation">' + (item.explanation || 'Score computed from available data.') + '</p>'
      grid.appendChild(card)
    })
  }

  function renderFallbackRecruiter (skills, projects, certs) {
    var grid = document.getElementById('recruiter-grid')
    var badge = document.getElementById('recruiter-overall-badge')
    if (!grid) return

    skills = skills || Store.get('user')?.skills || []
    projects = projects || Store.get('user')?.projects || []
    certs = certs || Store.get('user')?.certifications || []

    var techSkills = skills.filter(function (s) { return s.category !== 'Soft Skills' })
    var avgTech = techSkills.length ? Math.round(techSkills.reduce(function (a, b) { return a + b.level }, 0) / techSkills.length) : 50
    var projScore = Math.min(95, (projects.filter(function (p) { return p.completed }).length / Math.max(1, projects.length)) * 100)
    var githubScore = 65
    var commScore = (skills.find(function (s) { return s.name === 'Communication' })?.level) || 70
    var certScore = Math.min(100, certs.length * 25)
    var resumeScore = 72

    var overall = Math.round((avgTech + projScore + githubScore + commScore + certScore + resumeScore) / 6)
    if (badge) badge.textContent = 'Overall: ' + overall + '/100'

    var metrics = [
      { name: 'Technical Skills', score: avgTech, color: avgTech >= 80 ? 'var(--success)' : avgTech >= 60 ? 'var(--warning)' : 'var(--error)', explanation: 'Average of ' + techSkills.length + ' technical skills.' },
      { name: 'Projects', score: projScore, color: projScore >= 80 ? 'var(--success)' : projScore >= 60 ? 'var(--warning)' : 'var(--error)', explanation: projects.length + ' projects, ' + projects.filter(function (p) { return p.completed }).length + ' completed.' },
      { name: 'GitHub', score: githubScore, color: githubScore >= 80 ? 'var(--success)' : githubScore >= 60 ? 'var(--warning)' : 'var(--error)', explanation: 'Based on public repos, stars, and contribution activity.' },
      { name: 'Communication', score: commScore, color: commScore >= 80 ? 'var(--success)' : commScore >= 60 ? 'var(--warning)' : 'var(--error)', explanation: 'Derived from soft skills assessment.' },
      { name: 'Certifications', score: certScore, color: certScore >= 80 ? 'var(--success)' : certScore >= 60 ? 'var(--warning)' : 'var(--error)', explanation: certs.length + ' certification(s) earned across relevant domains.' },
      { name: 'Resume', score: resumeScore, color: resumeScore >= 80 ? 'var(--success)' : resumeScore >= 60 ? 'var(--warning)' : 'var(--error)', explanation: 'ATS keyword match, format, and section completeness.' }
    ]

    grid.innerHTML = ''
    metrics.forEach(function (m) {
      var card = document.createElement('div')
      card.className = 'recruiter-card'
      card.innerHTML =
        '<div class="recruiter-card-header">' +
          '<h4 class="recruiter-card-name">' + m.name + '</h4>' +
          '<span class="recruiter-card-score" style="color:' + m.color + '">' + Math.round(m.score) + '</span>' +
        '</div>' +
        '<div class="recruiter-card-bar"><div class="recruiter-card-fill" style="width:' + m.score + '%;background:' + m.color + '"></div></div>' +
        '<p class="recruiter-card-explanation">' + m.explanation + '</p>'
      grid.appendChild(card)
    })
  }

  /* ===== ACHIEVEMENTS ===== */
  function renderAchievements () {
    var row = document.getElementById('achievement-row')
    if (!row) return

    var streak = Store.get('learningStreak') || { current: 0, longest: 0 }
    var badges = Store.get('user')?.badges || []
    var badgesMeta = BadgeDefinitions || []

    var badgesEarned = badges.length
    var badgesTotal = badgesMeta.length || 15
    var completionPct = Math.min(100, Math.round((badgesEarned / Math.max(1, badgesTotal)) * 100))

    var totalSkills = 16
    var level = streak.current >= 20 ? 'Advanced' : streak.current >= 10 ? 'Intermediate' : streak.current >= 5 ? 'Regular' : 'Beginner'
    var levelPct = Math.min(100, Math.round((streak.current / 30) * 100))

    row.innerHTML =
      '<div class="achievement-card">' +
        '<div class="achievement-icon streak"><i class="fa-solid fa-fire"></i></div>' +
        '<div class="achievement-body">' +
          '<h4>Learning Streak</h4>' +
          '<p>' + streak.current + ' days (longest: ' + streak.longest + ')</p>' +
          '<div class="achievement-progress"><div class="achievement-progress-fill" style="width:' + Math.min(100, streak.current * 3.3) + '%"></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="achievement-card">' +
        '<div class="achievement-icon badges"><i class="fa-solid fa-trophy"></i></div>' +
        '<div class="achievement-body">' +
          '<h4>Badges Earned</h4>' +
          '<p>' + badgesEarned + ' of ' + badgesTotal + ' (' + completionPct + '%)</p>' +
          '<div class="achievement-progress"><div class="achievement-progress-fill" style="width:' + completionPct + '%"></div></div>' +
        '</div>' +
      '</div>' +
      '<div class="achievement-card">' +
        '<div class="achievement-icon level"><i class="fa-solid fa-signal"></i></div>' +
        '<div class="achievement-body">' +
          '<h4>Progress Level</h4>' +
          '<p>' + level + ' — ' + streak.current + '/30 days this month</p>' +
          '<div class="achievement-progress"><div class="achievement-progress-fill" style="width:' + levelPct + '%"></div></div>' +
        '</div>' +
      '</div>'
  }

  /* ===== IMPROVEMENT ENGINE ===== */
  function renderImprovementEngine (dashboard, career, skillGap, resume) {
    var grid = document.getElementById('improve-grid')
    var badge = document.getElementById('improve-potential')
    if (!grid) return

    var improvements = []

    // From skill gap
    if (skillGap && skillGap.missingSkills) {
      skillGap.missingSkills.slice(0, 3).forEach(function (ms) {
        var hours = ms.estimatedHours || 20
        var gain = Math.min(15, Math.round(hours / 5))
        improvements.push({
          title: 'Learn ' + ms.name,
          description: 'Estimated ' + hours + ' hours to reach required proficiency. Fills a critical gap for your target career path.',
          gain: gain,
          detail: 'Missing skill with weight ' + (ms.weight || 1) + ' in your target role.'
        })
      })
    }

    // From resume
    if (resume && resume.suggestions) {
      resume.suggestions.slice(0, 2).forEach(function (s) {
        improvements.push({
          title: s.length > 40 ? s.slice(0, 40) + '...' : s,
          description: 'Improve your resume\'s ATS score and recruiter appeal.',
          gain: 7,
          detail: s
        })
      })
    }

    // From career recommendations
    if (career && career.recommendations) {
      var topRec = career.recommendations[0]
      if (topRec && topRec.requiredSkills) {
        var missing = topRec.requiredSkills.filter(function (s) { return !s.acquired })
        if (missing.length && improvements.length < 3) {
          improvements.push({
            title: 'Add ' + missing[0].name + ' for ' + topRec.title,
            description: 'This is the highest-impact missing skill for your top career match (' + topRec.matchPercentage + '% match).',
            gain: 10,
            detail: 'Required for ' + topRec.title + ' role with ' + topRec.demandLevel + ' demand.'
          })
        }
      }
    }

    // Fallback from user data
    if (!improvements.length) {
      var userSkills = Store.get('user')?.skills || []
      var lowest = userSkills.slice().sort(function (a, b) { return a.level - b.level }).slice(0, 3)
      lowest.forEach(function (s) {
        improvements.push({
          title: 'Strengthen ' + s.name,
          description: 'Currently at ' + s.level + '% proficiency. Improving this will boost your overall skill strength.',
          gain: s.level < 40 ? 12 : s.level < 60 ? 8 : 5,
          detail: s.name + ' is in the ' + (s.category || 'General') + ' category.'
        })
      })
    }

    var totalGain = improvements.reduce(function (sum, imp) { return sum + (imp.gain || 0) }, 0)
    if (badge) badge.textContent = '+' + totalGain + ' potential'

    grid.innerHTML = ''
    improvements.slice(0, 3).forEach(function (imp, idx) {
      var card = document.createElement('div')
      card.className = 'improve-card'
      card.setAttribute('data-rank', (idx + 1).toString())
      card.innerHTML =
        '<h4 class="improve-card-title">' + imp.title + '</h4>' +
        '<p class="improve-card-desc">' + imp.description + '</p>' +
        '<span class="improve-card-gain"><i class="fa-solid fa-arrow-up"></i> +' + imp.gain + ' points</span>'
      grid.appendChild(card)
    })
  }

  function renderFallbackImprovements (skills) {
    var grid = document.getElementById('improve-grid')
    var badge = document.getElementById('improve-potential')
    if (!grid) return

    skills = skills || Store.get('user')?.skills || []
    var lowest = skills.slice().sort(function (a, b) { return a.level - b.level }).slice(0, 3)
    var improvements = lowest.map(function (s) {
      var gain = s.level < 40 ? 12 : s.level < 60 ? 8 : 5
      return { title: 'Strengthen ' + s.name, description: 'Currently at ' + s.level + '% proficiency.', gain: gain }
    })

    var totalGain = improvements.reduce(function (s, i) { return s + i.gain }, 0)
    if (badge) badge.textContent = '+' + totalGain + ' potential'

    grid.innerHTML = ''
    improvements.forEach(function (imp, idx) {
      var card = document.createElement('div')
      card.className = 'improve-card'
      card.setAttribute('data-rank', (idx + 1).toString())
      card.innerHTML = '<h4 class="improve-card-title">' + imp.title + '</h4><p class="improve-card-desc">' + imp.description + '</p><span class="improve-card-gain"><i class="fa-solid fa-arrow-up"></i> +' + imp.gain + ' points</span>'
      grid.appendChild(card)
    })
  }

  /* ===== KPI DETAIL DRAWER (enhanced with factors + history) ===== */
  function openDrawer (title, kpi) {
    var backdrop = document.getElementById('kpi-drawer-backdrop')
    var drawer = document.getElementById('kpi-drawer')
    var drawerTitle = document.getElementById('drawer-title')
    var drawerBody = document.getElementById('drawer-body')
    var closeBtn = document.getElementById('drawer-close')

    if (!drawer || !drawerBody) return

    drawerTitle.textContent = title + ' — Detailed Breakdown'

    var html = ''
    html += '<div class="drawer-section"><h4 class="drawer-section-title">Score</h4><p class="drawer-text" style="font-size:2rem;font-weight:700;color:var(--primary)">' + kpi.value + '/100</p></div>'

    // Weighted score if factors exist
    if (kpi.weightedScore != null) {
      html += '<div class="drawer-section"><h4 class="drawer-section-title">Weighted Calculation</h4><p class="drawer-text">Final Weighted Score: <strong>' + kpi.weightedScore + '</strong></p></div>'
    }

    // Factor breakdown table
    if (kpi.factors && kpi.factors.length) {
      html += '<div class="drawer-section"><h4 class="drawer-section-title">How Calculated — Factor Breakdown</h4>'
      html += '<div class="drawer-factors">'
      html += '<div class="drawer-factor-header"><span>Factor</span><span>Weight</span><span>Score</span><span>Contribution</span></div>'
      kpi.factors.forEach(function (f) {
        var contrib = Math.round(f.score * f.weight)
        html += '<div class="drawer-factor-row">' +
          '<span class="drawer-factor-name">' + f.name + '</span>' +
          '<span class="drawer-factor-weight">' + Math.round(f.weight * 100) + '%</span>' +
          '<span class="drawer-factor-score">' + f.score + '</span>' +
          '<span class="drawer-factor-contrib">' + contrib + '</span>' +
        '</div>'
      })
      html += '</div>'
      html += '<p class="drawer-text" style="margin-top:var(--space-2);font-size:11px">Final = &Sigma;(Score × Weight). If factors don\'t sum to the overall score, additional normalization is applied.</p>'
      html += '</div>'
    }

    // History trend
    if (kpi.history7 && kpi.history7.length > 1) {
      html += '<div class="drawer-section"><h4 class="drawer-section-title">7-Day History</h4><div class="drawer-history-bars">'
      kpi.history7.forEach(function (h) {
        var day = h.date ? h.date.slice(5) : '?'
        var val = h.value
        var barHeight = Math.max(4, val || 0)
        html += '<div class="drawer-history-bar-item"><div class="drawer-history-bar" style="height:' + barHeight + 'px" title="' + day + ': ' + val + '"></div><span class="drawer-history-label">' + day + '</span></div>'
      })
      html += '</div></div>'
    }

    if (kpi.history30 && kpi.history30.length > 1) {
      html += '<div class="drawer-section"><h4 class="drawer-section-title">30-Day Trend</h4><p class="drawer-text">' + kpi.history30.length + ' data points recorded over the past month.</p></div>'
    }

    html += '<div class="drawer-section"><h4 class="drawer-section-title">Confidence</h4><p class="drawer-text">' + kpi.confidence + '</p></div>'

    if (kpi.trend) {
      html += '<div class="drawer-section"><h4 class="drawer-section-title">Trend (' + (kpi.trend.period || '7d') + ')</h4><p class="drawer-text">' + kpi.trend.display + ' (' + kpi.trend.direction + ')' + (kpi.trend.dataPoints ? ' based on ' + kpi.trend.dataPoints + ' data points' : '') + '</p></div>'
    }

    html += '<div class="drawer-section"><h4 class="drawer-section-title">Explanation</h4><p class="drawer-text">' + kpi.explanation + '</p></div>'

    if (kpi.suggestions && kpi.suggestions.length) {
      html += '<div class="drawer-section"><h4 class="drawer-section-title">Suggestions</h4>'
      kpi.suggestions.forEach(function (s) {
        html += '<div class="drawer-suggestion"><i class="fa-solid fa-lightbulb"></i> ' + s + '</div>'
      })
      html += '</div>'
    }

    html += '<div class="drawer-section"><h4 class="drawer-section-title">Last Updated</h4><p class="drawer-text">' + new Date(kpi.updatedAt).toLocaleString() + '</p></div>'

    drawerBody.innerHTML = html

    if (backdrop) backdrop.classList.remove('hidden')
    drawer.classList.add('open')
    document.body.style.overflow = 'hidden'

    function closeDrawer () {
      drawer.classList.remove('open')
      if (backdrop) backdrop.classList.add('hidden')
      document.body.style.overflow = ''
    }

    closeBtn?.addEventListener('click', closeDrawer, { once: true })
    backdrop?.addEventListener('click', closeDrawer, { once: true })

    document.addEventListener('keydown', function handler (e) {
      if (e.key === 'Escape') { closeDrawer(); document.removeEventListener('keydown', handler) }
    })
  }

  /* ===== PDF EXPORT ===== */
  function initExport () {
    var btn = document.getElementById('dash-export-btn')
    if (!btn) return
    btn.addEventListener('click', function () {
      exportCareerReport()
    })
  }

  function exportCareerReport () {
    var user = Store.get('user') || {}
    var kpiCards = document.querySelectorAll('.kpi-card')
    var data = []
    kpiCards.forEach(function (card) {
      var label = card.querySelector('.kpi-label')?.textContent || ''
      var value = card.querySelector('.kpi-value')?.textContent || ''
      var trend = card.querySelector('.kpi-trend')?.textContent || ''
      var expl = card.querySelector('.kpi-explanation')?.textContent || ''
      data.push({ label: label, value: value, trend: trend, explanation: expl })
    })

    var careerCards = document.querySelectorAll('.career-card')
    var careers = []
    careerCards.forEach(function (card) {
      var title = card.querySelector('.career-card-title')?.textContent || ''
      var match = card.querySelector('.career-match-value')?.textContent || ''
      careers.push({ title: title, match: match })
    })

    var recCards = document.querySelectorAll('.recruiter-card')
    var recScores = []
    recCards.forEach(function (card) {
      var name = card.querySelector('.recruiter-card-name')?.textContent || ''
      var score = card.querySelector('.recruiter-card-score')?.textContent || ''
      recScores.push({ name: name, score: score })
    })

    var improveCards = document.querySelectorAll('.improve-card')
    var improves = []
    improveCards.forEach(function (card) {
      var title = card.querySelector('.improve-card-title')?.textContent || ''
      var gain = card.querySelector('.improve-card-gain')?.textContent || ''
      improves.push({ title: title, gain: gain })
    })

    var streak = Store.get('learningStreak') || {}
    var win = window.open('', '_blank')
    if (!win) {
      Toast.error('Please allow popups for PDF export')
      return
    }

    win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SkillPilot AI — Career Report</title>')
    win.document.write('<style>')
    win.document.write('body{font-family:Inter,sans-serif;padding:40px;color:#1E293B;max-width:900px;margin:0 auto}')
    win.document.write('h1{font-size:28px;color:#4F46E5;margin-bottom:4px}')
    win.document.write('h2{font-size:18px;color:#1E293B;border-bottom:2px solid #E2E8F0;padding-bottom:8px;margin-top:32px}')
    win.document.write('.sub{color:#64748B;font-size:14px;margin-bottom:24px}')
    win.document.write('.kpi-table{width:100%;border-collapse:collapse;margin-bottom:24px}')
    win.document.write('.kpi-table th{background:#F1F5F9;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748B}')
    win.document.write('.kpi-table td{padding:10px 12px;border-bottom:1px solid #E2E8F0;font-size:14px}')
    win.document.write('.kpi-table tr:last-child td{border-bottom:none}')
    win.document.write('.section{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin-bottom:16px}')
    win.document.write('.section h3{margin:0 0 4px;font-size:15px}')
    win.document.write('.section p{margin:0;color:#64748B;font-size:13px}')
    win.document.write('.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}')
    win.document.write('.badge{display:inline-block;background:#EEF2FF;color:#4F46E5;padding:2px 10px;border-radius:4px;font-size:12px;font-weight:600}')
    win.document.write('.footer{margin-top:32px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:12px;color:#94A3B8;text-align:center}')
    win.document.write('@media print{body{padding:20px}}')
    win.document.write('</style></head><body>')
    win.document.write('<h1>SkillPilot AI — Career Report</h1>')
    win.document.write('<p class="sub">Generated for ' + (user.name || 'User') + ' &middot; ' + new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>')

    win.document.write('<h2>Performance Overview</h2>')
    win.document.write('<table class="kpi-table"><thead><tr><th>Metric</th><th>Score</th><th>Trend</th><th>Explanation</th></tr></thead><tbody>')
    data.forEach(function (d) {
      win.document.write('<tr><td><strong>' + d.label + '</strong></td><td>' + d.value + '</td><td>' + d.trend + '</td><td style="font-size:12px;color:#64748B">' + d.explanation + '</td></tr>')
    })
    win.document.write('</tbody></table>')

    win.document.write('<h2>Recruiter View</h2>')
    win.document.write('<div class="grid-2">')
    recScores.forEach(function (r) {
      win.document.write('<div class="section"><h3>' + r.name + '</h3><p style="font-size:24px;font-weight:700;color:#4F46E5;margin-top:4px">' + r.score + '</p></div>')
    })
    win.document.write('</div>')

    win.document.write('<h2>Career Recommendations</h2>')
    careers.forEach(function (c) {
      win.document.write('<div class="section"><h3>' + c.title + ' <span class="badge">' + c.match + '</span></h3></div>')
    })

    win.document.write('<h2>Improvement Actions</h2>')
    improves.forEach(function (imp) {
      win.document.write('<div class="section"><h3>' + imp.title + '</h3><p>' + imp.gain + '</p></div>')
    })

    win.document.write('<h2>Learning Activity</h2>')
    win.document.write('<div class="section"><h3>Learning Streak</h3><p>' + (streak.current || 0) + ' days (longest: ' + (streak.longest || 0) + ')</p></div>')

    win.document.write('<div class="footer">Generated by SkillPilot AI &middot; Data from demo profile &middot; Scores are algorithmic estimates based on profile data</div>')
    win.document.write('</body></html>')
    win.document.close()

    setTimeout(function () {
      win.focus()
      win.print()
      win.onafterprint = function () { win.close() }
    }, 500)
  }

  /* ===== REFRESH ===== */
  function initRefresh () {
    var btn = document.getElementById('dash-refresh-btn')
    if (!btn) return
    btn.addEventListener('click', async function () {
      btn.classList.add('spinning')
      await loadDashboard()
      btn.classList.remove('spinning')
    })
  }

  /* ===== INIT ===== */
  function init () {
    initTheme()
    initSidebar()
    initLogout()
    initExport()
    initRefresh()
    loadUser()
    loadDashboard()
    if (typeof SessionManager !== 'undefined' && SessionManager) SessionManager.start()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
