const ErrorBoundary = (function () {
  function show (opts) {
    const {
      message = 'Something went wrong',
      detail = '',
      retry = null,
      fallback = null,
      container = document.body
    } = opts || {}

    const el = document.createElement('div')
    el.className = 'error-boundary'
    el.setAttribute('role', 'alert')

    el.innerHTML = `
      <div class="error-boundary-card">
        <div class="error-boundary-icon">
          <i class="fa-solid fa-circle-exclamation"></i>
        </div>
        <h3 class="error-boundary-title">${escapeHtml(message)}</h3>
        ${detail ? `<p class="error-boundary-detail">${escapeHtml(detail)}</p>` : ''}
        <div class="error-boundary-actions">
          ${retry ? `<button class="error-boundary-btn error-boundary-retry" data-action="retry">
            <i class="fa-solid fa-rotate"></i> Retry
          </button>` : ''}
          ${fallback ? `<a href="${escapeHtml(fallback)}" class="error-boundary-btn error-boundary-fallback">
            <i class="fa-solid fa-gauge-high"></i> Go to Dashboard
          </a>` : ''}
        </div>
      </div>`

    container.appendChild(el)

    if (retry) {
      el.querySelector('.error-boundary-retry')?.addEventListener('click', async function () {
        this.disabled = true
        this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Retrying...'
        try {
          await retry()
          el.remove()
        } catch (e) {
          this.disabled = false
          this.innerHTML = '<i class="fa-solid fa-rotate"></i> Retry'
        }
      })
    }

    return el
  }

  function hide (el) {
    if (el && el.parentNode) {
      el.style.opacity = '0'
      el.style.transform = 'translateY(-8px)'
      el.style.transition = 'all 200ms ease'
      setTimeout(() => el.remove(), 200)
    }
  }

  function escapeHtml (str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  return { show, hide }
})()
