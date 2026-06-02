import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Application } from 'express'
import User from '../models/User'
import Profile from '../models/Profile'
import { generateToken } from '../middleware/auth'
import env from './env'
import logger from '../services/logger.service'

export function initPassport(app: Application): void {
  app.use(passport.initialize())

  if (env.googleClientId && env.googleClientSecret) {
    passport.use(new GoogleStrategy({
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email'],
    }, async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any, info?: any) => void) => {
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

        const token = generateToken(String(user._id))
        done(null, { user, token })
      } catch (err: any) {
        logger.error('Google OAuth error', { error: err.message })
        done(err, null)
      }
    }))

    logger.info('Passport Google OAuth strategy initialized')
  } else {
    logger.info('Google OAuth not configured — skipping strategy')
  }
}
