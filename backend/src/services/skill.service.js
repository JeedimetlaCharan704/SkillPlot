const CAREER_PATHS = {
  'data-scientist': {
    skills: ['python', 'sql', 'machine learning', 'deep learning', 'statistics', 'nlp', 'tensorflow', 'pytorch', 'data visualization', 'excel'],
    weight: { python: 15, sql: 10, 'machine learning': 20, statistics: 15, 'deep learning': 10, nlp: 5, tensorflow: 5, pytorch: 5, 'data visualization': 10, excel: 5 },
  },
  'fullstack-developer': {
    skills: ['javascript', 'react', 'node', 'express', 'mongodb', 'sql', 'html', 'css', 'git', 'rest', 'typescript', 'docker'],
    weight: { javascript: 15, react: 15, node: 12, express: 8, mongodb: 8, sql: 8, html: 7, css: 7, git: 8, rest: 5, typescript: 5, docker: 2 },
  },
  'frontend-developer': {
    skills: ['javascript', 'react', 'typescript', 'html', 'css', 'git', 'rest', 'redux', 'tailwind', 'jest'],
    weight: { javascript: 20, react: 20, typescript: 10, html: 12, css: 12, git: 8, rest: 5, redux: 5, tailwind: 5, jest: 3 },
  },
  'backend-developer': {
    skills: ['python', 'javascript', 'node', 'express', 'sql', 'mongodb', 'postgresql', 'rest', 'graphql', 'docker', 'git', 'aws'],
    weight: { python: 10, javascript: 8, node: 15, express: 12, sql: 12, mongodb: 8, postgresql: 8, rest: 8, graphql: 3, docker: 5, git: 5, aws: 6 },
  },
  'machine-learning-engineer': {
    skills: ['python', 'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'sql', 'aws', 'docker', 'statistics'],
    weight: { python: 15, 'machine learning': 20, 'deep learning': 15, tensorflow: 10, pytorch: 10, nlp: 8, 'computer vision': 5, sql: 5, aws: 5, docker: 2, statistics: 5 },
  },
  'devops-engineer': {
    skills: ['docker', 'kubernetes', 'aws', 'linux', 'git', 'ci', 'python', 'sql', 'node'],
    weight: { docker: 20, kubernetes: 15, aws: 20, linux: 15, git: 10, ci: 8, python: 5, sql: 3, node: 4 },
  },
}

function computeSkillGap (userSkills, targetCareer) {
  const path = CAREER_PATHS[targetCareer]
  if (!path) return null

  const userSkillNames = (userSkills || []).map(s => (typeof s === 'string' ? s : s.name || '').toLowerCase()).filter(Boolean)
  const requiredSkills = path.skills
  const weights = path.weight

  const matchedSkills = requiredSkills.filter(s => userSkillNames.includes(s))
  const missingSkills = requiredSkills.filter(s => !userSkillNames.includes(s))

  let matchScore = 0
  let totalWeight = 0
  for (const [skill, weight] of Object.entries(weights)) {
    totalWeight += weight
    if (userSkillNames.includes(skill)) matchScore += weight
  }

  const overallMatch = totalWeight > 0 ? Math.round((matchScore / totalWeight) * 100) : 0

  const gaps = missingSkills.map(skill => ({
    skill,
    weight: weights[skill] || 5,
    estimatedHours: Math.round(weights[skill] || 5) * 4,
  })).sort((a, b) => b.weight - a.weight)

  return {
    careerPath: targetCareer,
    overallMatch,
    matchedSkills,
    missingSkills,
    gaps,
    totalRequired: requiredSkills.length,
    matchedCount: matchedSkills.length,
  }
}

function computeAllCareerMatches (userSkills) {
  const results = []
  for (const career of Object.keys(CAREER_PATHS)) {
    const result = computeSkillGap(userSkills, career)
    if (result) results.push(result)
  }
  return results.sort((a, b) => b.overallMatch - a.overallMatch)
}

module.exports = { computeSkillGap, computeAllCareerMatches, CAREER_PATHS }
