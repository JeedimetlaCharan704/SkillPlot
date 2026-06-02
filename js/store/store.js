const Store = (function () {
  const STORAGE_KEY = 'skillpilot_state'
  const SUB_KEY = '__subscribers'

  let state = {}
  const subscribers = {}

  const defaults = {
    theme: 'system',
    user: null,
    isLoggedIn: false,
    userRole: null,
    isDemoProfile: true,
    onboardingComplete: false,
    sessionStart: null,
    lastActivity: null,
    sessionTimeout: 1800000,
    resumeAnalysis: null,
    skillGapAnalysis: null,
    careerRecommendations: null,
    placementPrediction: null,
    portfolioAnalysis: null,
    recruiterScore: null,
    githubData: null,
    roadmap: null,
    learningStreak: { current: 0, longest: 0, lastActive: null },
    badges: [],
    achievements: [],
    activityLog: [],
    _version: 1
  }

  function load () {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        state = { ...defaults, ...parsed }
        return
      }
    } catch (e) {
      // corrupted data
    }
    state = { ...defaults }
    persist()
  }

  function persist () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.warn('Store: failed to persist state', e)
    }
  }

  function get (key) {
    return key ? state[key] : state
  }

  function set (key, value) {
    const prev = state[key]
    state[key] = value
    persist()
    notify(key, value, prev)
    if (key !== '_version') {
      notify('*', null, null)
    }
  }

  function update (key, updater) {
    const prev = state[key]
    const next = typeof updater === 'function' ? updater(prev) : updater
    state[key] = next
    persist()
    notify(key, next, prev)
    notify('*', null, null)
  }

  function subscribe (key, fn) {
    if (!subscribers[key]) subscribers[key] = []
    subscribers[key].push(fn)
    return function unsubscribe () {
      subscribers[key] = subscribers[key].filter(s => s !== fn)
    }
  }

  function notify (key, value, prev) {
    if (subscribers[key]) {
      subscribers[key].forEach(fn => {
        try { fn(value, prev, key) } catch (e) { console.warn('Store subscriber error', e) }
      })
    }
  }

  function reset () {
    state = { ...defaults }
    persist()
    Object.keys(subscribers).forEach(k => {
      if (k !== '__subscribers') notify(k, state[k], null)
    })
    notify('*', null, null)
  }

  function getSnapshot () {
    return JSON.parse(JSON.stringify(state))
  }

  function importState (data) {
    state = { ...defaults, ...data, _version: defaults._version }
    persist()
    Object.keys(state).forEach(k => {
      notify(k, state[k], null)
    })
    notify('*', null, null)
  }

  load()

  return {
    get,
    set,
    update,
    subscribe,
    reset,
    getSnapshot,
    importState,
    get defaults () { return { ...defaults } },
    get size () { return Object.keys(state).length }
  }
})()

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Store }
}
