var MentorService = (function () {
  'use strict'

  var RISK_THRESHOLDS = { critical: 30, high: 50, medium: 70, low: 100 }

  function getStudents () {
    if (typeof DemoStudents !== 'undefined' && DemoStudents) return DemoStudents
    return []
  }

  // ===== OVERVIEW =====
  function getOverview (students) {
    if (!students) students = getStudents()
    var total = students.length
    if (!total) return { totalStudents: 0, avgReadiness: 0, avgPlacement: 0, avgResume: 0, avgStrength: 0, activeLearners: 0, atRisk: 0 }

    var sumReadiness = 0, sumPlacement = 0, sumResume = 0, sumStrength = 0, active = 0, atRisk = 0
    var now = new Date()
    students.forEach(function (s) {
      sumReadiness += s.readiness || 0
      sumPlacement += s.placementProbability || 0
      sumResume += s.resumeScore || 0
      sumStrength += s.profileStrength || 0
      if (s.recentActivity) {
        var d = new Date(s.recentActivity)
        if ((now - d) < 30 * 24 * 60 * 60 * 1000) active++
      }
      if (s.riskLevel === 'high' || s.riskLevel === 'critical') atRisk++
    })

    return {
      totalStudents: total,
      avgReadiness: Math.round(sumReadiness / total),
      avgPlacement: Math.round(sumPlacement / total),
      avgResume: Math.round(sumResume / total),
      avgStrength: Math.round(sumStrength / total),
      activeLearners: active,
      atRisk: atRisk
    }
  }

  // ===== RISK DETECTION =====
  function detectRisks (students) {
    if (!students) students = getStudents()
    return students.map(function (s) {
      var risks = []
      if (s.readiness < 50) risks.push({ type: 'low_readiness', label: 'Low Readiness', desc: 'Readiness score is ' + s.readiness + '% — needs improvement across all areas' })
      if (s.resumeScore < 50) risks.push({ type: 'weak_resume', label: 'Weak Resume', desc: 'Resume score ' + s.resumeScore + '% — needs resume overhaul' })
      if ((s.projectsCount || 0) === 0) risks.push({ type: 'no_projects', label: 'Missing Projects', desc: 'No projects in profile — real-world work missing' })
      if (s.projectsCount < 2) risks.push({ type: 'few_projects', label: 'Few Projects', desc: 'Only ' + (s.projectsCount || 0) + ' project(s) — add more' })
      if ((s.certificationsCount || 0) === 0) risks.push({ type: 'no_certifications', label: 'Missing Certifications', desc: 'No certifications earned' })
      if (!s.hasGithub) risks.push({ type: 'no_github', label: 'No GitHub Activity', desc: 'GitHub not connected — no code visibility' })
      if ((s.githubActivity || 0) < 30) risks.push({ type: 'low_github', label: 'Low GitHub Activity', desc: 'GitHub activity score ' + (s.githubActivity || 0) + ' — very low' })
      if ((s.internshipsCount || 0) === 0) risks.push({ type: 'no_internship', label: 'No Internship', desc: 'No internship experience' })
      return { studentId: s.id, studentName: s.name, risks: risks, riskCount: risks.length, riskLevel: s.riskLevel }
    })
  }

  // ===== COHORT ANALYTICS =====
  function getCohortAnalytics (students) {
    if (!students) students = getStudents()
    if (!students.length) return { readinessDist: [], placementDist: [], skillDist: [], careerDist: [], topTalent: [], insights: {} }

    // Readiness distribution buckets
    var readinessBuckets = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 }
    var placementBuckets = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 }
    var skillBuckets = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 }
    var careerInterest = {}
    var allSkills = {}
    var allWeak = {}
    var certCount = {}

    students.forEach(function (s) {
      var r = s.readiness || 0; bucketReadiness(r, readinessBuckets)
      var p = s.placementProbability || 0; bucketReadiness(p, placementBuckets)
      var sk = s.skillLevel || 0; bucketReadiness(sk, skillBuckets)

      var interest = s.careerInterest || 'Undecided'
      careerInterest[interest] = (careerInterest[interest] || 0) + 1

      ;(s.skills || []).forEach(function (skl) { allSkills[skl] = (allSkills[skl] || 0) + 1 })
      ;(s.weakSkills || []).forEach(function (w) { allWeak[w] = (allWeak[w] || 0) + 1 })

      if ((s.certificationsCount || 0) > 0) {
        var certs = s.certificationsCount || 0
        certCount[certs + ' certs'] = (certCount[certs + ' certs'] || 0) + 1
      }
    })
    if (!Object.keys(certCount).length) certCount['No certs'] = students.length

    return {
      readinessDist: Object.entries(readinessBuckets).map(function (e) { return { label: e[0], value: e[1] } }),
      placementDist: Object.entries(placementBuckets).map(function (e) { return { label: e[0], value: e[1] } }),
      skillDist: Object.entries(skillBuckets).map(function (e) { return { label: e[0], value: e[1] } }),
      careerDist: Object.entries(careerInterest).map(function (e) { return { label: e[0], value: e[1] } }).sort(function (a, b) { return b.value - a.value }),
      certDist: Object.entries(certCount).map(function (e) { return { label: e[0], value: e[1] } }),
      allSkills: Object.entries(allSkills).sort(function (a, b) { return b[1] - a[1] }).slice(0, 10),
      allWeak: Object.entries(allWeak).sort(function (a, b) { return b[1] - a[1] }).slice(0, 10)
    }
  }

  function bucketReadiness (val, buckets) {
    if (val <= 25) buckets['0-25']++
    else if (val <= 50) buckets['26-50']++
    else if (val <= 75) buckets['51-75']++
    else buckets['76-100']++
  }

  // ===== TOP TALENT =====
  function getTopTalent (students) {
    if (!students) students = getStudents()
    var sorted = students.slice().sort(function (a, b) { return b.readiness - a.readiness })
    return {
      highestReadiness: sorted.length ? sorted[0] : null,
      highestGithub: students.slice().sort(function (a, b) { return (b.githubActivity || 0) - (a.githubActivity || 0) })[0] || null,
      bestPortfolio: students.slice().sort(function (a, b) { return b.profileStrength - a.profileStrength })[0] || null,
      strongestResume: students.slice().sort(function (a, b) { return b.resumeScore - a.resumeScore })[0] || null,
      topFive: sorted.slice(0, 5)
    }
  }

  // ===== INSIGHTS =====
  function getInsights (analytics) {
    var weakSkills = (analytics.allWeak || []).slice(0, 5)
    var topSkills = (analytics.allSkills || []).slice(0, 5)
    var careerDist = (analytics.careerDist || []).slice(0, 5)

    return {
      mostCommonWeaknesses: weakSkills.map(function (s) { return { skill: s[0], count: s[1] } }),
      mostRequestedSkills: topSkills.map(function (s) { return { skill: s[0], count: s[1] } }),
      mostValuableCertifications: [
        { name: 'AWS Cloud Practitioner', value: 'Cloud — 80% placement boost', demand: 'High' },
        { name: 'Google Data Analytics', value: 'Data — 75% resume improvement', demand: 'High' },
        { name: 'TensorFlow Developer', value: 'AI/ML — 85% skill validation', demand: 'Medium' }
      ],
      mostCommonGaps: [
        { skill: 'Docker', studentsMissing: 7, impact: 'Blocks DevOps roles' },
        { skill: 'AWS', studentsMissing: 8, impact: 'Blocks Cloud roles' },
        { skill: 'Machine Learning', studentsMissing: 6, impact: 'Blocks AI/DS roles' },
        { skill: 'SQL', studentsMissing: 4, impact: 'Blocks data roles' }
      ],
      topCareerInterests: careerDist
    }
  }

  // ===== BULK ACTIONS =====
  function generateBulkActions (students) {
    if (!students) students = getStudents()
    var atRisk = students.filter(function (s) { return s.riskLevel === 'high' || s.riskLevel === 'critical' })
    var noProjects = students.filter(function (s) { return (s.projectsCount || 0) < 2 })
    var noCerts = students.filter(function (s) { return (s.certificationsCount || 0) === 0 })
    var noGithub = students.filter(function (s) { return !s.hasGithub })

    return {
      learningPlans: [
        { title: 'Python & SQL Foundations', students: atRisk.length, desc: 'Build core programming skills for ' + atRisk.length + ' at-risk students', impact: 'High' },
        { title: 'Project-Based Learning Track', students: noProjects.length, desc: 'Guide ' + noProjects.length + ' students to complete 2+ projects', impact: 'High' },
        { title: 'GitHub Onboarding Sprint', students: noGithub.length, desc: 'Get ' + noGithub.length + ' students to set up GitHub and push code', impact: 'Medium' }
      ],
      recommendedCertifications: [
        { title: 'Google Data Analytics Professional', students: '6 students', desc: 'Builds data analysis skills — recommended for DS/DA track', impact: 'High' },
        { title: 'AWS Cloud Practitioner', students: '8 students', desc: 'Cloud fundamentals — key gap for most students', impact: 'High' },
        { title: 'Meta Front-End Developer', students: '5 students', desc: 'Web development foundation for frontend track', impact: 'Medium' }
      ],
      suggestedProjects: [
        { title: 'Personal Portfolio Website', students: noProjects.length, desc: 'Beginner-friendly — teaches HTML/CSS/JS, deployment', impact: 'High' },
        { title: 'Data Analysis Dashboard', students: 6, desc: 'Intermediate — Python, SQL, visualization', impact: 'Medium' },
        { title: 'REST API Backend', students: 4, desc: 'Intermediate — Node.js/Express, databases, deployment', impact: 'Medium' }
      ]
    }
  }

  // ===== EXPORTS =====
  function exportJSON (students, overview, risks, analytics) {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      overview: overview,
      totalStudents: students.length,
      students: students.map(function (s) { return { name: s.name, readiness: s.readiness, placement: s.placementProbability, resume: s.resumeScore, risk: s.riskLevel, career: s.careerInterest, skills: s.skills } }),
      riskSummary: { totalRisks: risks.reduce(function (sum, r) { return sum + r.riskCount }, 0), atRisk: risks.filter(function (r) { return r.riskLevel === 'high' || r.riskLevel === 'critical' }).length },
      careerDistribution: analytics.careerDist
    }, null, 2)
  }

  function exportMarkdown (students, overview, risks, analytics, insights) {
    var md = '# Mentor Dashboard Report\n\n'
    md += 'Generated ' + new Date().toLocaleDateString() + '\n\n'

    md += '## Overview\n\n'
    md += '- **Total Students:** ' + overview.totalStudents + '\n'
    md += '- **Average Readiness:** ' + overview.avgReadiness + '%\n'
    md += '- **Average Placement:** ' + overview.avgPlacement + '%\n'
    md += '- **Average Resume:** ' + overview.avgResume + '%\n'
    md += '- **Active Learners:** ' + overview.activeLearners + '\n'
    md += '- **At-Risk Students:** ' + overview.atRisk + '\n\n'

    md += '## Students\n\n'
    md += '| Name | Readiness | Placement | Resume | Risk | Career Interest |\n'
    md += '|------|-----------|-----------|--------|------|----------------|\n'
    students.forEach(function (s) {
      md += '| ' + s.name + ' | ' + s.readiness + '% | ' + s.placementProbability + '% | ' + s.resumeScore + '% | ' + s.riskLevel + ' | ' + (s.careerInterest || '') + ' |\n'
    })

    md += '\n## Risk Summary\n\n'
    md += '- Total risk flags: ' + risks.reduce(function (sum, r) { return sum + r.riskCount }, 0) + '\n'
    md += '- At-risk students: ' + risks.filter(function (r) { return r.riskLevel === 'high' || r.riskLevel === 'critical' }).length + '\n\n'

    md += '## Career Interests\n\n'
    analytics.careerDist.forEach(function (c) {
      md += '- ' + c.label + ': ' + c.value + ' students\n'
    })

    md += '\n## Top Skills (Most Common)\n\n'
    ;(analytics.allSkills || []).forEach(function (s) {
      md += '- ' + s[0] + ': ' + s[1] + ' students\n'
    })

    md += '\n## Most Common Weaknesses\n\n'
    insights.mostCommonWeaknesses.forEach(function (w) {
      md += '- ' + w.skill + ': ' + w.count + ' students missing this\n'
    })

    return md
  }

  function exportCSV (students) {
    var headers = 'Name,Email,Readiness,Placement,Resume,Profile Strength,Risk Level,Career Interest,Skills,Projects,Certifications,Internships,GitHub Activity\n'
    var rows = students.map(function (s) {
      return '"' + s.name + '","' + s.email + '",' + (s.readiness || 0) + ',' + (s.placementProbability || 0) + ',' + (s.resumeScore || 0) + ',' + (s.profileStrength || 0) + ',"' + (s.riskLevel || '') + '","' + (s.careerInterest || '') + '","' + (s.skills || []).join('; ') + '",' + (s.projectsCount || 0) + ',' + (s.certificationsCount || 0) + ',' + (s.internshipsCount || 0) + ',' + (s.githubActivity || 0)
    }).join('\n')
    return headers + rows
  }

  function exportPDF (students, overview, risks, analytics, insights) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var bg = isDark ? '#0F172A' : '#FFFFFF'
    var text = isDark ? '#E2E8F0' : '#1E293B'
    var card = isDark ? '#1E293B' : '#F8FAFC'

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mentor Dashboard Report</title>'
    html += '<style>body{font-family:Inter,sans-serif;background:' + bg + ';color:' + text + ';padding:40px;line-height:1.6}h1{font-size:28px}h2{font-size:20px;border-bottom:2px solid #4F46E5;padding-bottom:6px;margin-top:28px}.section{background:' + card + ';border-radius:12px;padding:20px;margin:12px 0}.stat{font-size:36px;font-weight:700;color:#4F46E5}.grid{display:flex;flex-wrap:wrap;gap:12px}.item{flex:1;min-width:120px;padding:12px;background:' + bg + ';border-radius:8px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{text-align:left;padding:6px 10px;border-bottom:1px solid ' + (isDark ? '#334155' : '#E2E8F0') + '}th{font-weight:600;font-size:12px}td{font-size:12px}</style></head><body>'
    html += '<h1>Mentor Dashboard Report</h1><p>Generated ' + new Date().toLocaleDateString() + '</p>'

    html += '<div class="section"><h2>Cohort Overview</h2><div class="grid">'
    html += '<div class="item"><div class="stat">' + overview.totalStudents + '</div><div>Students</div></div>'
    html += '<div class="item"><div class="stat">' + overview.avgReadiness + '%</div><div>Avg Readiness</div></div>'
    html += '<div class="item"><div class="stat">' + overview.avgPlacement + '%</div><div>Avg Placement</div></div>'
    html += '<div class="item"><div class="stat">' + overview.atRisk + '</div><div>At Risk</div></div>'
    html += '</div></div>'

    html += '<div class="section"><h2>Student Roster</h2><table><tr><th>Name</th><th>Readiness</th><th>Placement</th><th>Resume</th><th>Risk</th><th>Career</th></tr>'
    students.forEach(function (s) {
      var c = s.riskLevel === 'low' ? '#10B981' : s.riskLevel === 'medium' ? '#F59E0B' : '#EF4444'
      html += '<tr><td>' + s.name + '</td><td>' + s.readiness + '%</td><td>' + s.placementProbability + '%</td><td>' + s.resumeScore + '%</td><td style="color:' + c + '">' + s.riskLevel + '</td><td>' + (s.careerInterest || '') + '</td></tr>'
    })
    html += '</table></div>'

    html += '<div class="section"><h2>Career Interests</h2><table><tr><th>Career Path</th><th>Students</th></tr>'
    analytics.careerDist.forEach(function (c) {
      html += '<tr><td>' + c.label + '</td><td>' + c.value + '</td></tr>'
    })
    html += '</table></div>'

    html += '<div class="section"><h2>Most Common Weaknesses</h2><table><tr><th>Skill Gap</th><th>Students Missing</th></tr>'
    insights.mostCommonWeaknesses.forEach(function (w) {
      html += '<tr><td>' + w.skill + '</td><td>' + w.count + '</td></tr>'
    })
    html += '</table></div>'

    html += '<p style="text-align:center;margin-top:40px;font-size:12px;opacity:0.5">Generated by SkillPilot AI — Mentor Dashboard</p></body></html>'
    return html
  }

  return {
    getStudents: getStudents,
    getOverview: getOverview,
    detectRisks: detectRisks,
    getCohortAnalytics: getCohortAnalytics,
    getTopTalent: getTopTalent,
    getInsights: getInsights,
    generateBulkActions: generateBulkActions,
    exportJSON: exportJSON,
    exportMarkdown: exportMarkdown,
    exportCSV: exportCSV,
    exportPDF: exportPDF
  }
})()
