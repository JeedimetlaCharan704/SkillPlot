const mongoose = require('mongoose')

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  profileStrength: {
    score: { type: Number, default: 0 },
    factors: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastComputed: { type: Date, default: null },
  },
  placementPrediction: {
    score: { type: Number, default: 0 },
    tier: { type: String, enum: ['platinum', 'gold', 'silver', 'bronze', 'basic'], default: 'basic' },
    salaryEstimate: {
      entry: { type: Number, default: 0 },
      likely: { type: Number, default: 0 },
      stretch: { type: Number, default: 0 },
    },
    factors: { type: mongoose.Schema.Types.Mixed, default: {} },
    compatibleCompanies: [{ type: String }],
    lastComputed: { type: Date, default: null },
  },
  skillGap: {
    careerMatches: { type: mongoose.Schema.Types.Mixed, default: {} },
    topGaps: [{ type: String }],
    overallMatch: { type: Number, default: 0 },
    lastComputed: { type: Date, default: null },
  },
  weeklyActivity: { type: mongoose.Schema.Types.Mixed, default: {} },
  kpiHistory: [{ snapshot: { type: mongoose.Schema.Types.Mixed }, date: { type: Date } }],
}, { timestamps: true })

analyticsSchema.index({ user: 1 })

module.exports = mongoose.model('Analytics', analyticsSchema)
