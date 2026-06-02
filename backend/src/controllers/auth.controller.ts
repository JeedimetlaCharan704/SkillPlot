import crypto from 'crypto'
import { Response, NextFunction } from 'express'
import User from '../models/User'
import Profile from '../models/Profile'
import { generateToken, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import logger from '../services/logger.service'
import * as emailService from '../services/email.service'

export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, role } = req.body

    const existing = await User.findOne({ email })
    if (existing) throw new AppError('Email already registered', 409)

    const user = await User.create({ name, email, password, role })
    const token = generateToken(String(user._id))

    await Profile.create({ user: user._id })

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    res.status(201).json({ data: { token, user } })
  } catch (err) {
    next(err)
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) throw new AppError('Invalid email or password', 401)

    const isMatch = await user.comparePassword(password)
    if (!isMatch) throw new AppError('Invalid email or password', 401)

    if (!user.isActive) throw new AppError('Account deactivated. Contact support.', 403)

    const token = generateToken(String(user._id))
    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    res.json({ data: { token, user } })
  } catch (err) {
    next(err)
  }
}

export function getMe(req: AuthRequest, res: Response): void {
  res.json({ data: { user: req.user } })
}

export function googleAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const env = require('../config/env').default
  if (!env.googleClientId || !env.googleClientSecret) {
    res.redirect('/oauth-callback.html#error=Google+sign-in+not+configured')
    return
  }
  const passport = require('passport')
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
}

export function googleCallback(req: AuthRequest, res: Response, next: NextFunction): void {
  const env = require('../config/env').default
  if (!env.googleClientId || !env.googleClientSecret) {
    res.redirect('/oauth-callback.html#error=Google+OAuth+not+configured')
    return
  }
  const passport = require('passport')
  passport.authenticate('google', { session: false, failureRedirect: '/oauth-callback.html#error=google-auth-failed' }, (err: any, data: any) => {
    if (err || !data) {
      return res.redirect('/oauth-callback.html#error=google-auth-failed')
    }
    const frontendUrl = (process.env.CORS_ORIGIN || 'http://localhost:8080').split(',')[0].trim()
    res.redirect(`${frontendUrl}/oauth-callback.html#token=${data.token}&user=${encodeURIComponent(JSON.stringify(data.user))}`)
  })(req, res, next)
}

export async function forgotPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body
    if (!email) throw new AppError('Email is required', 400)

    const user = await User.findOne({ email })
    if (!user) throw new AppError('No account found with that email', 404)

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.passwordResetExpires = new Date(Date.now() + 3600000)
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${(process.env.CORS_ORIGIN || 'http://localhost:8080').split(',')[0].trim()}/reset-password.html?token=${resetToken}`

    const emailResult = await emailService.sendPasswordReset(email, resetUrl)

    const message = emailResult.sent
      ? 'Password reset link sent to your email'
      : 'Password reset link generated (email not configured)'

    res.json({
      data: {
        message,
        resetUrl,
        emailSent: emailResult.sent,
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body
    if (!token || !password) throw new AppError('Token and password are required', 400)
    if (password.length < 6) throw new AppError('Password must be at least 6 characters', 400)

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password')

    if (!user) throw new AppError('Invalid or expired reset token', 400)

    user.password = password
    user.passwordResetToken = null
    user.passwordResetExpires = null
    await user.save()

    const jwtToken = generateToken(String(user._id))

    res.json({ data: { message: 'Password reset successful', token: jwtToken, user } })
  } catch (err) {
    next(err)
  }
}
