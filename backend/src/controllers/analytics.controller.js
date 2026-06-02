const Profile = require('../models/Profile')
const Resume = require('../models/Resume')
const Analytics = require('../models/Analytics')
const profileService = require('../services/profile.service')
const placementService = require('../services/placement.service')
const skillService = require('../services/skill.service')
const { AppError } = require('../middleware/errorHandler')

async function getOrCreateAnalytics (userId) {
  let analytics = await Analytics.findOne({ user: userId })
  if (!analytics) {
    analytics = await Analytics.create({ user: userId })
  }
  return analytics
}

exports.getDashboard = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id })
    const lastResume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 }).select('scores.overall')
    const analytics = await getOrCreateAnalytics(req.user._id)

    const strengthResult = profile
      ? profileService.computeProfileStrength(profile)
      : { score: 0, factors: {} }

    const insights = profile
      ? profileService.generateInsights(profile, strengthResult)
      : []

    const dashboard = {
      profileStrength: strengthResult.score,
      resumeScore: (lastResume && lastResume.scores) ? lastResume.scores.overall : 0,
      skillsCount: (profile && profile.skills) ? profile.skills.length : 0,
      projectsCount: (profile && profile.projects) ? profile.projects.length : 0,
      certificationsCount: (profile && profile.certifications) ? profile.certifications.length : 0,
      internshipsCount: (profile && profile.internships) ? profile.internships.length : 0,
      insights,
      factors: strengthResult.factors,
      lastUpdated: new Date(),
    }

    analytics.profileStrength = { score: strengthResult.score, factors: strengthResult.factors, lastComputed: new Date() }
    await analytics.save()

    res.json({ data: { dashboard } })
  } catch (err) {
    next(err)
  }
}

exports.getPlacement = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id })
    const analytics = await getOrCreateAnalytics(req.user._id)

    const profileData = {
      cgpa: parseFloat(req.query.cgpa) || 8.0,
      skills: (profile && profile.skills) || [],
      projects: (profile && profile.projects) || [],
      internships: (profile && profile.internships) || [],
      certifications: (profile && profile.certifications) || [],
      resumeScore: analytics.profileStrength.score || 50,
      githubScore: 30,
      targetDomain: req.query.domain || 'software-engineering',
    }

    const result = placementService.computePlacementScore(profileData)

    analytics.placementPrediction = {
      score: result.score,
      tier: result.tier,
      salaryEstimate: result.salaryEstimate,
      factors: result.factors,
      lastComputed: new Date(),
    }
    await analytics.save()

    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}

exports.getSkillGap = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id })
    const userSkills = (profile && profile.skills) ? profile.skills.map(s => s.name) : []

    const career = req.query.career
    let result

    if (career) {
      result = skillService.computeSkillGap(userSkills, career)
      if (!result) throw new AppError(`Unknown career path: ${career}`, 400)
    } else {
      result = skillService.computeAllCareerMatches(userSkills)
    }

    const analytics = await getOrCreateAnalytics(req.user._id)
    analytics.skillGap = {
      careerMatches: Array.isArray(result) ? result : [result],
      topGaps: Array.isArray(result) ? (result[0] ? result[0].missingSkills : []) : result.missingSkills,
      overallMatch: Array.isArray(result) ? (result[0] ? result[0].overallMatch : 0) : result.overallMatch,
      lastComputed: new Date(),
    }
    await analytics.save()

    res.json({ data: { analysis: result } })
  } catch (err) {
    next(err)
  }
}
