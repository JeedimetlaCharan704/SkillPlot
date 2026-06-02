function computeProfileStrength (profile) {
  const factors = {}

  const skillsScore = (profile.skills && profile.skills.length > 0)
    ? Math.min(100, profile.skills.length * 8 + profile.skills.filter(s => s.level > 50).length * 2)
    : 0
  factors.skills = { score: Math.min(100, skillsScore), weight: 0.20, count: (profile.skills || []).length }

  const projectScore = (profile.projects && profile.projects.length > 0)
    ? Math.min(100, (profile.projects.length * 15) + profile.projects.reduce((s, p) => s + (p.impactScore || 0), 0) / Math.max(1, profile.projects.length))
    : 0
  factors.projects = { score: Math.round(projectScore), weight: 0.20, count: (profile.projects || []).length }

  const certScore = (profile.certifications && profile.certifications.length > 0)
    ? Math.min(100, profile.certifications.length * 20)
    : 0
  factors.certifications = { score: certScore, weight: 0.10, count: (profile.certifications || []).length }

  const internshipScore = (profile.internships && profile.internships.length > 0)
    ? Math.min(100, profile.internships.length * 30)
    : 0
  factors.internships = { score: internshipScore, weight: 0.15, count: (profile.internships || []).length }

  const educationScore = (profile.education && profile.education.length > 0) ? 80 : 0
  factors.education = { score: educationScore, weight: 0.10, count: (profile.education || []).length }

  const socialScore = (
    (profile.socialLinks && profile.socialLinks.github ? 30 : 0) +
    (profile.socialLinks && profile.socialLinks.linkedin ? 30 : 0) +
    (profile.socialLinks && profile.socialLinks.portfolio ? 20 : 0) +
    (profile.socialLinks && profile.socialLinks.twitter ? 10 : 0)
  )
  factors.social = { score: socialScore, weight: 0.10 }

  const headlineScore = (profile.headline && profile.headline.length > 10) ? 90 : profile.headline ? 50 : 0
  const bioScore = (profile.bio && profile.bio.length > 50) ? 90 : profile.bio ? 50 : 0
  factors.completeness = { score: Math.round((headlineScore + bioScore) / 2), weight: 0.10 }

  const locationScore = profile.location ? 100 : 0
  factors.location = { score: locationScore, weight: 0.05 }

  let totalScore = 0
  let totalWeight = 0
  for (const factor of Object.values(factors)) {
    totalScore += factor.score * factor.weight
    totalWeight += factor.weight
  }

  return {
    score: Math.round(totalWeight > 0 ? totalScore / totalWeight : 0),
    factors,
  }
}

function generateInsights (profile, strengthResult) {
  const insights = []
  const score = strengthResult.score

  if (score >= 80) insights.push({ type: 'positive', message: 'Strong profile — ready for placements', priority: 1 })
  else if (score >= 50) insights.push({ type: 'warning', message: 'Profile needs improvement in key areas', priority: 2 })
  else insights.push({ type: 'critical', message: 'Profile is weak — focus on fundamentals', priority: 3 })

  if (!profile.skills || profile.skills.length < 5) {
    insights.push({ type: 'warning', message: `Add ${5 - (profile.skills || []).length} more skills`, priority: 2 })
  }

  if (!profile.projects || profile.projects.length < 2) {
    insights.push({ type: 'warning', message: `Add ${2 - (profile.projects || []).length} more projects`, priority: 2 })
  }

  if (!profile.certifications || profile.certifications.length === 0) {
    insights.push({ type: 'info', message: 'Add certifications to boost profile', priority: 3 })
  }

  if (!profile.socialLinks || !profile.socialLinks.github) {
    insights.push({ type: 'info', message: 'Link GitHub account', priority: 3 })
  }

  if (!profile.socialLinks || !profile.socialLinks.linkedin) {
    insights.push({ type: 'info', message: 'Link LinkedIn profile', priority: 3 })
  }

  return insights.sort((a, b) => a.priority - b.priority)
}

module.exports = { computeProfileStrength, generateInsights }
