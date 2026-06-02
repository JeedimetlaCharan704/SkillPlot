const SessionManager = (function () {
  const IDLE_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
  const WARN_BEFORE = 60000
  let warnTimer = null
  let expireTimer = null
  let activityHandler = null

  function start () {
    if (!Store.get('isLoggedIn')) return

    AuthService.updateActivity()

    activityHandler = function () {
      AuthService.updateActivity()
      clearTimers()
      startTimers()
    }

    IDLE_EVENTS.forEach(ev => document.addEventListener(ev, activityHandler, { passive: true }))
    startTimers()
  }

  function startTimers () {
    const timeout = Store.get('sessionTimeout') || 1800000
    const warnAt = timeout - WARN_BEFORE

    expireTimer = setTimeout(async () => {
      await handleExpire()
    }, timeout)

    warnTimer = setTimeout(() => {
      const remaining = AuthService.getSessionRemaining()
      if (remaining && !remaining.expired) {
        Toast.warning(`Session expiring in ${remaining.formatted}. Move your mouse to stay signed in.`)
      }
    }, warnAt)
  }

  function clearTimers () {
    if (warnTimer) { clearTimeout(warnTimer); warnTimer = null }
    if (expireTimer) { clearTimeout(expireTimer); expireTimer = null }
  }

  async function handleExpire () {
    await AuthService.logout()
    Toast.error('Session expired due to inactivity. Please sign in again.')
    setTimeout(() => {
      window.location.href = 'login.html'
    }, 1500)
  }

  function stop () {
    clearTimers()
    if (activityHandler) {
      IDLE_EVENTS.forEach(ev => document.removeEventListener(ev, activityHandler))
      activityHandler = null
    }
  }

  return { start, stop }
})()
