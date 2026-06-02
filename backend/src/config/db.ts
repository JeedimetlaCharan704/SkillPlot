import dns from 'dns'
import mongoose from 'mongoose'
import env from './env'

dns.setServers(['8.8.8.8', '1.1.1.1'])

async function connectDB(): Promise<void> {
  const opts = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  }

  try {
    await mongoose.connect(env.mongoUri, opts)
    console.log(`[DB] Connected to MongoDB — ${mongoose.connection.host}`)
  } catch (err: any) {
    console.error(`[DB] Connection failed: ${err.message}`)
    process.exit(1)
  }

  mongoose.connection.on('error', (err: any) => {
    console.error(`[DB] Runtime error: ${err.message}`)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] Disconnected')
  })
}

export default connectDB
