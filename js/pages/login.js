(function () {
  'use strict'

  const DEMO_CREDENTIALS = {
    student: { email: 'student@skillpilot.ai', password: 'demo123', role: 'student' },
    mentor: { email: 'mentor@skillpilot.ai', password: 'demo123', role: 'mentor' },
    recruiter: { email: 'recruiter@skillpilot.ai', password: 'demo123', role: 'recruiter' },
    admin: { email: 'admin@skillpilot.ai', password: 'admin123', role: 'admin' }
  }

  let currentRole = 'student'

  /* ===== AUTH GUARD ===== */
  function checkExistingSession () {
    if (Store.get('isLoggedIn') && Store.get('user')) {
      const role = Store.get('userRole')
      const targets = { mentor: 'mentor-dashboard.html', recruiter: 'admin.html', student: 'index.html', admin: 'admin.html' }
      window.location.href = targets[role] || 'index.html'
    }
  }

  /* ===== THEME ===== */
  var THEME_CYCLE = ['light', 'dark', 'system']
  var THEME_ICONS = { light: 'fa-solid fa-moon', dark: 'fa-solid fa-sun', system: 'fa-solid fa-circle-half-stroke' }
  var THEME_LABELS = { light: 'Light', dark: 'Dark', system: 'System' }

  function initTheme () {
    const toggle = document.getElementById('theme-toggle')
    if (!toggle) return

    function getEffectiveTheme () {
      var mode = document.documentElement.getAttribute('data-theme-mode') || 'light'
      if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return mode
    }

    function getThemeMode () {
      return document.documentElement.getAttribute('data-theme-mode') || 'light'
    }

    function setThemeMode (mode) {
      var effective = mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode
      document.documentElement.setAttribute('data-theme', effective)
      document.documentElement.setAttribute('data-theme-mode', mode)
      Store.set('theme', mode)
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
      if (getThemeMode() === 'system') {
        setThemeMode('system')
      }
    })
  }

  /* ===== ROLE TABS ===== */
  function initRoleTabs () {
    const tabs = document.querySelectorAll('.role-tab')
    const form = document.getElementById('login-form')
    const emailInput = document.getElementById('login-email')

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        tabs.forEach(t => {
          t.classList.remove('active')
          t.setAttribute('aria-selected', 'false')
          t.tabIndex = -1
        })
        this.classList.add('active')
        this.setAttribute('aria-selected', 'true')
        this.tabIndex = 0
        currentRole = this.dataset.role

        const creds = DEMO_CREDENTIALS[currentRole]
        if (creds) {
          emailInput.value = creds.email
          document.getElementById('login-password').value = creds.password
        }

        form.classList.remove('visible')
        void form.offsetWidth
        form.classList.add('visible')
      })

      tab.addEventListener('keydown', function (e) {
        const tabsArray = Array.from(tabs)
        const idx = tabsArray.indexOf(this)
        let nextIdx = -1
        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length
        if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length
        if (nextIdx >= 0) {
          e.preventDefault()
          tabsArray[nextIdx].click()
          tabsArray[nextIdx].focus()
        }
      })
    })
  }

  /* ===== LOADING STATE ===== */
  function setLoading (loading) {
    const btn = document.getElementById('login-submit-btn')
    const form = document.getElementById('login-form')
    const skeletonZone = document.getElementById('login-skeleton')
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

  /* ===== LOGIN FORM ===== */
  function initLoginForm () {
    const form = document.getElementById('login-form')
    if (!form) return

    form.addEventListener('submit', async function (e) {
      e.preventDefault()
      const email = document.getElementById('login-email').value.trim()
      const password = document.getElementById('login-password').value

      if (!email || !password) {
        Toast.error('Please enter email and password')
        return
      }

      setLoading(true)

      try {
        const result = await AuthService.login(email, password)

        if (result.success) {
          Toast.success('Signed in successfully!')
          await handlePostLogin(result.data.redirect)
        } else {
          setLoading(false)
          const errEl = ErrorBoundary.show({
            message: result.error || 'Invalid credentials',
            detail: 'Please check your credentials and try again.',
            retry: async () => {
              setLoading(true)
              const retry = await AuthService.login(email, password)
              if (retry.success) {
                ErrorBoundary.hide(errEl)
                Toast.success('Signed in successfully!')
                await handlePostLogin(retry.data.redirect)
              } else {
                throw new Error(retry.error)
              }
              setLoading(false)
            },
            fallback: 'login.html'
          })
          if (result.suggestions) {
            result.suggestions.forEach(s => Toast.info(s))
          }
        }
      } catch (err) {
        setLoading(false)
        ErrorBoundary.show({
          message: 'Unable to complete login',
          detail: 'A network or server error occurred. Please try again.',
          retry: async () => {
            form.dispatchEvent(new Event('submit'))
          },
          fallback: 'login.html'
        })
      }
    })
  }

  /* ===== DEMO ACCOUNT CARDS ===== */
  function initDemoCards () {
    const cards = document.querySelectorAll('.demo-card')
    cards.forEach(card => {
      card.addEventListener('click', async function () {
        const role = this.dataset.role
        const creds = DEMO_CREDENTIALS[role]
        if (!creds) return

        setLoading(true)

        try {
          const result = await AuthService.login(creds.email, creds.password)
          if (result.success) {
            Toast.success(`Signed in as ${creds.role}`)
            await handlePostLogin(result.data.redirect)
          }
        } catch (err) {
          setLoading(false)
          ErrorBoundary.show({
            message: 'Demo login failed',
            detail: 'Unable to authenticate with demo credentials.',
            retry: async () => {
              setLoading(true)
              const retry = await AuthService.login(creds.email, creds.password)
              if (retry.success) {
                ErrorBoundary.hide(document.querySelector('.error-boundary'))
                Toast.success(`Signed in as ${creds.role}`)
                await handlePostLogin(retry.data.redirect)
              }
              setLoading(false)
            },
            fallback: 'login.html'
          })
        } finally {
          setLoading(false)
        }
      })

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.click()
        }
      })
    })
  }

  /* ===== SOCIAL LOGIN ===== */
  function initSocialLogin () {
    const buttons = document.querySelectorAll('.social-btn')
    buttons.forEach(btn => {
      btn.addEventListener('click', async function () {
        const provider = this.dataset.provider

        if (provider === 'google') {
          window.location.href = '/api/auth/google'
          return
        }

        setLoading(true)

        try {
          const result = await AuthService.loginWithProvider(provider)
          if (result.success) {
            Toast.success(`Signed in with ${provider}`)
            await handlePostLogin(result.data.redirect)
          }
        } catch (err) {
          setLoading(false)
          ErrorBoundary.show({
            message: `${provider} login failed`,
            detail: 'Social login simulation encountered an error.',
            retry: async () => {
              setLoading(true)
              const retry = await AuthService.loginWithProvider(provider)
              if (retry.success) {
                ErrorBoundary.hide(document.querySelector('.error-boundary'))
                Toast.success(`Signed in with ${provider}`)
                await handlePostLogin(retry.data.redirect)
              }
              setLoading(false)
            },
            fallback: 'login.html'
          })
        } finally {
          setLoading(false)
        }
      })
    })
  }

  /* ===== GOOGLE OAUTH CALLBACK ===== */
  function handleGoogleCallback () {
    var params = new URLSearchParams(window.location.search)
    var token = params.get('token')
    var userParam = params.get('user')

    if (token && userParam) {
      try {
        var user = JSON.parse(decodeURIComponent(userParam))
        Store.set('user', user)
        Store.set('isLoggedIn', true)
        Store.set('userRole', user.role || 'student')
        var redirect = user.role === 'student' ? 'index.html' : user.role === 'mentor' ? 'mentor-dashboard.html' : 'admin.html'
        window.location.href = redirect
      } catch (e) {
        /* fall through to normal login */
      }
    }

    var error = params.get('error')
    if (error) {
      Toast.error(decodeURIComponent(error).replace(/\+/g, ' '))
    }
  }

  /* ===== ONBOARDING MODAL ===== */
  function initOnboarding () {
    const modal = document.getElementById('onboarding-modal')
    if (!modal) return

    const hasCompletedOnboarding = Store.get('onboardingComplete')
    if (hasCompletedOnboarding) return

    setTimeout(() => {
      modal.classList.remove('hidden')
    }, 600)

    const demoOption = document.getElementById('onboard-demo')
    const createOption = document.getElementById('onboard-create')

    demoOption.addEventListener('click', function () {
      loadDemoProfile()
      Store.set('isLoggedIn', true)
      Store.set('userRole', 'student')
      Store.set('onboardingComplete', true)
      modal.classList.add('hidden')
      Toast.success('Demo profile loaded successfully!')
      setTimeout(function () { window.location.href = 'index.html' }, 400)
    })

    createOption.addEventListener('click', function () {
      Store.set('isLoggedIn', true)
      Store.set('isDemoProfile', false)
      Store.set('onboardingComplete', true)
      modal.classList.add('hidden')
      Toast.info('Start by adding your skills and projects in your profile.')
      setTimeout(function () { window.location.href = 'profile.html' }, 400)
    })

    demoOption.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click() }
    })
    createOption.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click() }
    })
  }

  function loadDemoProfile () {
    if (!DemoProfile) return
    const profile = DemoProfile

    Store.set('isDemoProfile', true)

    Store.set('user', profile.user)
    Store.update('user', u => {
      u.skills = profile.skills
      u.projects = profile.projects
      u.certifications = profile.certifications
      u.internships = profile.internships
      u.badges = profile.badges
      u.github = profile.github || null
      u.linkedin = profile.linkedin || null
      u.learningHistory = profile.learningHistory || []
      return u
    })

    Store.set('learningStreak', profile.learningStreak)
    Store.set('resumeAnalysis', profile.resumeAnalysis)
    Store.set('careerRecommendations', profile.careerRecommendations)
    Store.set('placementPrediction', profile.placementPrediction)
  }

  /* ===== POST-LOGIN ===== */
  async function handlePostLogin (redirect) {
    const onboardingComplete = Store.get('onboardingComplete')
    if (!onboardingComplete) {
      Store.set('onboardingComplete', true)
    }

    const isDemo = Store.get('isDemoProfile')
    if (isDemo) {
      loadDemoProfile()
    }

    await new Promise(r => setTimeout(r, 400))
    window.location.href = redirect || 'index.html'
  }

  /* ===== INIT ===== */
  function init () {
    if (AuthService.isSessionExpired()) {
      AuthService.logout()
    }

    handleGoogleCallback()
    checkExistingSession()
    initTheme()

    const creds = DEMO_CREDENTIALS[currentRole]
    document.getElementById('login-email').value = creds.email
    document.getElementById('login-password').value = creds.password

    initRoleTabs()
    initLoginForm()
    initDemoCards()
    initSocialLogin()
    initOnboarding()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
