const request = require('supertest')
const app = require('../server')
const User = require('../models/User')
const Profile = require('../models/Profile')
const jwt = require('jsonwebtoken')
const env = require('../config/env')

describe('Analytics API', () => {
  let token

  beforeEach(async () => {
    const user = await User.create({ name: 'Test User', email: 'analytics@test.com', password: 'password123', role: 'student' })
    token = jwt.sign({ id: user._id }, env.jwtSecret, { expiresIn: '7d' })
    await Profile.create({
      user: user._id,
      skills: [
        { name: 'Python', category: 'Programming', level: 85, importance: 90 },
        { name: 'JavaScript', category: 'Programming', level: 80, importance: 85 },
      ],
      projects: [{ title: 'Test Project', description: 'A project', completed: true }],
    })
  })

  describe('GET /api/analytics/dashboard', () => {
    it('should return dashboard KPIs', async () => {
      const res = await request(app).get('/api/analytics/dashboard').set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body.data.dashboard).toBeDefined()
      expect(res.body.data.dashboard.skillsCount).toBe(2)
      expect(res.body.data.dashboard.projectsCount).toBe(1)
    })
  })

  describe('GET /api/analytics/placement', () => {
    it('should return placement prediction', async () => {
      const res = await request(app).get('/api/analytics/placement?cgpa=8.5&domain=software-engineering').set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body.data.prediction).toBeDefined()
      expect(res.body.data.prediction.tier).toBeDefined()
    })
  })

  describe('GET /api/analytics/skill-gap', () => {
    it('should return skill gap analysis', async () => {
      const res = await request(app).get('/api/analytics/skill-gap').set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body.data.skillGap).toBeDefined()
    })
  })
})
