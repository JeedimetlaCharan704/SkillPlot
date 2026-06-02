const Toast = (function () {
  const container = document.createElement('div')
  container.className = 'toast-container'
  document.body.appendChild(container)

  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  }

  function show (message, type = 'info', duration = 3500) {
    const toast = document.createElement('div')
    toast.className = `toast toast-${type} animate-fade-in-up`
    toast.setAttribute('role', 'alert')
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`
    container.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(100%)'
      toast.style.transition = 'all 300ms ease'
      setTimeout(() => toast.remove(), 300)
    }, duration)
  }

  function success (msg) { show(msg, 'success') }
  function error (msg) { show(msg, 'error') }
  function warning (msg) { show(msg, 'warning') }
  function info (msg) { show(msg, 'info') }

  return { show, success, error, warning, info }
})()

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Toast }
}
