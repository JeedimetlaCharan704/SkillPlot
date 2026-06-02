const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')
const Profile = require('../models/Profile')
const { generateToken } = require('../middleware/auth')
const env = require('./env')
const logger = require('../services/logger.service')

function initPassport (app) {
  app.use(passport.initialize())

  if (env.googleClientId && env.googleClientSecret) {
    passport.use(new GoogleStrategy({
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email'],
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const name = profile.displayName
        const googleId = profile.id
        const avatar = profile.photos?.[0]?.value

        let user = await User.findOne({ $or: [{ googleId }, { email }] })

        if (user) {
          user.googleId = googleId
          user.authProvider = 'google'
          user.avatar = user.avatar || avatar
          if (!user.isActive) return done(null, false, { message: 'Account deactivated' })
          user.lastLogin = new Date()
          await user.save({ validateBeforeSave: false })
        } else {
          user = await User.create({
            name,
            email,
            googleId,
            authProvider: 'google',
            avatar,
            role: 'student',
            password: `google_${googleId}_${Date.now()}`,
          })
          await Profile.create({ user: user._id })
        }

        const token = generateToken(user._id)
        done(null, { user, token })
      } catch (err) {
        logger.error('Google OAuth error', { error: err.message })
        done(err, null)
      }
    }))

    logger.info('Passport Google OAuth strategy initialized')
  } else {
    logger.info('Google OAuth not configured — skipping strategy')
  }
}

module.exports = { initPassport }
