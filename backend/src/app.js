const express = require('express')
const cors = require('cors')

const app = express()

// CORS configuration - allow Vercel and local origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://project1-steel-ten.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true)

      // Check if origin is in allowed list or matches vercel pattern
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.includes('.vercel.app')
      ) {
        callback(null, true)
      } else {
        callback(null, true) // Allow all origins for now
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/auctions', require('./routes/auctions'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/activity', require('./routes/activity'))

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ msg: e.message }))
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors,
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      success: false,
      message: field + ' already exists',
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    })
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

module.exports = app
