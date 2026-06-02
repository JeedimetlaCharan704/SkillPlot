const mongoose = require('mongoose')

const keywordMatchSchema = new mongoose.Schema({
  keyword: { type: String, required: true },
  found: { type: Boolean, default: false },
  category: { type: String, default: '' },
  importance: { type: String, enum: ['critical', 'important', 'nice-to-have'], default: 'important' },
}, { _id: false })

const sectionScoreSchema = new mongoose.Schema({
  section: { type: String, required: true },
  score: { type: Number, min: 0, max: 100 },
  wordCount: { type: Number, default: 0 },
  suggestions: [{ type: String }],
}, { _id: false })

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalName: { type: String, default: '' },
  content: { type: String, default: '' },
  textContent: { type: String, default: '' },

  scores: {
    overall: { type: Number, min: 0, max: 100, default: 0 },
    skills: { type: Number, min: 0, max: 100, default: 0 },
    experience: { type: Number, min: 0, max: 100, default: 0 },
    education: { type: Number, min: 0, max: 100, default: 0 },
    projects: { type: Number, min: 0, max: 100, default: 0 },
    certifications: { type: Number, min: 0, max: 100, default: 0 },
  },

  sectionScores: [sectionScoreSchema],

  keywordMatches: [keywordMatchSchema],

  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],

  suggestions: [{ type: String }],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],

  targetRole: { type: String, default: '' },
  analysisVersion: { type: String, default: '1.0' },

  raw: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

resumeSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('Resume', resumeSchema)
