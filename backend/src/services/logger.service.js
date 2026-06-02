const winston = require('winston')
const path = require('path')
const env = require('../config/env')

const logDir = path.resolve(__dirname, '../../logs')

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 }

const colorizer = winston.format.colorize()

const logger = winston.createLogger({
  levels,
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', maxsize: 10485760, maxFiles: 10 }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log'), maxsize: 10485760, maxFiles: 10 }),
  ],
})

if (env.nodeEnv !== 'production' || env.nodeEnv === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const colorLevel = colorizer.colorize(level, level.toUpperCase())
        const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
        return `${timestamp} ${colorLevel} ${message}${metaStr}`
      })
    ),
  }))
}

logger.stream = {
  write: (message) => logger.http(message.trim()),
}

module.exports = logger
