const jwt = require('jsonwebtoken')
const env = require('../config/env')
const User = require('../models/User')

function generateToken (userId) {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })
}

async function authenticate (req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ error: 'User not found.' })
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account deactivated.' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' })
    }
    return res.status(401).json({ error: 'Invalid token.' })
  }
}

function optionalAuth (req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return next()

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, env.jwtSecret)
    User.findById(decoded.id).then(user => {
      if (user && user.isActive) req.user = user
      next()
    }).catch(() => next())
  } catch {
    next()
  }
}

function authorize (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' })
    }
    next()
  }
}

module.exports = { generateToken, authenticate, optionalAuth, authorize }
