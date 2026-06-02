(function () {
  var currentPath = (window.location.pathname.split('/').pop() || 'index.html').split('?')[0].split('#')[0]

  function getStoreValue(key) {
    try {
      var raw = localStorage.getItem('skillpilot_state')
      if (!raw) return null
      return JSON.parse(raw)[key]
    } catch (e) { return null }
  }

  var isLoggedIn = getStoreValue('isLoggedIn')
  var userRole = getStoreValue('userRole')
  var isLoginPage = currentPath === 'login.html'

  if (isLoginPage) {
    if (isLoggedIn) {
      var redirect = userRole === 'mentor' || userRole === 'recruiter' || userRole === 'admin' ? 'admin.html' : 'index.html'
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

  if (!currentPath.startsWith('admin') && (userRole === 'recruiter' || userRole === 'admin')) {
    window.location.href = 'admin.html'
    return
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.logout-btn, #logout-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault()
        if (typeof Store !== 'undefined') {
          Store.set('user', null)
          Store.set('isLoggedIn', false)
          Store.set('userRole', null)
        }
        window.location.href = 'login.html'
      })
    })
  })
})()
