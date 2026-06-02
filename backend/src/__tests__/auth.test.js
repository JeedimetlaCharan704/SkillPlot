const request = require('supertest')
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./setup')
const app = require('../server')
const User = require('../models/User')

beforeAll(async () => { await connectTestDB() })
afterAll(async () => { await disconnectTestDB() })
afterEach(async () => { await clearTestDB() })

describe('Auth API', () => {
  const testUser = { name: 'Test User', email: 'test@test.com', password: 'password123', role: 'student' }

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser)
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.email).toBe(testUser.email)
      expect(res.body.data.token).toBeDefined()
    })

    it('should reject duplicate email', async () => {
      await User.create(testUser)
      const res = await request(app).post('/api/auth/register').send(testUser)
      expect(res.status).toBe(409)
    })

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({ ...testUser, email: 'invalid' })
      expect(res.status).toBe(400)
    })

    it('should require name', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: '123456', role: 'student' })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create(testUser)
    })

    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.token).toBeDefined()
    })

    it('should reject wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: 'wrong' })
      expect(res.status).toBe(401)
    })

    it('should reject non-existent user', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'nonexistent@test.com', password: 'password123' })
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const user = await User.create(testUser)
      const jwt = require('jsonwebtoken')
      const env = require('../config/env')
      const token = jwt.sign({ id: user._id }, env.jwtSecret, { expiresIn: '7d' })

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body.data.user.email).toBe(testUser.email)
    })

    it('should reject missing token', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.status).toBe(401)
    })

    it('should reject invalid token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalid-token')
      expect(res.status).toBe(401)
    })
  })
})
