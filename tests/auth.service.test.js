/**
 * @jest-environment jsdom
 */
const storeModule = require('../js/store/store')
const Store = storeModule.Store
global.Store = Store

// Mock ApiService — default to offline so fallback auth kicks in
global.ApiService = {
  setToken: jest.fn(),
  clearToken: jest.fn(),
  auth: {
    login: jest.fn().mockResolvedValue({ success: false, error: 'offline' }),
    register: jest.fn().mockResolvedValue({ success: false, error: 'offline' })
  }
}

const { AuthService } = require('../js/services/auth.service')

beforeEach(() => {
  localStorage.clear()
  Store.reset()
  jest.clearAllMocks()
  ApiService.auth.login.mockResolvedValue({ success: false, error: 'offline' })
  ApiService.auth.register.mockResolvedValue({ success: false, error: 'offline' })
})

describe('AuthService', () => {
  describe('login', () => {
    test('returns success for valid demo credentials (fallback)', async () => {
      const result = await AuthService.login('student@skillpilot.ai', 'demo123')
      expect(result.success).toBe(true)
      expect(result.data.user.name).toBe('Aryan Sharma')
      expect(Store.get('isLoggedIn')).toBe(true)
      expect(Store.get('userRole')).toBe('student')
    })

    test('returns error for invalid credentials', async () => {
      const result = await AuthService.login('wrong@email.com', 'badpass')
      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
      expect(Store.get('isLoggedIn')).toBe(false)
    })

    test('returns suggestions on invalid credentials', async () => {
      const result = await AuthService.login('bad@email.com', 'badpass')
      expect(result.suggestions).toBeDefined()
      expect(result.suggestions.length).toBeGreaterThan(0)
    })

    test('calls API when ApiService is available', async () => {
      ApiService.auth.login.mockResolvedValue({
        success: true,
        data: { token: 'abc', user: { email: 'test@test.com', role: 'student', name: 'Test' } }
      })
      const result = await AuthService.login('test@test.com', 'test123')
      expect(ApiService.auth.login).toHaveBeenCalledWith('test@test.com', 'test123')
      expect(result.success).toBe(true)
    })

    test('falls back to demo auth when API returns offline error', async () => {
      ApiService.auth.login.mockResolvedValue({ success: false, error: 'offline' })
      const result = await AuthService.login('mentor@skillpilot.ai', 'demo123')
      expect(result.success).toBe(true)
      expect(result.data.user.name).toBe('Dr. Priya Patel')
    })
  })

  describe('register', () => {
    test('registers a new user and sets session', async () => {
      const profile = { name: 'New User', email: 'new@user.com', password: 'pass123', role: 'student' }
      const result = await AuthService.register(profile)
      expect(result.success).toBe(true)
      expect(Store.get('isLoggedIn')).toBe(true)
      expect(Store.get('userRole')).toBe('student')
    })

    test('calls API when available', async () => {
      ApiService.auth.register.mockResolvedValue({
        success: true,
        data: { token: 'abc', user: { email: 'api@user.com', role: 'student', name: 'API User' } }
      })
      const result = await AuthService.register({ name: 'API User', email: 'api@user.com', password: 'pass123', role: 'student' })
      expect(ApiService.auth.register).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('loginWithProvider', () => {
    test('returns success for Google', async () => {
      const result = await AuthService.loginWithProvider('google')
      expect(result.success).toBe(true)
      expect(Store.get('isLoggedIn')).toBe(true)
      expect(Store.get('userRole')).toBe('student')
    })

    test('returns success for GitHub', async () => {
      const result = await AuthService.loginWithProvider('github')
      expect(result.success).toBe(true)
      expect(Store.get('isLoggedIn')).toBe(true)
    })
  })

  describe('logout', () => {
    test('clears session and redirects to login', async () => {
      await AuthService.login('student@skillpilot.ai', 'demo123')
      const result = await AuthService.logout()
      expect(result.success).toBe(true)
      expect(result.data.redirect).toBe('login.html')
      expect(Store.get('isLoggedIn')).toBe(false)
      expect(Store.get('user')).toBeNull()
    })
  })

  describe('getSession', () => {
    test('returns logged out state when no session', async () => {
      const session = await AuthService.getSession()
      expect(session.data.isLoggedIn).toBe(false)
      expect(session.data.user).toBeNull()
    })

    test('returns logged in state after login', async () => {
      await AuthService.login('student@skillpilot.ai', 'demo123')
      const session = await AuthService.getSession()
      expect(session.data.isLoggedIn).toBe(true)
      expect(session.data.user.name).toBe('Aryan Sharma')
    })
  })

  describe('session expiry', () => {
    test('isSessionExpired returns false after fresh login', async () => {
      await AuthService.login('student@skillpilot.ai', 'demo123')
      expect(AuthService.isSessionExpired()).toBe(false)
    })

    test('getSessionRemaining returns formatted duration', async () => {
      await AuthService.login('student@skillpilot.ai', 'demo123')
      const info = AuthService.getSessionRemaining()
      expect(info.elapsed).toBeGreaterThanOrEqual(0)
      expect(info.formatted).toMatch(/\d+m \d+s/)
    })
  })
})
