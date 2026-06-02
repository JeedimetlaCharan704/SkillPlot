import mongoose, { Document, Schema } from 'mongoose'

export interface IKeywordMatch {
  keyword: string
  found: boolean
  category: string
  importance: 'critical' | 'important' | 'nice-to-have'
}

export interface ISectionScore {
  section: string
  score: number
  wordCount?: number
  suggestions: string[]
}

export interface IResumeScores {
  overall: number
  skills: number
  experience: number
  education: number
  projects: number
  certifications: number
}

export interface IResume extends Document {
  createdAt: Date
  updatedAt: Date
  user: mongoose.Types.ObjectId
  originalName: string
  content: string
  textContent: string
  scores: IResumeScores
  sectionScores: ISectionScore[]
  keywordMatches: IKeywordMatch[]
  matchedKeywords: string[]
  missingKeywords: string[]
  suggestions: string[]
  strengths: string[]
  weaknesses: string[]
  targetRole: string
  aiEnhanced: boolean
  analysisVersion: string
  raw: any
}

const keywordMatchSchema = new Schema<IKeywordMatch>({
  keyword: { type: String, required: true },
  found: { type: Boolean, default: false },
  category: { type: String, default: '' },
  importance: { type: String, enum: ['critical', 'important', 'nice-to-have'], default: 'important' },
}, { _id: false })

const sectionScoreSchema = new Schema<ISectionScore>({
  section: { type: String, required: true },
  score: { type: Number, min: 0, max: 100 },
  wordCount: { type: Number, default: 0 },
  suggestions: [{ type: String }],
}, { _id: false })

const resumeSchema = new Schema<IResume>({
  user: {
    type: Schema.Types.ObjectId,
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
  aiEnhanced: { type: Boolean, default: false },
  analysisVersion: { type: String, default: '2.0' },

  raw: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true })

resumeSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model<IResume>('Resume', resumeSchema)
