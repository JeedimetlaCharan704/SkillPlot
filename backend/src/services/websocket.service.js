const logger = require('./logger.service')

let io = null

function initWebSocket (server) {
  try {
    const { Server } = require('socket.io')
    io = new Server(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
      pingInterval: 25000,
      pingTimeout: 20000,
    })

    io.on('connection', (socket) => {
      logger.debug(`WebSocket client connected: ${socket.id}`)

      socket.on('join-dashboard', (userId) => {
        if (userId) socket.join(`user:${userId}`)
      })

      socket.on('disconnect', (reason) => {
        logger.debug(`WebSocket client disconnected: ${socket.id} (${reason})`)
      })
    })

    logger.info('WebSocket server initialized')
  } catch (err) {
    logger.warn('WebSocket initialization failed — continuing without real-time updates', { error: err.message })
  }
  return io
}

function getIO () { return io }

function emitToUser (userId, event, data) {
  if (io) io.to(`user:${userId}`).emit(event, data)
}

function emitToAll (event, data) {
  if (io) io.emit(event, data)
}

module.exports = { initWebSocket, getIO, emitToUser, emitToAll }
