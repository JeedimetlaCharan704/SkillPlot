const SkillService = (function () {
  var BASE_HOURS_PER_SKILL = 40
  var CATEGORY_MODIFIERS = {
    'Programming Languages': 1.0,
    'Frontend': 1.0,
    'Backend': 1.0,
    'Databases': 0.9,
    'AI & Data Science': 1.3,
    'Cloud & DevOps': 1.2,
    'Dev Tools': 0.7,
    'Soft Skills': 0.7,
    'Computer Science': 1.1,
    'Data & Analytics': 0.9,
    'Cyber Security': 1.1,
    'Design': 0.8,
    'Methodologies': 0.8,
    'Product': 0.8
  }
  var DIFFICULTY_MODIFIERS = { beginner: 0.8, intermediate: 1.0, advanced: 1.3 }

  /* ---- Helpers ---- */
  function _getUserSkills () {
    var user = Store.get('user')
    return (user && user.skills) || []
  }

  function _getUserCertifications () {
    var user = Store.get('user')
    return (user && user.certifications) || []
  }

  function _getUserProjects () {
    var user = Store.get('user')
    return (user && user.projects) || []
  }

  function _cosineSimilarity (vecA, vecB) {
    var allKeys = Object.keys(vecA).concat(Object.keys(vecB)).filter(function (k, i, a) { return a.indexOf(k) === i })
    var dot = 0, normA = 0, normB = 0
    allKeys.forEach(function (key) {
      var a = vecA[key] || 0
      var b = vecB[key] || 0
      dot += a * b
      normA += a * a
      normB += b * b
    })
    if (normA === 0 || normB === 0) return 0
    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  function _getSkillDbInfo (name) {
    var db = window.SkillsDB || []
    for (var i = 0; i < db.length; i++) {
      if (db[i].name.toLowerCase() === name.toLowerCase()) return db[i]
    }
    return null
  }

  /* ---- Estimate learning hours for a skill ---- */
  function _estimateHours (skillName, requiredLevel, currentLevel, gap, difficulty) {
    var dbInfo = _getSkillDbInfo(skillName)
    var category = (dbInfo && dbInfo.category) || 'General'
    var catMod = CATEGORY_MODIFIERS[category] || 1.0
    var diffMod = DIFFICULTY_MODIFIERS[difficulty] || 1.0
    var base = BASE_HOURS_PER_SKILL * (requiredLevel / 100)
    var gapRatio = Math.max(0.1, gap / 100)
    var hours = Math.round(base * gapRatio * catMod * diffMod)
    return Math.max(4, hours)
  }

  /* ---- Compute impact on readiness ---- */
  function _computeImpact (weight, gap, totalRequired) {
    var base = Math.round(weight * 20 * Math.min(1, gap / 50))
    return Math.max(1, base)
  }

  /* ---- Build comparison array ---- */
  function _buildComparison (requiredSkills, userSkills, targetRoleId, difficulty) {
    var userMap = {}
    userSkills.forEach(function (s) {
      userMap[s.name.toLowerCase()] = s.level || 50
    })

    var comparison = []
    var acquired = []
    var missing = []
    var partial = []

    requiredSkills.forEach(function (rs) {
      var currentLevel = userMap[rs.name.toLowerCase()]
      var requiredLevel = Math.round((rs.weight || 0.5) * 100)
      var gap = 0
      var isAcquired = false
      var isPartial = false
      var status = 'missing'

      if (currentLevel !== undefined) {
        gap = Math.max(0, requiredLevel - currentLevel)
        if (gap === 0) {
          isAcquired = true
          status = 'acquired'
        } else {
          isPartial = true
          status = 'partial'
        }
      } else {
        currentLevel = 0
        gap = requiredLevel
        status = 'missing'
      }

      var hours = _estimateHours(rs.name, requiredLevel, currentLevel, gap, difficulty)

      var entry = {
        name: rs.name,
        category: (_getSkillDbInfo(rs.name) && _getSkillDbInfo(rs.name).category) || 'General',
        currentLevel: currentLevel,
        requiredLevel: requiredLevel,
        gap: gap,
        status: status,
        weight: rs.weight || 0.5,
        estimatedHours: hours,
        impact: _computeImpact(rs.weight || 0.5, gap, requiredSkills.length),
        difficulty: difficulty
      }

      comparison.push(entry)
      if (status === 'acquired') acquired.push(entry)
      else if (status === 'partial') partial.push(entry)
      else missing.push(entry)
    })

    return { comparison: comparison, acquired: acquired, missing: missing, partial: partial }
  }

  /* ---- Priority classification ---- */
  function _classifyPriority (item) {
    if (item.status === 'acquired') return 'closed'
    if (item.gap >= 15 && item.weight >= 0.7) return 'high'
    if (item.gap >= 10 || item.weight >= 0.55) return 'medium'
    return 'low'
  }

  function _buildPriorityMatrix (comparison) {
    var matrix = { high: [], medium: [], low: [], closed: [] }
    comparison.forEach(function (item) {
      var p = _classifyPriority(item)
      matrix[p].push(item)
    })
    ;['high', 'medium', 'low'].forEach(function (key) {
      matrix[key].sort(function (a, b) {
        if (a.weight !== b.weight) return b.weight - a.weight
        return b.gap - a.gap
      })
    })
    return matrix
  }

  /* ---- Build learning timeline ---- */
  function _buildTimeline (priorityMatrix) {
    var daily = []
    var weekly = []
    var monthly = []
    var allOpen = [].concat(priorityMatrix.high, priorityMatrix.medium, priorityMatrix.low)
    allOpen.forEach(function (item) {
      if (item.estimatedHours <= 15) daily.push(item)
      else if (item.estimatedHours <= 40) weekly.push(item)
      else monthly.push(item)
    })
    return { daily: daily, weekly: weekly, monthly: monthly }
  }

  /* ---- Estimate total learning time ---- */
  function _estimateTotalTime (comparison, hoursPerDay) {
    hoursPerDay = hoursPerDay || 2
    var totalHours = comparison.reduce(function (sum, c) {
      if (c.status === 'acquired') return sum
      return sum + c.estimatedHours
    }, 0)
    var days = Math.ceil(totalHours / hoursPerDay)
    var weeks = Math.ceil(days / 7)
    var months = Math.round((days / 30) * 10) / 10
    return {
      totalHours: totalHours,
      hoursPerDay: hoursPerDay,
      days: days,
      weeks: weeks,
      months: months
    }
  }

  /* ---- Compute career match (cosine similarity) ---- */
  function _computeCareerMatch (userSkills, requiredSkills) {
    var userVec = {}
    var reqVec = {}
    userSkills.forEach(function (s) { userVec[s.name.toLowerCase()] = (s.level || 50) / 100 })
    requiredSkills.forEach(function (s) { reqVec[s.name.toLowerCase()] = s.weight || 0.5 })
    return Math.round(_cosineSimilarity(userVec, reqVec) * 100)
  }

  /* ---- Compute readiness score ---- */
  function _computeReadiness (comparison) {
    var totalWeight = 0
    var weightedScore = 0
    comparison.forEach(function (item) {
      totalWeight += item.weight
      var ratio = item.status === 'acquired' ? 1 : item.status === 'partial' ? (item.currentLevel / item.requiredLevel) : 0
      weightedScore += item.weight * ratio
    })
    return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0
  }

  /* ---- Skill Gap Score (inverse of average gap normalized) ---- */
  function _computeSkillGapScore (comparison) {
    var totalGap = 0
    var count = 0
    comparison.forEach(function (item) {
      totalGap += item.gap
      count++
    })
    var avgGap = count > 0 ? totalGap / count : 0
    return Math.max(0, Math.min(100, Math.round(100 - avgGap)))
  }

  /* ---- Confidence ---- */
  function _computeConfidence (userSkills, comparison) {
    if (userSkills.length >= 5 && comparison.length >= 5) return 'High'
    if (userSkills.length >= 2) return 'Medium'
    return 'Low'
  }

  /* ---- Action Plan (top 10) ---- */
  function _buildActionPlan (priorityMatrix, timeline, targetTitle) {
    var plan = []
    var rank = 1

    var allOpen = [].concat(priorityMatrix.high, priorityMatrix.medium, priorityMatrix.low)
    allOpen.forEach(function (item) {
      if (rank > 10) return
      var confidence = item.status === 'partial' ? 'High' : 'Medium'
      var reason = item.status === 'partial' 
        ? 'Currently at ' + item.currentLevel + '%, need ' + item.requiredLevel + '%. Close the ' + item.gap + '% gap.'
        : 'Core skill for ' + targetTitle + ' with weight ' + item.weight + '. Start from scratch (' + item.estimatedHours + ' hours).'
      
      plan.push({
        rank: rank,
        action: item.status === 'partial' ? 'Strengthen ' + item.name + ' (→' + item.requiredLevel + '%)' : 'Learn ' + item.name,
        impact: '+' + item.impact + ' Readiness',
        reason: reason,
        hours: item.estimatedHours,
        category: item.category,
        weight: item.weight,
        priority: _classifyPriority(item),
        gap: item.gap,
        confidence: confidence,
        calculation: 'impact = weight(' + item.weight + ') × 20 × min(1, gap(' + item.gap + ')/50) = ' + item.impact
      })
      rank++
    })

    // Add project/cert suggestions if room
    if (rank <= 10) {
      var certs = _getUserCertifications()
      if (certs.length < 2) {
        plan.push({
          rank: rank,
          action: 'Earn a relevant certification',
          impact: '+10 Readiness',
          reason: 'Certifications demonstrate commitment and validate skills to recruiters.',
          hours: 60,
          category: 'Certification',
          weight: 0.6,
          priority: 'medium',
          gap: 100,
          confidence: 'Medium',
          calculation: 'Certifications add 10-15% to readiness based on recruiter studies.'
        })
        rank++
      }
    }
    if (rank <= 10) {
      var projects = _getUserProjects()
      var completedProjects = projects.filter(function (p) { return p.completed }).length
      if (completedProjects < 3) {
        plan.push({
          rank: rank,
          action: 'Build a ' + targetTitle + ' portfolio project',
          impact: '+12 Readiness',
          reason: 'Real projects prove practical ability more than any other signal.',
          hours: 80,
          category: 'Project',
          weight: 0.8,
          priority: 'high',
          gap: 100,
          confidence: 'High',
          calculation: 'Projects demonstrate applied skills. 1 project = +12% readiness.'
        })
      }
    }

    return plan.slice(0, 10)
  }

  /* ---- Suggestions ---- */
  function _buildSuggestions (score, match, readiness, missingCount, priorityMatrix, timeline) {
    var s = []
    if (missingCount > 3) s.push('You have ' + missingCount + ' missing skills. Start with the ' + priorityMatrix.high.length + ' high-priority items.')
    if (priorityMatrix.high.length) s.push('Focus on: ' + priorityMatrix.high.slice(0, 3).map(function (x) { return x.name }).join(', ') + '. These close critical gaps.')
    if (match < 40) s.push('Your skill set is significantly different from this career path. Consider starting with foundational skills.')
    if (readiness >= 70) s.push('You\'re well-prepared! Start applying for ' + score.targetRole + ' roles while continuing to strengthen gaps.')
    if (timeline.months > 3) s.push('Estimated timeline is ' + timeline.months + ' months. Consider increasing daily learning hours.')
    if (timeline.months <= 1) s.push('You can close all gaps in under a month. Prioritize high-impact skills first.')
    s.push('Estimated total: ' + timeline.totalHours + ' hours at ' + timeline.hoursPerDay + ' hrs/day = ' + timeline.days + ' days.')
    return s
  }

  /* ===== MAIN ANALYZE ===== */
  async function analyzeGap (targetRoleId, hoursPerDay) {
    hoursPerDay = hoursPerDay || 2
    await new Promise(function (r) { setTimeout(r, 500 + Math.random() * 500) })

    var careerPaths = window.CareerPaths || []
    var path = null
    for (var i = 0; i < careerPaths.length; i++) {
      if (careerPaths[i].id === targetRoleId) { path = careerPaths[i]; break }
    }
    if (!path) return { error: 'Career path "' + targetRoleId + '" not found.' }

    var userSkills = _getUserSkills()
    var requiredSkills = path.skills || []
    var difficulty = path.difficulty || 'intermediate'

    // Build comparison
    var comp = _buildComparison(requiredSkills, userSkills, targetRoleId, difficulty)
    var priorityMatrix = _buildPriorityMatrix(comp.comparison)
    var timeline = _estimateTotalTime(comp.comparison, hoursPerDay)
    var careerMatch = _computeCareerMatch(userSkills, requiredSkills)
    var readiness = _computeReadiness(comp.comparison)
    var skillGapScore = _computeSkillGapScore(comp.comparison)
    var confidence = _computeConfidence(userSkills, comp.comparison)
    var actionPlan = _buildActionPlan(priorityMatrix, timeline, path.title)
    var suggestions = _buildSuggestions(skillGapScore, careerMatch, readiness, comp.missing.length, priorityMatrix, timeline)
    var timelinePlan = _buildTimeline(priorityMatrix)

    var result = {
      skillGapScore: skillGapScore,
      careerMatch: careerMatch,
      readiness: readiness,
      confidence: confidence,
      estimatedTime: timeline,

      targetRole: path.title,
      targetRoleId: path.id,
      careerPath: {
        title: path.title,
        description: path.description,
        difficulty: path.difficulty,
        demandLevel: path.demandLevel,
        salaryRange: path.salaryRange,
        icon: path.icon,
        color: path.color,
        roadmap30: path.roadmaps && path.roadmaps['30'] ? path.roadmaps['30'] : [],
        roadmap60: path.roadmaps && path.roadmaps['60'] ? path.roadmaps['60'] : [],
        roadmap90: path.roadmaps && path.roadmaps['90'] ? path.roadmaps['90'] : []
      },

      comparison: comp.comparison,
      acquiredSkills: comp.acquired,
      missingSkills: comp.missing,
      partialSkills: comp.partial,

      priorityMatrix: priorityMatrix,
      timelinePlan: timelinePlan,

      actionPlan: actionPlan,
      suggestions: suggestions,

      stats: {
        totalRequired: requiredSkills.length,
        acquiredCount: comp.acquired.length,
        partialCount: comp.partial.length,
        missingCount: comp.missing.length,
        totalEstimatedHours: timeline.totalHours
      },

      whatIf: null,

      calculation: {
        steps: [
          'Target: ' + path.title + ' (' + requiredSkills.length + ' required skills, difficulty: ' + difficulty + ')',
          'Profile: ' + userSkills.length + ' user skills, ' + comp.acquired.length + ' acquired, ' + comp.partial.length + ' partial, ' + comp.missing.length + ' missing',
          'Skill Gap Score: 100 - avg(gap%). Avg gap = ' + Math.round(comp.comparison.reduce(function (s, c) { return s + c.gap }, 0) / Math.max(1, comp.comparison.length)) + '% → score = ' + skillGapScore,
          'Career Match: cosine similarity of user skill vector vs required skill vectors = ' + careerMatch + '%',
          'Readiness: weighted ratio of current to required levels across all skills = ' + readiness + '%',
          'Learning Time: ' + timeline.totalHours + ' total hours at ' + hoursPerDay + ' hrs/day = ' + timeline.days + ' days (' + timeline.months + ' months)',
          'Priorities: ' + priorityMatrix.high.length + ' high, ' + priorityMatrix.medium.length + ' medium, ' + priorityMatrix.low.length + ' low impact items',
          'Action Plan: top ' + actionPlan.length + ' ranked by impact × confidence × urgency'
        ],
        formula: 'skillGapScore = 100 - avg(gap%); careerMatch = cosineSimilarity(userVec, reqVec) × 100; readiness = Σ(weight × ratio) / Σ(weight) × 100'
      }
    }

    Store.set('skillGapAnalysis', result)
    return result
  }

  /* ===== WHAT IF MODE ===== */
  function whatIf (baseAnalysis, hypotheticalSkill) {
    if (!baseAnalysis || !hypotheticalSkill || !hypotheticalSkill.name) return baseAnalysis

    var skillName = hypotheticalSkill.name
    var skillLevel = hypotheticalSkill.level || 70

    // Clone the comparison and apply the hypothetical
    var newComparison = baseAnalysis.comparison.map(function (item) {
      if (item.name.toLowerCase() === skillName.toLowerCase()) {
        var newCurrent = Math.max(item.currentLevel, skillLevel)
        var newGap = Math.max(0, item.requiredLevel - newCurrent)
        var newStatus = newGap === 0 ? 'acquired' : newCurrent > 0 ? 'partial' : 'missing'
        var newHours = _estimateHours(item.name, item.requiredLevel, newCurrent, newGap, item.difficulty)
        return {
          name: item.name,
          category: item.category,
          currentLevel: newCurrent,
          requiredLevel: item.requiredLevel,
          gap: newGap,
          status: newStatus,
          weight: item.weight,
          estimatedHours: newHours,
          impact: _computeImpact(item.weight, newGap, baseAnalysis.comparison.length),
          difficulty: item.difficulty
        }
      }
      return item
    })

    // Add skill if not in comparison
    var found = false
    for (var i = 0; i < newComparison.length; i++) {
      if (newComparison[i].name.toLowerCase() === skillName.toLowerCase()) { found = true; break }
    }
    if (!found) {
      var dbInfo = _getSkillDbInfo(skillName)
      var reqLev = 80
      var gap = Math.max(0, reqLev - skillLevel)
      newComparison.push({
        name: skillName,
        category: (dbInfo && dbInfo.category) || 'Other',
        currentLevel: skillLevel,
        requiredLevel: reqLev,
        gap: gap,
        status: gap === 0 ? 'acquired' : 'partial',
        weight: 0.6,
        estimatedHours: _estimateHours(skillName, reqLev, skillLevel, gap, 'intermediate'),
        impact: _computeImpact(0.6, gap, newComparison.length),
        difficulty: 'intermediate'
      })
    }

    // Recalculate
    var priorityMatrix = _buildPriorityMatrix(newComparison)
    var timeline = _estimateTotalTime(newComparison, baseAnalysis.estimatedTime.hoursPerDay)
    var skillGapScore = _computeSkillGapScore(newComparison)
    var readiness = _computeReadiness(newComparison)
    var actionPlan = _buildActionPlan(priorityMatrix, timeline, baseAnalysis.targetRole)
    var timelinePlan = _buildTimeline(priorityMatrix)

    return {
      skillGapScore: skillGapScore,
      careerMatch: baseAnalysis.careerMatch,
      readiness: readiness,
      confidence: baseAnalysis.confidence,
      estimatedTime: timeline,
      targetRole: baseAnalysis.targetRole,
      targetRoleId: baseAnalysis.targetRoleId,
      careerPath: baseAnalysis.careerPath,
      comparison: newComparison,
      acquiredSkills: newComparison.filter(function (c) { return c.status === 'acquired' }),
      missingSkills: newComparison.filter(function (c) { return c.status === 'missing' }),
      partialSkills: newComparison.filter(function (c) { return c.status === 'partial' }),
      priorityMatrix: priorityMatrix,
      timelinePlan: timelinePlan,
      actionPlan: actionPlan,
      suggestions: baseAnalysis.suggestions.slice(),
      stats: {
        totalRequired: baseAnalysis.stats.totalRequired,
        acquiredCount: newComparison.filter(function (c) { return c.status === 'acquired' }).length,
        partialCount: newComparison.filter(function (c) { return c.status === 'partial' }).length,
        missingCount: newComparison.filter(function (c) { return c.status === 'missing' }).length,
        totalEstimatedHours: timeline.totalHours
      },
      whatIf: { skill: skillName, level: skillLevel },
      calculation: baseAnalysis.calculation
    }
  }

  /* ===== EXPORTS ===== */
  function exportJSON (analysis) {
    var out = {
      analysis: {
        targetRole: analysis.targetRole,
        skillGapScore: analysis.skillGapScore,
        careerMatch: analysis.careerMatch,
        readiness: analysis.readiness,
        confidence: analysis.confidence,
        estimatedTime: analysis.estimatedTime
      },
      skillComparison: analysis.comparison.map(function (c) {
        return { name: c.name, category: c.category, currentLevel: c.currentLevel, requiredLevel: c.requiredLevel, gap: c.gap, status: c.status, priority: c.priority || 'medium', estimatedHours: c.estimatedHours }
      }),
      priorityMatrix: {
        high: (analysis.priorityMatrix.high || []).map(function (c) { return c.name }),
        medium: (analysis.priorityMatrix.medium || []).map(function (c) { return c.name }),
        low: (analysis.priorityMatrix.low || []).map(function (c) { return c.name })
      },
      learningTimeline: analysis.estimatedTime,
      actionPlan: analysis.actionPlan.map(function (a) {
        return { rank: a.rank, action: a.action, impact: a.impact, reason: a.reason, hours: a.hours, confidence: a.confidence }
      }),
      suggestions: analysis.suggestions,
      calculationSteps: analysis.calculation.steps,
      formula: analysis.calculation.formula
    }
    return JSON.stringify(out, null, 2)
  }

  function exportMarkdown (analysis) {
    var md = '# Skill Gap Analysis Report\n\n'
    md += '**Target Role:** ' + analysis.targetRole + '\n'
    md += '**Generated:** ' + new Date().toISOString() + '\n\n'

    md += '## Overview\n\n'
    md += '| Metric | Value |\n|--------|-------|\n'
    md += '| Skill Gap Score | ' + analysis.skillGapScore + '/100 |\n'
    md += '| Career Match | ' + analysis.careerMatch + '% |\n'
    md += '| Readiness | ' + analysis.readiness + '% |\n'
    md += '| Confidence | ' + analysis.confidence + ' |\n'
    md += '| Learning Time | ' + analysis.estimatedTime.totalHours + ' hours (' + analysis.estimatedTime.days + ' days) |\n\n'

    md += '## Skill Comparison\n\n'
    md += '| Skill | Current | Required | Gap | Status | Hours |\n|------|---------|----------|-----|--------|-------|\n'
    analysis.comparison.forEach(function (c) {
      md += '| ' + c.name + ' | ' + c.currentLevel + '% | ' + c.requiredLevel + '% | ' + c.gap + '% | ' + c.status + ' | ' + c.estimatedHours + ' |\n'
    })

    md += '\n## Action Plan\n\n'
    md += '| # | Action | Impact | Hours | Confidence |\n|---|--------|--------|-------|------------|\n'
    analysis.actionPlan.forEach(function (a) {
      md += '| ' + a.rank + ' | ' + a.action + ' | ' + a.impact + ' | ' + a.hours + ' | ' + a.confidence + ' |\n'
    })

    if (analysis.suggestions.length) {
      md += '\n## Suggestions\n\n'
      analysis.suggestions.forEach(function (s) { md += '- ' + s + '\n' })
    }

    md += '\n## Calculation Steps\n\n'
    analysis.calculation.steps.forEach(function (s, i) { md += (i + 1) + '. ' + s + '\n' })
    md += '\n*Formula:* ' + analysis.calculation.formula + '\n\n'
    md += '---\n*Generated by SkillPilot AI Skill Gap Analyzer*'
    return md
  }

  function exportPDF (analysis) {
    // Returns HTML string for window.print
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SkillPilot AI — Skill Gap Report</title>'
    html += '<style>'
    html += 'body{font-family:Inter,sans-serif;padding:40px;color:#1E293B;max-width:900px;margin:0 auto}'
    html += 'h1{font-size:28px;color:#4F46E5;margin-bottom:4px}'
    html += 'h2{font-size:18px;color:#1E293B;border-bottom:2px solid #E2E8F0;padding-bottom:8px;margin-top:32px}'
    html += '.sub{color:#64748B;font-size:14px;margin-bottom:24px}'
    html += 'table{width:100%;border-collapse:collapse;margin-bottom:24px}'
    html += 'th{background:#F1F5F9;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748B}'
    html += 'td{padding:10px 12px;border-bottom:1px solid #E2E8F0;font-size:14px}'
    html += '.section{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin-bottom:16px}'
    html += '.footer{margin-top:32px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:12px;color:#94A3B8;text-align:center}'
    html += 'pre{background:#F1F5F9;padding:12px;border-radius:6px;font-size:12px;overflow-x:auto}'
    html += '@media print{body{padding:20px}}'
    html += '</style></head><body>'
    html += '<h1>SkillPilot AI — Skill Gap Analysis Report</h1>'
    html += '<p class="sub">Target: ' + analysis.targetRole + ' &middot; ' + new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>'

    html += '<h2>Overview</h2>'
    html += '<table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>'
    html += '<tr><td>Skill Gap Score</td><td style="font-size:20px;font-weight:700;color:' + (analysis.skillGapScore >= 70 ? '#10B981' : '#F59E0B') + '">' + analysis.skillGapScore + '/100</td></tr>'
    html += '<tr><td>Career Match</td><td>' + analysis.careerMatch + '%</td></tr>'
    html += '<tr><td>Readiness</td><td>' + analysis.readiness + '%</td></tr>'
    html += '<tr><td>Learning Time</td><td>' + analysis.estimatedTime.totalHours + ' hours (' + analysis.estimatedTime.days + ' days)</td></tr>'
    html += '</tbody></table>'

    html += '<h2>Action Plan</h2>'
    html += '<table><thead><tr><th>#</th><th>Action</th><th>Impact</th><th>Hours</th></tr></thead><tbody>'
    analysis.actionPlan.forEach(function (a) {
      html += '<tr><td>' + a.rank + '</td><td>' + a.action + '</td><td style="color:#10B981;font-weight:600">' + a.impact + '</td><td>' + a.hours + '</td></tr>'
    })
    html += '</tbody></table>'

    html += '<h2>Skill Comparison</h2>'
    html += '<table><thead><tr><th>Skill</th><th>Current</th><th>Required</th><th>Gap</th><th>Status</th></tr></thead><tbody>'
    analysis.comparison.forEach(function (c) {
      var statusIcon = c.status === 'acquired' ? '✅' : c.status === 'partial' ? '⚠️' : '❌'
      html += '<tr><td>' + c.name + '</td><td>' + c.currentLevel + '%</td><td>' + c.requiredLevel + '%</td><td>' + c.gap + '%</td><td>' + statusIcon + ' ' + c.status + '</td></tr>'
    })
    html += '</tbody></table>'

    html += '<h2>Suggestions</h2>'
    analysis.suggestions.forEach(function (s) {
      html += '<div class="section"><p style="margin:0">💡 ' + s + '</p></div>'
    })

    html += '<div class="footer">Generated by SkillPilot AI Skill Gap Analyzer</div>'
    html += '</body></html>'
    return html
  }

  function getLastAnalysis () {
    return Store.get('skillGapAnalysis')
  }

  return {
    analyzeGap: analyzeGap,
    whatIf: whatIf,
    exportJSON: exportJSON,
    exportMarkdown: exportMarkdown,
    exportPDF: exportPDF,
    getLastAnalysis: getLastAnalysis
  }
})()
