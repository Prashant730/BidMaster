const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const http = require('http')
const app = require('./src/app')
const connectDB = require('./src/config/db')
const { initializeSocket } = require('./src/config/socket')
const { startScheduler } = require('./src/services/schedulerService')

const PORT = process.env.PORT || 5000

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.IO
initializeSocket(server)

// Connect to database and start server
async function startServer() {
  try {
    await connectDB()

    server.listen(PORT, () => {
      console.log('Server running on port ' + PORT)
      console.log('Environment: ' + (process.env.NODE_ENV || 'development'))

      // Start the auction scheduler
      startScheduler()
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
