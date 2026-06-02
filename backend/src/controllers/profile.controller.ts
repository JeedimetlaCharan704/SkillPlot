import { Response, NextFunction } from 'express'
import Profile from '../models/Profile'
import { AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

async function getOrCreateProfile(userId: string): Promise<any> {
  let profile = await Profile.findOne({ user: userId })
  if (!profile) {
    profile = await Profile.create({ user: userId })
  }
  return profile
}

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    res.json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const allowed = [
      'headline', 'bio', 'phone', 'location', 'avatar', 'resumeUrl',
      'education', 'skills', 'socialLinks', 'preferences',
    ]

    const updates: Record<string, any> = {}
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

export async function addProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    profile.projects.push(req.body)
    await profile.save()
    res.status(201).json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

export async function updateProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

export async function deleteProject(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

export async function addCertification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    profile.certifications.push(req.body)
    await profile.save()
    res.status(201).json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

export async function deleteCertification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

export async function addInternship(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getOrCreateProfile(req.user._id)
    profile.internships.push(req.body)
    await profile.save()
    res.status(201).json({ data: { profile } })
  } catch (err) {
    next(err)
  }
}

export async function deleteInternship(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
