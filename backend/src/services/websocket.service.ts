import logger from './logger.service'

let io: any = null

function initWebSocket(server: any): any {
  try {
    const { Server } = require('socket.io')
    io = new Server(server, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
      pingInterval: 25000,
      pingTimeout: 20000,
    })

    io.on('connection', (socket: any) => {
      logger.debug(`WebSocket client connected: ${socket.id}`)

      socket.on('join-dashboard', (userId: string) => {
        if (userId) socket.join(`user:${userId}`)
      })

      socket.on('disconnect', (reason: string) => {
        logger.debug(`WebSocket client disconnected: ${socket.id} (${reason})`)
      })
    })

    logger.info('WebSocket server initialized')
  } catch (err: any) {
    logger.warn('WebSocket initialization failed — continuing without real-time updates', { error: err.message })
  }
  return io
}

function getIO(): any { return io }

function emitToUser(userId: string, event: string, data: any): void {
  if (io) io.to(`user:${userId}`).emit(event, data)
}

function emitToAll(event: string, data: any): void {
  if (io) io.emit(event, data)
}

export { initWebSocket, getIO, emitToUser, emitToAll }
