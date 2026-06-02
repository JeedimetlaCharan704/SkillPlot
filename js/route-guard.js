(function () {
  var STORAGE_KEY = 'skillpilot_state'
  var currentPath = (window.location.pathname.split('/').pop() || 'index.html').split('?')[0].split('#')[0]
  var isLoginPage = currentPath === 'login.html'

  function getStoreValue (key) {
    try {
      var raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw)[key]
    } catch (e) {
      return null
    }
  }

  var isLoggedIn = getStoreValue('isLoggedIn')
  var userRole = getStoreValue('userRole')

  if (isLoginPage) {
    if (isLoggedIn) {
      var redirect = userRole === 'mentor' ? 'mentor-dashboard.html' : userRole === 'recruiter' || userRole === 'admin' ? 'admin.html' : 'index.html'
      window.location.href = redirect
    }
    return
  }

  if (!isLoggedIn) {
    window.location.href = 'login.html'
    return
  }

  if (currentPath.startsWith('admin') && userRole !== 'mentor' && userRole !== 'recruiter' && userRole !== 'admin') {
    window.location.href = 'index.html'
    return
  }

  // Allow all roles on any page; only block students from admin pages
})()
