const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Middleware to protect routes - verifies JWT token
async function protect(req, res, next) {
  let token

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from token
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    // Check if user is active
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned',
      })
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended',
      })
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    })
  }
}

// Optional auth - attaches user if token exists, but doesn't require it
async function optionalAuth(req, res, next) {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (user && user.status === 'active') {
      req.user = user
    }
  } catch (error) {
    // Token invalid, continue without user
  }

  next()
}

module.exports = { protect, optionalAuth }
