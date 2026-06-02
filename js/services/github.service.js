const GitHubService = (function () {
  const GITHUB_API = 'https://api.github.com'

  function _generateMockRepos (username) {
    const mockRepos = [
      { name: 'skillpilot-ai', description: 'AI-powered career intelligence platform', stars: 42, forks: 12, language: 'JavaScript', topics: ['ai', 'career', 'analytics'], hasReadme: true },
      { name: 'ml-resume-analyzer', description: 'Machine learning based resume scoring engine', stars: 28, forks: 8, language: 'Python', topics: ['machine-learning', 'nlp', 'resume'], hasReadme: true },
      { name: 'career-path-predictor', description: 'Predict optimal career paths using skill vectors', stars: 15, forks: 5, language: 'Python', topics: ['data-science', 'career'], hasReadme: true },
      { name: 'portfolio-generator', description: 'Auto-generate portfolio websites from GitHub data', stars: 33, forks: 10, language: 'JavaScript', topics: ['portfolio', 'generator'], hasReadme: true },
      { name: 'skill-gap-analyzer', description: 'Analyze skill gaps for target roles', stars: 19, forks: 4, language: 'TypeScript', topics: ['skills', 'analytics'], hasReadme: true },
      { name: 'placement-predictor', description: 'Predict campus placement probability using ML', stars: 24, forks: 7, language: 'Python', topics: ['ml', 'placement', 'prediction'], hasReadme: true }
    ]

    const totalCommits = 340 + Math.floor(Math.random() * 200)
    const totalPRs = 45 + Math.floor(Math.random() * 30)
    const totalIssues = 22 + Math.floor(Math.random() * 20)

    const langDistribution = { JavaScript: 40, Python: 35, TypeScript: 15, HTML: 5, CSS: 5 }

    return {
      username,
      avatarUrl: `https://avatars.githubusercontent.com/${username}`,
      name: username.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      bio: 'Full Stack Developer | AI Enthusiast | Open Source Contributor',
      publicRepos: mockRepos.length,
      totalStars: mockRepos.reduce((s, r) => s + r.stars, 0),
      totalForks: mockRepos.reduce((s, r) => s + r.forks, 0),
      followers: 86,
      following: 42,
      totalCommits,
      totalPRs,
      totalIssues,
      languages: langDistribution,
      contributionScore: Math.round((totalCommits * 0.4 + totalPRs * 0.3 + mockRepos.length * 0.3) / 5),
      repos: mockRepos,
      lastActive: new Date().toISOString()
    }
  }

  function _computeQualityScore (repos) {
    let score = 0
    repos.forEach(r => {
      if (r.description) score += 15
      if (r.hasReadme) score += 15
      score += Math.min(20, r.stars * 0.5)
      score += Math.min(10, r.forks * 1)
      if (r.topics && r.topics.length > 0) score += Math.min(10, r.topics.length * 3)
    })
    return Math.min(100, Math.round(score / repos.length))
  }

  function _computeTechStack (repos) {
    const techs = new Set()
    repos.forEach(r => {
      if (r.language) techs.add(r.language)
      if (r.topics) r.topics.forEach(t => techs.add(t))
    })
    return Array.from(techs).slice(0, 12)
  }

  async function fetchProfile (username) {
    // Try live API first
    if (typeof ApiService !== 'undefined' && username && username !== 'demo-user') {
      var apiResult = await ApiService.github.analyze(username)
      if (apiResult.success) {
        var liveData = apiResult.data
        liveData.isMock = false
        liveData.source = 'api'
        liveData.confidence = 'High'
        liveData.calculation = { steps: ['Fetched live data from GitHub API via SkillPilot backend'] }
        Store.set('githubData', liveData)
        return liveData
      }
    }

    await new Promise(r => setTimeout(r, 800 + Math.random() * 700))

    const useMock = !username || username === 'demo-user'

    if (useMock) {
      const data = _generateMockRepos(username || 'demo-user')
      const qualityScore = _computeQualityScore(data.repos)
      const techStack = _computeTechStack(data.repos)

      const suggestions = []
      if (data.repos.length < 5) {
        suggestions.push('Add more repositories to strengthen your GitHub profile')
      }
      if (qualityScore < 70) {
        suggestions.push('Improve repo quality: add README files, descriptions, and topics')
      }
      suggestions.push('Contribute to open source projects to increase visibility')

      const result = {
        ...data,
        isMock: true,
        qualityScore,
        techStack,
        topProjects: data.repos.sort((a, b) => b.stars - a.stars).slice(0, 4),
        confidence: 'High',
        suggestions,
        calculation: {
          steps: [
            `Loaded ${data.repos.length} repositories for ${username}`,
            `Languages: ${Object.entries(data.languages).map(([k, v]) => `${k} (${v}%)`).join(', ')}`,
            `Contribution score based on commits, PRs, and repo count`,
            `Quality score weighted by descriptions, READMEs, stars, and topics`
          ]
        },
        source: 'mock'
      }

      Store.set('githubData', result)
      return result
    }

    try {
      const userRes = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}`)
      if (!userRes.ok) throw new Error('User not found')
      const userData = await userRes.json()

      const reposRes = await fetch(`${GITHUB_API}/users/${encodeURIComponent(username)}/repos?per_page=50&sort=updated`)
      const reposData = await reposRes.json()

      const repos = reposData.map(r => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        topics: r.topics || [],
        hasReadme: true,
        url: r.html_url,
        updatedAt: r.updated_at
      }))

      const langMap = {}
      repos.forEach(r => {
        if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1
      })
      const total = Object.values(langMap).reduce((a, b) => a + b, 0)
      const langDistribution = {}
      Object.entries(langMap).forEach(([k, v]) => {
        langDistribution[k] = Math.round((v / total) * 100)
      })

      const qualityScore = _computeQualityScore(repos)
      const techStack = _computeTechStack(repos)

      const suggestions = []
      if (repos.length < 5) {
        suggestions.push('Add more repositories to strengthen your GitHub profile')
      }
      if (qualityScore < 70) {
        suggestions.push('Improve repo quality: add README files, descriptions, and topics')
      }

      const result = {
        username: userData.login,
        avatarUrl: userData.avatar_url,
        name: userData.name,
        bio: userData.bio,
        publicRepos: userData.public_repos,
        totalStars: repos.reduce((s, r) => s + r.stars, 0),
        totalForks: repos.reduce((s, r) => s + r.forks, 0),
        followers: userData.followers,
        following: userData.following,
        languages: langDistribution,
        repos,
        qualityScore,
        techStack,
        topProjects: repos.sort((a, b) => b.stars - a.stars).slice(0, 4),
        isMock: false,
        confidence: repos.length > 0 ? 'High' : 'Medium',
        suggestions,
        source: 'github'
      }

      Store.set('githubData', result)
      return result
    } catch (e) {
      const fallback = _generateMockRepos(username)
      fallback.isMock = true
      fallback.confidence = 'Low'
      fallback.suggestions = ['Could not fetch from GitHub API. Showing demo data.', 'Check your internet connection and try again.']
      fallback.source = 'mock-fallback'
      Store.set('githubData', fallback)
      return fallback
    }
  }

  function getLastData () {
    return Store.get('githubData')
  }

  return { fetchProfile, getLastData }
})()
