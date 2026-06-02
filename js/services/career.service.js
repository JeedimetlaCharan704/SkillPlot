const CareerService = (function () {
  function _buildUserSkillVector (skills) {
    const vec = {}
    ;(skills || []).forEach(s => {
      vec[s.name.toLowerCase()] = (s.level || 50) / 100
    })
    return vec
  }

  function _cosineSimilarity (vecA, vecB) {
    const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)])
    let dotProduct = 0
    let normA = 0
    let normB = 0

    allKeys.forEach(key => {
      const a = vecA[key] || 0
      const b = vecB[key] || 0
      dotProduct += a * b
      normA += a * a
      normB += b * b
    })

    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  function _estimateSalary (path, matchPct) {
    const base = path.salaryRange?.min || 400000
    const max = path.salaryRange?.max || 2000000
    const confidenceFactor = matchPct / 100
    return {
      min: Math.round(base * (0.8 + confidenceFactor * 0.2)),
      max: Math.round(max * (0.7 + confidenceFactor * 0.3)),
      currency: 'INR'
    }
  }

  function _assessDifficulty (path, userSkills, matchPct) {
    const totalSkills = (path.skills || []).length
    const matchedSkills = (path.skills || []).filter(ps =>
      (userSkills || []).some(us => us.name.toLowerCase() === ps.name.toLowerCase())
    ).length

    if (totalSkills === 0) return { level: 'beginner', label: 'Beginner Friendly' }

    const ratio = matchedSkills / totalSkills
    if (ratio >= 0.6 || matchPct >= 70) return { level: 'beginner', label: 'Beginner Friendly' }
    if (ratio >= 0.3 || matchPct >= 40) return { level: 'intermediate', label: 'Moderate Challenge' }
    return { level: 'advanced', label: 'Requires Preparation' }
  }

  async function getRecommendations () {
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500))

    const user = Store.get('user')
    const userSkills = user?.skills || []
    const userVector = _buildUserSkillVector(userSkills)
    const careerPaths = window.CareerPaths || []
    const resumeAnalysis = Store.get('resumeAnalysis')

    if (careerPaths.length === 0) {
      return { recommendations: [], error: 'No career paths configured' }
    }

    const recommendations = careerPaths.map(path => {
      const pathVector = {}
      ;(path.skills || []).forEach(s => {
        pathVector[s.name.toLowerCase()] = s.weight || 0.5
      })

      const rawMatch = _cosineSimilarity(userVector, pathVector)
      const matchPercentage = Math.round(rawMatch * 100)

      const userSkillNames = new Set((userSkills || []).map(s => s.name.toLowerCase()))
      const requiredSkills = (path.skills || []).map(s => ({
        name: s.name,
        acquired: userSkillNames.has(s.name.toLowerCase()),
        weight: s.weight || 0.5
      }))

      const acquiredCount = requiredSkills.filter(s => s.acquired).length
      const totalCount = requiredSkills.length

      return {
        id: path.id,
        title: path.title,
        description: path.description,
        matchPercentage: Math.min(95, matchPercentage),
        salaryRange: _estimateSalary(path, matchPercentage),
        difficulty: _assessDifficulty(path, userSkills, matchPercentage),
        demandLevel: path.demandLevel || 'medium',
        requiredSkills,
        skillMatch: totalCount > 0 ? Math.round((acquiredCount / totalCount) * 100) : 0,
        roadmaps: path.roadmaps || { '30': [], '60': [], '90': [] }
      }
    })

    const sorted = recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage)
    const topPath = sorted[0]

    const suggestions = []
    if (userSkills.length < 3) {
      suggestions.push('Add at least 3 skills to get accurate career matches')
    } else if (topPath && topPath.matchPercentage < 50) {
      suggestions.push('Consider building skills in high-demand areas like AI, Cloud, or Data Science')
    }
    if (topPath && topPath.matchPercentage < 30) {
      suggestions.push('Explore the learning roadmaps to build foundational skills for your target role')
    }
    suggestions.push('Update your skills regularly as you learn new technologies')

    const result = {
      recommendations: sorted.slice(0, 8),
      topRecommendation: topPath,
      totalPaths: sorted.length,
      confidence: userSkills.length >= 3 ? 'High' : userSkills.length >= 1 ? 'Medium' : 'Low',
      suggestions,
      calculation: {
        steps: [
          `Analyzed ${userSkills.length} user skills against ${careerPaths.length} career paths`,
          `Used cosine similarity weighted by skill importance`,
          `Salary estimated from market data adjusted by match score`,
          `Difficulty based on skill gap ratio`
        ],
        formula: 'match% = cosineSimilarity(userVector, pathVector) × 100'
      }
    }

    Store.set('careerRecommendations', result)
    return result
  }

  async function getRecommendationsForSkills (skills) {
    const tempUser = Store.get('user') || {}
    tempUser.skills = skills
    Store.set('user', tempUser)
    return getRecommendations()
  }

  function getLastRecommendations () {
    return Store.get('careerRecommendations')
  }

  return { getRecommendations, getRecommendationsForSkills, getLastRecommendations }
})()
