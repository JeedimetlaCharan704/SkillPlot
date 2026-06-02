import Resume from '../models/Resume'
import * as resumeService from '../services/resume.service'
import logger from '../services/logger.service'

async function processResumeJob(job: any): Promise<any> {
  const { resumeId } = job.data
  logger.info(`Processing resume analysis job`, { jobId: job.id, resumeId })

  try {
    const resume = await Resume.findById(resumeId)
    if (!resume) throw new Error(`Resume ${resumeId} not found`)

    const analysis = resumeService.analyzeResume(resume.textContent || resume.content)

    resume.scores = analysis.scores
    resume.sectionScores = analysis.sectionScores
    resume.keywordMatches = analysis.keywordMatches
    resume.matchedKeywords = analysis.matchedKeywords
    resume.missingKeywords = analysis.missingKeywords
    resume.suggestions = analysis.suggestions
    resume.strengths = analysis.strengths
    resume.weaknesses = analysis.weaknesses
    resume.analysisVersion = '2.0'

    await resume.save()
    logger.info(`Resume analysis complete`, { jobId: job.id, resumeId, overallScore: analysis.scores?.overall })
    return analysis
  } catch (err: any) {
    logger.error(`Resume analysis failed`, { jobId: job.id, resumeId, error: err.message })
    throw err
  }
}

export { processResumeJob }
