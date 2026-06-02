const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
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

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  issuer: { type: String, required: true },
  url: { type: String, default: '' },
  issueDate: { type: Date },
  expiryDate: { type: Date },
  credentialId: { type: String, default: '' },
  skillMapping: [{ type: String, trim: true }],
}, { timestamps: true })

const internshipSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true },
  description: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  skillsGained: [{ type: String, trim: true }],
  url: { type: String, default: '' },
}, { timestamps: true })

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, default: '' },
  startYear: { type: Number },
  endYear: { type: Number },
  grade: { type: String, default: '' },
}, { timestamps: true })

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
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

profileSchema.methods.addProject = function (data) {
  this.projects.push(data)
  return this.save()
}

profileSchema.methods.addCertification = function (data) {
  this.certifications.push(data)
  return this.save()
}

profileSchema.methods.addInternship = function (data) {
  this.internships.push(data)
  return this.save()
}

module.exports = mongoose.model('Profile', profileSchema)
