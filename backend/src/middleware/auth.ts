import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import env from '../config/env'
import User from '../models/User'

export interface AuthRequest extends Request {
  user?: any
}

export function generateToken (userId: string): string {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions)
}

export async function authenticate (req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' })
      return
    }

    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, env.jwtSecret) as { id: string }
    const user = await User.findById(decoded.id)

    if (!user) {
      res.status(401).json({ error: 'User not found.' })
      return
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Account deactivated.' })
      return
    }

    req.user = user
    next()
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired.' })
      return
    }
    res.status(401).json({ error: 'Invalid token.' })
  }
}

export function optionalAuth (req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    next()
    return
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as { id: string }
    User.findById(decoded.id).then(user => {
      if (user && user.isActive) req.user = user
      next()
    }).catch(() => next())
  } catch {
    next()
  }
}

export function authorize (...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user?.role)) {
      res.status(403).json({ error: 'Insufficient permissions.' })
      return
    }
    next()
  }
}
