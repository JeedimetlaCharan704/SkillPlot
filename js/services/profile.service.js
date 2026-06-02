var ProfileService = (function () {
  'use strict'

  var FACTOR_WEIGHTS = {
    skills: 0.20,
    projects: 0.18,
    certifications: 0.12,
    internships: 0.15,
    github: 0.10,
    linkedin: 0.05,
    resume: 0.12,
    achievements: 0.08
  }

  var SECTION_CONFIG = {
    skills: { label: 'Skills', icon: 'fa-solid fa-code', maxScore: 100 },
    projects: { label: 'Projects', icon: 'fa-solid fa-diagram-project', maxScore: 100 },
    certifications: { label: 'Certifications', icon: 'fa-solid fa-certificate', maxScore: 100 },
    internships: { label: 'Internships', icon: 'fa-solid fa-briefcase', maxScore: 100 },
    github: { label: 'GitHub', icon: 'fa-brands fa-github', maxScore: 100 },
    linkedin: { label: 'LinkedIn', icon: 'fa-brands fa-linkedin', maxScore: 100 },
    resume: { label: 'Resume', icon: 'fa-solid fa-file-lines', maxScore: 100 },
    achievements: { label: 'Achievements', icon: 'fa-solid fa-trophy', maxScore: 100 }
  }

  function getProfile () {
    var user = Store.get('user')
    if (!user) return null
    var profile = {
      user: user,
      skills: user.skills || [],
      projects: user.projects || [],
      certifications: user.certifications || [],
      internships: user.internships || [],
      github: user.github || null,
      linkedin: user.linkedin || null,
      badges: user.badges || [],
      learningHistory: user.learningHistory || [],
      learningStreak: user.learningStreak || { current: 0, longest: 0 },
      resumeAnalysis: user.resumeAnalysis || null
    }
    return profile
  }

  function updateProfileField (field, data) {
    var user = Store.get('user')
    if (!user) return null
    user[field] = data
    Store.set('user', user)
    if (typeof ApiService !== 'undefined') {
      ApiService.profile.update({ [field]: data }).catch(function () {})
    }
    return getProfile()
  }

  // ===== STRENGTH SCORING =====
  function calculateStrength (profile) {
    if (!profile) profile = getProfile()
    if (!profile) return { strength: 0, confidence: 'Low', factors: {}, suggestions: [] }

    var factors = {}
    var suggestions = []

    // Skills score
    var skillsScore = 0
    if (profile.skills && profile.skills.length) {
      var totalWeight = profile.skills.reduce(function (sum, s) { return sum + (s.importance || 0.5) }, 0)
      var weightedSum = profile.skills.reduce(function (sum, s) { return sum + (s.level || 0) * (s.importance || 0.5) }, 0)
      skillsScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
      var advancedCount = profile.skills.filter(function (s) { return s.level >= 70 }).length
      if (advancedCount < 3) suggestions.push('Build more advanced skills (level 70+) to strengthen your profile')
    }
    factors.skills = { score: skillsScore, maxScore: 100, label: 'Skills', details: profile.skills ? profile.skills.length + ' skills tracked' : 'No skills' }

    // Projects score
    var projectsScore = 0
    if (profile.projects && profile.projects.length) {
      var totalComplexity = profile.projects.reduce(function (sum, p) { return sum + (p.complexityScore != null ? p.complexityScore : 50) }, 0)
      var totalImpact = profile.projects.reduce(function (sum, p) { return sum + (p.impactScore != null ? p.impactScore : 50) }, 0)
      var completed = profile.projects.filter(function (p) { return p.completed }).length
      projectsScore = Math.round((totalComplexity + totalImpact) / (profile.projects.length * 2))
      if (completed < 2) suggestions.push('Complete more projects to improve your profile strength')
    }
    factors.projects = { score: projectsScore, maxScore: 100, label: 'Projects', details: profile.projects ? profile.projects.length + ' projects' : 'No projects' }

    // Certifications score
    var certScore = 0
    if (profile.certifications && profile.certifications.length) {
      var certCount = profile.certifications.length
      certScore = Math.min(100, certCount * 25 + 10)
      if (certCount < 2) suggestions.push('Earn more certifications to boost your credentials')
    }
    factors.certifications = { score: certScore, maxScore: 100, label: 'Certifications', details: profile.certifications ? profile.certifications.length + ' certifications' : 'No certifications' }

    // Internships score
    var internScore = 0
    if (profile.internships && profile.internships.length) {
      var completedInterns = profile.internships.filter(function (i) { return i.completed }).length
      internScore = Math.min(100, completedInterns * 40 + 15)
      if (completedInterns === 0) suggestions.push('Complete an internship to gain real-world experience')
    }
    factors.internships = { score: internScore, maxScore: 100, label: 'Internships', details: profile.internships ? profile.internships.length + ' internships' : 'No internships' }

    // GitHub score
    var githubScore = 0
    if (profile.github) {
      var gh = profile.github
      var repoScore = Math.min(35, (gh.repoCount || 0) * 2)
      var activityScore = gh.activityScore || 0
      var contribScore = gh.contributionScore || 0
      githubScore = Math.round((repoScore + activityScore * 0.35 + contribScore * 0.3))
      if (gh.repoCount < 5) suggestions.push('Add more repositories to your GitHub profile')
    }
    factors.github = { score: githubScore, maxScore: 100, label: 'GitHub', details: profile.github ? (profile.github.repoCount || 0) + ' repos' : 'Not connected' }

    // LinkedIn score
    var linkedinScore = 0
    if (profile.linkedin) {
      linkedinScore = profile.linkedin.completeness || 0
      if (linkedinScore < 60) suggestions.push('Complete your LinkedIn profile (aim for 80%+ completeness)')
    }
    factors.linkedin = { score: linkedinScore, maxScore: 100, label: 'LinkedIn', details: profile.linkedin ? (profile.linkedin.completeness || 0) + '% complete' : 'Not connected' }

    // Resume score
    var resumeScore = 0
    if (profile.resumeAnalysis) {
      resumeScore = profile.resumeAnalysis.resumeScore || 0
      if (resumeScore < 70) suggestions.push('Improve your resume to increase profile strength')
    } else {
      suggestions.push('Upload your resume for analysis')
    }
    factors.resume = { score: resumeScore, maxScore: 100, label: 'Resume', details: profile.resumeAnalysis ? 'Score: ' + resumeScore : 'Not uploaded' }

    // Achievements score
    var achievementScore = 0
    if (profile.badges && profile.badges.length) {
      var unlockedCount = profile.badges.filter(function (b) { return b.unlockedAt }).length
      achievementScore = Math.min(100, unlockedCount * 15 + 10)
      if (unlockedCount < 3) suggestions.push('Unlock more badges by engaging with platform features')
    }
    factors.achievements = { score: achievementScore, maxScore: 100, label: 'Achievements', details: profile.badges ? (profile.badges.filter(function (b) { return b.unlockedAt }).length) + '/' + profile.badges.length + ' unlocked' : 'No badges' }

    // Composite score
    var totalWeighted = 0
    var totalWeight = 0
    for (var key in FACTOR_WEIGHTS) {
      if (factors[key]) {
        totalWeighted += factors[key].score * FACTOR_WEIGHTS[key]
        totalWeight += FACTOR_WEIGHTS[key]
      }
    }
    var compositeScore = totalWeight > 0 ? Math.round(totalWeighted / totalWeight) : 0

    // Confidence
    var filled = Object.values(factors).filter(function (f) { return f.score > 0 }).length
    var confidence = filled >= 6 ? 'High' : filled >= 3 ? 'Medium' : 'Low'

    // Top suggestions (max 5)
    suggestions = suggestions.slice(0, 5)

    return {
      strength: compositeScore,
      confidence: confidence,
      factors: factors,
      suggestions: suggestions,
      filledSections: filled,
      totalSections: Object.keys(FACTOR_WEIGHTS).length
    }
  }

  // ===== INSIGHTS =====
  function generateInsights (profile) {
    if (!profile) profile = getProfile()
    if (!profile) return { strengths: [], weaknesses: [], highestImpact: null, missingSections: [], alerts: [] }

    // Map industry categories
    var categoryMap = { 'Programming Languages': 'Programming', 'AI & Data Science': 'Data Science', 'Frontend': 'Frontend', 'Backend': 'Backend', 'Databases': 'Databases', 'DevOps': 'DevOps', 'Cloud': 'Cloud', 'Dev Tools': 'Dev Tools', 'Soft Skills': 'Soft Skills' }

    // Strengths: skills with level >= 70
    var strengths = (profile.skills || []).filter(function (s) { return s.level >= 70 }).map(function (s) {
      return { type: 'skill', text: s.name + ' (' + s.level + '/100)', category: categoryMap[s.category] || s.category, value: s.level }
    })

    // Add project strengths
    ;(profile.projects || []).forEach(function (p) {
      if (p.impactScore >= 70) strengths.push({ type: 'project', text: p.name + ' (Impact: ' + p.impactScore + ')', category: 'Projects', value: p.impactScore })
    })

    weaknesses = (profile.skills || []).filter(function (s) { return s.level < 40 }).map(function (s) {
      return { type: 'skill', text: s.name + ' (' + s.level + '/100)', category: categoryMap[s.category] || s.category, value: 100 - s.level }
    })

    // Add missing sections
    var missingSections = []
    if (!profile.skills || !profile.skills.length) missingSections.push('Skills')
    if (!profile.projects || !profile.projects.length) missingSections.push('Projects')
    if (!profile.certifications || !profile.certifications.length) missingSections.push('Certifications')
    if (!profile.internships || !profile.internships.length) missingSections.push('Internships')
    if (!profile.github) missingSections.push('GitHub')
    if (!profile.linkedin) missingSections.push('LinkedIn')
    if (!profile.resumeAnalysis) missingSections.push('Resume')

    // Highest impact improvement
    var strength = calculateStrength(profile)
    var highestImpact = null
    var maxGap = 0
    for (var key in strength.factors) {
      var factor = strength.factors[key]
      var gap = 100 - factor.score
      var weightedGap = gap * FACTOR_WEIGHTS[key]
      if (weightedGap > maxGap && factor.score < 100) {
        maxGap = weightedGap
        highestImpact = { factor: key, label: SECTION_CONFIG[key] ? SECTION_CONFIG[key].label : key, currentScore: factor.score, potentialGain: Math.round(gap * FACTOR_WEIGHTS[key]), weight: FACTOR_WEIGHTS[key] }
      }
    }

    // Alerts
    var alerts = []
    if (missingSections.length > 2) alerts.push({ severity: 'warning', text: missingSections.length + ' sections missing — profile is incomplete' })
    if (strength.strength < 40) alerts.push({ severity: 'critical', text: 'Overall profile strength below 40 — needs significant improvement' })
    if (!profile.github) alerts.push({ severity: 'info', text: 'Connect GitHub to showcase your code contributions' })
    if (!profile.linkedin) alerts.push({ severity: 'info', text: 'Add LinkedIn to improve recruiter visibility' })

    // Sort strengths and weaknesses by value desc
    strengths.sort(function (a, b) { return b.value - a.value })
    weaknesses.sort(function (a, b) { return b.value - a.value })

    return {
      strengths: strengths.slice(0, 5),
      weaknesses: weaknesses.slice(0, 5),
      highestImpact: highestImpact,
      missingSections: missingSections,
      alerts: alerts
    }
  }

  // ===== CRUD: Projects =====
  function addProject (project) {
    var user = Store.get('user')
    if (!user) return null
    if (!user.projects) user.projects = []
    project.id = 'proj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
    user.projects.push(project)
    Store.set('user', user)
    return project
  }

  function updateProject (id, data) {
    var user = Store.get('user')
    if (!user || !user.projects) return null
    var idx = -1
    for (var i = 0; i < user.projects.length; i++) {
      if (user.projects[i].id === id) { idx = i; break }
    }
    if (idx === -1) return null
    for (var key in data) { user.projects[idx][key] = data[key] }
    Store.set('user', user)
    return user.projects[idx]
  }

  function deleteProject (id) {
    var user = Store.get('user')
    if (!user || !user.projects) return false
    user.projects = user.projects.filter(function (p) { return p.id !== id })
    Store.set('user', user)
    return true
  }

  // ===== CRUD: Certifications =====
  function addCertification (cert) {
    var user = Store.get('user')
    if (!user) return null
    if (!user.certifications) user.certifications = []
    cert.id = 'cert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
    user.certifications.push(cert)
    Store.set('user', user)
    if (user.learningHistory) user.learningHistory.unshift({ type: 'certification_earned', title: 'Earned ' + cert.name, date: new Date().toISOString().slice(0, 10), category: cert.category || 'Certification' })
    Store.set('user', user)
    return cert
  }

  function updateCertification (id, data) {
    var user = Store.get('user')
    if (!user || !user.certifications) return null
    var idx = -1
    for (var i = 0; i < user.certifications.length; i++) {
      if (user.certifications[i].id === id) { idx = i; break }
    }
    if (idx === -1) return null
    for (var key in data) { user.certifications[idx][key] = data[key] }
    Store.set('user', user)
    return user.certifications[idx]
  }

  function deleteCertification (id) {
    var user = Store.get('user')
    if (!user || !user.certifications) return false
    user.certifications = user.certifications.filter(function (c) { return c.id !== id })
    Store.set('user', user)
    return true
  }

  // ===== CRUD: Internships =====
  function addInternship (internship) {
    var user = Store.get('user')
    if (!user) return null
    if (!user.internships) user.internships = []
    internship.id = 'intern_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
    user.internships.push(internship)
    Store.set('user', user)
    if (user.learningHistory) user.learningHistory.unshift({ type: 'internship_added', title: 'Added ' + internship.role + ' at ' + internship.company, date: new Date().toISOString().slice(0, 10), category: 'Internship' })
    Store.set('user', user)
    return internship
  }

  function updateInternship (id, data) {
    var user = Store.get('user')
    if (!user || !user.internships) return null
    var idx = -1
    for (var i = 0; i < user.internships.length; i++) {
      if (user.internships[i].id === id) { idx = i; break }
    }
    if (idx === -1) return null
    for (var key in data) { user.internships[idx][key] = data[key] }
    Store.set('user', user)
    return user.internships[idx]
  }

  function deleteInternship (id) {
    var user = Store.get('user')
    if (!user || !user.internships) return false
    user.internships = user.internships.filter(function (i) { return i.id !== id })
    Store.set('user', user)
    return true
  }

  // ===== EXPORTS =====
  function exportJSON (profile) {
    if (!profile) profile = getProfile()
    if (!profile) return '{}'
    var strength = calculateStrength(profile)
    var insights = generateInsights(profile)
    var output = {
      exportedAt: new Date().toISOString(),
      profile: profile.user,
      strength: strength,
      insights: insights,
      skills: profile.skills,
      projects: profile.projects,
      certifications: profile.certifications,
      internships: profile.internships,
      github: profile.github,
      linkedin: profile.linkedin,
      badges: profile.badges,
      learningHistory: profile.learningHistory
    }
    return JSON.stringify(output, null, 2)
  }

  function exportMarkdown (profile) {
    if (!profile) profile = getProfile()
    if (!profile) return '# Profile\n\nNo profile data found.'
    var strength = calculateStrength(profile)
    var insights = generateInsights(profile)

    var md = '# Profile Intelligence Hub — ' + (profile.user.name || 'User') + '\n\n'
    md += '## Profile Strength\n\n'
    md += '- **Overall Strength:** ' + strength.strength + '%\n'
    md += '- **Confidence:** ' + strength.confidence + '\n'
    md += '- **Sections Filled:** ' + strength.filledSections + '/' + strength.totalSections + '\n\n'

    md += '### Factor Breakdown\n\n'
    md += '| Factor | Score | Details |\n'
    md += '|--------|-------|--------|\n'
    for (var key in strength.factors) {
      var f = strength.factors[key]
      md += '| ' + f.label + ' | ' + f.score + '/100 | ' + f.details + ' |\n'
    }

    md += '\n## Skills Matrix\n\n'
    md += '| Skill | Category | Level | Importance | Growth |\n'
    md += '|-------|----------|-------|------------|--------|\n'
    ;(profile.skills || []).forEach(function (s) {
      md += '| ' + s.name + ' | ' + (s.category || '') + ' | ' + s.level + '/100 | ' + (s.importance || '') + ' | ' + (s.growthTrend || '') + ' |\n'
    })

    md += '\n## Projects\n\n'
    ;(profile.projects || []).forEach(function (p) {
      md += '- **' + p.name + '** — ' + (p.description || '') + ' (Complexity: ' + (p.complexityScore || 'N/A') + ', Impact: ' + (p.impactScore || 'N/A') + ')\n'
    })

    md += '\n## Certifications\n\n'
    ;(profile.certifications || []).forEach(function (c) {
      md += '- **' + c.name + '** — ' + (c.issuer || '') + ' (' + (c.date || '') + ')\n'
    })

    md += '\n## Internships\n\n'
    ;(profile.internships || []).forEach(function (i) {
      md += '- **' + i.role + '** at ' + i.company + ' (' + (i.duration || '') + ')\n'
    })

    md += '\n## Insights\n\n'
    md += '### Top Strengths\n'
    ;(insights.strengths || []).forEach(function (s) { md += '- ' + s.text + '\n' })

    md += '\n### Areas for Improvement\n'
    ;(insights.weaknesses || []).forEach(function (w) { md += '- ' + w.text + '\n' })

    if (insights.highestImpact) {
      md += '\n### Highest Impact Improvement\n'
      md += '- ' + insights.highestImpact.label + ': +' + insights.highestImpact.potentialGain + ' potential points\n'
    }

    return md
  }

  function exportPDF (profile) {
    if (!profile) profile = getProfile()
    if (!profile) return '<html><body><h1>No profile data</h1></body></html>'
    var strength = calculateStrength(profile)
    var insights = generateInsights(profile)
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var bg = isDark ? '#0F172A' : '#FFFFFF'
    var text = isDark ? '#E2E8F0' : '#1E293B'
    var cardBg = isDark ? '#1E293B' : '#F8FAFC'

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Profile Report — ' + (profile.user.name || 'User') + '</title>'
    html += '<style>body{font-family:Inter,sans-serif;background:' + bg + ';color:' + text + ';padding:40px;line-height:1.6}h1{font-size:28px;margin-bottom:4px}h2{font-size:20px;border-bottom:2px solid #4F46E5;padding-bottom:6px;margin-top:32px}.section{background:' + cardBg + ';border-radius:12px;padding:20px;margin:16px 0}.score{font-size:48px;font-weight:700;color:#4F46E5}.grid{display:flex;flex-wrap:wrap;gap:12px}.factor{flex:1;min-width:140px;padding:12px;background:' + bg + ';border-radius:8px}.factor-score{font-size:24px;font-weight:600}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid ' + (isDark ? '#334155' : '#E2E8F0') + '}th{font-weight:600}.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:500}.meta{color:' + (isDark ? '#94A3B8' : '#64748B') + ';font-size:14px}</style></head><body>'
    html += '<h1>' + (profile.user.name || 'Profile Report') + '</h1>'
    html += '<p class="meta">' + (profile.user.email || '') + ' — ' + (profile.user.role || '') + ' — Generated ' + new Date().toLocaleDateString() + '</p>'

    html += '<div class="section"><h2>Profile Strength</h2>'
    html += '<div class="score">' + strength.strength + '%</div>'
    html += '<p>Confidence: ' + strength.confidence + ' — ' + strength.filledSections + '/' + strength.totalSections + ' sections filled</p>'
    html += '<div class="grid">'
    for (var key in strength.factors) {
      var f = strength.factors[key]
      var color = f.score >= 70 ? '#10B981' : f.score >= 40 ? '#F59E0B' : '#EF4444'
      html += '<div class="factor"><div style="color:' + color + '" class="factor-score">' + f.score + '</div><div>' + f.label + '</div><div style="font-size:12px;opacity:0.7">' + f.details + '</div></div>'
    }
    html += '</div></div>'

    html += '<div class="section"><h2>Skills Matrix</h2><table><tr><th>Skill</th><th>Category</th><th>Level</th><th>Growth</th></tr>'
    ;(profile.skills || []).forEach(function (s) {
      var c = s.level >= 70 ? '#10B981' : s.level >= 40 ? '#F59E0B' : '#EF4444'
      html += '<tr><td>' + s.name + '</td><td>' + (s.category || '') + '</td><td style="color:' + c + '">' + s.level + '/100</td><td>' + (s.growthTrend || '') + '</td></tr>'
    })
    html += '</table></div>'

    html += '<div class="section"><h2>Projects</h2>'
    ;(profile.projects || []).forEach(function (p) {
      html += '<div style="margin:8px 0"><strong>' + p.name + '</strong> — ' + (p.description || '') + '<br><span style="font-size:13px;opacity:0.7">Complexity: ' + (p.complexityScore || 'N/A') + ' | Impact: ' + (p.impactScore || 'N/A') + ' | Tech: ' + (p.technologies || []).join(', ') + '</span></div>'
    })
    html += '</div>'

    html += '<div class="section"><h2>Insights</h2><h3>Top Strengths</h3><ul>' + (insights.strengths || []).map(function (s) { return '<li>' + s.text + '</li>' }).join('') + '</ul>'
    html += '<h3>Areas for Improvement</h3><ul>' + (insights.weaknesses || []).map(function (w) { return '<li>' + w.text + '</li>' }).join('') + '</ul>'
    if (insights.highestImpact) html += '<p><strong>Highest Impact:</strong> ' + insights.highestImpact.label + ' (+' + insights.highestImpact.potentialGain + ' pts)</p>'
    html += '</div>'

    html += '<p style="text-align:center;margin-top:40px;font-size:12px;opacity:0.5">Generated by SkillPilot AI — Profile Intelligence Hub</p>'
    html += '</body></html>'
    return html
  }

  // ===== PUBLIC API =====
  return {
    getProfile: getProfile,
    updateProfileField: updateProfileField,
    calculateStrength: calculateStrength,
    generateInsights: generateInsights,
    addProject: addProject,
    updateProject: updateProject,
    deleteProject: deleteProject,
    addCertification: addCertification,
    updateCertification: updateCertification,
    deleteCertification: deleteCertification,
    addInternship: addInternship,
    updateInternship: updateInternship,
    deleteInternship: deleteInternship,
    exportJSON: exportJSON,
    exportMarkdown: exportMarkdown,
    exportPDF: exportPDF,
    SECTION_CONFIG: SECTION_CONFIG,
    FACTOR_WEIGHTS: FACTOR_WEIGHTS
  }
})()
