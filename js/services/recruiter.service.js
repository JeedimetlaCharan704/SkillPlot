const RecruiterService = (function () {
  const METRICS = [
    { name: 'Technical Skills', key: 'skills', weight: 0.20 },
    { name: 'Projects', key: 'projects', weight: 0.25 },
    { name: 'Certifications', key: 'certifications', weight: 0.15 },
    { name: 'GitHub Activity', key: 'github', weight: 0.15 },
    { name: 'Resume Score', key: 'resume', weight: 0.15 },
    { name: 'Profile Completeness', key: 'profile', weight: 0.10 }
  ]

  function _scoreSkills (skills) {
    if (!skills || skills.length === 0) return { score: 0, explanation: 'No skills added to profile' }
    const avgLevel = skills.reduce((s, sk) => s + (sk.level || 0), 0) / skills.length
    const countBonus = Math.min(20, skills.length * 3)
    const score = Math.min(100, Math.round(avgLevel * 0.8 + countBonus))
    return {
      score,
      explanation: `${skills.length} skills profiled, average proficiency ${Math.round(avgLevel)}%`
    }
  }

  function _scoreProjects (projects) {
    if (!projects || projects.length === 0) return { score: 0, explanation: 'No projects listed' }
    let score = 0
    projects.forEach(p => {
      if (p.name) score += 15
      if (p.description) score += 10
      if (p.technologies && p.technologies.length > 0) score += 10
      if (p.url) score += 10
      if (p.completed !== false) score += 5
    })
    return {
      score: Math.min(100, score),
      explanation: `${projects.length} projects evaluated for depth and completeness`
    }
  }

  function _scoreCertifications (certs) {
    if (!certs || certs.length === 0) return { score: 0, explanation: 'No certifications listed' }
    const score = Math.min(100, certs.length * 25)
    return {
      score,
      explanation: `${certs.length} certifications listed`
    }
  }

  function _scoreGitHub (githubData) {
    if (!githubData) return { score: 30, explanation: 'GitHub not connected (base score: 30)' }
    const repos = githubData.repos || []
    const repoScore = Math.min(40, repos.length * 6)
    const starScore = Math.min(30, (githubData.totalStars || 0) * 0.5)
    const qualityScore = githubData.qualityScore || 0
    return {
      score: Math.min(100, qualityScore * 0.3 + repoScore + starScore),
      explanation: `${repos.length} repos, ${githubData.totalStars || 0} total stars`
    }
  }

  function _scoreResume (analysis) {
    if (!analysis) return { score: 40, explanation: 'Resume not analyzed (base score: 40)' }
    return {
      score: analysis.resumeScore || 40,
      explanation: `Resume scored ${analysis.resumeScore || 40}/100 by AI analysis`
    }
  }

  function _scoreProfile (user) {
    if (!user) return { score: 0, explanation: 'No profile data' }
    let filled = 0
    const fields = ['name', 'email', 'skills', 'projects', 'certifications', 'githubUsername', 'linkedinUrl']
    fields.forEach(f => {
      const val = user[f]
      if (val && (Array.isArray(val) ? val.length > 0 : true)) filled++
    })
    return {
      score: Math.round((filled / fields.length) * 100),
      explanation: `${filled}/${fields.length} profile sections completed`
    }
  }

  async function compute () {
    await new Promise(r => setTimeout(r, 400))

    const user = Store.get('user')
    const resumeAnalysis = Store.get('resumeAnalysis')
    const githubData = Store.get('githubData')

    const metricResults = METRICS.map(m => {
      let result
      switch (m.key) {
        case 'skills': result = _scoreSkills(user?.skills); break
        case 'projects': result = _scoreProjects(user?.projects); break
        case 'certifications': result = _scoreCertifications(user?.certifications); break
        case 'github': result = _scoreGitHub(githubData); break
        case 'resume': result = _scoreResume(resumeAnalysis); break
        case 'profile': result = _scoreProfile(user); break
        default: result = { score: 0, explanation: 'Unknown metric' }
      }
      return {
        name: m.name,
        score: result.score,
        weight: m.weight,
        weighted: Math.round(result.score * m.weight),
        explanation: result.explanation,
        confidence: result.score > 0 ? (result.score > 50 ? 'High' : 'Medium') : 'Low'
      }
    })

    const overall = Math.min(100, Math.round(metricResults.reduce((s, m) => s + m.weighted, 0)))

    const strongest = [...metricResults].sort((a, b) => b.score - a.score).slice(0, 2)
    const weakest = [...metricResults].sort((a, b) => a.score - b.score).slice(0, 2)

    const suggestions = metricResults
      .filter(m => m.score < 60)
      .map(m => {
        const tips = {
          'Technical Skills': 'Add more skills with accurate proficiency levels',
          'Projects': 'Add detailed project descriptions, technologies used, and live links',
          'Certifications': 'Earn industry-recognized certifications from AWS, Google, or Microsoft',
          'GitHub Activity': 'Push more projects, contribute to open source, add README files',
          'Resume Score': 'Upload resume for AI analysis and follow improvement suggestions',
          'Profile Completeness': 'Complete all profile sections including LinkedIn and GitHub links'
        }
        return { metric: m.name, suggestion: tips[m.name] || 'Focus on improving this area' }
      })

    const result = {
      overall,
      breakdown: metricResults,
      hiringConfidence: overall >= 80 ? 'High' : overall >= 60 ? 'Medium' : 'Low',
      strongest,
      weakest,
      suggestions,
      confidence: user ? 'High' : 'Low',
      calculation: {
        steps: [
          `Evaluated ${METRICS.length} recruiter-facing dimensions`,
          ...metricResults.map(m => `${m.name}: ${m.score}/100 (weight: ${Math.round(m.weight * 100)}%)`),
          `Final score: weighted average of all dimensions`
        ],
        formula: 'recruiterScore = Σ(metricScore × metricWeight)'
      }
    }

    Store.set('recruiterScore', result)
    return result
  }

  function getLastScore () {
    return Store.get('recruiterScore')
  }

  return { compute, getLastScore }
})()
