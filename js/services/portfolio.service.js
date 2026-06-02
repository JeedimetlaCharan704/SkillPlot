const PortfolioService = (function () {
  const SECTIONS = [
    { name: 'Technical Skills', key: 'skills', weight: 0.30 },
    { name: 'Projects', key: 'projects', weight: 0.25 },
    { name: 'GitHub Presence', key: 'github', weight: 0.20 },
    { name: 'Resume Quality', key: 'resume', weight: 0.15 },
    { name: 'Certifications', key: 'certifications', weight: 0.10 }
  ]

  function _scoreSkills (skills) {
    if (!skills || skills.length === 0) return { score: 0, details: 'No skills added' }
    const avgLevel = skills.reduce((s, sk) => s + (sk.level || 0), 0) / skills.length
    const countScore = Math.min(100, skills.length * 12)
    const levelScore = avgLevel
    return {
      score: Math.round(countScore * 0.4 + levelScore * 0.6),
      details: `${skills.length} skills with average proficiency ${Math.round(avgLevel)}%`
    }
  }

  function _scoreProjects (projects) {
    if (!projects || projects.length === 0) return { score: 0, details: 'No projects added' }
    let score = 0
    projects.forEach(p => {
      if (p.name) score += 15
      if (p.description && p.description.length > 50) score += 15
      if (p.technologies && p.technologies.length > 0) score += 10
      if (p.url) score += 10
      if (p.completed !== false) score += 5
    })
    return {
      score: Math.min(100, score),
      details: `${projects.length} projects evaluated for quality and completeness`
    }
  }

  function _scoreGitHub (githubData) {
    if (!githubData) return { score: 30, details: 'GitHub not connected (default score)' }
    const repos = githubData.repos || []
    const qualityScore = githubData.qualityScore || 0
    const repoScore = Math.min(40, repos.length * 8)
    const starScore = Math.min(30, (githubData.totalStars || 0) * 0.5)
    return {
      score: Math.min(100, qualityScore * 0.4 + repoScore + starScore),
      details: `${repos.length} repos, ${githubData.totalStars || 0} stars`
    }
  }

  function _scoreResume (resumeAnalysis) {
    if (!resumeAnalysis) return { score: 0, details: 'Resume not analyzed' }
    return {
      score: resumeAnalysis.resumeScore || 0,
      details: `Resume scored ${resumeAnalysis.resumeScore || 0}/100`
    }
  }

  function _scoreCertifications (certifications) {
    if (!certifications || certifications.length === 0) return { score: 0, details: 'No certifications added' }
    const countScore = Math.min(100, certifications.length * 25)
    return {
      score: countScore,
      details: `${certifications.length} certifications listed`
    }
  }

  function _getReadiness (overallScore) {
    if (overallScore >= 85) return { level: 'excellent', label: 'Portfolio Ready', color: 'var(--success)' }
    if (overallScore >= 70) return { level: 'good', label: 'Almost Ready', color: 'var(--primary)' }
    if (overallScore >= 50) return { level: 'fair', label: 'Needs Improvement', color: 'var(--warning)' }
    return { level: 'poor', label: 'Requires Attention', color: 'var(--error)' }
  }

  async function analyze () {
    await new Promise(r => setTimeout(r, 500 + Math.random() * 400))

    const user = Store.get('user')
    const resumeAnalysis = Store.get('resumeAnalysis')
    const githubData = Store.get('githubData')

    const skillResult = _scoreSkills(user?.skills)
    const projectResult = _scoreProjects(user?.projects)
    const githubResult = _scoreGitHub(githubData)
    const resumeResult = _scoreResume(resumeAnalysis)
    const certResult = _scoreCertifications(user?.certifications)

    const sectionScores = [
      { name: 'Technical Skills', score: skillResult.score, weight: 0.30, details: skillResult.details, suggestions: skillResult.score < 60 ? ['Add more skills with proficiency levels'] : [] },
      { name: 'Projects', score: projectResult.score, weight: 0.25, details: projectResult.details, suggestions: projectResult.score < 60 ? ['Add detailed project descriptions and links'] : [] },
      { name: 'GitHub Presence', score: githubResult.score, weight: 0.20, details: githubResult.details, suggestions: githubResult.score < 60 ? ['Push more projects to GitHub', 'Add README files to repositories'] : [] },
      { name: 'Resume Quality', score: resumeResult.score, weight: 0.15, details: resumeResult.details, suggestions: resumeResult.score < 60 ? ['Upload resume for analysis and improvement suggestions'] : [] },
      { name: 'Certifications', score: certResult.score, weight: 0.10, details: certResult.details, suggestions: certResult.score < 60 ? ['Earn industry-recognized certifications'] : [] }
    ]

    const overallScore = Math.round(sectionScores.reduce((s, sec) => s + sec.score * sec.weight, 0))
    const readiness = _getReadiness(overallScore)

    const allSuggestions = sectionScores.flatMap(s => s.suggestions)

    const result = {
      score: overallScore,
      readiness,
      sections: sectionScores,
      suggestions: allSuggestions,
      confidence: (user?.skills?.length || 0) >= 3 ? 'High' : 'Medium',
      calculation: {
        steps: sectionScores.map(s => `${s.name}: ${s.score}/100 (weight: ${Math.round(s.weight * 100)}%)`),
        formula: 'portfolioScore = Σ(sectionScore × sectionWeight)'
      },
      exportData: _buildExportData(sectionScores, overallScore, readiness, user)
    }

    Store.set('portfolioAnalysis', result)
    return result
  }

  function _buildExportData (sections, score, readiness, user) {
    return {
      generatedAt: new Date().toISOString(),
      userName: user?.name || 'User',
      portfolioScore: score,
      readiness: readiness.label,
      sections: sections.map(s => ({
        category: s.name,
        score: s.score,
        details: s.details
      })),
      skills: (user?.skills || []).map(s => ({ name: s.name, proficiency: s.level })),
      projects: (user?.projects || []).map(p => ({
        name: p.name,
        description: p.description,
        technologies: p.technologies,
        url: p.url
      }))
    }
  }

  async function exportJSON () {
    const analysis = Store.get('portfolioAnalysis')
    if (!analysis) await analyze()
    const data = Store.get('portfolioAnalysis')?.exportData || {}
    return { format: 'json', data, filename: `skillpilot-portfolio-${Date.now()}.json` }
  }

  async function exportMarkdown () {
    const analysis = Store.get('portfolioAnalysis')
    if (!analysis) await analyze()
    const data = analysis?.exportData || {}
    let md = `# Portfolio Analysis Report\n\n`
    md += `**Generated:** ${new Date().toLocaleDateString()}\n`
    md += `**Portfolio Score:** ${data.portfolioScore || analysis?.score || 0}/100\n`
    md += `**Readiness:** ${analysis?.readiness?.label || 'N/A'}\n\n`
    md += `## Section Breakdown\n\n`
    ;(data.sections || analysis?.sections || []).forEach(s => {
      md += `### ${s.name}\n`
      md += `- Score: ${s.score}/100\n`
      md += `- ${s.details || ''}\n\n`
    })
    return { format: 'markdown', data: md, filename: `skillpilot-portfolio-${Date.now()}.md` }
  }

  async function exportPDF () {
    const md = await exportMarkdown()
    return { format: 'pdf', data: md.data, filename: `skillpilot-portfolio-${Date.now()}.pdf`, note: 'PDF generation requires server-side rendering. Data exported as structured markdown ready for PDF conversion.' }
  }

  function getLastAnalysis () {
    return Store.get('portfolioAnalysis')
  }

  return { analyze, exportJSON, exportMarkdown, exportPDF, getLastAnalysis }
})()
