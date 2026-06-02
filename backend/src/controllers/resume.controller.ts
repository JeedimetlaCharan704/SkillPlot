import { Response, NextFunction } from 'express'
import Resume from '../models/Resume'
import * as resumeService from '../services/resume.service'
import { AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import logger from '../services/logger.service'

export async function analyze(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { content, targetRole } = req.body

    if (!content || content.trim().length < 50) {
      throw new AppError('Resume content must be at least 50 characters', 400)
    }

    let analysis = resumeService.analyzeResume(content)

    const aiResult = await resumeService.analyzeResumeWithAI(content, targetRole)
    if (aiResult) {
      logger.info('AI-powered resume analysis used')
      if (aiResult.scores) analysis.scores = aiResult.scores
      if (aiResult.strengths) analysis.strengths = aiResult.strengths
      if (aiResult.weaknesses) analysis.weaknesses = aiResult.weaknesses
      if (aiResult.suggestions) analysis.suggestions = aiResult.suggestions
      if (aiResult.matchedKeywords) analysis.matchedKeywords = aiResult.matchedKeywords
      if (aiResult.missingKeywords) analysis.missingKeywords = aiResult.missingKeywords
    }

    const resume = await Resume.create({
      user: req.user._id,
      content: content.slice(0, 10000),
      textContent: content.slice(0, 10000),
      targetRole: targetRole || '',
      aiEnhanced: !!aiResult,
      ...analysis,
    })

    res.status(201).json({ data: { resume } })
  } catch (err) {
    next(err)
  }
}

export async function getHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1)
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string, 10) || 10))
    const skip = (page - 1) * limit

    const [resumes, total] = await Promise.all([
      Resume.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('scores.overall targetRole originalName createdAt'),
      Resume.countDocuments({ user: req.user._id }),
    ])

    res.json({
      data: {
        resumes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!resume) throw new AppError('Resume analysis not found', 404)

    res.json({ data: { resume } })
  } catch (err) {
    next(err)
  }
}
