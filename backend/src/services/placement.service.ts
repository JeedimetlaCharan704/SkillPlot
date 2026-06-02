import axios from 'axios'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001'

const SKILL_WEIGHTS: Record<string, number> = {
  python: 3, java: 3, javascript: 3, sql: 3, 'data structures': 3,
  algorithms: 3, 'system design': 3, 'machine learning': 3, 'deep learning': 3,
  react: 3, 'node.js': 3, docker: 3, kubernetes: 3, aws: 3, git: 3,
  'rest api': 3, 'database management': 3,
  html: 2, css: 2, typescript: 2, 'c++': 2, go: 2, rust: 2,
  mongodb: 2, postgresql: 2, redis: 2, graphql: 2, tensorflow: 2,
  pytorch: 2, linux: 2, 'ci/cd': 2, agile: 2, scrum: 2, oop: 2,
  flutter: 1, swift: 1, kotlin: 1, 'vue.js': 1, angular: 1,
  'express.js': 1, fastapi: 1, django: 1, 'spring boot': 1,
  numpy: 1, pandas: 1, tableau: 1, 'power bi': 1, excel: 1,
  photoshop: 1, figma: 1
}

export function computeSkillsQuality(skills: string[]): number {
  if (!skills || skills.length === 0) return 0
  const lower = skills.map(s => s.toLowerCase().trim())
  let score = 0
  for (const s of lower) {
    score += SKILL_WEIGHTS[s] || 1
  }
  return score
}

export function predictPlacement(features: {
  cgpa: number
  numSkills: number
  skillsQuality: number
  numProjects: number
  numInternships: number
  numCerts: number
  githubRepos: number
  commScore: number
  techScore: number
}): { placementProbability: number; predictedPlaced: boolean; confidence: string } {
  const baseScore =
    ((features.cgpa - 5) / 5) * 25 +
    Math.min(features.skillsQuality / 15, 1) * 20 +
    Math.min(features.numProjects / 5, 1) * 15 +
    Math.min(features.numInternships / 3, 1) * 15 +
    Math.min(features.numCerts / 5, 1) * 10 +
    Math.min(features.githubRepos / 20, 1) * 10 +
    (features.commScore / 100) * 10 +
    (features.techScore / 100) * 15

  const prob = Math.max(5, Math.min(100, baseScore * 2.5))
  const placed = prob >= 65

  return {
    placementProbability: Math.round(prob * 10) / 10,
    predictedPlaced: placed,
    confidence: prob >= 80 ? 'High' : prob >= 65 ? 'Medium' : 'Low'
  }
}

export async function predictPlacementML(features: {
  cgpa: number
  numSkills: number
  skillsQuality: number
  numProjects: number
  numInternships: number
  numCerts: number
  githubRepos: number
  commScore: number
  techScore: number
  userId?: string
}): Promise<{
  placementProbability: number
  predictedPlaced: boolean
  confidence: string
  source: string
}> {
  try {
    const payload = {
      cgpa: features.cgpa,
      num_skills: features.numSkills,
      skills_quality: features.skillsQuality,
      num_projects: features.numProjects,
      num_internships: features.numInternships,
      num_certs: features.numCerts,
      github_repos: features.githubRepos,
      comm_score: features.commScore,
      tech_score: features.techScore
    }
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/predict`, payload, { timeout: 5000 })
    const data = response.data
    return {
      placementProbability: data.placement_probability,
      predictedPlaced: data.predicted_placed,
      confidence: data.confidence,
      source: 'ml-service'
    }
  } catch {
    const fallback = predictPlacement(features)
    return { ...fallback, source: 'fallback-engine' }
  }
}

const SALARY_BY_DOMAIN: Record<string, { entry: number; mid: number; senior: number }> = {
  'software-engineering': { entry: 600000, mid: 1200000, senior: 2000000 },
  'data-science': { entry: 700000, mid: 1400000, senior: 2500000 },
  'machine-learning': { entry: 800000, mid: 1500000, senior: 2800000 },
  devops: { entry: 650000, mid: 1300000, senior: 2200000 },
  frontend: { entry: 550000, mid: 1000000, senior: 1800000 },
  backend: { entry: 600000, mid: 1100000, senior: 1900000 },
  fullstack: { entry: 650000, mid: 1200000, senior: 2000000 },
  default: { entry: 500000, mid: 900000, senior: 1500000 },
}

export function computePlacementScore(profileData: {
  cgpa?: number
  skills?: any[]
  projects?: any[]
  internships?: any[]
  certifications?: any[]
  resumeScore?: number
  githubScore?: number
  targetDomain?: string
}): {
  score: number
  tier: string
  salaryEstimate: { entry: number; likely: number; stretch: number }
  factors: Record<string, any>
  lastComputed: Date
} {
  const factors: Record<string, any> = {}

  const cgpaScore = profileData.cgpa ? Math.min(100, (profileData.cgpa / 10) * 100) : 50
  factors.cgpa = { score: cgpaScore, weight: 0.15, value: profileData.cgpa }

  const skillCount = (profileData.skills || []).length
  const skillsScore = Math.min(100, skillCount * 7)
  factors.skills = { score: skillsScore, weight: 0.20, count: skillCount }

  const projectCount = (profileData.projects || []).length
  const projectQuality = profileData.projects
    ? profileData.projects.reduce((s, p) => s + (p.impactScore || 50), 0) / Math.max(1, projectCount)
    : 0
  const projectsScore = Math.min(100, projectCount * 12 + projectQuality * 0.3)
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

  let tier: string
  if (finalScore >= 85) tier = 'platinum'
  else if (finalScore >= 70) tier = 'gold'
  else if (finalScore >= 55) tier = 'silver'
  else if (finalScore >= 40) tier = 'bronze'
  else tier = 'basic'

  const domain = profileData.targetDomain || 'software-engineering'
  const salaryData = SALARY_BY_DOMAIN[domain] || SALARY_BY_DOMAIN.default
  const salaryMultiplier = 0.5 + finalScore / 200
  const salaryEstimate = {
    entry: Math.round(salaryData.entry * salaryMultiplier),
    likely: Math.round(salaryData.mid * salaryMultiplier),
    stretch: Math.round(salaryData.senior * salaryMultiplier),
  }

  return { score: finalScore, tier, salaryEstimate, factors, lastComputed: new Date() }
}

export function extractFeaturesFromProfile(profile: {
  cgpa?: number
  skills?: string[]
  education?: Array<{ degree?: string; cgpa?: number }>
  projects?: Array<{ title?: string }>
  internships?: Array<{ company?: string }>
  certifications?: Array<{ name?: string }>
  githubData?: { public_repos?: number }
  resumeAnalysis?: { commScore?: number; techScore?: number }
}): {
  cgpa: number
  numSkills: number
  skillsQuality: number
  numProjects: number
  numInternships: number
  numCerts: number
  githubRepos: number
  commScore: number
  techScore: number
} {
  let cgpa = profile.cgpa || 0
  if (!cgpa && profile.education && profile.education.length > 0) {
    const valid = profile.education.filter(e => e.cgpa && e.cgpa > 0)
    if (valid.length > 0) {
      cgpa = valid.reduce((sum, e) => sum + (e.cgpa || 0), 0) / valid.length
    }
  }
  return {
    cgpa,
    numSkills: profile.skills?.length || 0,
    skillsQuality: computeSkillsQuality(profile.skills || []),
    numProjects: profile.projects?.length || 0,
    numInternships: profile.internships?.length || 0,
    numCerts: profile.certifications?.length || 0,
    githubRepos: profile.githubData?.public_repos || 0,
    commScore: profile.resumeAnalysis?.commScore || 50,
    techScore: profile.resumeAnalysis?.techScore || 50
  }
}
