import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import http from 'http'

import env from './config/env'
import connectDB from './config/db'
import { errorHandler } from './middleware/errorHandler'
import logger from './services/logger.service'
import { initWebSocket } from './services/websocket.service'
import { initQueue } from './services/queue.service'
import { initPassport } from './config/passport'

import authRoutes from './routes/auth.routes'
import profileRoutes from './routes/profile.routes'
import resumeRoutes from './routes/resume.routes'
import githubRoutes from './routes/github.routes'
import analyticsRoutes from './routes/analytics.routes'
import uploadRoutes from './routes/upload.routes'

const app = express()

app.use(helmet())
const corsOrigins = env.corsOrigin.split(',').map((s: string) => s.trim()).filter(Boolean)
app.use(cors({ origin: corsOrigins }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }))

if (env.nodeEnv !== 'test') {
  const morgan = require('morgan')
  app.use(morgan('combined', { stream: (logger as any).stream }))
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

async function start(): Promise<void> {
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

export default app
