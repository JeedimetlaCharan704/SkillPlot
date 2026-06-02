const request = require('supertest')
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./setup')
const app = require('../server')
const User = require('../models/User')
const Profile = require('../models/Profile')
const jwt = require('jsonwebtoken')
const env = require('../config/env')

beforeAll(async () => { await connectTestDB() })
afterAll(async () => { await disconnectTestDB() })
afterEach(async () => { await clearTestDB() })

describe('Profile API', () => {
  let token
  let userId

  beforeEach(async () => {
    const user = await User.create({ name: 'Test User', email: 'profile@test.com', password: 'password123', role: 'student' })
    userId = user._id
    token = jwt.sign({ id: user._id }, env.jwtSecret, { expiresIn: '7d' })
    await Profile.create({ user: user._id })
  })

  describe('GET /api/profile', () => {
    it('should return user profile', async () => {
      const res = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body.data.profile).toBeDefined()
    })
  })

  describe('PUT /api/profile', () => {
    it('should update profile fields', async () => {
      const updates = { headline: 'Software Developer', location: 'San Francisco' }
      const res = await request(app).put('/api/profile').set('Authorization', `Bearer ${token}`).send(updates)
      expect(res.status).toBe(200)
      expect(res.body.data.profile.headline).toBe('Software Developer')
    })
  })

  describe('POST /api/profile/projects', () => {
    it('should add a project', async () => {
      const project = { title: 'Test Project', description: 'A test project', technologies: ['Node.js', 'React'] }
      const res = await request(app).post('/api/profile/projects').set('Authorization', `Bearer ${token}`).send(project)
      expect(res.status).toBe(201)
      expect(res.body.data.project.title).toBe('Test Project')
    })
  })

  describe('POST /api/profile/certifications', () => {
    it('should add a certification', async () => {
      const cert = { name: 'AWS Certified', issuer: 'Amazon' }
      const res = await request(app).post('/api/profile/certifications').set('Authorization', `Bearer ${token}`).send(cert)
      expect(res.status).toBe(201)
    })
  })

  describe('DELETE /api/profile/projects/:id', () => {
    it('should delete a project', async () => {
      const profile = await Profile.findOne({ user: userId })
      profile.projects.push({ title: 'To Delete', description: 'desc' })
      await profile.save()
      const projectId = profile.projects[0]._id

      const res = await request(app).delete(`/api/profile/projects/${projectId}`).set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)

      const updated = await Profile.findOne({ user: userId })
      expect(updated.projects.length).toBe(0)
    })
  })
})
