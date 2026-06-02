const Resume = require('../models/Resume')
const resumeService = require('../services/resume.service')
const { AppError } = require('../middleware/errorHandler')

exports.analyze = async (req, res, next) => {
  try {
    const { content, targetRole } = req.body

    if (!content || content.trim().length < 50) {
      throw new AppError('Resume content must be at least 50 characters', 400)
    }

    const analysis = resumeService.analyzeResume(content)

    const resume = await Resume.create({
      user: req.user._id,
      content: content.slice(0, 10000),
      textContent: content.slice(0, 10000),
      targetRole: targetRole || '',
      ...analysis,
    })

    res.status(201).json({ data: { resume } })
  } catch (err) {
    next(err)
  }
}

exports.getHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10))
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

exports.getById = async (req, res, next) => {
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
