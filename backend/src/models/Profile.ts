import mongoose, { Document, Schema } from 'mongoose'

export interface IProject {
  title: string
  description: string
  technologies: string[]
  url: string
  githubUrl: string
  startDate?: Date
  endDate?: Date
  impactScore: number
  complexityScore: number
}

export interface ICertification {
  name: string
  issuer: string
  url: string
  issueDate?: Date
  expiryDate?: Date
  credentialId: string
  skillMapping: string[]
}

export interface IInternship {
  company: string
  role: string
  description: string
  startDate?: Date
  endDate?: Date
  skillsGained: string[]
  url: string
}

export interface IEducation {
  institution: string
  degree: string
  field: string
  startYear?: number
  endYear?: number
  grade: string
}

export interface ISkill {
  name: string
  level: number
  importance: number
  growthTrend: 'up' | 'stable' | 'down'
}

export interface ISocialLinks {
  github: string
  linkedin: string
  twitter: string
  portfolio: string
}

export interface IPreferences {
  careerGoals: string[]
  preferredRoles: string[]
  preferredLocations: string[]
  workType: 'remote' | 'hybrid' | 'onsite' | 'any'
}

export interface IProfile extends Document {
  user: mongoose.Types.ObjectId
  headline: string
  bio: string
  phone: string
  location: string
  avatar: string
  resumeUrl: string
  education: IEducation[]
  projects: IProject[]
  certifications: ICertification[]
  internships: IInternship[]
  skills: ISkill[]
  socialLinks: ISocialLinks
  preferences: IPreferences
  addProject(data: IProject): Promise<IProfile>
  addCertification(data: ICertification): Promise<IProfile>
  addInternship(data: IInternship): Promise<IProfile>
}

const projectSchema = new Schema<IProject>({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  technologies: [{ type: String, trim: true }],
  url: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  impactScore: { type: Number, min: 0, max: 100, default: 0 },
  complexityScore: { type: Number, min: 0, max: 100, default: 0 },
}, { timestamps: true })

const certificationSchema = new Schema<ICertification>({
  name: { type: String, required: true, trim: true },
  issuer: { type: String, required: true },
  url: { type: String, default: '' },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  credentialId: { type: String, default: '' },
  skillMapping: [{ type: String, trim: true }],
}, { timestamps: true })

const internshipSchema = new Schema<IInternship>({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true },
  description: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  skillsGained: [{ type: String, trim: true }],
  url: { type: String, default: '' },
}, { timestamps: true })

const educationSchema = new Schema<IEducation>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, default: '' },
  startYear: { type: Number },
  endYear: { type: Number },
  grade: { type: String, default: '' },
}, { timestamps: true })

const profileSchema = new Schema<IProfile>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  headline: { type: String, default: '', maxlength: 100 },
  bio: { type: String, default: '', maxlength: 1000 },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  avatar: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },

  education: [educationSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  internships: [internshipSchema],

  skills: [{
    name: { type: String, required: true },
    level: { type: Number, min: 0, max: 100, default: 50 },
    importance: { type: Number, min: 0, max: 100, default: 50 },
    growthTrend: { type: String, enum: ['up', 'stable', 'down'], default: 'stable' },
  }],

  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    portfolio: { type: String, default: '' },
  },

  preferences: {
    careerGoals: [{ type: String }],
    preferredRoles: [{ type: String }],
    preferredLocations: [{ type: String }],
    workType: { type: String, enum: ['remote', 'hybrid', 'onsite', 'any'], default: 'any' },
  },
}, { timestamps: true })

profileSchema.methods.addProject = function (data: IProject): Promise<IProfile> {
  this.projects.push(data)
  return this.save()
}

profileSchema.methods.addCertification = function (data: ICertification): Promise<IProfile> {
  this.certifications.push(data)
  return this.save()
}

profileSchema.methods.addInternship = function (data: IInternship): Promise<IProfile> {
  this.internships.push(data)
  return this.save()
}

export default mongoose.model<IProfile>('Profile', profileSchema)
