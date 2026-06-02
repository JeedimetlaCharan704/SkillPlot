const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const http = require('http')

const env = require('./config/env')
const connectDB = require('./config/db')
const { errorHandler } = require('./middleware/errorHandler')
const logger = require('./services/logger.service')
const { initWebSocket, getIO } = require('./services/websocket.service')
const { initQueue } = require('./services/queue.service')
const { initPassport } = require('./config/passport')

const authRoutes = require('./routes/auth.routes')
const profileRoutes = require('./routes/profile.routes')
const resumeRoutes = require('./routes/resume.routes')
const githubRoutes = require('./routes/github.routes')
const analyticsRoutes = require('./routes/analytics.routes')
const uploadRoutes = require('./routes/upload.routes')

const app = express()

app.use(helmet())
var corsOrigins = env.corsOrigin.split(',').map(function (s) { return s.trim() }).filter(Boolean)
app.use(cors({ origin: corsOrigins }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }))

if (env.nodeEnv !== 'test') {
  const morgan = require('morgan')
  app.use(morgan('combined', { stream: logger.stream }))
}

const limiter = rateLimit({
  windowMs: env.rateLimitWindow,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

initPassport(app)

app.get('/api/health', async (_req, res) => {
  const mongoose = require('mongoose')
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbState,
    memory: process.memoryUsage(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/upload', uploadRoutes)

app.all('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` })
})

app.use(errorHandler)

const server = http.createServer(app)

async function start () {
  await connectDB()
  await initQueue()

  const io = initWebSocket(server)
  app.set('io', io)

  server.listen(env.port, () => {
    logger.info(`SkillPilot AI API running on port ${env.port} (${env.nodeEnv})`)
  })
}

if (env.nodeEnv !== 'test') {
  start()
}

module.exports = app
