var GithubAnalyticsService = (function () {
  'use strict'

  var DEMO_GITHUB = {
    username: 'aryan-dev',
    avatarUrl: 'https://avatars.githubusercontent.com/u/0',
    name: 'Aryan Sharma',
    bio: 'BCA Student | AI & Full-Stack Developer | Building SkillPilot AI',
    location: 'Hyderabad, India',
    blog: '',
    company: '',
    publicRepos: 18,
    publicGists: 5,
    followers: 12,
    following: 8,
    totalStars: 24,
    totalForks: 9,
    joinedAt: '2024-06-15T00:00:00Z',
    contributionScore: 65,
    activityScore: 72,
    repos: [
      {
        name: 'SkillPilot AI',
        description: 'AI-powered career intelligence platform featuring resume analysis, career recommendation engine, skill gap detection, placement prediction, and portfolio builder.',
        language: 'JavaScript',
        stars: 8,
        forks: 3,
        topics: ['ai', 'career', 'resume', 'career-guidance', 'placement-prediction'],
        size: 12800,
        hasReadme: true,
        hasDescription: true,
        hasTopics: true,
        createdAt: '2026-01-10T00:00:00Z',
        updatedAt: '2026-05-28T00:00:00Z',
        archived: false,
        fork: false,
        technologies: ['JavaScript', 'Chart.js', 'CSS', 'localStorage']
      },
      {
        name: 'ML Resume Analyzer',
        description: 'ML-based resume scoring system analyzing keyword density, section coverage, and formatting for ATS compatibility.',
        language: 'Python',
        stars: 5,
        forks: 2,
        topics: ['machine-learning', 'nlp', 'resume-analysis', 'ats'],
        size: 6400,
        hasReadme: true,
        hasDescription: true,
        hasTopics: true,
        createdAt: '2025-08-15T00:00:00Z',
        updatedAt: '2026-03-10T00:00:00Z',
        archived: false,
        fork: false,
        technologies: ['Python', 'scikit-learn', 'NLTK', 'Flask']
      },
      {
        name: 'E-Commerce Dashboard',
        description: 'Real-time analytics dashboard for e-commerce with sales forecasting and customer segmentation.',
        language: 'JavaScript',
        stars: 4,
        forks: 1,
        topics: ['ecommerce', 'analytics', 'dashboard', 'machine-learning'],
        size: 9200,
        hasReadme: true,
        hasDescription: true,
        hasTopics: false,
        createdAt: '2025-06-20T00:00:00Z',
        updatedAt: '2026-02-15T00:00:00Z',
        archived: false,
        fork: false,
        technologies: ['React', 'Python', 'Pandas', 'D3.js', 'Node.js']
      },
      {
        name: 'Smart Campus Portal',
        description: 'Integrated campus management system with attendance, grades, events, and placement modules.',
        language: 'JavaScript',
        stars: 3,
        forks: 2,
        topics: ['campus', 'education', 'management'],
        size: 15600,
        hasReadme: true,
        hasDescription: true,
        hasTopics: true,
        createdAt: '2024-11-05T00:00:00Z',
        updatedAt: '2025-12-20T00:00:00Z',
        archived: false,
        fork: false,
        technologies: ['React', 'Node.js', 'MongoDB', 'Firebase']
      },
      {
        name: 'GitHub Contribution Tracker',
        description: 'CLI tool and web dashboard for tracking GitHub contributions and visualizing language distribution.',
        language: 'Python',
        stars: 2,
        forks: 0,
        topics: ['github', 'cli', 'dashboard'],
        size: 3200,
        hasReadme: true,
        hasDescription: true,
        hasTopics: false,
        createdAt: '2026-04-01T00:00:00Z',
        updatedAt: '2026-05-25T00:00:00Z',
        archived: false,
        fork: false,
        technologies: ['Python', 'GitHub API', 'Chart.js']
      },
      {
        name: 'Data Analysis Toolkit',
        description: 'Collection of Python scripts for data cleaning, visualization, and exploratory analysis.',
        language: 'Python',
        stars: 1,
        forks: 0,
        topics: ['data-analysis', 'python', 'visualization'],
        size: 1800,
        hasReadme: false,
        hasDescription: true,
        hasTopics: true,
        createdAt: '2025-03-10T00:00:00Z',
        updatedAt: '2025-09-05T00:00:00Z',
        archived: false,
        fork: false,
        technologies: ['Python', 'Pandas', 'Matplotlib', 'Seaborn']
      },
      {
        name: 'React Component Library',
        description: 'Reusable UI components built with React and TypeScript for rapid prototyping.',
        language: 'TypeScript',
        stars: 1,
        forks: 1,
        topics: ['react', 'components', 'ui'],
        size: 4500,
        hasReadme: true,
        hasDescription: true,
        hasTopics: false,
        createdAt: '2025-01-20T00:00:00Z',
        updatedAt: '2025-11-10T00:00:00Z',
        archived: true,
        fork: false,
        technologies: ['TypeScript', 'React', 'Storybook']
      },
      {
        name: 'algorithm-practice',
        description: 'Solutions to DSA problems from LeetCode, CodeForces, and HackerRank.',
        language: 'Java',
        stars: 0,
        forks: 0,
        topics: [],
        size: 1200,
        hasReadme: false,
        hasDescription: true,
        hasTopics: false,
        createdAt: '2024-09-01T00:00:00Z',
        updatedAt: '2025-06-20T00:00:00Z',
        archived: false,
        fork: false,
        technologies: ['Java']
      }
    ],
    languageBreakdown: {
      JavaScript: 35,
      Python: 28,
      TypeScript: 12,
      HTML: 10,
      CSS: 8,
      Java: 5,
      Others: 2
    },
    activityTimeline: [
      { month: '2026-01', contributions: 12 },
      { month: '2026-02', contributions: 18 },
      { month: '2026-03', contributions: 25 },
      { month: '2026-04', contributions: 20 },
      { month: '2026-05', contributions: 30 },
      { month: '2026-06', contributions: 10 }
    ],
    weeklyActivity: [
      { week: 'W1', commits: 4, prs: 1, reviews: 2 },
      { week: 'W2', commits: 7, prs: 2, reviews: 1 },
      { week: 'W3', commits: 5, prs: 0, reviews: 3 },
      { week: 'W4', commits: 9, prs: 3, reviews: 2 }
    ]
  }

  var TECH_CATEGORIES = {
    Frontend: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Chart.js', 'Storybook', 'D3.js'],
    Backend: ['Node.js', 'Flask', 'Express'],
    'Data Science': ['Python', 'scikit-learn', 'NLTK', 'Pandas', 'Matplotlib', 'Seaborn'],
    Cloud: [],
    DevOps: ['Firebase', 'GitHub API'],
    Databases: ['MongoDB']
  }

  function fetchGitHubData (username, mode) {
    if (mode === 'demo') return Promise.resolve({ data: DEMO_GITHUB, mode: 'demo' })
    if (mode === 'api') return fetchFromAPI(username)
    return Promise.resolve({ data: DEMO_GITHUB, mode: 'fallback' })
  }

  function fetchFromAPI (username) {
    return Promise.all([
      fetch('https://api.github.com/users/' + username).then(function (r) { return r.ok ? r.json() : null }),
      fetch('https://api.github.com/users/' + username + '/repos?per_page=100&sort=updated').then(function (r) { return r.ok ? r.json() : null }),
      fetch('https://api.github.com/users/' + username + '/events?per_page=100').then(function (r) { return r.ok ? r.json() : null })
    ]).then(function (results) {
      var userData = results[0]
      var reposData = results[1]
      if (!userData || !reposData) return { data: null, mode: 'failed' }

      var repos = reposData.map(function (r) {
        return {
          name: r.name,
          description: r.description || '',
          language: r.language || 'Unknown',
          stars: r.stargazers_count,
          forks: r.forks_count,
          topics: r.topics || [],
          size: r.size || 0,
          hasReadme: true,
          hasDescription: !!(r.description),
          hasTopics: r.topics && r.topics.length > 0,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          archived: r.archived,
          fork: r.fork,
          technologies: [r.language || 'Unknown'].filter(Boolean)
        }
      })

      var langBreakdown = {}
      repos.forEach(function (r) {
        var lang = r.language || 'Others'
        langBreakdown[lang] = (langBreakdown[lang] || 0) + 1
      })
      var total = Object.values(langBreakdown).reduce(function (a, b) { return a + b }, 0)
      if (total > 0) for (var k in langBreakdown) langBreakdown[k] = Math.round(langBreakdown[k] / total * 100)

      var result = {
        username: userData.login,
        avatarUrl: userData.avatar_url,
        name: userData.name || userData.login,
        bio: userData.bio || '',
        location: userData.location || '',
        blog: userData.blog || '',
        company: userData.company || '',
        publicRepos: userData.public_repos,
        publicGists: userData.public_gists || 0,
        followers: userData.followers,
        following: userData.following,
        totalStars: repos.reduce(function (sum, r) { return sum + r.stars }, 0),
        totalForks: repos.reduce(function (sum, r) { return sum + r.forks }, 0),
        joinedAt: userData.created_at,
        contributionScore: 0,
        activityScore: 0,
        repos: repos,
        languageBreakdown: langBreakdown,
        activityTimeline: [],
        weeklyActivity: []
      }
      result.contributionScore = computeContributionScore(result)
      result.activityScore = computeActivityScore(result)
      return { data: result, mode: 'api' }
    }).catch(function () {
      return { data: null, mode: 'failed' }
    })
  }

  function computeContributionScore (data) {
    var repoScore = Math.min(30, (data.repos || []).length * 2)
    var starScore = Math.min(30, (data.totalStars || 0) * 1.5)
    var forkScore = Math.min(15, (data.totalForks || 0) * 2)
    var followerScore = Math.min(15, (data.followers || 0) * 1.5)
    var gistScore = Math.min(10, (data.publicGists || 0) * 2)
    return Math.round(repoScore + starScore + forkScore + followerScore + gistScore)
  }

  function computeActivityScore (data) {
    if (!data.repos || !data.repos.length) return 0
    var now = new Date()
    var recentCount = 0
    data.repos.forEach(function (r) {
      var updated = new Date(r.updatedAt)
      var diffMonths = (now.getFullYear() - updated.getFullYear()) * 12 + now.getMonth() - updated.getMonth()
      if (diffMonths <= 3) recentCount++
    })
    var recentRatio = data.repos.length > 0 ? recentCount / data.repos.length : 0
    var diversity = Math.min(20, Object.keys(data.languageBreakdown || {}).length * 4)
    var starRatio = Math.min(20, (data.totalStars || 0) * 2)
    return Math.round(recentRatio * 40 + diversity + starRatio + 10)
  }

  // ===== PROJECT QUALITY ENGINE =====
  function analyzeProjectQuality (repos) {
    if (!repos || !repos.length) return { scores: [], average: 0, distribution: [] }
    var scores = repos.map(function (r) {
      var readmeScore = r.hasReadme ? 20 : 0
      var descScore = r.hasDescription ? (r.description.length > 50 ? 20 : r.description.length > 20 ? 15 : 10) : 0
      var topicsScore = r.hasTopics ? Math.min(15, (r.topics || []).length * 5) : 0
      var starScore = Math.min(20, r.stars * 4)
      var sizeScore = Math.min(15, r.size / 1000 * 2)
      var techScore = Math.min(10, (r.technologies || []).length * 3)
      var total = readmeScore + descScore + topicsScore + starScore + sizeScore + techScore
      var label = total >= 70 ? 'Excellent' : total >= 50 ? 'Good' : total >= 30 ? 'Average' : 'Needs Work'
      return { name: r.name, score: total, label: label, language: r.language, stars: r.stars, topics: r.topics || [] }
    })
    var avg = scores.length > 0 ? Math.round(scores.reduce(function (s, s2) { return s + s2.score }, 0) / scores.length) : 0
    var dist = { excellent: 0, good: 0, average: 0, needsWork: 0 }
    scores.forEach(function (s) {
      if (s.score >= 70) dist.excellent++
      else if (s.score >= 50) dist.good++
      else if (s.score >= 30) dist.average++
      else dist.needsWork++
    })
    scores.sort(function (a, b) { return b.score - a.score })
    return { scores: scores, average: avg, distribution: dist }
  }

  // ===== DEVELOPER MATURITY =====
  function computeDeveloperMaturity (data) {
    if (!data) return { score: 0, factors: {} }
    var repos = data.repos || []

    var consistency = repos.length > 0 ? Math.min(100, Math.round(repos.filter(function (r) {
      var u = new Date(r.updatedAt); var d = new Date()
      return (d.getTime() - u.getTime()) < 90 * 24 * 60 * 60 * 1000
    }).length / repos.length * 100)) : 0

    var allTechs = {}
    repos.forEach(function (r) {
      ;(r.technologies || []).forEach(function (t) { allTechs[t] = true })
    })
    var techCount = Object.keys(allTechs).length
    var diversity = Math.min(100, techCount * 8)

    var docScore = repos.length > 0 ? Math.round(repos.filter(function (r) { return r.hasReadme }).length / repos.length * 60 + repos.filter(function (r) { return r.hasTopics }).length / repos.length * 40) : 0

    var openSourceScore = Math.min(100, (data.totalForks || 0) * 8 + (data.totalStars || 0) * 2)

    var categories = {}
    repos.forEach(function (r) {
      ;(r.technologies || []).forEach(function (t) {
        for (var cat in TECH_CATEGORIES) {
          if (TECH_CATEGORIES[cat].indexOf(t) !== -1) { categories[cat] = true; break }
        }
      })
    })
    var breadth = Math.min(100, Object.keys(categories).length * 20)

    var total = Math.round(consistency * 0.25 + diversity * 0.20 + docScore * 0.20 + openSourceScore * 0.15 + breadth * 0.20)

    return {
      score: total,
      factors: {
        consistency: { score: consistency, label: 'Consistency', desc: repos.length + ' repos, ' + (data.repos || []).filter(function (r) { return r.updatedAt && new Date(r.updatedAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }).length + ' recently active' },
        diversity: { score: diversity, label: 'Project Diversity', desc: techCount + ' unique technologies across repos' },
        documentation: { score: docScore, label: 'Documentation', desc: repos.filter(function (r) { return r.hasReadme }).length + '/' + repos.length + ' repos with README' },
        openSource: { score: openSourceScore, label: 'Open Source Activity', desc: (data.totalForks || 0) + ' forks, ' + (data.totalStars || 0) + ' stars received' },
        breadth: { score: breadth, label: 'Tech Breadth', desc: Object.keys(categories).length + ' technology categories (Frontend, Backend, Data Science, etc.)' }
      }
    }
  }

  // ===== TECH CATEGORY ANALYSIS =====
  function analyzeTechCategories (repos) {
    var categories = {}
    for (var cat in TECH_CATEGORIES) { categories[cat] = [] }
    var uncategorized = []

    repos.forEach(function (r) {
      ;(r.technologies || []).forEach(function (t) {
        var found = false
        for (var cat2 in TECH_CATEGORIES) {
          if (TECH_CATEGORIES[cat2].indexOf(t) !== -1) { categories[cat2].push(t); found = true; break }
        }
        if (!found) uncategorized.push(t)
      })
    })

    var result = {}
    for (var cat3 in categories) {
      var techs = categories[cat3]
      var unique = techs.filter(function (t, i, a) { return a.indexOf(t) === i })
      result[cat3] = { technologies: unique, count: unique.length, score: Math.min(100, unique.length * 20) }
    }
    result.Other = { technologies: uncategorized.filter(function (t, i, a) { return a.indexOf(t) === i }), count: uncategorized.filter(function (t, i, a) { return a.indexOf(t) === i }).length, score: 0 }
    return result
  }

  // ===== RECRUITER VIEW =====
  function generateRecruiterView (data, quality, maturity, categories) {
    if (!data) return { strengths: [], weaknesses: [], impressiveProjects: [], recommendedProjects: [] }
    var repos = data.repos || []

    var strongestAreas = []
    if (maturity.factors.consistency.score >= 60) strongestAreas.push('Consistent contributor with ' + repos.length + ' repositories')
    if (maturity.factors.diversity.score >= 60) strongestAreas.push('Strong technology diversity across ' + Object.keys(categories).length + ' categories')
    if (maturity.factors.documentation.score >= 60) strongestAreas.push('Excellent documentation habits with READMEs on most repos')
    if (quality.average >= 50) strongestAreas.push('High average project quality score of ' + quality.average + '/100')

    var weakestAreas = []
    if (!data.contributionScore || data.contributionScore < 50) weakestAreas.push('Low contribution score — increase open source engagement')
    if (!data.activityScore || data.activityScore < 50) weakestAreas.push('Recent activity is low — push new code to stay visible')
    if (maturity.factors.openSource.score < 40) weakestAreas.push('Limited open source collaboration — consider contributing to other projects')
    var lowQuality = quality.scores.filter(function (s) { return s.score < 40 })
    if (lowQuality.length > 1) weakestAreas.push(lowQuality.length + ' repos need quality improvements')

    var impressive = quality.scores.slice(0, 3).map(function (s) {
      return { name: s.name, score: s.score, reason: s.score >= 70 ? 'Well-documented with strong metrics' : 'Solid project with good structure', stars: s.stars }
    })

    var recommended = []
    var topCats = Object.keys(categories).filter(function (c) { return categories[c].count > 0 }).sort(function (a, b) { return categories[b].count - a.count })
    if (topCats.indexOf('Cloud') === -1) recommended.push('Build a cloud-native project (AWS/GCP/Azure) to fill a gap')
    if (topCats.indexOf('DevOps') === -1) recommended.push('Add DevOps skills (Docker/Kubernetes/CI/CD) to your portfolio')
    if (repos.length < 10) recommended.push('Create more diverse projects — aim for 10+ public repos')
    if (recommended.length < 2) recommended.push('Open source contributions to established projects to boost community presence')

    return {
      strengths: strongestAreas,
      weaknesses: weakestAreas,
      impressiveProjects: impressive,
      recommendedProjects: recommended.slice(0, 3)
    }
  }

  // ===== EXPORTS =====
  function exportJSON (data, quality, maturity, recruiter) {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      username: data.username,
      overview: { repos: data.publicRepos, stars: data.totalStars, forks: data.totalForks, followers: data.followers, contributionScore: data.contributionScore, activityScore: data.activityScore },
      languageBreakdown: data.languageBreakdown,
      projectQuality: { average: quality.average, distribution: quality.distribution, repos: quality.scores },
      developerMaturity: { score: maturity.score, factors: maturity.factors },
      recruiterView: recruiter,
      techCategories: categories
    }, null, 2)
  }

  function exportMarkdown (data, quality, maturity, recruiter) {
    if (!data) return '# GitHub Analytics\n\nNo data.'
    var md = '# GitHub Analytics — @' + data.username + '\n\n'
    md += '## Overview\n\n'
    md += '- **Repositories:** ' + data.publicRepos + '\n'
    md += '- **Stars:** ' + data.totalStars + '\n'
    md += '- **Forks:** ' + data.totalForks + '\n'
    md += '- **Followers:** ' + data.followers + '\n'
    md += '- **Contribution Score:** ' + data.contributionScore + '/100\n'
    md += '- **Activity Score:** ' + data.activityScore + '/100\n\n'

    md += '## Project Quality\n\n'
    md += '- **Average Quality Score:** ' + quality.average + '/100\n'
    md += '- **Excellent:** ' + quality.distribution.excellent + ' | **Good:** ' + quality.distribution.good + ' | **Average:** ' + quality.distribution.average + ' | **Needs Work:** ' + quality.distribution.needsWork + '\n\n'
    md += '| Repo | Score | Language | Stars |\n|------|-------|----------|-------|\n'
    quality.scores.forEach(function (s) {
      md += '| ' + s.name + ' | ' + s.score + '/100 | ' + (s.language || '') + ' | ' + s.stars + ' |\n'
    })

    md += '\n## Developer Maturity\n\n'
    md += '- **Overall:** ' + maturity.score + '/100\n'
    for (var key in maturity.factors) {
      md += '- **' + maturity.factors[key].label + ':** ' + maturity.factors[key].score + '/100 — ' + maturity.factors[key].desc + '\n'
    }

    md += '\n## Recruiter View\n\n'
    md += '### Strongest Areas\n'
    recruiter.strengths.forEach(function (s) { md += '- ' + s + '\n' })
    md += '\n### Areas to Improve\n'
    recruiter.weaknesses.forEach(function (w) { md += '- ' + w + '\n' })
    return md
  }

  function exportPDF (data, quality, maturity, recruiter) {
    if (!data) return '<html><body><h1>No data</h1></body></html>'
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    var bg = isDark ? '#0F172A' : '#FFFFFF'
    var text = isDark ? '#E2E8F0' : '#1E293B'
    var cardBg = isDark ? '#1E293B' : '#F8FAFC'

    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>GitHub Analytics — @' + data.username + '</title>'
    html += '<style>body{font-family:Inter,sans-serif;background:' + bg + ';color:' + text + ';padding:40px;line-height:1.6}h1{font-size:28px;margin-bottom:4px}h2{font-size:20px;border-bottom:2px solid #4F46E5;padding-bottom:6px;margin-top:32px}.section{background:' + cardBg + ';border-radius:12px;padding:20px;margin:16px 0}.stat{font-size:36px;font-weight:700;color:#4F46E5}.grid{display:flex;flex-wrap:wrap;gap:12px}.item{flex:1;min-width:120px;padding:12px;background:' + bg + ';border-radius:8px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid ' + (isDark ? '#334155' : '#E2E8F0') + '}th{font-weight:600}</style></head><body>'
    html += '<h1>GitHub Analytics — @' + data.username + '</h1>'
    html += '<p>Generated ' + new Date().toLocaleDateString() + '</p>'

    html += '<div class="section"><h2>Overview</h2><div class="grid">'
    html += '<div class="item"><div class="stat">' + data.publicRepos + '</div><div>Repositories</div></div>'
    html += '<div class="item"><div class="stat">' + data.totalStars + '</div><div>Stars</div></div>'
    html += '<div class="item"><div class="stat">' + data.totalForks + '</div><div>Forks</div></div>'
    html += '<div class="item"><div class="stat">' + (data.contributionScore || 0) + '</div><div>Contribution Score</div></div>'
    html += '</div></div>'

    html += '<div class="section"><h2>Project Quality</h2><p>Average Quality Score: <strong>' + quality.average + '/100</strong></p>'
    html += '<table><tr><th>Repo</th><th>Score</th><th>Status</th><th>Stars</th></tr>'
    quality.scores.slice(0, 8).forEach(function (s) {
      var c = s.score >= 70 ? '#10B981' : s.score >= 50 ? '#F59E0B' : '#EF4444'
      html += '<tr><td>' + s.name + '</td><td style="color:' + c + '">' + s.score + '</td><td>' + s.label + '</td><td>' + s.stars + '</td></tr>'
    })
    html += '</table></div>'

    html += '<div class="section"><h2>Developer Maturity</h2><div class="stat">' + maturity.score + '/100</div>'
    html += '<table><tr><th>Factor</th><th>Score</th><th>Details</th></tr>'
    for (var key in maturity.factors) {
      var f = maturity.factors[key]
      var c2 = f.score >= 60 ? '#10B981' : f.score >= 40 ? '#F59E0B' : '#EF4444'
      html += '<tr><td>' + f.label + '</td><td style="color:' + c2 + '">' + f.score + '/100</td><td>' + f.desc + '</td></tr>'
    }
    html += '</table></div>'

    html += '<div class="section"><h2>Recruiter View</h2><h3>Strongest Areas</h3><ul>' + recruiter.strengths.map(function (s) { return '<li>' + s + '</li>' }).join('') + '</ul>'
    html += '<h3>Areas to Improve</h3><ul>' + recruiter.weaknesses.map(function (w) { return '<li>' + w + '</li>' }).join('') + '</ul></div>'

    html += '<p style="text-align:center;margin-top:40px;font-size:12px;opacity:0.5">Generated by SkillPilot AI — GitHub Analytics</p></body></html>'
    return html
  }

  // ===== MAIN ANALYZE =====
  function analyze (username, mode) {
    return fetchGitHubData(username, mode).then(function (result) {
      var data = result.data
      if (!data) {
        // Fallback to demo data
        return analyze('', 'demo').then(function (f) { f.mode = 'demo'; return f })
      }
      var quality = analyzeProjectQuality(data.repos)
      var maturity = computeDeveloperMaturity(data)
      var categories = analyzeTechCategories(data.repos)
      var recruiter = generateRecruiterView(data, quality, maturity, categories)
      return {
        data: data,
        quality: quality,
        maturity: maturity,
        categories: categories,
        recruiter: recruiter,
        mode: result.mode
      }
    })
  }

  return {
    analyze: analyze,
    DEMO_GITHUB: DEMO_GITHUB,
    TECH_CATEGORIES: TECH_CATEGORIES,
    fetchFromAPI: fetchFromAPI,
    computeContributionScore: computeContributionScore,
    computeActivityScore: computeActivityScore,
    analyzeProjectQuality: analyzeProjectQuality,
    computeDeveloperMaturity: computeDeveloperMaturity,
    analyzeTechCategories: analyzeTechCategories,
    generateRecruiterView: generateRecruiterView,
    exportJSON: exportJSON,
    exportMarkdown: exportMarkdown,
    exportPDF: exportPDF
  }
})()
