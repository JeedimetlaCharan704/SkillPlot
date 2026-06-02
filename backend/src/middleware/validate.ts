import validator from 'validator'
import { Request, Response, NextFunction } from 'express'

interface ValidationRule {
  required?: boolean
  type?: string
  minLength?: number
  maxLength?: number
  enum?: string[]
  min?: number
  max?: number
  pattern?: string
  transform?: (val: any) => any
}

interface ValidationSchema {
  body?: Record<string, ValidationRule>
  query?: Record<string, ValidationRule>
  params?: Record<string, ValidationRule>
  [key: string]: any
}

function validate(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string> = {}
    const data = schema.body ? req.body : req.query

    for (const [field, rules] of Object.entries(schema)) {
      if (field === 'body' || field === 'query' || field === 'params') continue
      const typedRules = rules as ValidationRule
      const value = (data as any)[field]

      if (typedRules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`
        continue
      }

      if (value === undefined || value === null || value === '') continue

      if (typedRules.type === 'email' && !validator.isEmail(String(value))) {
        errors[field] = `${field} must be a valid email`
      }

      if (typedRules.type === 'url' && !validator.isURL(String(value))) {
        errors[field] = `${field} must be a valid URL`
      }

      if (typedRules.minLength && String(value).length < typedRules.minLength) {
        errors[field] = `${field} must be at least ${typedRules.minLength} characters`
      }

      if (typedRules.maxLength && String(value).length > typedRules.maxLength) {
        errors[field] = `${field} must be at most ${typedRules.maxLength} characters`
      }

      if (typedRules.enum && !typedRules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${typedRules.enum.join(', ')}`
      }

      if (typedRules.min !== undefined && Number(value) < typedRules.min) {
        errors[field] = `${field} must be at least ${typedRules.min}`
      }

      if (typedRules.max !== undefined && Number(value) > typedRules.max) {
        errors[field] = `${field} must be at most ${typedRules.max}`
      }

      if (typedRules.pattern && !new RegExp(typedRules.pattern).test(String(value))) {
        errors[field] = `${field} format is invalid`
      }
    }

    if (Object.keys(errors).length) {
      res.status(400).json({ error: 'Validation failed', details: errors })
      return
    }

    if (schema.body) {
      for (const field of Object.keys(schema.body)) {
        const rule = schema.body[field]
        if (rule.transform) {
          req.body[field] = rule.transform(req.body[field])
        }
      }
    }

    next()
  }
}

const authSchemas = {
  register: {
    body: {
      name: { required: true, minLength: 2, maxLength: 50 },
      email: { required: true, type: 'email' },
      password: { required: true, minLength: 6 },
      role: { enum: ['student', 'mentor', 'recruiter'] },
    },
  },
  login: {
    body: {
      email: { required: true, type: 'email' },
      password: { required: true },
    },
  },
}

export { validate, authSchemas }
