const env = require('../config/env')
const logger = require('./logger.service')

let transporter = null

function getTransporter () {
  if (transporter) return transporter
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) return null
  const nodemailer = require('nodemailer')
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  })
  return transporter
}

function isConfigured () {
  return !!env.smtpHost && !!env.smtpUser && !!env.smtpPass
}

async function sendPasswordReset (to, resetUrl) {
  const t = getTransporter()
  if (!t) {
    logger.info(`Email not configured — password reset URL for ${to}: ${resetUrl}`)
    return { sent: false, reason: 'Email not configured. Reset URL logged to console.' }
  }

  try {
    await t.sendMail({
      from: env.emailFrom,
      to,
      subject: 'SkillPlot — Password Reset Request',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
          <h2 style="color:#4F46E5;">SkillPlot Password Reset</h2>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;margin:16px 0;">Reset Password</a>
          <p style="color:#666;font-size:14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    logger.info(`Password reset email sent to ${to}`)
    return { sent: true }
  } catch (err) {
    logger.error(`Failed to send password reset email to ${to}`, { error: err.message })
    return { sent: false, reason: err.message }
  }
}

module.exports = { sendPasswordReset, isConfigured }
