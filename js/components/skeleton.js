const Skeleton = (function () {
  function card (opts) {
    const lines = opts.lines || 3
    const width = opts.width || '100%'
    const height = opts.height || 'auto'
    const count = opts.count || 1

    let html = ''
    for (let i = 0; i < count; i++) {
      html += `<div class="skeleton-card" style="width:${typeof width === 'string' ? width : width + 'px'};height:${typeof height === 'string' ? height : height + 'px'}">`
      for (let j = 0; j < lines; j++) {
        const w = 60 + Math.random() * 35
        html += `<div class="skeleton skeleton-text" style="width:${w}%"></div>`
      }
      html += '</div>'
    }
    return html
  }

  function statCard () {
    return `
      <div class="skeleton skeleton-stat-card">
        <div class="skeleton skeleton-icon"></div>
        <div class="skeleton-stat-body">
          <div class="skeleton skeleton-text" style="width:50%"></div>
          <div class="skeleton skeleton-title" style="width:30%;height:28px"></div>
        </div>
      </div>`
  }

  function chart () {
    return `<div class="skeleton skeleton-chart"><div class="skeleton skeleton-chart-inner"></div></div>`
  }

  function loginForm () {
    return `
      <div class="skeleton-login-form">
        <div class="skeleton skeleton-title" style="width:40%;margin:0 auto var(--space-6)"></div>
        <div class="skeleton skeleton-text" style="width:100%;height:44px;margin-bottom:var(--space-4)"></div>
        <div class="skeleton skeleton-text" style="width:100%;height:44px;margin-bottom:var(--space-4)"></div>
        <div class="skeleton skeleton-text" style="width:100%;height:46px;border-radius:var(--radius-md)"></div>
      </div>`
  }

  return { card, statCard, chart, loginForm }
})()

Skeleton.STAT_CARD = 'stat-card'
Skeleton.CHART = 'chart'
Skeleton.LOGIN_FORM = 'login-form'
