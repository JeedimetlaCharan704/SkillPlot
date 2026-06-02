(function () {
  'use strict'

  var THEME_CYCLE = ['light', 'dark', 'system']
  var THEME_ICONS = { light: 'fa-solid fa-moon', dark: 'fa-solid fa-sun', system: 'fa-solid fa-circle-half-stroke' }
  var editContext = null

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
  function showRoot () { var el = document.getElementById('pr-root'); if (el) el.style.display = 'grid' }

  /* ===== MODAL HELPERS ===== */
  function openModal (id) { var m = document.getElementById(id); if (m) { m.classList.add('open'); m.setAttribute('aria-hidden', 'false') } }
  function closeModal (id) { var m = document.getElementById(id); if (m) { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true') } }

  function initModals () {
    document.querySelectorAll('.pr-modal-close, [data-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = this.getAttribute('data-close')
        if (target) closeModal(target)
      })
    })
    document.querySelectorAll('.pr-modal-overlay').forEach(function (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === this) closeModal(this.id)
      })
    })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.pr-modal-overlay.open').forEach(function (m) { closeModal(m.id) })
      }
    })
  }

  /* ===== RENDER: Profile Card ===== */
  function renderProfile (profile) {
    var u = profile.user
    var av = document.getElementById('pr-avatar')
    if (av) {
      var parts = (u.name || 'US').split(' ')
      av.textContent = (parts[0][0] || '') + (parts[1] ? parts[1][0] : parts[0][1] || '')
    }
    setText('pr-name', u.name || 'User')
    setText('pr-roll', u.rollNo || '')
    setText('pr-bio', u.bio || '')

    var contact = document.getElementById('pr-contact')
    if (!contact) return
    contact.innerHTML = ''
    var items = [
      { icon: 'fa-solid fa-envelope', text: u.email || '' },
      { icon: 'fa-solid fa-phone', text: u.phone || '' },
      { icon: 'fa-solid fa-location-dot', text: u.location || '' }
    ]
    items.forEach(function (item) {
      if (item.text) {
        var div = document.createElement('div')
        div.className = 'pr-contact-item'
        div.innerHTML = '<i class="' + item.icon + '"></i><span>' + item.text + '</span>'
        contact.appendChild(div)
      }
    })
  }

  /* ===== RENDER: Strength ===== */
  function renderStrength (profile) {
    var strength = ProfileService.calculateStrength(profile)
    var val = document.getElementById('pr-strength-val')
    var conf = document.getElementById('pr-strength-conf')
    var fill = document.getElementById('pr-strength-fill')
    var sec = document.getElementById('pr-strength-sections')

    if (val) val.textContent = strength.strength + '%'
    if (conf) conf.textContent = 'Confidence: ' + strength.confidence + ' — ' + strength.filledSections + '/' + strength.totalSections + ' sections filled'
    if (fill) fill.style.width = strength.strength + '%'

    if (sec) {
      sec.innerHTML = ''
      for (var key in strength.factors) {
        var f = strength.factors[key]
        var color = f.score >= 70 ? '#10B981' : f.score >= 40 ? '#F59E0B' : '#EF4444'
        var item = document.createElement('div')
        item.className = 'pr-strength-section'
        item.innerHTML = '<i class="' + (ProfileService.SECTION_CONFIG[key] ? ProfileService.SECTION_CONFIG[key].icon : 'fa-solid fa-circle') + '" style="color:' + color + '"></i>' + f.label + ' ' + f.score + '%'
        sec.appendChild(item)
      }
    }
  }

  /* ===== RENDER: Insights ===== */
  function renderInsights (profile) {
    var container = document.getElementById('pr-insights')
    if (!container) return
    var insights = ProfileService.generateInsights(profile)

    container.innerHTML =
      '<div class="pr-insight-card">' +
        '<div class="pr-insight-title"><i class="fa-solid fa-star" style="color:#10B981;margin-right:4px"></i>Top Strengths</div>' +
        (insights.strengths.length ? insights.strengths.map(function (s) {
          return '<div class="pr-insight-item"><span class="strength-dot high"></span>' + s.text + '</div>'
        }).join('') : '<div class="pr-insight-item" style="color:var(--text-3)">No data yet</div>') +
      '</div>' +
      '<div class="pr-insight-card">' +
        '<div class="pr-insight-title"><i class="fa-solid fa-arrow-trend-up" style="color:#F59E0B;margin-right:4px"></i>Areas to Improve</div>' +
        (insights.weaknesses.length ? insights.weaknesses.map(function (w) {
          return '<div class="pr-insight-item"><span class="strength-dot weak"></span>' + w.text + '</div>'
        }).join('') : '<div class="pr-insight-item" style="color:var(--text-3)">No areas detected</div>') +
      '</div>' +
      (insights.highestImpact ? '<div class="pr-insight-card">' +
        '<div class="pr-insight-title"><i class="fa-solid fa-bolt" style="color:var(--primary);margin-right:4px"></i>Highest Impact Improvement</div>' +
        '<div class="pr-insight-item" style="font-weight:var(--weight-medium);color:var(--text)"><span class="strength-dot medium"></span>' + insights.highestImpact.label + ': +' + insights.highestImpact.potentialGain + ' potential points (current ' + insights.highestImpact.currentScore + '/100)</div>' +
      '</div>' : '') +
      (insights.missingSections.length ? '<div class="pr-insight-card">' +
        '<div class="pr-insight-title"><i class="fa-solid fa-circle-exclamation" style="color:#EF4444;margin-right:4px"></i>Missing Sections</div>' +
        insights.missingSections.map(function (ms) {
          return '<div class="pr-insight-item"><span class="strength-dot weak"></span>' + ms + '</div>'
        }).join('') +
      '</div>' : '')

    // Alerts
    if (insights.alerts.length) {
      var alertsHtml = '<div class="pr-insight-card" style="grid-column:1/-1">' +
        '<div class="pr-insight-title"><i class="fa-solid fa-bell" style="color:#EF4444;margin-right:4px"></i>Alerts</div>'
      insights.alerts.forEach(function (a) {
        var icon = a.severity === 'critical' ? 'fa-solid fa-circle-exclamation' : a.severity === 'warning' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-info'
        var color = a.severity === 'critical' ? '#EF4444' : a.severity === 'warning' ? '#F59E0B' : '#3B82F6'
        alertsHtml += '<div class="pr-insight-item"><span class="strength-dot" style="background:' + color + '"></span><span style="color:' + color + '">' + a.text + '</span></div>'
      })
      alertsHtml += '</div>'
      container.innerHTML += alertsHtml
    }
  }

  /* ===== RENDER: Skills ===== */
  function renderSkills (profile) {
    var grid = document.getElementById('pr-skills-grid')
    var count = document.getElementById('pr-skills-count')
    if (!grid) return
    var skills = profile.skills || []
    if (count) count.textContent = skills.length + ' skills'

    // Group by category
    var categories = {}
    var categoryOrder = ['Programming Languages', 'AI & Data Science', 'Frontend', 'Backend', 'Databases', 'Cloud', 'DevOps', 'Dev Tools', 'Soft Skills']
    skills.forEach(function (s) {
      var cat = s.category || 'Other'
      if (!categories[cat]) categories[cat] = []
      categories[cat].push(s)
    })

    grid.innerHTML = ''
    categoryOrder.forEach(function (cat) {
      if (!categories[cat] || !categories[cat].length) return
      var catSkills = categories[cat]
      var avg = Math.round(catSkills.reduce(function (sum, s) { return sum + s.level }, 0) / catSkills.length)

      var block = document.createElement('div')
      block.className = 'pr-skill-category'
      block.innerHTML =
        '<div class="pr-skill-category-header">' + cat + ' <span>' + catSkills.length + ' skills · Avg ' + avg + '%</span></div>' +
        catSkills.map(function (s) {
          var color = s.level >= 70 ? '#10B981' : s.level >= 40 ? '#F59E0B' : '#EF4444'
          var growthClass = s.growthTrend || 'stable'
          return '<div class="pr-skill-row">' +
            '<span class="pr-skill-name">' + s.name + '</span>' +
            '<div class="pr-skill-level-bar"><div class="pr-skill-level-fill" style="width:' + s.level + '%;background:' + color + '"></div></div>' +
            '<span class="pr-skill-importance">' + Math.round((s.importance || 0.5) * 100) + '%</span>' +
            '<span class="pr-skill-growth ' + growthClass + '">' + growthClass + '</span>' +
          '</div>'
        }).join('')
      grid.appendChild(block)
    })
  }

  /* ===== RENDER: Projects ===== */
  function renderProjects (profile) {
    var grid = document.getElementById('pr-projects-grid')
    var count = document.getElementById('pr-projects-count')
    if (!grid) return
    var projects = profile.projects || []
    if (count) count.textContent = projects.length + ' projects'

    grid.innerHTML = projects.map(function (p) {
      var statusIcon = p.completed ? 'fa-solid fa-check-circle' : 'fa-solid fa-clock'
      var statusColor = p.completed ? '#10B981' : '#F59E0B'
      return '<div class="pr-project-card" data-id="' + p.id + '">' +
        '<div class="pr-project-icon"><i class="fa-solid fa-code-branch"></i></div>' +
        '<div class="pr-project-body">' +
          '<div class="pr-project-name">' + esc(p.name) + '</div>' +
          '<div class="pr-project-desc">' + esc(p.description || '') + '</div>' +
          '<div class="pr-project-tech">' + (p.technologies || []).map(function (t) { return '<span>' + esc(t) + '</span>' }).join('') + '</div>' +
          '<div class="pr-project-meta">' +
            '<span><i class="' + statusIcon + '" style="color:' + statusColor + '"></i> ' + (p.completed ? 'Completed' : 'In Progress') + '</span>' +
            '<span><i class="fa-solid fa-gauge-high" style="color:var(--text-3)"></i> ' + (p.complexityScore || 'N/A') + '</span>' +
            '<span><i class="fa-solid fa-bolt" style="color:var(--text-3)"></i> ' + (p.impactScore || 'N/A') + '</span>' +
            '<span><i class="fa-solid fa-calendar" style="color:var(--text-3)"></i> ' + (p.year || '') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="pr-project-actions">' +
          '<button class="edit-btn" data-edit-project="' + p.id + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="delete-btn" data-delete-project="' + p.id + '" title="Delete"><i class="fa-solid fa-trash-can"></i></button>' +
        '</div>' +
      '</div>'
    }).join('')

    // Attach project event listeners
    grid.querySelectorAll('[data-edit-project]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-edit-project')
        var project = null
        for (var i = 0; i < (profile.projects || []).length; i++) {
          if (profile.projects[i].id === id) { project = profile.projects[i]; break }
        }
        if (project) openProjectModal(project)
      })
    })
    grid.querySelectorAll('[data-delete-project]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-delete-project')
        if (confirm('Delete this project?')) { ProfileService.deleteProject(id); reRender() }
      })
    })
  }

  /* ===== RENDER: Certifications ===== */
  function renderCertifications (profile) {
    var grid = document.getElementById('pr-certs-grid')
    var count = document.getElementById('pr-certs-count')
    if (!grid) return
    var certs = profile.certifications || []
    if (count) count.textContent = certs.length + ' certifications'

    grid.innerHTML = certs.map(function (c) {
      return '<div class="pr-cert-card" data-id="' + c.id + '">' +
        '<div class="pr-cert-header">' +
          '<div class="pr-cert-icon"><i class="fa-solid fa-award"></i></div>' +
          '<div><div class="pr-cert-name">' + esc(c.name) + '</div><div class="pr-cert-issuer">' + esc(c.issuer || '') + '</div></div>' +
        '</div>' +
        '<div class="pr-cert-date">' + (c.date || '') + '</div>' +
        '<div class="pr-cert-skills">' + (c.skillMapping || []).map(function (s) { return '<span>' + esc(s) + '</span>' }).join('') + '</div>' +
        '<div class="pr-cert-actions">' +
          '<button class="edit-btn" data-edit-cert="' + c.id + '" title="Edit" style="width:24px;height:24px;border:none;background:transparent;color:var(--text-3);cursor:pointer"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="delete-btn" data-delete-cert="' + c.id + '" title="Delete" style="width:24px;height:24px;border:none;background:transparent;color:var(--text-3);cursor:pointer"><i class="fa-solid fa-trash-can"></i></button>' +
        '</div>' +
      '</div>'
    }).join('')

    grid.querySelectorAll('[data-edit-cert]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-edit-cert')
        var cert = null
        for (var i = 0; i < (profile.certifications || []).length; i++) {
          if (profile.certifications[i].id === id) { cert = profile.certifications[i]; break }
        }
        if (cert) openCertModal(cert)
      })
    })
    grid.querySelectorAll('[data-delete-cert]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-delete-cert')
        if (confirm('Delete this certification?')) { ProfileService.deleteCertification(id); reRender() }
      })
    })
  }

  /* ===== RENDER: Internships ===== */
  function renderInternships (profile) {
    var grid = document.getElementById('pr-internships-grid')
    var count = document.getElementById('pr-interns-count')
    if (!grid) return
    var internships = profile.internships || []
    if (count) count.textContent = internships.length + ' internships'

    grid.innerHTML = internships.map(function (i) {
      return '<div class="pr-intern-card" data-id="' + i.id + '">' +
        '<div class="pr-intern-icon"><i class="fa-solid fa-building"></i></div>' +
        '<div class="pr-intern-body">' +
          '<div class="pr-intern-role">' + esc(i.role) + '</div>' +
          '<div class="pr-intern-company">' + esc(i.company) + '</div>' +
          '<div class="pr-intern-duration">' + (i.duration || '') + (i.startDate ? ' (' + i.startDate + ' to ' + (i.endDate || 'present') + ')' : '') + '</div>' +
          '<div class="pr-intern-skills">' + (i.skillsGained || i.technologies || []).map(function (s) { return '<span>' + esc(s) + '</span>' }).join('') + '</div>' +
        '</div>' +
        '<div class="pr-project-actions">' +
          '<button class="edit-btn" data-edit-intern="' + i.id + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="delete-btn" data-delete-intern="' + i.id + '" title="Delete"><i class="fa-solid fa-trash-can"></i></button>' +
        '</div>' +
      '</div>'
    }).join('')

    grid.querySelectorAll('[data-edit-intern]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-edit-intern')
        var intern = null
        for (var i = 0; i < (profile.internships || []).length; i++) {
          if (profile.internships[i].id === id) { intern = profile.internships[i]; break }
        }
        if (intern) openInternModal(intern)
      })
    })
    grid.querySelectorAll('[data-delete-intern]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-delete-intern')
        if (confirm('Delete this internship?')) { ProfileService.deleteInternship(id); reRender() }
      })
    })
  }

  /* ===== RENDER: GitHub ===== */
  function renderGithub (profile) {
    var content = document.getElementById('pr-github-content')
    var status = document.getElementById('pr-github-status')
    if (!content) return
    var gh = profile.github
    if (!gh) {
      content.innerHTML = '<p style="font-size:var(--text-xs);color:var(--text-3);padding:var(--space-2) 0">GitHub not connected. <a href="#" style="color:var(--primary)">Connect now</a>.</p>'
      if (status) status.textContent = 'Not connected'
      return
    }
    if (status) status.innerHTML = '<span style="font-size:var(--text-xs);color:#10B981">Connected as @' + gh.username + '</span>'

    var totalPct = 0
    var langEntries = Object.entries(gh.languages || {}).sort(function (a, b) { return b[1] - a[1] })
    var langColors = { JavaScript: '#F7DF1E', Python: '#3776AB', TypeScript: '#3178C6', HTML: '#E34F26', CSS: '#1572B6', Java: '#B07219', Others: '#6B7280' }
    langEntries.forEach(function (l) { totalPct += l[1] })

    content.innerHTML =
      '<div class="pr-github-card">' +
        '<div class="pr-github-avatar"><i class="fa-brands fa-github"></i></div>' +
        '<div class="pr-github-body">' +
          '<div class="pr-github-username">@' + esc(gh.username) + '</div>' +
          '<div class="pr-github-stats">' +
            '<span class="pr-github-stat"><i class="fa-solid fa-book"></i> ' + (gh.repoCount || 0) + ' repos</span>' +
            '<span class="pr-github-stat"><i class="fa-solid fa-star"></i> ' + (gh.stars || 0) + ' stars</span>' +
            '<span class="pr-github-stat"><i class="fa-solid fa-users"></i> ' + (gh.followers || 0) + ' followers</span>' +
          '</div>' +
          '<div class="pr-github-langs">' +
            langEntries.map(function (l) {
              var pct = totalPct > 0 ? Math.round(l[1] / totalPct * 100) : 0
              var color = langColors[l[0]] || '#6B7280'
              return '<div class="pr-github-lang-row"><span style="width:80px">' + l[0] + '</span><div class="pr-github-lang-bar"><div class="pr-github-lang-fill" style="width:' + pct + '%;background:' + color + '"></div></div><span>' + pct + '%</span></div>'
            }).join('') +
          '</div>' +
          '<div class="pr-github-scores">' +
            '<span class="pr-github-score"><i class="fa-solid fa-chart-line" style="color:#10B981"></i> Activity: ' + (gh.activityScore || 0) + '/100</span>' +
            '<span class="pr-github-score"><i class="fa-solid fa-code-commit" style="color:#8B5CF6"></i> Contributions: ' + (gh.contributionScore || 0) + '/100</span>' +
          '</div>' +
        '</div>' +
      '</div>'
  }

  /* ===== RENDER: LinkedIn ===== */
  function renderLinkedin (profile) {
    var content = document.getElementById('pr-linkedin-content')
    var status = document.getElementById('pr-linkedin-status')
    if (!content) return
    var li = profile.linkedin
    if (!li) {
      content.innerHTML = '<p style="font-size:var(--text-xs);color:var(--text-3);padding:var(--space-2) 0">LinkedIn not connected.</p>'
      if (status) status.textContent = 'Not connected'
      return
    }
    if (status) status.innerHTML = '<span style="font-size:var(--text-xs);color:#0A66C2">' + li.completeness + '% complete</span>'

    var fillColor = li.completeness >= 70 ? '#10B981' : li.completeness >= 40 ? '#F59E0B' : '#EF4444'
    content.innerHTML =
      '<div class="pr-linkedin-card">' +
        '<i class="fa-brands fa-linkedin pr-linkedin-icon"></i>' +
        '<div class="pr-linkedin-body">' +
          '<a href="' + esc(li.profileUrl || '#') + '" target="_blank" class="pr-linkedin-url">' + esc(li.profileUrl || '') + ' <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:9px"></i></a>' +
          '<div class="pr-linkedin-meta">' + (li.connections || 0) + ' connections · ' + (li.recommendations || 0) + ' recommendations</div>' +
          '<div class="pr-linkedin-bar"><div class="pr-linkedin-fill" style="width:' + li.completeness + '%;background:' + fillColor + '"></div></div>' +
        '</div>' +
      '</div>'
  }

  /* ===== RENDER: Badges ===== */
  function renderBadges (profile) {
    var grid = document.getElementById('pr-badge-grid')
    var count = document.getElementById('pr-badges-count')
    if (!grid) return
    var badges = profile.badges || []
    if (count) count.textContent = badges.filter(function (b) { return b.unlockedAt }).length + '/' + badges.length + ' unlocked'

    grid.innerHTML = badges.map(function (b) {
      var unlocked = !!b.unlockedAt
      return '<div class="pr-badge-item ' + (unlocked ? 'unlocked' : 'locked') + '">' +
        '<div class="pr-badge-icon"><i class="fa-solid ' + (unlocked ? 'fa-trophy' : 'fa-lock') + '"></i></div>' +
        '<div class="pr-badge-name">' + esc(b.name || b.id) + '</div>' +
        '<div class="pr-badge-condition">' + esc(b.condition || '') + '</div>' +
      '</div>'
    }).join('')
  }

  /* ===== RENDER: Timeline ===== */
  function renderTimeline (profile) {
    var container = document.getElementById('pr-timeline')
    var count = document.getElementById('pr-timeline-count')
    if (!container) return
    var history = profile.learningHistory || []
    if (count) count.textContent = history.length + ' events'

    container.innerHTML = history.map(function (h) {
      var typeClass = h.type === 'skill_learned' ? 'learned' : h.type === 'certification_earned' ? 'earned' : h.type === 'resume_uploaded' ? 'uploaded' : 'added'
      return '<div class="pr-timeline-item ' + typeClass + '">' +
        '<div class="pr-tl-date">' + (h.date || '') + '</div>' +
        '<div class="pr-tl-title">' + esc(h.title || '') + '</div>' +
        '<div class="pr-tl-cat">' + esc(h.category || '') + '</div>' +
      '</div>'
    }).join('')
  }

  /* ===== PROJECT MODAL ===== */
  function openProjectModal (project) {
    editContext = project ? { type: 'project', id: project.id } : { type: 'project', id: null }
    document.getElementById('project-modal-title').textContent = project ? 'Edit Project' : 'Add Project'
    document.getElementById('proj-name').value = project ? project.name || '' : ''
    document.getElementById('proj-desc').value = project ? project.description || '' : ''
    document.getElementById('proj-tech').value = project && project.technologies ? project.technologies.join(', ') : ''
    document.getElementById('proj-url').value = project ? project.url || '' : ''
    document.getElementById('proj-demo').value = project ? project.demoUrl || '' : ''
    document.getElementById('proj-complexity').value = project ? project.complexityScore || 50 : 50
    document.getElementById('proj-impact').value = project ? project.impactScore || 50 : 50
    document.getElementById('proj-year').value = project ? project.year || 2026 : 2026
    document.getElementById('proj-completed').value = project ? (project.completed ? 'true' : 'false') : 'true'
    openModal('project-modal')
  }

  function saveProject () {
    var data = {
      name: document.getElementById('proj-name').value.trim(),
      description: document.getElementById('proj-desc').value.trim(),
      technologies: document.getElementById('proj-tech').value.split(',').map(function (s) { return s.trim() }).filter(Boolean),
      url: document.getElementById('proj-url').value.trim() || null,
      demoUrl: document.getElementById('proj-demo').value.trim() || null,
      complexityScore: parseInt(document.getElementById('proj-complexity').value) || 50,
      impactScore: parseInt(document.getElementById('proj-impact').value) || 50,
      year: parseInt(document.getElementById('proj-year').value) || 2026,
      completed: document.getElementById('proj-completed').value === 'true'
    }
    if (!data.name) { Toast.error('Project name is required'); return }

    if (editContext && editContext.id) {
      ProfileService.updateProject(editContext.id, data)
      Toast.success('Project updated')
    } else {
      ProfileService.addProject(data)
      Toast.success('Project added')
    }
    closeModal('project-modal'); reRender()
  }

  /* ===== CERT MODAL ===== */
  function openCertModal (cert) {
    editContext = cert ? { type: 'cert', id: cert.id } : { type: 'cert', id: null }
    document.getElementById('cert-modal-title').textContent = cert ? 'Edit Certification' : 'Add Certification'
    document.getElementById('cert-name').value = cert ? cert.name || '' : ''
    document.getElementById('cert-issuer').value = cert ? cert.issuer || '' : ''
    document.getElementById('cert-date').value = cert ? cert.date || '' : ''
    document.getElementById('cert-url').value = cert ? cert.url || '' : ''
    document.getElementById('cert-category').value = cert ? cert.category || 'Cloud' : 'Cloud'
    document.getElementById('cert-skills').value = cert && cert.skillMapping ? cert.skillMapping.join(', ') : ''
    openModal('cert-modal')
  }

  function saveCert () {
    var data = {
      name: document.getElementById('cert-name').value.trim(),
      issuer: document.getElementById('cert-issuer').value.trim(),
      date: document.getElementById('cert-date').value,
      url: document.getElementById('cert-url').value.trim() || null,
      category: document.getElementById('cert-category').value,
      skillMapping: document.getElementById('cert-skills').value.split(',').map(function (s) { return s.trim() }).filter(Boolean)
    }
    if (!data.name) { Toast.error('Certification name is required'); return }

    if (editContext && editContext.id) {
      ProfileService.updateCertification(editContext.id, data)
      Toast.success('Certification updated')
    } else {
      ProfileService.addCertification(data)
      Toast.success('Certification added')
    }
    closeModal('cert-modal'); reRender()
  }

  /* ===== INTERN MODAL ===== */
  function openInternModal (intern) {
    editContext = intern ? { type: 'intern', id: intern.id } : { type: 'intern', id: null }
    document.getElementById('intern-modal-title').textContent = intern ? 'Edit Internship' : 'Add Internship'
    document.getElementById('intern-role').value = intern ? intern.role || '' : ''
    document.getElementById('intern-company').value = intern ? intern.company || '' : ''
    document.getElementById('intern-duration').value = intern ? intern.duration || '' : ''
    document.getElementById('intern-start').value = intern ? intern.startDate || '' : ''
    document.getElementById('intern-end').value = intern ? intern.endDate || '' : ''
    document.getElementById('intern-tech').value = intern && intern.technologies ? intern.technologies.join(', ') : ''
    document.getElementById('intern-skills-gained').value = intern && intern.skillsGained ? intern.skillsGained.join(', ') : ''
    document.getElementById('intern-completed').value = intern ? (intern.completed ? 'true' : 'false') : 'true'
    openModal('intern-modal')
  }

  function saveIntern () {
    var data = {
      role: document.getElementById('intern-role').value.trim(),
      company: document.getElementById('intern-company').value.trim(),
      duration: document.getElementById('intern-duration').value.trim(),
      startDate: document.getElementById('intern-start').value,
      endDate: document.getElementById('intern-end').value,
      technologies: document.getElementById('intern-tech').value.split(',').map(function (s) { return s.trim() }).filter(Boolean),
      skillsGained: document.getElementById('intern-skills-gained').value.split(',').map(function (s) { return s.trim() }).filter(Boolean),
      completed: document.getElementById('intern-completed').value === 'true'
    }
    if (!data.role || !data.company) { Toast.error('Role and Company are required'); return }

    if (editContext && editContext.id) {
      ProfileService.updateInternship(editContext.id, data)
      Toast.success('Internship updated')
    } else {
      ProfileService.addInternship(data)
      Toast.success('Internship added')
    }
    closeModal('intern-modal'); reRender()
  }

  /* ===== EXPORTS ===== */
  function initExports () {
    document.getElementById('export-json').addEventListener('click', function () {
      var content = ProfileService.exportJSON()
      downloadFile(content, 'profile-intelligence.json', 'application/json')
      Toast.success('JSON exported')
    })
    document.getElementById('export-md').addEventListener('click', function () {
      var content = ProfileService.exportMarkdown()
      downloadFile(content, 'profile-intelligence.md', 'text/markdown')
      Toast.success('Markdown exported')
    })
    document.getElementById('export-pdf').addEventListener('click', function () {
      var win = window.open('', '_blank')
      if (!win) { Toast.error('Please allow popups for PDF export'); return }
      win.document.write(ProfileService.exportPDF())
      win.document.close(); win.focus()
      setTimeout(function () { win.print() }, 500)
      Toast.success('PDF export ready')
    })
  }

  function downloadFile (content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType })
    var url = URL.createObjectURL(blob)
    var a = document.createElement('a'); a.href = url; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  /* ===== HELPERS ===== */
  function setText (id, val) { var el = document.getElementById(id); if (el) el.textContent = val || '' }
  function esc (str) {
    if (typeof str !== 'string') return str || ''
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
  }

  /* ===== MAIN RENDER ===== */
  function reRender () {
    var profile = ProfileService.getProfile()
    if (!profile) {
      Toast.error('No profile data found. Please log in.')
      return
    }
    renderProfile(profile)
    renderStrength(profile)
    renderInsights(profile)
    renderSkills(profile)
    renderProjects(profile)
    renderCertifications(profile)
    renderInternships(profile)
    renderGithub(profile)
    renderLinkedin(profile)
    renderBadges(profile)
    renderTimeline(profile)
  }

  /* ===== INIT ===== */
  function init () {
    initTheme(); initSidebar(); initLogout(); loadUser(); initModals(); initExports()

    // Modal save buttons
    document.getElementById('project-save-btn').addEventListener('click', saveProject)
    document.getElementById('cert-save-btn').addEventListener('click', saveCert)
    document.getElementById('intern-save-btn').addEventListener('click', saveIntern)

    // Add buttons
    document.getElementById('add-project-btn').addEventListener('click', function () { openProjectModal(null) })
    document.getElementById('add-cert-btn').addEventListener('click', function () { openCertModal(null) })
    document.getElementById('add-intern-btn').addEventListener('click', function () { openInternModal(null) })

    // Render
    showSkeletons()
    setTimeout(function () {
      try {
        reRender()
        hideSkeletons()
        showRoot()
        Toast.success('Profile loaded')
      } catch (e) {
        console.error('Profile render error:', e)
        if (typeof ErrorBoundary !== 'undefined') {
          ErrorBoundary.show({ message: 'Profile failed to load', detail: e.message, retry: reRender, fallback: 'index.html' })
        } else { Toast.error('Render failed: ' + e.message) }
        hideSkeletons(); showRoot()
      }
    }, 300)
  }

  document.addEventListener('DOMContentLoaded', init)
})()
