require('dotenv').config()

// Set test environment variables if not already set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing'
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'
process.env.NODE_ENV = 'test'

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongoServer

// Connect to in-memory MongoDB before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)
})

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

// Disconnect and stop MongoDB after all tests
afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})
