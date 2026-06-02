const AuthService = (function () {
  var DEMO_USERS = {
    student: { email: 'student@skillpilot.ai', password: 'demo123', role: 'student', name: 'Aryan Sharma' },
    mentor: { email: 'mentor@skillpilot.ai', password: 'demo123', role: 'mentor', name: 'Dr. Priya Patel' },
    recruiter: { email: 'recruiter@skillpilot.ai', password: 'demo123', role: 'recruiter', name: 'Rahul Verma' },
    admin: { email: 'admin@skillpilot.ai', password: 'admin123', role: 'admin', name: 'Admin User' }
  }

  var ROLE_REDIRECTS = { admin: 'admin.html', mentor: 'mentor-dashboard.html', recruiter: 'admin.html', student: 'index.html' }

  function _simulateLatency (ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms || 600 + Math.random() * 400) })
  }

  function _setSession (user) {
    var now = Date.now()
    Store.set('user', { ...user, id: user.id || 'usr_' + now, avatar: user.avatar || null, joinedAt: new Date().toISOString() })
    Store.set('isLoggedIn', true)
    Store.set('userRole', user.role)
    Store.set('sessionStart', now)
    Store.set('lastActivity', now)
  }

  function _handleApiResult (result) {
    if (result.success && result.data && result.data.token) {
      ApiService.setToken(result.data.token)
      var user = result.data.user || result.data
      _setSession(user)
      var redirect = ROLE_REDIRECTS[user.role] || 'index.html'
      return { success: true, error: null, data: { user: Store.get('user'), redirect: redirect } }
    }
    return null
  }

  async function login (email, password) {
    // Try API first
    if (typeof ApiService !== 'undefined') {
      var apiResult = await ApiService.auth.login(email, password)
      var handled = _handleApiResult(apiResult)
      if (handled) return handled
      if (apiResult.success && apiResult.data) {
        ApiService.setToken(apiResult.data.token || '')
        var user = apiResult.data.user || apiResult.data
        _setSession(user)
        return { success: true, error: null, data: { user: Store.get('user'), redirect: ROLE_REDIRECTS[user.role] || 'index.html' } }
      }
      if (apiResult.error !== 'offline') {
        if (apiResult.error === 'Invalid email or password' || apiResult.error === 'User not found') {
          return { success: false, error: 'Invalid email or password. Try demo credentials.', data: null, suggestions: Object.values(DEMO_USERS).map(function (u) { return 'Use ' + u.email + ' / ' + u.password }) }
        }
        return { success: false, error: apiResult.error || 'Login failed', data: null, suggestions: [] }
      }
    }

    // Fallback to localStorage demo auth
    await _simulateLatency()
    var matched = Object.values(DEMO_USERS).find(function (u) { return u.email === email && u.password === password })
    if (!matched) {
      return { success: false, error: 'Invalid email or password. Try demo credentials.', data: null, suggestions: ['Use student@skillpilot.ai / demo123', 'Use mentor@skillpilot.ai / demo123', 'Use recruiter@skillpilot.ai / demo123', 'Use admin@skillpilot.ai / admin123'] }
    }
    var user = Object.assign({}, matched)
    delete user.password
    _setSession(user)
    return { success: true, error: null, data: { user: Store.get('user'), redirect: ROLE_REDIRECTS[user.role] || 'index.html' } }
  }

  async function loginWithProvider (provider) {
    await _simulateLatency(1200)
    var providerUsers = {
      google: { email: 'aryan.sharma@gmail.com', name: 'Aryan Sharma', role: 'student' },
      github: { email: 'aryan@github.com', name: 'Aryan S.', role: 'student' },
      linkedin: { email: 'aryan.sharma@linkedin.com', name: 'Aryan Sharma', role: 'student' }
    }
    var profile = providerUsers[provider] || providerUsers.google
    _setSession({ ...profile, provider: provider })
    return { success: true, error: null, data: { user: Store.get('user'), redirect: 'index.html' } }
  }

  async function logout () {
    if (typeof ApiService !== 'undefined') ApiService.clearToken()
    await _simulateLatency(200)
    Store.set('user', null)
    Store.set('isLoggedIn', false)
    Store.set('userRole', null)
    return { success: true, data: { redirect: 'login.html' } }
  }

  async function getSession () {
    await _simulateLatency(100)
    var user = Store.get('user')
    var isLoggedIn = Store.get('isLoggedIn')
    return { success: true, data: { isLoggedIn: isLoggedIn, user: isLoggedIn ? user : null, role: Store.get('userRole') }, confidence: isLoggedIn ? 'High' : 'Low', calculation: { steps: ['Checked localStorage for existing session', 'User ' + (isLoggedIn ? 'found' : 'not found')] } }
  }

  async function register (profile) {
    // Try API first
    if (typeof ApiService !== 'undefined') {
      var apiResult = await ApiService.auth.register(profile.name, profile.email, profile.password, profile.role)
      var handled = _handleApiResult(apiResult)
      if (handled) return handled
      if (apiResult.error !== 'offline') {
        return { success: false, error: apiResult.error || 'Registration failed', data: null }
      }
    }

    // Fallback
    await _simulateLatency(800)
    var user = Object.assign({}, profile, { id: 'usr_' + Date.now(), joinedAt: new Date().toISOString() })
    delete user.password
    _setSession(user)
    return { success: true, data: { user: Store.get('user'), redirect: ROLE_REDIRECTS[user.role] || 'index.html' } }
  }

  function updateActivity () { Store.set('lastActivity', Date.now()) }

  function isSessionExpired () {
    var last = Store.get('lastActivity')
    var timeout = Store.get('sessionTimeout')
    if (!last || !timeout) return false
    return Date.now() - last > timeout
  }

  function getSessionRemaining () {
    var last = Store.get('lastActivity')
    var timeout = Store.get('sessionTimeout')
    if (!last || !timeout) return null
    var elapsed = Date.now() - last
    var remaining = Math.max(0, timeout - elapsed)
    return { elapsed: elapsed, remaining: remaining, expired: elapsed > timeout, formatted: _formatDuration(remaining) }
  }

  function _formatDuration (ms) {
    var totalSec = Math.floor(ms / 1000)
    var min = Math.floor(totalSec / 60)
    var sec = totalSec % 60
    return min + 'm ' + sec + 's'
  }

  return { login: login, loginWithProvider: loginWithProvider, logout: logout, getSession: getSession, register: register, updateActivity: updateActivity, isSessionExpired: isSessionExpired, getSessionRemaining: getSessionRemaining }
})()
