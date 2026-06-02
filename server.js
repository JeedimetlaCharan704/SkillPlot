const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 8080
const API_PORT = 5000
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown'
}

const server = http.createServer((req, res) => {
  // Proxy /api/* requests to the backend Express server
  if (req.url.startsWith('/api/')) {
    const options = {
      hostname: 'localhost',
      port: API_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: 'localhost:' + API_PORT }
    }
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res)
    })
    proxyReq.on('error', () => {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Backend API unavailable. Start the backend with: cd backend && npm start' }))
    })
    req.pipe(proxyReq)
    return
  }

  let filePath = path.join(__dirname, req.url === '/' ? 'login.html' : req.url)
  const ext = path.extname(filePath)
  const contentType = MIME[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end('<h1>404 Not Found</h1>')
      return
    }
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' })
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log('')
  console.log('  SkillPilot AI is running!')
  console.log('')
  console.log('  Frontend: http://localhost:' + PORT)
  console.log('  API:      http://localhost:' + API_PORT + '/api')
  console.log('  Login:    student@skillpilot.ai / demo123')
  console.log('')
  console.log('  First start the backend:')
  console.log('    cd backend && npm start')
  console.log('')
  console.log('  Press Ctrl+C to stop')
  console.log('')
})
