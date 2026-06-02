const KPI = (function () {
  var HISTORY_KEY = 'skillpilot_kpi_history'
  var MAX_HISTORY_DAYS = 30

  /* ---- Trend ---- */
  function computeTrend (value, previous) {
    if (previous == null || previous === 0) return null
    var diff = value - previous
    var pct = ((diff / previous) * 100)
    var sign = diff >= 0 ? '+' : ''
    if (Math.abs(pct) < 0.5) return { direction: 'stable', display: '0%', value: 0, period: '7d' }
    return {
      direction: diff > 0 ? 'up' : 'down',
      display: sign + pct.toFixed(1) + '%',
      value: pct,
      period: '7d'
    }
  }

  /* ---- Trend from history ---- */
  function computeTrendFromHistory (currentValue, history, key) {
    if (!history || !history.length) return null
    var sorted = history.slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date) })
    var recent = sorted.slice(-7).filter(function (h) { return h[key] != null })
    if (recent.length < 2) return null

    var first = recent[0][key]
    var last = recent[recent.length - 1][key]
    if (first === 0) return null
    var diff = last - first
    var pct = (diff / first) * 100
    var direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable'
    return {
      direction: direction,
      display: (diff >= 0 ? '+' : '') + pct.toFixed(1) + '%',
      value: pct,
      period: '7d',
      firstValue: first,
      lastValue: last,
      dataPoints: recent.length
    }
  }

  /* ---- Explanation ---- */
  function buildExplanation (steps, formula) {
    var parts = []
    if (steps && steps.length) {
      parts.push(steps.join('. '))
    }
    if (formula) {
      parts.push('Formula: ' + formula)
    }
    return parts.join(' | ') || 'Score computed from profile data.'
  }

  /* ---- Suggestions ---- */
  function formatSuggestions (raw) {
    if (!raw || !raw.length) return []
    return raw.map(function (s) {
      if (typeof s === 'string') return s
      if (s.suggestion) return s.suggestion
      if (s.area) return s.area + ': ' + (s.suggestions || []).join(', ')
      return JSON.stringify(s)
    })
  }

  /* ---- KPI Factory ---- */
  function make (opts) {
    var value = opts.value || 0
    var label = opts.label || 'Score'
    var confidence = opts.confidence || 'Medium'
    var trend = opts.trend
    var previousValue = opts.previousValue
    var explanation = opts.explanation
    var suggestions = opts.suggestions
    var calculation = opts.calculation
    var factors = opts.factors || []
    var history7 = opts.history7 || []
    var history30 = opts.history30 || []
    var historyKey = opts.historyKey || ''

    var resolvedTrend = trend
    if (!resolvedTrend && previousValue != null) {
      resolvedTrend = computeTrend(value, previousValue)
    }
    if (!resolvedTrend && history7.length && historyKey) {
      resolvedTrend = computeTrendFromHistory(value, history7, historyKey)
    }

    var resolvedExplanation = explanation || (calculation ? buildExplanation(calculation.steps, calculation.formula) : 'Score computed from profile data.')
    var resolvedSuggestions = formatSuggestions(suggestions)
    var weightedScore = factors.length ? factors.reduce(function (sum, f) { return sum + (f.score * f.weight) }, 0) : null

    return {
      value: Math.round(value * 10) / 10,
      confidence: ['High', 'Medium', 'Low'].indexOf(confidence) >= 0 ? confidence : 'Medium',
      trend: resolvedTrend,
      explanation: resolvedExplanation,
      suggestions: resolvedSuggestions,
      factors: factors,
      weightedScore: weightedScore ? Math.round(weightedScore * 10) / 10 : null,
      history7: history7.slice(-7),
      history30: history30.slice(-30),
      label: label,
      updatedAt: new Date().toISOString()
    }
  }

  /* ---- Render KPI Card ---- */
  function renderCard (kpi, container) {
    var trendClass = kpi.trend
      ? kpi.trend.direction === 'up' ? 'trend-up'
        : kpi.trend.direction === 'down' ? 'trend-down'
        : 'trend-stable'
      : ''

    var trendIcon = kpi.trend
      ? kpi.trend.direction === 'up' ? 'fa-arrow-up'
        : kpi.trend.direction === 'down' ? 'fa-arrow-down'
        : 'fa-minus'
      : ''

    var confidenceColor = kpi.confidence === 'High' ? 'var(--success)'
      : kpi.confidence === 'Low' ? 'var(--error)'
      : 'var(--warning)'

    var el = document.createElement('div')
    el.className = 'kpi-card'
    el.innerHTML =
      '<div class="kpi-header">' +
        '<span class="kpi-label">' + kpi.label + '</span>' +
        '<span class="kpi-confidence" style="color:' + confidenceColor + '" title="Confidence: ' + kpi.confidence + '">' +
          '<i class="fa-solid fa-circle" style="font-size:8px"></i> ' + kpi.confidence +
        '</span>' +
      '</div>' +
      '<div class="kpi-value-row">' +
        '<span class="kpi-value">' + kpi.value + '</span>' +
        (kpi.trend ? '<span class="kpi-trend ' + trendClass + '"><i class="fa-solid ' + trendIcon + '"></i> ' + kpi.trend.display + '</span>' : '') +
      '</div>' +
      '<p class="kpi-explanation">' + kpi.explanation + '</p>' +
      (kpi.suggestions.length ? '<div class="kpi-suggestions"><i class="fa-solid fa-lightbulb"></i> ' + kpi.suggestions[0] + '</div>' : '') +
      '<button class="kpi-details-btn" data-kpi-label="' + kpi.label + '">View Details <i class="fa-solid fa-chevron-right"></i></button>'

    container.appendChild(el)
    return el
  }

  /* ---- KPI History Management ---- */
  function loadHistory () {
    try {
      var raw = localStorage.getItem(HISTORY_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  }

  function saveHistory (history) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
      // storage full
    }
  }

  function snapshot (data) {
    var history = loadHistory()
    var today = new Date().toISOString().slice(0, 10)
    var existing = history.filter(function (h) { return h.date === today })
    var entry = { date: today }
    if (data.careerReadiness != null) entry.careerReadiness = data.careerReadiness
    if (data.recruiterScore != null) entry.recruiterScore = data.recruiterScore
    if (data.placementProb != null) entry.placementProb = data.placementProb
    if (data.resumeScore != null) entry.resumeScore = data.resumeScore
    if (data.skillStrength != null) entry.skillStrength = data.skillStrength

    if (existing.length) {
      Object.assign(existing[0], entry)
    } else {
      history.push(entry)
    }

    var cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - MAX_HISTORY_DAYS)
    var cutoffStr = cutoff.toISOString().slice(0, 10)
    var pruned = history.filter(function (h) { return h.date >= cutoffStr })

    saveHistory(pruned)
    return pruned
  }

  function getHistory (key) {
    var history = loadHistory()
    if (!key) return history
    return history.filter(function (h) { return h[key] != null }).map(function (h) { return { date: h.date, value: h[key] } })
  }

  return {
    make: make,
    renderCard: renderCard,
    computeTrend: computeTrend,
    computeTrendFromHistory: computeTrendFromHistory,
    buildExplanation: buildExplanation,
    formatSuggestions: formatSuggestions,
    snapshot: snapshot,
    getHistory: getHistory,
    loadHistory: loadHistory
  }
})()
