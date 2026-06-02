const request = require('supertest')
const app = require('../server')

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('should return ok status', async () => {
      const res = await request(app).get('/api/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.uptime).toBeDefined()
      expect(res.body.timestamp).toBeDefined()
    })
  })

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent')
      expect(res.status).toBe(404)
      expect(res.body.error).toBeDefined()
    })
  })
})
