import mongoose, { Document, Schema } from 'mongoose'

export interface IAnalytics extends Document {
  user: mongoose.Types.ObjectId
  profileStrength: {
    score: number
    factors: any
    lastComputed: Date | null
  }
  placementPrediction: {
    score: number
    tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'basic'
    salaryEstimate: {
      entry: number
      likely: number
      stretch: number
    }
    factors: any
    compatibleCompanies: string[]
    lastComputed: Date | null
  }
  skillGap: {
    careerMatches: any
    topGaps: string[]
    overallMatch: number
    lastComputed: Date | null
  }
  weeklyActivity: any
  kpiHistory: Array<{ snapshot: any; date: Date }>
}

const analyticsSchema = new Schema<IAnalytics>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  profileStrength: {
    score: { type: Number, default: 0 },
    factors: { type: Schema.Types.Mixed, default: {} },
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
    factors: { type: Schema.Types.Mixed, default: {} },
    compatibleCompanies: [{ type: String }],
    lastComputed: { type: Date, default: null },
  },
  skillGap: {
    careerMatches: { type: Schema.Types.Mixed, default: {} },
    topGaps: [{ type: String }],
    overallMatch: { type: Number, default: 0 },
    lastComputed: { type: Date, default: null },
  },
  weeklyActivity: { type: Schema.Types.Mixed, default: {} },
  kpiHistory: [{ snapshot: { type: Schema.Types.Mixed }, date: { type: Date } }],
}, { timestamps: true })

analyticsSchema.index({ user: 1 })

export default mongoose.model<IAnalytics>('Analytics', analyticsSchema)
