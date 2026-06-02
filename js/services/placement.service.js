const PlacementService = (function () {
  var FACTORS = [
    { name: 'CGPA', weight: 0.15, compute: function (user) { return { score: Math.round((Math.min(10, (user.cgpa || 8.5)) / 10) * 100), raw: user.cgpa || 8.5 } } },
    { name: 'Skills', weight: 0.25, compute: function (user) {
      var skills = user.skills || []
      if (!skills.length) return { score: 0, raw: 0 }
      var avgLevel = Math.round(skills.reduce(function (s, sk) { return s + (sk.level || 50) }, 0) / skills.length)
      var countBonus = Math.min(20, skills.length * 3)
      return { score: Math.min(100, avgLevel + countBonus), raw: avgLevel }
    } },
    { name: 'Projects', weight: 0.20, compute: function (user) {
      var projects = user.projects || []
      if (!projects.length) return { score: 0, raw: 0 }
      var completed = projects.filter(function (p) { return p.completed }).length
      var ratio = completed / Math.max(1, projects.length)
      var techDiversity = Math.min(20, new Set(projects.reduce(function (a, p) { return a.concat(p.technologies || []) }, [])).size * 4)
      return { score: Math.min(100, Math.round(ratio * 60 + (completed * 8) + techDiversity)), raw: { total: projects.length, completed: completed } }
    } },
    { name: 'Internships', weight: 0.15, compute: function (user) {
      var internships = user.internships || []
      var count = internships.length || (user.projects ? Math.min(2, Math.floor(user.projects.length / 2)) : 1)
      return { score: Math.min(100, count * 30), raw: count }
    } },
    { name: 'Certifications', weight: 0.10, compute: function (user) {
      var certs = user.certifications || []
      return { score: Math.min(100, certs.length * 25), raw: certs.length }
    } },
    { name: 'Resume Score', weight: 0.10, compute: function (user) {
      var ra = Store.get('resumeAnalysis')
      return { score: (ra && ra.resumeScore) || 70, raw: (ra && ra.resumeScore) || 70 }
    } },
    { name: 'GitHub Activity', weight: 0.05, compute: function (user) {
      var gh = Store.get('githubData')
      return { score: (gh && gh.score) || 60, raw: (gh && gh.score) || 60 }
    } }
  ]

  var CLASSIFICATIONS = [
    { min: 85, label: 'Industry Ready', desc: 'You are highly competitive for top-tier companies. Focus on targeting specific roles and preparing for interviews.', icon: 'fa-rocket', color: '#10B981' },
    { min: 70, label: 'Strong Candidate', desc: 'Strong profile with good placement prospects. Bridge remaining gaps to reach top-tier readiness.', icon: 'fa-star', color: '#06B6D4' },
    { min: 55, label: 'Competitive', desc: 'You have a solid foundation. Focused improvement in 2-3 areas will significantly boost your chances.', icon: 'fa-arrow-trend-up', color: '#F59E0B' },
    { min: 35, label: 'Developing', desc: 'Building your profile. Prioritize projects, certifications, and skill development to improve prospects.', icon: 'fa-seedling', color: '#8B5CF6' },
    { min: 0, label: 'High Risk', desc: 'Your profile needs significant strengthening. Focus on fundamentals: complete projects, build skills, earn certifications.', icon: 'fa-triangle-exclamation', color: '#EF4444' }
  ]

  var SCENARIOS = [
    { id: 'addInternship', label: '+1 Internship', description: 'Add a 3-month internship', modifier: { type: 'addInternship', value: 1 } },
    { id: 'addCert', label: '+1 Certification', description: 'Earn an additional certification', modifier: { type: 'addCert', value: 1 } },
    { id: 'addProjects', label: '+2 Projects', description: 'Complete 2 new portfolio projects', modifier: { type: 'addProjects', value: 2 } },
    { id: 'improveCGPA', label: 'Improve CGPA (9.0)', description: 'Raise CGPA from current to 9.0', modifier: { type: 'cgpa', value: 9.0 } },
    { id: 'learnSQL', label: 'Learn SQL', description: 'Add SQL to your skill set at 80%', modifier: { type: 'addSkill', name: 'SQL', level: 80 } },
    { id: 'mlProject', label: 'Complete ML Project', description: 'Add a completed ML project with 4+ technologies', modifier: { type: 'addProject', completed: true, techCount: 4 } }
  ]

  /* ---- Compute overall score ---- */
  function _computeFactors (user) {
    return FACTORS.map(function (f) {
      var result = f.compute(user)
      var score = result.score
      var weighted = Math.round(score * f.weight)
      var impact = score >= 80 ? 'low' : score >= 55 ? 'medium' : 'high'
      return {
        factor: f.name,
        score: score,
        weight: f.weight,
        weighted: weighted,
        impact: impact,
        raw: result.raw,
        maxPossible: Math.round(100 * f.weight),
        remaining: Math.round((100 - score) * f.weight)
      }
    })
  }

  function _computeProbability (factors) {
    var total = factors.reduce(function (s, f) { return s + f.weighted }, 0)
    return Math.min(99, Math.max(1, total))
  }

  function _classify (probability) {
    for (var i = 0; i < CLASSIFICATIONS.length; i++) {
      if (probability >= CLASSIFICATIONS[i].min) return CLASSIFICATIONS[i]
    }
    return CLASSIFICATIONS[CLASSIFICATIONS.length - 1]
  }

  function _confidence (user) {
    var skills = user.skills || []
    var projects = user.projects || []
    if (skills.length >= 5 && projects.length >= 2) return 'High'
    if (skills.length >= 2) return 'Medium'
    return 'Low'
  }

  /* ---- Salary Estimation ---- */
  function _estimateSalary (probability, user, targetRole) {
    var pd = window.PlacementData
    var domainSalaries = pd && pd.domainSalaries ? pd.domainSalaries : {}
    var premiums = pd && pd.skillPremiums ? pd.skillPremiums : {}

    // Base from matching domain
    var domainKey = null
    if (domainSalaries) {
      var keys = Object.keys(domainSalaries)
      for (var i = 0; i < keys.length; i++) {
        if (targetRole && targetRole.toLowerCase().indexOf(keys[i].toLowerCase()) >= 0) { domainKey = keys[i]; break }
      }
      if (!domainKey && targetRole) {
        if (targetRole.indexOf('Scientist') >= 0 || targetRole.indexOf('Data') >= 0) domainKey = 'Data Science'
        else if (targetRole.indexOf('ML') >= 0 || targetRole.indexOf('Machine Learning') >= 0) domainKey = 'Machine Learning'
        else if (targetRole.indexOf('Software') >= 0 || targetRole.indexOf('Full Stack') >= 0 || targetRole.indexOf('Developer') >= 0) domainKey = 'Software Engineering'
        else if (targetRole.indexOf('Cloud') >= 0) domainKey = 'Cloud Engineering'
        else if (targetRole.indexOf('Cyber') >= 0) domainKey = 'Cyber Security'
        else if (targetRole.indexOf('Analyst') >= 0) domainKey = 'Data Analytics'
      }
    }

    var baseFresher = domainKey && domainSalaries[domainKey] ? domainSalaries[domainKey].fresher : { min: 400000, max: 1000000 }

    // Compute skill premium
    var userSkills = user.skills || []
    var totalPremium = 0
    var premiumCount = 0
    if (premiums) {
      userSkills.forEach(function (s) {
        if (premiums[s.name]) { totalPremium += premiums[s.name]; premiumCount++ }
      })
    }
    var avgPremium = premiumCount > 0 ? totalPremium / premiumCount : 0

    // Scale by probability
    var probFactor = probability / 100
    var premiumBoost = 1 + (avgPremium / 100) * probFactor

    var entryMin = Math.round(baseFresher.min * (0.7 + probFactor * 0.3))
    var entryMax = Math.round(baseFresher.max * (0.7 + probFactor * 0.3))
    var likelyMin = Math.round(baseFresher.min * (0.9 + probFactor * 0.4) * premiumBoost)
    var likelyMax = Math.round(baseFresher.max * (0.9 + probFactor * 0.4) * premiumBoost)
    var stretchMin = Math.round(baseFresher.min * (1.2 + probFactor * 0.6) * premiumBoost * 1.2)
    var stretchMax = Math.round(baseFresher.max * (1.2 + probFactor * 0.6) * premiumBoost * 1.2)

    return {
      entry: { min: entryMin, max: entryMax },
      likely: { min: likelyMin, max: likelyMax },
      stretch: { min: stretchMin, max: stretchMax },
      currency: 'INR',
      premiumApplied: avgPremium > 0,
      premiumPercent: Math.round(avgPremium)
    }
  }

  /* ---- Company Matching ---- */
  function _matchCompanies (probability, user) {
    var companies = window.CompaniesData || []
    var userSkills = user.skills || []
    var targetRole = ''

    // Get target role from skill gap or career recs
    var sg = Store.get('skillGapAnalysis')
    if (sg && sg.targetRole) targetRole = sg.targetRole
    else {
      var cr = Store.get('careerRecommendations')
      if (cr && cr.topRecommendation) targetRole = cr.topRecommendation.title
    }

    return companies.map(function (c) {
      var minForRole = c.minScore || 70
      var rawMatch = probability >= minForRole
        ? Math.min(98, Math.round(probability - (minForRole - probability) * 0.15))
        : Math.round((probability / Math.max(1, minForRole)) * 50)

      var matchScore = Math.max(5, Math.min(98, rawMatch))

      // Skill overlap
      var reqSkills = ['Python', 'JavaScript', 'SQL', 'Data Structures', 'Algorithms']
      var matched = reqSkills.filter(function (rs) { return userSkills.some(function (us) { return us.name.toLowerCase() === rs.toLowerCase() }) })
      var missing = reqSkills.filter(function (rs) { return !userSkills.some(function (us) { return us.name.toLowerCase() === rs.toLowerCase() }) })

      return {
        name: c.name,
        industry: c.industry,
        type: c.type,
        matchScore: matchScore,
        minScore: minForRole,
        eligible: probability >= minForRole,
        salaryRange: c.avgSalary || { min: 500000, max: 1000000 },
        roles: c.roles || [],
        requiredSkills: reqSkills,
        matchedSkills: matched,
        missingSkills: missing.slice(0, 4),
        reasoning: probability >= minForRole
          ? 'Your profile score (' + probability + ') meets ' + c.name + '\'s threshold (' + minForRole + ')'
          : 'Your profile score (' + probability + ') is below ' + c.name + '\'s threshold (' + minForRole + ') by ' + (minForRole - probability) + ' points'
      }
    }).sort(function (a, b) { return b.matchScore - a.matchScore })
  }

  /* ---- Recruiter View ---- */
  function _recruiterView (factors, probability, classification, user) {
    var reasonsToContact = []
    var reasonsToReject = []

    // Check strong factors
    factors.forEach(function (f) {
      if (f.score >= 75) {
        if (f.factor === 'Projects') reasonsToContact.push('Strong project portfolio with real-world applications')
        else if (f.factor === 'Skills') reasonsToContact.push('Well-rounded technical skill set (' + f.score + '% proficiency)')
        else if (f.factor === 'CGPA') reasonsToContact.push('Strong academic record (' + f.raw + ' CGPA)')
        else if (f.factor === 'Internships') reasonsToContact.push('Practical industry experience (' + f.raw + ' internship(s))')
        else if (f.factor === 'Certifications') reasonsToContact.push('Industry certifications demonstrate learning commitment')
        else if (f.factor === 'Resume Score') reasonsToContact.push('Well-crafted resume with strong ATS compatibility')
        else if (f.factor === 'GitHub Activity') reasonsToContact.push('Active GitHub profile with public contributions')
      }
    })

    if (reasonsToContact.length === 0) reasonsToContact.push('Developing profile with growth potential')

    // Check weak factors
    factors.forEach(function (f) {
      if (f.score < 50) {
        if (f.factor === 'Projects') reasonsToReject.push('Insufficient project experience — critical for technical roles')
        else if (f.factor === 'Skills') reasonsToReject.push('Skill set needs broadening for target roles')
        else if (f.factor === 'CGPA') reasonsToReject.push('CGPA below competitive threshold for top companies')
        else if (f.factor === 'Internships') reasonsToReject.push('No internship experience — many companies require it')
        else if (f.factor === 'Certifications') reasonsToReject.push('No certifications — consider earning domain-relevant ones')
        else if (f.factor === 'Resume Score') reasonsToReject.push('Resume needs improvement — low ATS compatibility')
        else if (f.factor === 'GitHub Activity') reasonsToReject.push('No GitHub activity — important signal for tech roles')
      }
    })

    if (reasonsToReject.length === 0) reasonsToReject.push('No significant red flags detected')

    // Highest impact improvement
    var sorted = factors.slice().sort(function (a, b) { return b.remaining - a.remaining })
    var top = sorted[0]

    return {
      reasonsToContact: reasonsToContact,
      reasonsToReject: reasonsToReject.slice(0, 4),
      highestImpact: top ? {
        factor: top.factor,
        currentScore: top.score,
        potentialGain: top.remaining,
        suggestion: 'Improving ' + top.factor + ' by ' + (100 - top.score) + ' points adds +' + top.remaining + ' to overall score',
        impact: '+' + top.remaining
      } : null
    }
  }

  /* ---- Scenario Simulator ---- */
  function _applyScenario (baseFactors, probability, user, scenario) {
    // Deep clone factors
    var newFactors = baseFactors.map(function (f) { return { factor: f.factor, score: f.score, weight: f.weight, weighted: f.weighted, impact: f.impact, raw: f.raw, maxPossible: f.maxPossible, remaining: f.remaining } })
    var modifier = scenario.modifier

    if (modifier.type === 'addInternship') {
      var idx = newFactors.findIndex(function (f) { return f.factor === 'Internships' })
      if (idx >= 0) {
        var newCount = (newFactors[idx].raw || 0) + modifier.value
        newFactors[idx].score = Math.min(100, newCount * 30)
        newFactors[idx].raw = newCount
        newFactors[idx].weighted = Math.round(newFactors[idx].score * newFactors[idx].weight)
        newFactors[idx].remaining = Math.round((100 - newFactors[idx].score) * newFactors[idx].weight)
        newFactors[idx].impact = newFactors[idx].score >= 80 ? 'low' : newFactors[idx].score >= 55 ? 'medium' : 'high'
      }
    } else if (modifier.type === 'addCert') {
      var idx = newFactors.findIndex(function (f) { return f.factor === 'Certifications' })
      if (idx >= 0) {
        var newCount = (newFactors[idx].raw || 0) + modifier.value
        newFactors[idx].score = Math.min(100, newCount * 25)
        newFactors[idx].raw = newCount
        newFactors[idx].weighted = Math.round(newFactors[idx].score * newFactors[idx].weight)
        newFactors[idx].remaining = Math.round((100 - newFactors[idx].score) * newFactors[idx].weight)
        newFactors[idx].impact = newFactors[idx].score >= 80 ? 'low' : newFactors[idx].score >= 55 ? 'medium' : 'high'
      }
    } else if (modifier.type === 'addProjects') {
      var idx = newFactors.findIndex(function (f) { return f.factor === 'Projects' })
      if (idx >= 0) {
        var oldRaw = newFactors[idx].raw || { total: 0, completed: 0 }
        var newTotal = oldRaw.total + modifier.value
        var newCompleted = oldRaw.completed + modifier.value
        var ratio = newCompleted / Math.max(1, newTotal)
        newFactors[idx].score = Math.min(100, Math.round(ratio * 60 + (newCompleted * 8) + 12))
        newFactors[idx].raw = { total: newTotal, completed: newCompleted }
        newFactors[idx].weighted = Math.round(newFactors[idx].score * newFactors[idx].weight)
        newFactors[idx].remaining = Math.round((100 - newFactors[idx].score) * newFactors[idx].weight)
        newFactors[idx].impact = newFactors[idx].score >= 80 ? 'low' : newFactors[idx].score >= 55 ? 'medium' : 'high'
      }
    } else if (modifier.type === 'cgpa') {
      var idx = newFactors.findIndex(function (f) { return f.factor === 'CGPA' })
      if (idx >= 0) {
        var newCgpa = Math.min(10, modifier.value || 9.0)
        newFactors[idx].score = Math.round((newCgpa / 10) * 100)
        newFactors[idx].raw = newCgpa
        newFactors[idx].weighted = Math.round(newFactors[idx].score * newFactors[idx].weight)
        newFactors[idx].remaining = Math.round((100 - newFactors[idx].score) * newFactors[idx].weight)
        newFactors[idx].impact = newFactors[idx].score >= 80 ? 'low' : newFactors[idx].score >= 55 ? 'medium' : 'high'
      }
    } else if (modifier.type === 'addSkill') {
      var idx = newFactors.findIndex(function (f) { return f.factor === 'Skills' })
      if (idx >= 0) {
        var oldAvg = newFactors[idx].raw || 0
        var newAvg = Math.round((oldAvg + (modifier.level || 80)) / 2)
        var newCount = 6 // approximate
        newFactors[idx].score = Math.min(100, newAvg + Math.min(20, newCount * 3))
        newFactors[idx].raw = newAvg
        newFactors[idx].weighted = Math.round(newFactors[idx].score * newFactors[idx].weight)
        newFactors[idx].remaining = Math.round((100 - newFactors[idx].score) * newFactors[idx].weight)
      }
    } else if (modifier.type === 'addProject') {
      var idx = newFactors.findIndex(function (f) { return f.factor === 'Projects' })
      if (idx >= 0) {
        var oldRaw = newFactors[idx].raw || { total: 0, completed: 0 }
        var newTotal = oldRaw.total + 1
        var newCompleted = (modifier.completed !== false) ? oldRaw.completed + 1 : oldRaw.completed
        var ratio = newCompleted / Math.max(1, newTotal)
        var techBonus = Math.min(20, (modifier.techCount || 4) * 4)
        newFactors[idx].score = Math.min(100, Math.round(ratio * 60 + (newCompleted * 8) + techBonus))
        newFactors[idx].raw = { total: newTotal, completed: newCompleted }
        newFactors[idx].weighted = Math.round(newFactors[idx].score * newFactors[idx].weight)
        newFactors[idx].remaining = Math.round((100 - newFactors[idx].score) * newFactors[idx].weight)
      }
    }

    var newProb = _computeProbability(newFactors)
    var newClass = _classify(newProb)
    return { probability: newProb, classification: newClass, factors: newFactors }
  }

  function _generateImprovements (factors) {
    var map = {
      CGPA: ['Focus on improving core subject grades', 'Retake low-grade courses if possible', 'Take online courses to supplement GPA'],
      Skills: ['Learn high-demand skills in AI, Cloud, or Data Science', 'Deepen existing skills with advanced topics', 'Diversify across more categories'],
      Projects: ['Build 2-3 production-quality projects', 'Contribute to open source', 'Deploy projects with CI/CD pipelines'],
      Internships: ['Apply to intern roles at target companies', 'Consider remote/startup internships', 'Build projects to compensate'],
      Certifications: ['Earn cloud certifications (AWS, Azure, GCP)', 'Complete Coursera/edX Specializations', 'Get domain-specific certs'],
      'Resume Score': ['Quantify achievements with metrics', 'Tailor resume to each application', 'Add industry keywords'],
      'GitHub Activity': ['Contribute to open source projects', 'Push projects with good README/docs', 'Maintain a consistent commit streak']
    }

    return factors.filter(function (f) { return f.score < 70 }).map(function (f) {
      return {
        area: f.factor,
        currentScore: f.score,
        remaining: f.remaining,
        suggestions: map[f.factor] || ['Improve this area to boost placement chances'],
        impact: f.remaining > 10 ? '+10-15%' : '+5-8%'
      }
    })
  }

  /* ===== MAIN PREDICT ===== */
  async function predict () {
    await new Promise(function (r) { setTimeout(r, 600 + Math.random() * 500) })

    var user = Store.get('user') || {}
    if (!user.skills) user.skills = []
    if (!user.projects) user.projects = []
    if (!user.certifications) user.certifications = []
    if (!user.internships) user.internships = []

    var factors = _computeFactors(user)
    var probability = _computeProbability(factors)
    var classification = _classify(probability)
    var confidence = _confidence(user)

    // Target role for salary estimation
    var sg = Store.get('skillGapAnalysis')
    var cr = Store.get('careerRecommendations')
    var targetRole = null
    if (sg && sg.targetRole) targetRole = sg.targetRole
    else if (cr && cr.topRecommendation) targetRole = cr.topRecommendation.title

    var salary = _estimateSalary(probability, user, targetRole)
    var companyMatches = _matchCompanies(probability, user)
    var recruiterView = _recruiterView(factors, probability, classification, user)
    var improvements = _generateImprovements(factors)

    var eligibleCount = companyMatches.filter(function (c) { return c.eligible }).length

    var steps = []
    factors.forEach(function (f) {
      steps.push(f.factor + ': ' + f.score + '/100 × ' + Math.round(f.weight * 100) + '% = ' + f.weighted + ' pts')
    })
    steps.push('Total: ' + factors.reduce(function (s, f) { return s + f.weighted }, 0) + ' → ' + probability + '%')
    steps.push('Classification: ' + classification.label + ' (' + probability + '%)')
    steps.push('Salary (likely): ₹' + salary.likely.min.toLocaleString() + ' - ₹' + salary.likely.max.toLocaleString())
    steps.push('Eligible companies: ' + eligibleCount + '/' + companyMatches.length)

    var result = {
      probability: probability,
      confidence: confidence,
      classification: classification,
      factorBreakdown: factors,
      salaryEstimate: salary,
      companyMatches: companyMatches,
      eligibleCompanyCount: eligibleCount,
      totalCompanies: companyMatches.length,
      recruiterView: recruiterView,
      improvements: improvements,
      targetRole: targetRole,
      scenarios: SCENARIOS.map(function (s) {
        var sim = _applyScenario(factors, probability, user, s)
        return { id: s.id, label: s.label, description: s.description, result: sim }
      }),
      calculation: {
        steps: steps,
        formula: 'placementProbability = Σ(factorScore × factorWeight). Factors: CGPA(15%) + Skills(25%) + Projects(20%) + Internships(15%) + Certifications(10%) + Resume(10%) + GitHub(5%)'
      }
    }

    Store.set('placementPrediction', result)
    return result
  }

  /* ===== EXPORTS ===== */
  function exportJSON (analysis) {
    var out = {
      prediction: {
        probability: analysis.probability,
        confidence: analysis.confidence,
        classification: analysis.classification.label
      },
      factorBreakdown: analysis.factorBreakdown.map(function (f) {
        return { factor: f.factor, score: f.score, weight: f.weight, weighted: f.weighted }
      }),
      salary: analysis.salaryEstimate,
      topCompanies: analysis.companyMatches.slice(0, 5).map(function (c) {
        return { name: c.name, matchScore: c.matchScore, eligible: c.eligible, salaryRange: c.salaryRange, missingSkills: c.missingSkills }
      }),
      recruiterView: {
        reasonsToContact: analysis.recruiterView.reasonsToContact,
        reasonsToReject: analysis.recruiterView.reasonsToReject,
        highestImpactImprovement: analysis.recruiterView.highestImpact ? analysis.recruiterView.highestImpact.factor : null
      },
      improvements: analysis.improvements.map(function (i) { return { area: i.area, impact: i.impact, suggestions: i.suggestions } }),
      calculationSteps: analysis.calculation.steps,
      formula: analysis.calculation.formula
    }
    return JSON.stringify(out, null, 2)
  }

  function exportMarkdown (analysis) {
    var md = '# Placement Forecast Report\n\n'
    md += '**Generated:** ' + new Date().toISOString() + '\n\n'
    md += '## Overview\n\n'
    md += '| Metric | Value |\n|--------|-------|\n'
    md += '| Placement Probability | ' + analysis.probability + '% |\n'
    md += '| Classification | ' + analysis.classification.label + ' |\n'
    md += '| Confidence | ' + analysis.confidence + ' |\n'
    md += '| Eligible Companies | ' + analysis.eligibleCompanyCount + '/' + analysis.totalCompanies + ' |\n'
    md += '| Likely Salary | ₹' + analysis.salaryEstimate.likely.min.toLocaleString() + ' - ₹' + analysis.salaryEstimate.likely.max.toLocaleString() + ' |\n\n'

    md += '## Factor Breakdown\n\n'
    md += '| Factor | Score | Weight | Contribution |\n|--------|-------|--------|-------------|\n'
    analysis.factorBreakdown.forEach(function (f) {
      md += '| ' + f.factor + ' | ' + f.score + '/100 | ' + Math.round(f.weight * 100) + '% | ' + f.weighted + ' |\n'
    })

    md += '\n## Top Companies\n\n'
    md += '| Company | Match | Eligible | Salary |\n|---------|-------|----------|--------|\n'
    analysis.companyMatches.slice(0, 8).forEach(function (c) {
      md += '| ' + c.name + ' | ' + c.matchScore + '% | ' + (c.eligible ? 'Yes' : 'No') + ' | ₹' + c.salaryRange.min.toLocaleString() + '-' + c.salaryRange.max.toLocaleString() + ' |\n'
    })

    if (analysis.improvements.length) {
      md += '\n## Improvements\n\n'
      analysis.improvements.forEach(function (i) {
        md += '- **' + i.area + '** (score: ' + i.currentScore + '): ' + i.suggestions.join('; ') + '\n'
      })
    }

    md += '\n## Calculation Steps\n\n'
    analysis.calculation.steps.forEach(function (s, i) { md += (i + 1) + '. ' + s + '\n' })
    md += '\n*Formula:* ' + analysis.calculation.formula + '\n\n'
    md += '---\n*Educational Placement Forecast — Simulation Based on Current Profile*\n*Generated by SkillPilot AI Placement Predictor*'
    return md
  }

  function exportPDF (analysis) {
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SkillPilot AI — Placement Forecast</title>'
    html += '<style>'
    html += 'body{font-family:Inter,sans-serif;padding:40px;color:#1E293B;max-width:900px;margin:0 auto}'
    html += 'h1{font-size:28px;color:#4F46E5;margin-bottom:4px}'
    html += 'h2{font-size:18px;color:#1E293B;border-bottom:2px solid #E2E8F0;padding-bottom:8px;margin-top:32px}'
    html += '.sub{color:#64748B;font-size:14px;margin-bottom:24px}'
    html += 'table{width:100%;border-collapse:collapse;margin-bottom:24px}'
    html += 'th{background:#F1F5F9;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748B}'
    html += 'td{padding:10px 12px;border-bottom:1px solid #E2E8F0;font-size:14px}'
    html += '.class-badge{display:inline-block;padding:4px 12px;border-radius:6px;font-size:14px;font-weight:600}'
    html += '.section{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin-bottom:16px}'
    html += '.footer{margin-top:32px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:12px;color:#94A3B8;text-align:center}'
    html += '@media print{body{padding:20px}}'
    html += '</style></head><body>'
    html += '<h1>SkillPilot AI — Placement Forecast</h1>'
    html += '<p class="sub">Educational Placement Forecast &middot; ' + new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>'
    html += '<p style="color:#EF4444;font-size:12px;margin-bottom:24px">⚠ This is a simulation based on current profile data. Actual placement outcomes depend on many factors including interview performance, market conditions, and company hiring policies.</p>'

    html += '<h2>Overview</h2>'
    html += '<table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>'
    html += '<tr><td>Placement Probability</td><td style="font-size:24px;font-weight:700;color:' + analysis.classification.color + '">' + analysis.probability + '%</td></tr>'
    html += '<tr><td>Classification</td><td><span class="class-badge" style="background:' + analysis.classification.color + '20;color:' + analysis.classification.color + '">' + analysis.classification.label + '</span></td></tr>'
    html += '<tr><td>Confidence</td><td>' + analysis.confidence + '</td></tr>'
    html += '<tr><td>Likely Salary</td><td>₹' + analysis.salaryEstimate.likely.min.toLocaleString() + ' - ₹' + analysis.salaryEstimate.likely.max.toLocaleString() + '</td></tr>'
    html += '<tr><td>Eligible Companies</td><td>' + analysis.eligibleCompanyCount + '/' + analysis.totalCompanies + '</td></tr>'
    html += '</tbody></table>'

    html += '<h2>Factor Breakdown</h2>'
    html += '<table><thead><tr><th>Factor</th><th>Score</th><th>Weight</th><th>Contribution</th></tr></thead><tbody>'
    analysis.factorBreakdown.forEach(function (f) {
      html += '<tr><td>' + f.factor + '</td><td>' + f.score + '/100</td><td>' + Math.round(f.weight * 100) + '%</td><td>' + f.weighted + '</td></tr>'
    })
    html += '</tbody></table>'

    html += '<h2>Top Companies</h2>'
    html += '<table><thead><tr><th>Company</th><th>Match</th><th>Status</th><th>Missing Skills</th></tr></thead><tbody>'
    analysis.companyMatches.slice(0, 8).forEach(function (c) {
      html += '<tr><td><strong>' + c.name + '</strong></td><td>' + c.matchScore + '%</td><td>' + (c.eligible ? '✅ Eligible' : '❌ Below threshold') + '</td><td>' + (c.missingSkills.length ? c.missingSkills.join(', ') : 'None') + '</td></tr>'
    })
    html += '</tbody></table>'

    html += '<h2>Improvements</h2>'
    analysis.improvements.forEach(function (i) {
      html += '<div class="section"><h3 style="margin:0 0 4px;font-size:14px">' + i.area + ' <span style="color:#10B981">' + i.impact + '</span></h3><p style="margin:0;font-size:13px;color:#64748B">' + i.suggestions.join('; ') + '</p></div>'
    })

    html += '<div class="footer">Generated by SkillPilot AI Placement Predictor &middot; Simulation Based on Current Profile</div>'
    html += '</body></html>'
    return html
  }

  function getLastPrediction () {
    return Store.get('placementPrediction')
  }

  return { predict: predict, exportJSON: exportJSON, exportMarkdown: exportMarkdown, exportPDF: exportPDF, getLastPrediction: getLastPrediction, SCENARIOS: SCENARIOS }
})()
