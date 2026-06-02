const dns = require('dns')
const mongoose = require('mongoose')
const env = require('./env')

// Use Google DNS for reliable SRV resolution
dns.setServers(['8.8.8.8', '1.1.1.1'])

async function connectDB () {
  const opts = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  }

  try {
    await mongoose.connect(env.mongoUri, opts)
    console.log(`[DB] Connected to MongoDB — ${mongoose.connection.host}`)
  } catch (err) {
    console.error(`[DB] Connection failed: ${err.message}`)
    process.exit(1)
  }

  mongoose.connection.on('error', err => {
    console.error(`[DB] Runtime error: ${err.message}`)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] Disconnected')
  })
}

module.exports = connectDB
