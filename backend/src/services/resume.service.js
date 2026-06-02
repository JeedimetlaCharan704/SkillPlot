const SKILLS_DB = {
  python: { category: 'programming', importance: 'critical' },
  javascript: { category: 'programming', importance: 'critical' },
  typescript: { category: 'programming', importance: 'important' },
  java: { category: 'programming', importance: 'important' },
  sql: { category: 'databases', importance: 'critical' },
  mongodb: { category: 'databases', importance: 'important' },
  postgresql: { category: 'databases', importance: 'important' },
  react: { category: 'frontend', importance: 'critical' },
  node: { category: 'backend', importance: 'critical' },
  express: { category: 'backend', importance: 'important' },
  django: { category: 'backend', importance: 'important' },
  flask: { category: 'backend', importance: 'nice-to-have' },
  docker: { category: 'devops', importance: 'important' },
  kubernetes: { category: 'devops', importance: 'nice-to-have' },
  aws: { category: 'cloud', importance: 'important' },
  git: { category: 'tools', importance: 'critical' },
  'machine learning': { category: 'ai-ml', importance: 'important' },
  'deep learning': { category: 'ai-ml', importance: 'important' },
  tensorflow: { category: 'ai-ml', importance: 'nice-to-have' },
  pytorch: { category: 'ai-ml', importance: 'nice-to-have' },
  nlp: { category: 'ai-ml', importance: 'nice-to-have' },
  'computer vision': { category: 'ai-ml', importance: 'nice-to-have' },
  rest: { category: 'backend', importance: 'important' },
  graphql: { category: 'backend', importance: 'nice-to-have' },
  html: { category: 'frontend', importance: 'critical' },
  css: { category: 'frontend', importance: 'critical' },
  tailwind: { category: 'frontend', importance: 'nice-to-have' },
  bootstrap: { category: 'frontend', importance: 'nice-to-have' },
  redux: { category: 'frontend', importance: 'nice-to-have' },
  next: { category: 'frontend', importance: 'important' },
  jest: { category: 'testing', importance: 'nice-to-have' },
  cypress: { category: 'testing', importance: 'nice-to-have' },
  linux: { category: 'tools', importance: 'important' },
  ci: { category: 'devops', importance: 'nice-to-have' },
  agile: { category: 'methodology', importance: 'nice-to-have' },
  scrum: { category: 'methodology', importance: 'nice-to-have' },
  tableau: { category: 'data-viz', importance: 'nice-to-have' },
  powerbi: { category: 'data-viz', importance: 'nice-to-have' },
  excel: { category: 'tools', importance: 'important' },
}

const SECTIONS = ['experience', 'education', 'projects', 'skills', 'certifications']

function analyzeResume (textContent) {
  const text = (textContent || '').toLowerCase()
  const keywordMatches = []
  const matchedKeywords = []
  const missingKeywords = []

  for (const [keyword, meta] of Object.entries(SKILLS_DB)) {
    const found = text.includes(keyword)
    keywordMatches.push({ keyword, found, category: meta.category, importance: meta.importance })
    if (found) matchedKeywords.push(keyword)
    else missingKeywords.push(keyword)
  }

  const matchedCount = matchedKeywords.length
  const totalKeywords = Object.keys(SKILLS_DB).length
  const keywordScore = Math.round((matchedCount / totalKeywords) * 100)

  const hasExperience = /experience/i.test(text)
  const hasEducation = /education|b\.?tech|bachelor|master|phd/i.test(text)
  const hasProjects = /projects?/i.test(text)
  const hasSkills = /skills?|technologies?|proficient/i.test(text)
  const hasCerts = /certif|aws|google|microsoft|coursera|udemy/i.test(text)

  const sectionScores = [
    { section: 'experience', score: hasExperience ? 75 + Math.floor(Math.random() * 20) : 25, wordCount: 0, suggestions: hasExperience ? [] : ['Add experience section'] },
    { section: 'education', score: hasEducation ? 80 + Math.floor(Math.random() * 15) : 30, wordCount: 0, suggestions: hasEducation ? [] : ['Add education section'] },
    { section: 'projects', score: hasProjects ? 70 + Math.floor(Math.random() * 20) : 20, wordCount: 0, suggestions: hasProjects ? [] : ['Add projects section'] },
    { section: 'skills', score: hasSkills ? keywordScore : 15, wordCount: 0, suggestions: hasSkills ? [] : ['Add skills section'] },
    { section: 'certifications', score: hasCerts ? 65 + Math.floor(Math.random() * 25) : 10, wordCount: 0, suggestions: hasCerts ? [] : ['Add certifications section'] },
  ]

  const sectionsFound = sectionScores.filter(s => s.score > 50).length
  const overallScore = Math.round(
    keywordScore * 0.25 +
    (sectionScores.find(s => s.section === 'experience').score) * 0.25 +
    (sectionScores.find(s => s.section === 'education').score) * 0.15 +
    (sectionScores.find(s => s.section === 'projects').score) * 0.20 +
    (sectionScores.find(s => s.section === 'certifications').score) * 0.15
  )

  const suggestions = []
  const strengths = []
  const weaknesses = []

  if (matchedCount > totalKeywords * 0.6) strengths.push('Strong keyword coverage across multiple categories')
  else if (matchedCount < totalKeywords * 0.3) weaknesses.push('Low keyword density — add more technical skills')

  if (hasExperience) strengths.push('Experience section present')
  else weaknesses.push('Missing experience section')

  if (hasProjects) strengths.push('Projects section present')
  else weaknesses.push('Missing projects section')

  if (overallScore >= 70) strengths.push('Overall resume strength is good')
  else if (overallScore < 40) weaknesses.push('Overall resume needs significant improvement')

  if (missingKeywords.length > 0) {
    suggestions.push(`Add missing critical keywords: ${missingKeywords.filter(k => SKILLS_DB[k].importance === 'critical').slice(0, 5).join(', ')}`)
  }
  suggestions.push('Quantify achievements with metrics and numbers')
  suggestions.push('Use action verbs to describe responsibilities')

  const result = {
    scores: {
      overall: Math.min(overallScore, 100),
      skills: keywordScore,
      experience: sectionScores.find(s => s.section === 'experience').score,
      education: sectionScores.find(s => s.section === 'education').score,
      projects: sectionScores.find(s => s.section === 'projects').score,
      certifications: sectionScores.find(s => s.section === 'certifications').score,
    },
    sectionScores,
    keywordMatches,
    matchedKeywords,
    missingKeywords,
    suggestions,
    strengths,
    weaknesses,
  }

  return result
}

module.exports = { analyzeResume, SKILLS_DB }
