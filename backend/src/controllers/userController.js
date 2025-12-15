const User = require('../models/User')
const { getIO } = require('../config/socket')

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().select('-password')
    res.json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }
    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
async function updateUser(req, res, next) {
  try {
    const { status, role, isValidated, sellerStatus, isAdmin } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    // Update allowed fields
    if (status !== undefined) user.status = status
    if (role !== undefined) user.role = role
    if (isValidated !== undefined) user.isValidated = isValidated
    if (sellerStatus !== undefined) user.sellerStatus = sellerStatus
    if (isAdmin !== undefined) user.isAdmin = isAdmin

    await user.save()

    // Emit socket event for real-time update
    try {
      const io = getIO()
      io.emit('userUpdated', {
        userEmail: user.email,
        updates: { status, role, isValidated, sellerStatus, isAdmin },
      })
    } catch (socketError) {
      // Socket not initialized, continue without emitting
    }

    res.json({
      success: true,
      data: user.toPublicJSON(),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    await User.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Submit seller request
// @route   POST /api/users/seller-request
// @access  Private
async function submitSellerRequest(req, res, next) {
  try {
    const {
      businessName,
      businessType,
      description,
      experience,
      website,
      phone,
    } = req.body

    const user = await User.findById(req.user._id)

    // Admins cannot become sellers
    if (user.isAdmin || user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrators cannot become sellers',
      })
    }

    if (user.role === 'seller' && user.isValidated) {
      return res.status(400).json({
        success: false,
        message: 'You are already an approved seller',
      })
    }

    if (user.sellerStatus === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending seller request',
      })
    }

    // Update user with seller request
    user.role = 'seller'
    user.sellerStatus = 'pending'
    user.isValidated = false
    user.businessName = businessName
    user.businessType = businessType
    user.description = description
    user.experience = experience
    user.website = website
    if (phone) user.phone = phone
    user.requestedAt = new Date()

    await user.save()

    res.json({
      success: true,
      message: 'Seller request submitted successfully',
      data: user.toPublicJSON(),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get pending seller requests
// @route   GET /api/users/pending-sellers
// @access  Admin
async function getPendingSellers(req, res, next) {
  try {
    const pendingSellers = await User.find({
      sellerStatus: 'pending',
    }).select('-password')

    res.json({
      success: true,
      count: pendingSellers.length,
      data: pendingSellers,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Approve seller request
// @route   PUT /api/users/:id/approve-seller
// @access  Admin
async function approveSeller(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    if (user.sellerStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User does not have a pending seller request',
      })
    }

    user.role = 'seller'
    user.sellerStatus = 'approved'
    user.isValidated = true

    await user.save()

    // Emit socket event
    try {
      const io = getIO()
      io.emit('userUpdated', {
        userEmail: user.email,
        updates: {
          role: 'seller',
          sellerStatus: 'approved',
          isValidated: true,
        },
      })
    } catch (socketError) {
      // Socket not initialized
    }

    res.json({
      success: true,
      message: 'Seller approved successfully',
      data: user.toPublicJSON(),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Reject seller request
// @route   PUT /api/users/:id/reject-seller
// @access  Admin
async function rejectSeller(req, res, next) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    if (user.sellerStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User does not have a pending seller request',
      })
    }

    user.role = 'bidder'
    user.sellerStatus = 'rejected'
    user.isValidated = true

    await user.save()

    // Emit socket event
    try {
      const io = getIO()
      io.emit('userUpdated', {
        userEmail: user.email,
        updates: {
          role: 'bidder',
          sellerStatus: 'rejected',
          isValidated: true,
        },
      })
    } catch (socketError) {
      // Socket not initialized
    }

    res.json({
      success: true,
      message: 'Seller request rejected',
      data: user.toPublicJSON(),
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  submitSellerRequest,
  getPendingSellers,
  approveSeller,
  rejectSeller,
}
