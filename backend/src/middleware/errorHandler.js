function errorHandler (err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message)

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).reduce((acc, e) => {
      acc[e.path] = e.message
      return acc
    }, {})
    return res.status(400).json({ error: 'Validation failed', details })
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({ error: `${field} already exists` })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' })
  }

  const status = err.statusCode || 500
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  })
}

class AppError extends Error {
  constructor (message, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
  }
}

module.exports = { errorHandler, AppError }
