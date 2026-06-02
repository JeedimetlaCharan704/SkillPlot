const validator = require('validator')

function validate (schema) {
  return (req, res, next) => {
    const errors = {}
    const data = schema.body ? req.body : req.query

    for (const [field, rules] of Object.entries(schema)) {
      if (field === 'body' || field === 'query' || field === 'params') continue
      const value = data[field]

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`
        continue
      }

      if (value === undefined || value === null || value === '') continue

      if (rules.type === 'email' && !validator.isEmail(String(value))) {
        errors[field] = `${field} must be a valid email`
      }

      if (rules.type === 'url' && !validator.isURL(String(value))) {
        errors[field] = `${field} must be a valid URL`
      }

      if (rules.minLength && String(value).length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`
      }

      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors[field] = `${field} must be at most ${rules.maxLength} characters`
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`
      }

      if (rules.min !== undefined && Number(value) < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`
      }

      if (rules.max !== undefined && Number(value) > rules.max) {
        errors[field] = `${field} must be at most ${rules.max}`
      }

      if (rules.pattern && !new RegExp(rules.pattern).test(String(value))) {
        errors[field] = `${field} format is invalid`
      }
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }

    if (schema.body) {
      for (const field of Object.keys(schema.body)) {
        req.body[field] = schema.body[field].transform
          ? schema.body[field].transform(req.body[field])
          : req.body[field]
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

module.exports = { validate, authSchemas }
