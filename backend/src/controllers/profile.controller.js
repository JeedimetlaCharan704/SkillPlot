const Profile = require('../models/Profile')
const { AppError } = require('../middleware/errorHandler')

async function getOrCreateProfile (userId) {
  let profile = await Profile.findOne({ user: userId })
  if (!profile) {
    profile = await Profile.create({ user: userId })
  }
  return profile
}

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    res.json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = [
      'headline', 'bio', 'phone', 'location', 'avatar', 'resumeUrl',
      'education', 'skills', 'socialLinks', 'preferences',
    ]

    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key]
      }
    }

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true, upsert: true },
    )

    res.json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

exports.addProject = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    profile.projects.push(req.body)
    await profile.save()
    res.status(201).json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

exports.updateProject = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    const project = profile.projects.id(req.params.projectId)
    if (!project) throw new AppError('Project not found', 404)

    Object.assign(project, req.body)
    await profile.save()
    res.json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

exports.deleteProject = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    const project = profile.projects.id(req.params.projectId)
    if (!project) throw new AppError('Project not found', 404)

    project.deleteOne()
    await profile.save()
    res.json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

exports.addCertification = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    profile.certifications.push(req.body)
    await profile.save()
    res.status(201).json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

exports.deleteCertification = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    const cert = profile.certifications.id(req.params.certId)
    if (!cert) throw new AppError('Certification not found', 404)

    cert.deleteOne()
    await profile.save()
    res.json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

exports.addInternship = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    profile.internships.push(req.body)
    await profile.save()
    res.status(201).json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

exports.deleteInternship = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    const internship = profile.internships.id(req.params.internshipId)
    if (!internship) throw new AppError('Internship not found', 404)

    internship.deleteOne()
    await profile.save()
    res.json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}
