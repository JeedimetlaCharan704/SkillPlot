(function () {
  'use strict'

  var THEME_CYCLE = ['light', 'dark', 'system']
  var THEME_ICONS = { light: 'fa-solid fa-moon', dark: 'fa-solid fa-sun', system: 'fa-solid fa-circle-half-stroke' }
  var THEME_LABELS = { light: 'Light', dark: 'Dark', system: 'System' }

  function initTheme () {
    var toggle = document.getElementById('theme-toggle')
    if (!toggle) return

    function getThemeMode () {
      return document.documentElement.getAttribute('data-theme-mode') || 'light'
    }

    function setThemeMode (mode) {
      var effective = mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode
      document.documentElement.setAttribute('data-theme', effective)
      document.documentElement.setAttribute('data-theme-mode', mode)
      localStorage.setItem('skillpilot_theme', mode)
      var icon = toggle.querySelector('i')
      icon.className = THEME_ICONS[mode] || THEME_ICONS.light
      toggle.title = 'Theme: ' + (THEME_LABELS[mode] || mode)
      toggle.setAttribute('aria-label', 'Toggle theme (current: ' + (THEME_LABELS[mode] || mode) + ')')
    }

    setThemeMode(getThemeMode())

    toggle.addEventListener('click', function () {
      var current = getThemeMode()
      var idx = THEME_CYCLE.indexOf(current)
      var next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]
      setThemeMode(next)
    })

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (getThemeMode() === 'system') setThemeMode('system')
    })
  }

  function setLoading (loading) {
    var btn = document.getElementById('register-submit-btn')
    var form = document.getElementById('register-form')
    var skeletonZone = document.getElementById('register-skeleton')
    if (!btn) return
    if (loading) {
      btn.classList.add('btn-loading')
      btn.disabled = true
      if (form) form.style.display = 'none'
      if (skeletonZone) {
        skeletonZone.innerHTML = Skeleton.loginForm()
        skeletonZone.style.display = 'block'
      }
    } else {
      btn.classList.remove('btn-loading')
      btn.disabled = false
      if (form) form.style.display = ''
      if (skeletonZone) {
        skeletonZone.style.display = 'none'
        skeletonZone.innerHTML = ''
      }
    }
  }

  function initRegisterForm () {
    var form = document.getElementById('register-form')
    if (!form) return

    form.addEventListener('submit', async function (e) {
      e.preventDefault()

      var name = document.getElementById('reg-name').value.trim()
      var email = document.getElementById('reg-email').value.trim()
      var password = document.getElementById('reg-password').value
      var confirm = document.getElementById('reg-confirm').value
      var role = document.getElementById('reg-role').value

      if (!name || !email || !password || !confirm) {
        Toast.error('Please fill in all fields')
        return
      }

      if (password.length < 6) {
        Toast.error('Password must be at least 6 characters')
        return
      }

      if (password !== confirm) {
        Toast.error('Passwords do not match')
        return
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Toast.error('Please enter a valid email address')
        return
      }

      setLoading(true)

      try {
        var result = await AuthService.register({ name: name, email: email, password: password, role: role })

        if (result.success) {
          Toast.success('Account created successfully!')
          await new Promise(function (r) { return setTimeout(r, 600) })
          window.location.href = result.data.redirect || 'index.html'
        } else {
          setLoading(false)
          ErrorBoundary.show({
            message: result.error || 'Registration failed',
            detail: 'Please try again with different information.',
            retry: function () {
              form.dispatchEvent(new Event('submit'))
            },
            fallback: 'register.html'
          })
        }
      } catch (err) {
        setLoading(false)
        ErrorBoundary.show({
          message: 'Unable to complete registration',
          detail: 'A network or server error occurred. Please try again.',
          retry: function () {
            form.dispatchEvent(new Event('submit'))
          },
          fallback: 'register.html'
        })
      }
    })
  }

  function initSocialLogin () {
    var buttons = document.querySelectorAll('.social-btn')
    buttons.forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var provider = this.dataset.provider

        if (provider === 'google') {
          window.location.href = '/api/auth/google'
          return
        }

        setLoading(true)

        try {
          var result = await AuthService.loginWithProvider(provider)
          if (result.success) {
            Toast.success('Signed in with ' + provider)
            await new Promise(function (r) { return setTimeout(r, 600) })
            window.location.href = result.data.redirect || 'index.html'
          }
        } catch (err) {
          setLoading(false)
          Toast.error(provider + ' sign-in failed')
        } finally {
          setLoading(false)
        }
      })
    })
  }

  function init () {
    if (AuthService.isSessionExpired()) {
      AuthService.logout()
    }
    initTheme()
    initRegisterForm()
    initSocialLogin()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
