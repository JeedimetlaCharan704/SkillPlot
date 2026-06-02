const ApiService = (function () {
  const API_BASE = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG.getApiBase() : '/api'

  function getToken () {
    try {
      var state = JSON.parse(localStorage.getItem('skillpilot_state') || '{}')
      return state.apiToken || null
    } catch (e) { return null }
  }

  function setToken (token) {
    try {
      var state = JSON.parse(localStorage.getItem('skillpilot_state') || '{}')
      state.apiToken = token
      localStorage.setItem('skillpilot_state', JSON.stringify(state))
    } catch (e) {}
  }

  function clearToken () {
    try {
      var state = JSON.parse(localStorage.getItem('skillpilot_state') || '{}')
      delete state.apiToken
      localStorage.setItem('skillpilot_state', JSON.stringify(state))
    } catch (e) {}
  }

  async function request (method, path, body) {
    var url = API_BASE + path
    var headers = { 'Content-Type': 'application/json' }
    var token = getToken()
    if (token) headers['Authorization'] = 'Bearer ' + token

    var opts = { method: method, headers: headers }
    if (body) opts.body = JSON.stringify(body)

    var controller = new AbortController()
    opts.signal = controller.signal
    var timeoutId = setTimeout(function () { controller.abort() }, 15000)

    try {
      var res = await fetch(url, opts)
      clearTimeout(timeoutId)
      var text = await res.text()
      var data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data.error || 'Request failed')
      return { success: true, data: data.data || data, error: null }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError' || err instanceof TypeError) {
        return { success: false, data: null, error: 'offline' }
      }
      return { success: false, data: null, error: err.message }
    }
  }

  async function isAvailable () {
    var result = await request('GET', '/health')
    return result.success
  }

  var api = {
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    isAvailable: isAvailable,

    auth: {
      login: function (email, password) { return request('POST', '/auth/login', { email: email, password: password }) },
      register: function (name, email, password, role) { return request('POST', '/auth/register', { name: name, email: email, password: password, role: role || 'student' }) },
      getMe: function () { return request('GET', '/auth/me') }
    },

    profile: {
      get: function () { return request('GET', '/profile') },
      update: function (data) { return request('PUT', '/profile', data) },
      addProject: function (data) { return request('POST', '/profile/projects', data) },
      updateProject: function (id, data) { return request('PUT', '/profile/projects/' + id, data) },
      deleteProject: function (id) { return request('DELETE', '/profile/projects/' + id) },
      addCertification: function (data) { return request('POST', '/profile/certifications', data) },
      deleteCertification: function (id) { return request('DELETE', '/profile/certifications/' + id) },
      addInternship: function (data) { return request('POST', '/profile/internships', data) },
      deleteInternship: function (id) { return request('DELETE', '/profile/internships/' + id) }
    },

    resume: {
      analyze: function (content, targetRole) { return request('POST', '/resume/analyze', { content: content, targetRole: targetRole || '' }) },
      getHistory: function (page, limit) { return request('GET', '/resume/history?page=' + (page || 1) + '&limit=' + (limit || 10)) },
      getById: function (id) { return request('GET', '/resume/' + id) }
    },

    github: {
      analyze: function (username) { return request('GET', '/github/analyze/' + encodeURIComponent(username)) },
      getUser: function (username) { return request('GET', '/github/user/' + encodeURIComponent(username)) },
      getRepos: function (username, page) { return request('GET', '/github/repos/' + encodeURIComponent(username) + '?page=' + (page || 1)) }
    },

    analytics: {
      getDashboard: function () { return request('GET', '/analytics/dashboard') },
      getPlacement: function (cgpa, domain) { return request('GET', '/analytics/placement?cgpa=' + (cgpa || 8.0) + '&domain=' + (domain || 'software-engineering')) },
      getSkillGap: function (career) { return request('GET', '/analytics/skill-gap' + (career ? '?career=' + encodeURIComponent(career) : '')) }
    }
  }

  return api
})()
