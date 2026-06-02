const ResumeService = (function () {
  var REQUIRED_SECTIONS = ['Education', 'Skills', 'Projects', 'Experience', 'Certifications']
  var ALL_SECTIONS = ['Education', 'Skills', 'Projects', 'Experience', 'Certifications', 'Achievements', 'Summary', 'Publications']
  var SECTION_WEIGHT = 0.20
  var KEYWORD_WEIGHT = 0.50
  var FORMAT_WEIGHT = 0.15
  var LENGTH_WEIGHT = 0.15
  var SKILL_CATEGORIES = ['Programming Languages', 'Frontend', 'Backend', 'Databases', 'AI & Data Science', 'Cloud', 'DevOps', 'Mobile', 'Soft Skills', 'Dev Tools']

  var DEMO_RESUME = 'Aryan Sharma\naryan.sharma@skillpilot.ai | github.com/aryan-dev | linkedin.com/in/aryansharma | +91-98765-43210\n\nEducation\nBCA (Bachelor of Computer Applications) — 8.5 CGPA\nAurora University, 2024–2027\n\nSkills\nPython: Advanced, Machine Learning, Data Analysis, NumPy, Pandas, Scikit-learn\nJavaScript/TypeScript: React, Node.js, Express, Next.js\nDatabases: SQL, MongoDB, PostgreSQL\nCloud & DevOps: Docker, AWS, Git, CI/CD\nTools: VS Code, Jupyter, Figma, Postman\n\nProjects\nSkillPilot AI — AI career intelligence platform with dashboard, resume analyzer, placement predictor. Built with JavaScript, Chart.js, CSS.\nE-Commerce Platform — Full-stack React + Node.js e-commerce app with payment gateway integration.\nChat Application — Real-time chat using Socket.io, MongoDB, Express.\nPortfolio Website — Personal portfolio with dark mode, animations, responsive design.\nML Model Deployment — Deployed a sentiment analysis model using Flask and Docker.\n\nExperience\nSoftware Development Intern — TechSolutions Inc. (3 months)\nBuilt React components, REST APIs with Node.js/MongoDB, wrote unit tests.\n\nCertifications\nAWS Cloud Practitioner — Amazon Web Services\nGoogle Data Analytics Professional — Coursera\nMeta Front-End Developer Professional — Coursera\n\nAchievements\nTop 5 in University Hackathon 2026\nDean\'s List for Academic Excellence\nOpen Source Contributor — 3 merged PRs'

  /* ---- SECTION PARSING ---- */
  function _detectSections (text) {
    var lower = text.toLowerCase()
    var present = []
    var missing = []
    var weak = []

    ALL_SECTIONS.forEach(function (section) {
      if (lower.includes(section.toLowerCase())) {
        present.push(section)
        var secLines = _extractSectionLines(text, section)
        if (secLines.length < 3) weak.push(section)
      } else {
        missing.push(section)
      }
    })

    return { present: present, missing: missing, weak: weak }
  }

  function _extractSectionLines (text, section) {
    var lines = text.split('\n')
    var found = false
    var secLines = []
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(section.toLowerCase())) {
        found = true
        continue
      }
      if (found) {
        if (ALL_SECTIONS.some(function (s) { return s !== section && lines[i].toLowerCase().includes(s.toLowerCase()) })) break
        if (lines[i].trim()) secLines.push(lines[i])
      }
    }
    return secLines
  }

  /* ---- KEYWORD PARSING ---- */
  function _parseSkills (text) {
    var lower = text.toLowerCase()
    var skillsDb = window.SkillsDB || []
    var matched = []
    var missing = []

    skillsDb.forEach(function (skill) {
      var sk = skill.name.toLowerCase()
      if (lower.includes(sk)) {
        matched.push({ keyword: skill.name, count: (lower.match(new RegExp('\\b' + sk.replace(/[.+^${}()|[\]\\]/g, '\\$&') + '\\b', 'g')) || []).length, category: skill.category, importance: skill.importance })
      } else if (skill.importance > 0.7) {
        missing.push({ keyword: skill.name, importance: skill.importance, category: skill.category })
      }
    })

    var byCategory = {}
    var categories = {}
    matched.forEach(function (m) {
      var cat = m.category || 'Other'
      if (!byCategory[cat]) byCategory[cat] = []
      byCategory[cat].push(m)
      categories[cat] = (categories[cat] || 0) + 1
    })

    return {
      matched: matched,
      missing: missing.slice(0, 15),
      byCategory: byCategory,
      categoryCounts: categories
    }
  }

  function _extractTechStack (text) {
    var lower = text.toLowerCase()
    var stack = []
    var techs = ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'SQL', 'MongoDB', 'Docker', 'AWS', 'Git', 'Flask', 'Django', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NumPy', 'Pandas', 'R', 'Tableau', 'Power BI', 'Kubernetes', 'GraphQL', 'Next.js', 'Vue.js', 'Angular', 'Redis', 'PostgreSQL', 'Firebase', 'GCP', 'Azure', 'CI/CD', 'Linux', 'HTML/CSS', 'Figma', 'REST API', 'GraphQL']
    techs.forEach(function (t) {
      if (lower.includes(t.toLowerCase())) stack.push(t)
    })
    return stack
  }

  /* ---- SCORING ---- */
  function _rateFormat (text) {
    var score = 100
    var lines = text.split('\n').filter(function (l) { return l.trim() })
    if (lines.length < 20) score -= 15
    if (lines.length > 200) score -= 10
    var hasBullets = /[•\-*\d.]/.test(text)
    if (!hasBullets) score -= 10
    var hasEmail = /\S+@\S+/.test(text)
    if (!hasEmail) score -= 10
    var hasPhone = /[\d\-+]{10,}/.test(text)
    if (!hasPhone) score -= 10
    var hasLinks = /(https?:\/\/|github|linkedin)/i.test(text)
    if (!hasLinks) score -= 10
    var hasNumbers = /\d+/.test(text)
    if (!hasNumbers) score -= 5
    return Math.max(0, score)
  }

  function _scoreLength (text) {
    var words = text.split(/\s+/).filter(function (w) { return w.length > 1 }).length
    if (words >= 300 && words <= 800) return 100
    if (words >= 200 && words <= 1000) return 80
    if (words >= 100 && words <= 1500) return 60
    return 40
  }

  function _scoreATS (matched, sectionResult, formatScore) {
    var keywordScore = matched.length > 0
      ? Math.min(100, (matched.filter(function (m) { return m.count > 0 }).length / Math.max(matched.length, 1)) * 100)
      : 0
    var sectionScore = REQUIRED_SECTIONS.length > 0
      ? (sectionResult.present.length / REQUIRED_SECTIONS.length) * 100
      : 0
    return Math.round(keywordScore * 0.40 + sectionScore * 0.30 + formatScore * 0.30)
  }

  function _scoreTechnicalDepth (matched, byCategory, sectionResult) {
    var depthByCategory = Object.keys(byCategory).length * 12
    var totalSkills = matched.length * 5
    var hasProjects = sectionResult.present.indexOf('Projects') >= 0 ? 15 : 0
    var hasExperience = sectionResult.present.indexOf('Experience') >= 0 ? 10 : 0
    var hasCertifications = sectionResult.present.indexOf('Certifications') >= 0 ? 5 : 0
    return Math.min(100, Math.round(depthByCategory + totalSkills + hasProjects + hasExperience + hasCertifications))
  }

  function _scoreRecruiterAppeal (strengths, weaknesses, formatScore, sectionResult, matched) {
    var base = 50
    base += strengths.length * 8
    base -= weaknesses.length * 6
    base += formatScore > 80 ? 10 : formatScore > 60 ? 5 : 0
    base += sectionResult.present.length >= 4 ? 10 : sectionResult.present.length >= 3 ? 5 : 0
    base += matched.length > 10 ? 10 : matched.length > 5 ? 5 : 0
    return Math.min(100, Math.max(0, Math.round(base)))
  }

  function _scoreProfileCompleteness (sectionResult, formatScore, lengthScore) {
    var sectionScore = (sectionResult.present.length / ALL_SECTIONS.length) * 100
    var weakPenalty = sectionResult.weak.length * 5
    return Math.min(100, Math.max(0, Math.round(sectionScore * 0.50 + formatScore * 0.25 + lengthScore * 0.25 - weakPenalty)))
  }

  /* ---- SUGGESTIONS ---- */
  function _generateSuggestions (sectionResult, keywordResult, formatScore, matched, missing) {
    var suggestions = []
    if (sectionResult.missing.length > 0) {
      sectionResult.missing.forEach(function (s) { suggestions.push('Add "' + s + '" section to your resume') })
    }
    sectionResult.weak.forEach(function (s) { suggestions.push('Strengthen "' + s + '" section with more detail') })
    if (formatScore < 70) suggestions.push('Improve formatting: add contact info, links, and bullet points')
    if (missing.length > 3) suggestions.push('Add high-value skills: ' + missing.slice(0, 5).map(function (m) { return m.keyword }).join(', '))
    if (matched.length < 5) suggestions.push('Include more industry-relevant keywords to improve ATS match')
    var categories = Object.keys(keywordResult.byCategory || {})
    if (categories.length < 3) suggestions.push('Diversify your skills across more categories (current: ' + categories.length + ')')
    return suggestions
  }

  /* ---- MAIN ANALYZE ---- */
  async function analyze (text) {
    await new Promise(function (r) { setTimeout(r, 700 + Math.random() * 500) })

    var sectionResult = _detectSections(text)
    var keywordResult = _parseSkills(text)
    var formatScore = _rateFormat(text)
    var lengthScore = _scoreLength(text)
    var techStack = _extractTechStack(text)

    var atsScore = _scoreATS(keywordResult.matched, sectionResult, formatScore)
    var technicalDepth = _scoreTechnicalDepth(keywordResult.matched, keywordResult.byCategory, sectionResult)

    var strengthList = [
      sectionResult.present.length >= 3 ? 'Good section coverage (' + sectionResult.present.length + '/8 sections)' : null,
      formatScore >= 70 ? 'Well formatted resume with contact info and links' : null,
      keywordResult.matched.length > 5 ? 'Strong keyword presence (' + keywordResult.matched.length + ' skills detected)' : null,
      lengthScore >= 80 ? 'Optimal resume length (' + text.split(/\s+/).filter(function (w) { return w.length > 1 }).length + ' words)' : null,
      Object.keys(keywordResult.byCategory).length >= 3 ? 'Skills span ' + Object.keys(keywordResult.byCategory).length + ' categories' : null
    ].filter(function (s) { return s })

    var weaknessList = [
      sectionResult.missing.indexOf('Projects') >= 0 ? 'No projects section — critical for technical roles' : null,
      sectionResult.missing.indexOf('Experience') >= 0 ? 'No experience section' : null,
      sectionResult.missing.indexOf('Achievements') >= 0 ? 'No achievements section — consider adding one' : null,
      keywordResult.missing.length > 5 ? 'Missing ' + keywordResult.missing.length + ' high-value keywords' : null,
      formatScore < 70 ? 'Poor formatting: ' + (formatScore < 50 ? 'add contact info, links, bullet points' : 'improve structure') : null,
      lengthScore < 60 ? 'Resume too short — add more detail' : null,
      Object.keys(keywordResult.byCategory).length < 3 ? 'Skills concentrated in only ' + Object.keys(keywordResult.byCategory).length + ' categories — diversify' : null
    ].filter(function (s) { return s })

    var recruiterAppeal = _scoreRecruiterAppeal(strengthList, weaknessList, formatScore, sectionResult, keywordResult.matched)
    var profileCompleteness = _scoreProfileCompleteness(sectionResult, formatScore, lengthScore)
    var resumeScore = Math.round(atsScore * 0.30 + technicalDepth * 0.25 + recruiterAppeal * 0.25 + profileCompleteness * 0.20)

    var suggestions = _generateSuggestions(sectionResult, keywordResult, formatScore, keywordResult.matched, keywordResult.missing)
    var biggestMissing = keywordResult.missing.length ? keywordResult.missing.slice().sort(function (a, b) { return b.importance - a.importance })[0] : null

    var result = {
      resumeScore: resumeScore,
      atsScore: atsScore,
      technicalDepthScore: technicalDepth,
      recruiterAppealScore: recruiterAppeal,
      profileCompletenessScore: profileCompleteness,
      keywordMatch: {
        matched: keywordResult.matched,
        missing: keywordResult.missing.slice(0, 10),
        byCategory: keywordResult.byCategory,
        categoryCounts: keywordResult.categoryCounts,
        totalMatched: keywordResult.matched.length,
        totalMissing: keywordResult.missing.length
      },
      sections: sectionResult,
      techStack: techStack,
      strengths: strengthList,
      weaknesses: weaknessList,
      suggestions: suggestions,
      biggestMissing: biggestMissing,
      highestImpact: suggestions.length ? suggestions[0] : null,
      formatScore: formatScore,
      lengthScore: lengthScore,
      confidence: keywordResult.matched.length > 3 ? 'High' : 'Medium',
      calculation: {
        steps: [
          'Keyword Match: ' + keywordResult.matched.length + ' skills found across ' + Object.keys(keywordResult.byCategory).length + ' categories',
          'Sections: ' + sectionResult.present.length + '/' + ALL_SECTIONS.length + ' sections detected (' + sectionResult.missing.length + ' missing, ' + sectionResult.weak.length + ' weak)',
          'Format Score: ' + formatScore + '/100 (checked: bullets, email, phone, links, numbers)',
          'Length Score: ' + lengthScore + '/100 (optimal range 300-800 words)',
          'ATS Score: keyword density (40%) + sections (30%) + format (30%)',
          'Technical Depth: category breadth + skill count + projects/experience/certs bonuses',
          'Recruiter Appeal: base 50 + strengths(' + strengthList.length + '×8) - weaknesses(' + weaknessList.length + '×6) + format/sections/keyword bonuses',
          'Profile Completeness: sections (50%) + format (25%) + length (25%) - weak section penalties',
          'Final Resume Score: ATS(30%) + Technical Depth(25%) + Recruiter Appeal(25%) + Completeness(20%)'
        ],
        formula: 'resumeScore = atsScore(0.30) + technicalDepth(0.25) + recruiterAppeal(0.25) + profileCompleteness(0.20)'
      }
    }

    Store.set('resumeAnalysis', result)
    if (typeof ApiService !== 'undefined') {
      ApiService.resume.analyze(text, '').catch(function () {})
    }
    return result
  }

  /* ---- EXPORTS ---- */
  function exportJSON (analysis) {
    return JSON.stringify(analysis, null, 2)
  }

  function exportMarkdown (analysis) {
    var md = '# Resume Analysis Report\n\n'
    md += '**Generated:** ' + new Date().toISOString() + '\n\n'

    md += '## Scores\n\n'
    md += '| Metric | Score |\n|--------|------|\n'
    md += '| Resume Intelligence | ' + analysis.resumeScore + '/100 |\n'
    md += '| ATS Compatibility | ' + analysis.atsScore + '/100 |\n'
    md += '| Technical Depth | ' + analysis.technicalDepthScore + '/100 |\n'
    md += '| Recruiter Appeal | ' + analysis.recruiterAppealScore + '/100 |\n'
    md += '| Profile Completeness | ' + analysis.profileCompletenessScore + '/100 |\n\n'

    md += '## Keywords Found\n\n'
    var cats = analysis.keywordMatch.byCategory || {}
    Object.keys(cats).forEach(function (cat) {
      md += '### ' + cat + '\n'
      cats[cat].forEach(function (k) { md += '- ' + k.keyword + ' (×' + k.count + ')\n' })
      md += '\n'
    })

    if (analysis.suggestions.length) {
      md += '## Suggestions\n\n'
      analysis.suggestions.forEach(function (s) { md += '- ' + s + '\n' })
      md += '\n'
    }

    md += '## Calculation Steps\n\n'
    analysis.calculation.steps.forEach(function (s, i) { md += (i + 1) + '. ' + s + '\n' })
    md += '\n---\n*Generated by SkillPilot AI Resume Analyzer*'

    return md
  }

  function getLastAnalysis () {
    return Store.get('resumeAnalysis')
  }

  return { analyze: analyze, exportJSON: exportJSON, exportMarkdown: exportMarkdown, getLastAnalysis: getLastAnalysis, DEMO_RESUME: DEMO_RESUME }
})()
