const express = require('express')
const fs = require('fs')
const path = require('path')
const upload = require('../middleware/upload')
const { authenticate } = require('../middleware/auth')
const Resume = require('../models/Resume')
const Profile = require('../models/Profile')
const logger = require('../services/logger.service')

const router = express.Router()

router.post('/resume', authenticate, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const content = fs.readFileSync(filePath, 'utf-8')

    const resume = await Resume.create({
      user: req.user._id,
      originalName: req.file.originalname,
      content: content.substring(0, 50000),
      textContent: content.substring(0, 50000),
      scores: { overall: 0, skills: 0, experience: 0, education: 0, projects: 0, certifications: 0 },
      suggestions: [],
      strengths: [],
      weaknesses: [],
    })

    await Profile.findOneAndUpdate(
      { user: req.user._id },
      { resumeUrl: filePath },
      { upsert: true }
    )

    logger.info(`Resume uploaded by user ${req.user._id}`, { fileName: req.file.originalname, fileSize: req.file.size })

    res.json({ success: true, data: { resume: { id: resume._id, originalName: resume.originalName, uploadedAt: resume.createdAt } } })
  } catch (err) {
    next(err)
  }
})

module.exports = router
