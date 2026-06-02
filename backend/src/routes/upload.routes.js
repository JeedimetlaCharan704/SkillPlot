const express = require('express')
const fs = require('fs')
const path = require('path')
const upload = require('../middleware/upload')
const { authenticate } = require('../middleware/auth')
const Resume = require('../models/Resume')
const Profile = require('../models/Profile')
const logger = require('../services/logger.service')

const router = express.Router()

async function extractText (filePath, ext) {
  if (ext === '.pdf') {
    const pdfParse = require('pdf-parse')
    const buf = fs.readFileSync(filePath)
    const data = await pdfParse(buf)
    return data.text
  }

  if (ext === '.docx') {
    const mammoth = require('mammoth')
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value
  }

  if (ext === '.txt' || ext === '.rtf') {
    return fs.readFileSync(filePath, 'utf-8')
  }

  return ''
}

router.post('/resume', authenticate, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = req.file.path
    const ext = path.extname(req.file.originalname).toLowerCase()

    const textContent = await extractText(filePath, ext)

    const resume = await Resume.create({
      user: req.user._id,
      originalName: req.file.originalname,
      content: textContent.substring(0, 50000),
      textContent: textContent.substring(0, 50000),
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

    logger.info(`Resume uploaded by user ${req.user._id}`, { fileName: req.file.originalname, fileSize: req.file.size, ext })

    res.json({ success: true, data: { resume: { id: resume._id, originalName: resume.originalName, uploadedAt: resume.createdAt, textLength: textContent.length }, } })
  } catch (err) {
    next(err)
  }
})

module.exports = router
