import * as openaiService from './openai.service'

interface SkillMeta {
  category: string
  importance: 'critical' | 'important' | 'nice-to-have'
}

interface KeywordMatchResult {
  keyword: string
  found: boolean
  count: number
  category: string
  importance: 'critical' | 'important' | 'nice-to-have'
}

interface SectionScoreResult {
  score: number
  suggestions: string[]
}

interface ResumeAnalysisResult {
  scores: {
    overall: number
    skills: number
    experience: number
    education: number
    projects: number
    certifications: number
  }
  sectionScores: Array<{
    section: string
    score: number
    suggestions: string[]
  }>
  keywordMatches: KeywordMatchResult[]
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: string[]
  strengths: string[]
  weaknesses: string[]
}

const SKILLS_DB: Record<string, SkillMeta> = {
  python: { category: 'programming', importance: 'critical' },
  javascript: { category: 'programming', importance: 'critical' },
  typescript: { category: 'programming', importance: 'important' },
  java: { category: 'programming', importance: 'important' },
  'c\\+\\+': { category: 'programming', importance: 'important' },
  go: { category: 'programming', importance: 'nice-to-have' },
  rust: { category: 'programming', importance: 'nice-to-have' },
  sql: { category: 'databases', importance: 'critical' },
  mongodb: { category: 'databases', importance: 'important' },
  postgresql: { category: 'databases', importance: 'important' },
  mysql: { category: 'databases', importance: 'important' },
  redis: { category: 'databases', importance: 'nice-to-have' },
  react: { category: 'frontend', importance: 'critical' },
  'react native': { category: 'frontend', importance: 'important' },
  angular: { category: 'frontend', importance: 'important' },
  vue: { category: 'frontend', importance: 'important' },
  node: { category: 'backend', importance: 'critical' },
  express: { category: 'backend', importance: 'important' },
  django: { category: 'backend', importance: 'important' },
  flask: { category: 'backend', importance: 'nice-to-have' },
  spring: { category: 'backend', importance: 'important' },
  docker: { category: 'devops', importance: 'important' },
  kubernetes: { category: 'devops', importance: 'nice-to-have' },
  aws: { category: 'cloud', importance: 'important' },
  azure: { category: 'cloud', importance: 'important' },
  gcp: { category: 'cloud', importance: 'nice-to-have' },
  git: { category: 'tools', importance: 'critical' },
  'machine learning': { category: 'ai-ml', importance: 'important' },
  'deep learning': { category: 'ai-ml', importance: 'important' },
  tensorflow: { category: 'ai-ml', importance: 'nice-to-have' },
  pytorch: { category: 'ai-ml', importance: 'nice-to-have' },
  nlp: { category: 'ai-ml', importance: 'nice-to-have' },
  'computer vision': { category: 'ai-ml', importance: 'nice-to-have' },
  llm: { category: 'ai-ml', importance: 'important' },
  'large language models': { category: 'ai-ml', importance: 'important' },
  rag: { category: 'ai-ml', importance: 'nice-to-have' },
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
  cd: { category: 'devops', importance: 'nice-to-have' },
  agile: { category: 'methodology', importance: 'nice-to-have' },
  scrum: { category: 'methodology', importance: 'nice-to-have' },
  tableau: { category: 'data-viz', importance: 'nice-to-have' },
  powerbi: { category: 'data-viz', importance: 'nice-to-have' },
  excel: { category: 'tools', importance: 'important' },
}

const SECTION_PATTERNS: Record<string, RegExp> = {
  experience: /experience|work\s*(?:history|experience)|employment|professional\s*experience/i,
  education: /education|b\.?\s*tech|bachelor|master|phd|b\.\s*e|m\.\s*tech|mca|bca|degree/i,
  projects: /projects?|personal\s*projects?|academic\s*projects?/i,
  skills: /skills?|technologies?|tech\s*stack|technical\s*skills?|proficient/i,
  certifications: /certif|certification|coursera|udemy|aws\s*certified|google\s*certified|microsoft\s*certified/i,
}

function scoreSection(text: string, sectionName: string, keywordScore: number): SectionScoreResult {
  const pattern = SECTION_PATTERNS[sectionName]
  const found = pattern ? pattern.test(text) : true

  if (!found) return { score: 0, suggestions: [`Add a dedicated ${sectionName} section`] }

  let score = 0

  switch (sectionName) {
    case 'experience': {
      const hasNumbers = (text.match(/\d+%/g) || []).length + (text.match(/\d+x/g) || []).length + (text.match(/\d+\+? (years?|months?)/gi) || []).length
      const hasActionVerbs = /(developed|designed|implemented|built|created|led|managed|improved|optimized|architected|delivered)/gi.test(text)
      const hasMetrics = /\d+%|\d+x|increased|decreased|reduced/i.test(text)
      const bulletPoints = (text.match(/[•\-*]\s/g) || []).length

      score = 40
      if (hasActionVerbs) score += 15
      if (hasMetrics) score += 15
      if (hasNumbers) score += 15
      if (bulletPoints > 5) score += 15
      score = Math.min(score, 100)
      break
    }
    case 'education': {
      const hasGpa = /gpa|cgpa|percentage/i.test(text)
      const hasYear = /20\d{2}/.test(text)
      const hasDegree = /b\.?\s*tech|bachelor|master|phd|b\.\s*e|m\.\s*tech|mca/i.test(text)

      score = 50
      if (hasDegree) score += 15
      if (hasGpa) score += 20
      if (hasYear) score += 15
      score = Math.min(score, 100)
      break
    }
    case 'projects': {
      const projectCount = (text.match(/projects?/gi) || []).length
      const hasLinks = /github\.com|gitlab\.com|vercel\.app|netlify\.app/i.test(text)
      const hasTech = /(used|built\s*(with|using)|technologies?|tech\s*stack|built\s+using)/gi.test(text)

      score = 30
      if (projectCount > 1) score += 20
      if (projectCount > 3) score += 15
      if (hasLinks) score += 15
      if (hasTech) score += 20
      score = Math.min(score, 100)
      break
    }
    case 'skills':
      score = keywordScore
      break
    case 'certifications': {
      const certCount = (text.match(/certif|aws|google|microsoft|coursera|udemy/gi) || []).length

      score = 20
      if (certCount > 0) score += 20
      if (certCount > 2) score += 20
      if (certCount > 4) score += 40
      score = Math.min(score, 100)
      break
    }
  }

  return { score, suggestions: [] }
}

function analyzeResume(textContent: string): ResumeAnalysisResult {
  const text = (textContent || '').toLowerCase()
  const wordCount = text.split(/\s+/).filter(Boolean).length

  const keywordMatches: KeywordMatchResult[] = []
  const matchedKeywords: string[] = []
  const missingKeywords: string[] = []

  const criticalWeight = 3
  const importantWeight = 2
  const niceToHaveWeight = 1
  const weightMap: Record<string, number> = { critical: criticalWeight, important: importantWeight, 'nice-to-have': niceToHaveWeight }
  const maxWeight = criticalWeight

  let weightedScore = 0
  let maxWeightedScore = 0

  for (const [keyword, meta] of Object.entries(SKILLS_DB)) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'gi')
    const matches = text.match(regex)
    const count = matches ? matches.length : 0

    const found = count > 0
    const weight = weightMap[meta.importance] || 1

    keywordMatches.push({ keyword, found, count, category: meta.category, importance: meta.importance })
    if (found) {
      matchedKeywords.push(keyword)
      weightedScore += weight * Math.min(count, 3)
    }
    maxWeightedScore += weight * 3

    if (!found && meta.importance === 'critical') {
      missingKeywords.push(keyword)
    }
  }

  const keywordScore = maxWeightedScore > 0 ? Math.round((weightedScore / maxWeightedScore) * 100) : 0

  const sectionResults: Record<string, SectionScoreResult> = {}
  for (const section of Object.keys(SECTION_PATTERNS)) {
    sectionResults[section] = scoreSection(text, section, keywordScore)
  }

  const sectionScores = Object.entries(SECTION_PATTERNS).map(([section]) => ({
    section,
    score: sectionResults[section].score,
    suggestions: sectionResults[section].suggestions,
  }))

  const overallScore = Math.round(
    keywordScore * 0.25 +
    sectionResults.experience.score * 0.25 +
    sectionResults.education.score * 0.10 +
    sectionResults.projects.score * 0.20 +
    sectionResults.certifications.score * 0.20
  )

  const strengths: string[] = []
  const weaknesses: string[] = []
  const suggestions: string[] = []

  const criticalMatched = keywordMatches.filter(k => k.importance === 'critical' && k.found).length
  const criticalTotal = keywordMatches.filter(k => k.importance === 'critical').length

  if (keywordScore >= 70) strengths.push(`Strong keyword coverage (${matchedKeywords.length}/${Object.keys(SKILLS_DB).length} skills)`)
  else if (keywordScore >= 40) strengths.push(`Decent keyword coverage (${matchedKeywords.length}/${Object.keys(SKILLS_DB).length} skills)`)
  else weaknesses.push(`Low keyword density — only ${matchedKeywords.length}/${Object.keys(SKILLS_DB).length} skills detected`)

  if (criticalMatched >= criticalTotal * 0.7) strengths.push('All critical skills are well-represented')
  else if (criticalMatched < criticalTotal * 0.4) weaknesses.push(`Missing ${criticalTotal - criticalMatched} critical skills`)

  if (sectionResults.experience.score >= 60) strengths.push('Experience section has quantified achievements')
  else if (sectionResults.experience.score > 30) suggestions.push('Add metrics and numbers to your experience bullet points')
  else weaknesses.push('Experience section needs more detail with measurable outcomes')

  if (sectionResults.projects.score >= 60) strengths.push('Projects section is strong with technical depth')
  else if (sectionResults.projects.score > 20) suggestions.push('Add GitHub links and tech stack details to projects')
  else weaknesses.push('Projects section is weak — add more projects with technical descriptions')

  if (sectionResults.certifications.score >= 60) strengths.push('Good certifications that validate expertise')
  else suggestions.push('Consider adding certifications from AWS, Google, or Microsoft')

  if (wordCount > 500) strengths.push('Resume has sufficient length with good detail')
  else if (wordCount < 200) weaknesses.push('Resume is too short — aim for 300-600 words')

  if (missingKeywords.length > 0) {
    suggestions.push(`Add missing critical keywords: ${missingKeywords.slice(0, 5).join(', ')}`)
  }
  suggestions.push('Quantify achievements with metrics and percentages')
  suggestions.push('Use strong action verbs (developed, designed, implemented, optimized)')

  return {
    scores: {
      overall: Math.min(overallScore, 100),
      skills: keywordScore,
      experience: sectionResults.experience.score,
      education: sectionResults.education.score,
      projects: sectionResults.projects.score,
      certifications: sectionResults.certifications.score,
    },
    sectionScores,
    keywordMatches,
    matchedKeywords,
    missingKeywords,
    suggestions,
    strengths,
    weaknesses,
  }
}

async function analyzeResumeWithAI(textContent: string, targetRole?: string): Promise<any> {
  if (!openaiService.isAvailable()) return null
  return openaiService.analyzeResume(textContent, targetRole)
}

export { analyzeResume, analyzeResumeWithAI, SKILLS_DB }
