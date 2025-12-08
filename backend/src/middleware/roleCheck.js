// Middleware to check if user is admin
function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    })
  }

  if (req.user.role !== 'admin' && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    })
  }

  next()
}

// Middleware to check if user is a seller
function isSeller(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    })
  }

  // Admins can also perform seller actions
  if (req.user.role === 'admin' || req.user.isAdmin) {
    return next()
  }

  if (req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      message: 'Seller access required',
    })
  }

  // Check if seller is validated
  if (!req.user.isValidated || req.user.sellerStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Your seller account is not approved yet',
    })
  }

  next()
}

// Middleware to check if user is seller or admin
function isSellerOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    })
  }

  // Admin check
  if (req.user.role === 'admin' || req.user.isAdmin) {
    return next()
  }

  // Seller check
  if (
    req.user.role === 'seller' &&
    req.user.isValidated &&
    req.user.sellerStatus === 'approved'
  ) {
    return next()
  }

  return res.status(403).json({
    success: false,
    message: 'Seller or admin access required',
  })
}

// Middleware to check user is NOT admin (for bidding)
function isNotAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    })
  }

  if (req.user.role === 'admin' || req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admins cannot perform this action',
    })
  }

  next()
}

module.exports = { isAdmin, isSeller, isSellerOrAdmin, isNotAdmin }
