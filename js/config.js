var APP_CONFIG = {
  getApiBase: function () {
    var host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return (window.location.port === '8080' || window.location.port === '3000')
        ? 'http://localhost:5000/api'
        : '/api'
    }
    return 'https://skillplot-api-1cw0.onrender.com/api'
  },

  getWsUrl: function () {
    var host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:5000'
    return 'https://skillplot-api-1cw0.onrender.com'
  },
}
