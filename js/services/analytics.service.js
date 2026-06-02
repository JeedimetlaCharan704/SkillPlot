const AnalyticsService = (function () {
  function _generateWeeklyData () {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      day,
      active: Math.floor(Math.random() * 6) + 1,
      learning: Math.floor(Math.random() * 120) + 30,
      projects: Math.floor(Math.random() * 3),
      applications: Math.floor(Math.random() * 2)
    }))
  }

  function _generateProgressHistory () {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    let score = 30
    return months.map(month => {
      score += Math.floor(Math.random() * 12) + 3
      return { month, score: Math.min(100, score) }
    })
  }

  async function computeDashboard () {
    await new Promise(r => setTimeout(r, 300))

    const user = Store.get('user')
    const resumeAnalysis = Store.get('resumeAnalysis')
    const careerRecs = Store.get('careerRecommendations')
    const recruiterScore = Store.get('recruiterScore')

    const skills = user?.skills || []
    const projects = user?.projects || []
    const certifications = user?.certifications || []
    const streak = Store.get('learningStreak') || { current: 0, longest: 0 }

    const careerReadiness = recruiterScore?.overall || 60
    const resumeScore = resumeAnalysis?.resumeScore || 0
    const skillStrength = skills.length > 0 ? Math.round(skills.reduce((s, sk) => s + (sk.level || 0), 0) / skills.length) : 0
    const projectsCompleted = projects.filter(p => p.completed !== false).length
    const totalProjects = projects.length

    const suggestions = []
    if (careerReadiness < 60) {
      suggestions.push('Complete your profile and upload a resume to improve career readiness')
    }
    if (skills.length < 5) {
      suggestions.push('Add more skills with proficiency levels for better analysis')
    }
    if (projects.length === 0) {
      suggestions.push('Add your projects to strengthen your portfolio')
    }
    if (streak.current === 0) {
      suggestions.push('Start a learning streak by visiting daily')
    }

    const result = {
      careerReadiness,
      resumeScore,
      skillStrength,
      skillCount: skills.length,
      projectsCompleted,
      totalProjects,
      certificationsCount: certifications.length,
      streak: streak.current || 0,
      longestStreak: streak.longest || 0,
      topCareerPath: careerRecs?.topRecommendation?.title || 'Not analyzed',
      topMatchPct: careerRecs?.topRecommendation?.matchPercentage || 0,
      weeklyActivity: _generateWeeklyData(),
      progressHistory: _generateProgressHistory(),
      skillDistribution: skills.map(s => ({ name: s.name, level: s.level || 50 })),
      confidence: skills.length >= 3 ? 'High' : 'Medium',
      suggestions,
      calculation: {
        steps: [
          `Career Readiness: weighted composite of recruiter score (if available)`,
          `Skill Strength: average of all skill levels (${skills.length} skills)`,
          `Progress tracked across ${totalProjects} projects and ${certifications.length} certifications`,
          `Weekly activity simulated for demo purposes`
        ]
      }
    }

    return result
  }

  async function logActivity (type, details) {
    const log = Store.get('activityLog') || []
    log.unshift({
      type,
      details,
      timestamp: new Date().toISOString(),
      id: 'act_' + Date.now()
    })
    if (log.length > 100) log.length = 100
    Store.set('activityLog', log)

    if (type === 'learning') {
      _updateStreak()
    }
  }

  function _updateStreak () {
    const streak = Store.get('learningStreak') || { current: 0, longest: 0 }
    const today = new Date().toDateString()
    const lastActive = streak.lastActive

    if (lastActive !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const wasYesterday = lastActive === yesterday.toDateString()

      if (wasYesterday) {
        streak.current += 1
      } else {
        streak.current = 1
      }

      if (streak.current > streak.longest) {
        streak.longest = streak.current
      }

      streak.lastActive = today
      Store.set('learningStreak', streak)
    }
  }

  return { computeDashboard, logActivity }
})()
