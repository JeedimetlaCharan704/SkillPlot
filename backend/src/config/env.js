const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const required = ['MONGO_URI', 'JWT_SECRET']
const missing = required.filter(key => !process.env[key])
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  githubToken: process.env.GITHUB_TOKEN || '',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  redisUrl: process.env.REDIS_URL || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
}
