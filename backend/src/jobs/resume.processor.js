const Resume = require('../models/Resume')
const resumeService = require('../services/resume.service')
const logger = require('../services/logger.service')

async function processResumeJob (job) {
  const { resumeId } = job.data
  logger.info(`Processing resume analysis job`, { jobId: job.id, resumeId })

  try {
    const resume = await Resume.findById(resumeId)
    if (!resume) throw new Error(`Resume ${resumeId} not found`)

    const analysis = resumeService.analyze(resume.textContent || resume.content, resume.targetRole)

    resume.scores = analysis.scores || {}
    resume.sectionScores = analysis.sectionScores || []
    resume.keywordMatches = analysis.keywordMatches || []
    resume.matchedKeywords = analysis.matchedKeywords || []
    resume.missingKeywords = analysis.missingKeywords || []
    resume.suggestions = analysis.suggestions || []
    resume.strengths = analysis.strengths || []
    resume.weaknesses = analysis.weaknesses || []
    resume.analysisVersion = '2.0'

    await resume.save()
    logger.info(`Resume analysis complete`, { jobId: job.id, resumeId, overallScore: analysis.scores?.overall })
    return analysis
  } catch (err) {
    logger.error(`Resume analysis failed`, { jobId: job.id, resumeId, error: err.message })
    throw err
  }
}

module.exports = { processResumeJob }
