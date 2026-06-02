const mongoose = require('mongoose')

async function connectTestDB () {
  let uri
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server')
    const server = await MongoMemoryServer.create()
    uri = server.getUri()
    global.__MONGO_SERVER__ = server
  } catch (_err) {
    const env = require('../config/env')
    uri = env.mongoUri.replace(/\/[^/?]+(?=\?|$)/, '/skillpilot_test')
  }
  await mongoose.connect(uri)
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

async function disconnectTestDB () {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
  await mongoose.disconnect()
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop().catch(() => {})
  }
}

async function clearTestDB () {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

module.exports = { connectTestDB, disconnectTestDB, clearTestDB }
