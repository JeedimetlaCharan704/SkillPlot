import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  statusCode: number
  constructor (message: string, statusCode: number = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

export function errorHandler (err: any, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message)

  if (err.name === 'ValidationError') {
    const details: Record<string, string> = {}
    for (const key of Object.keys(err.errors)) {
      details[key] = err.errors[key].message
    }
    res.status(400).json({ error: 'Validation failed', details })
    return
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    res.status(409).json({ error: `${field} already exists` })
    return
  }

  if (err.name === 'CastError') {
    res.status(400).json({ error: 'Invalid ID format' })
    return
  }

  const status = err.statusCode || 500
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  })
}
