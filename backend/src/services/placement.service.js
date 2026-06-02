const SALARY_BY_DOMAIN = {
  'software-engineering': { entry: 600000, mid: 1200000, senior: 2000000 },
  'data-science': { entry: 700000, mid: 1400000, senior: 2500000 },
  'machine-learning': { entry: 800000, mid: 1500000, senior: 2800000 },
  'devops': { entry: 650000, mid: 1300000, senior: 2200000 },
  'frontend': { entry: 550000, mid: 1000000, senior: 1800000 },
  'backend': { entry: 600000, mid: 1100000, senior: 1900000 },
  'fullstack': { entry: 650000, mid: 1200000, senior: 2000000 },
  default: { entry: 500000, mid: 900000, senior: 1500000 },
}

function computePlacementScore (profileData) {
  const factors = {}

  const cgpaScore = profileData.cgpa ? Math.min(100, (profileData.cgpa / 10) * 100) : 50
  factors.cgpa = { score: cgpaScore, weight: 0.15, value: profileData.cgpa }

  const skillCount = (profileData.skills || []).length
  const skillsScore = Math.min(100, skillCount * 7)
  factors.skills = { score: skillsScore, weight: 0.20, count: skillCount }

  const projectCount = (profileData.projects || []).length
  const projectQuality = profileData.projects
    ? profileData.projects.reduce((s, p) => s + (p.impactScore || 50), 0) / Math.max(1, projectCount)
    : 0
  const projectsScore = Math.min(100, (projectCount * 12) + (projectQuality * 0.3))
  factors.projects = { score: Math.round(projectsScore), weight: 0.15, count: projectCount }

  const internCount = (profileData.internships || []).length
  const internshipsScore = Math.min(100, internCount * 35)
  factors.internships = { score: internshipsScore, weight: 0.15, count: internCount }

  const certCount = (profileData.certifications || []).length
  const certsScore = Math.min(100, certCount * 20)
  factors.certifications = { score: certsScore, weight: 0.10, count: certCount }

  const resumeScore = profileData.resumeScore || 50
  factors.resume = { score: Math.min(100, resumeScore), weight: 0.15 }

  const githubScore = profileData.githubScore || 30
  factors.github = { score: Math.min(100, githubScore), weight: 0.10 }

  let totalScore = 0
  let totalWeight = 0
  for (const factor of Object.values(factors)) {
    totalScore += factor.score * factor.weight
    totalWeight += factor.weight
  }

  const finalScore = Math.round(totalWeight > 0 ? totalScore / totalWeight : 0)

  let tier
  if (finalScore >= 85) tier = 'platinum'
  else if (finalScore >= 70) tier = 'gold'
  else if (finalScore >= 55) tier = 'silver'
  else if (finalScore >= 40) tier = 'bronze'
  else tier = 'basic'

  const domain = profileData.targetDomain || 'software-engineering'
  const salaryData = SALARY_BY_DOMAIN[domain] || SALARY_BY_DOMAIN.default
  const salaryMultiplier = 0.5 + (finalScore / 200)
  const salaryEstimate = {
    entry: Math.round(salaryData.entry * salaryMultiplier),
    likely: Math.round(salaryData.mid * salaryMultiplier),
    stretch: Math.round(salaryData.senior * salaryMultiplier),
  }

  return {
    score: finalScore,
    tier,
    salaryEstimate,
    factors,
    lastComputed: new Date(),
  }
}

module.exports = { computePlacementScore }
