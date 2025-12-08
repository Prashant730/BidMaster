const Settings = require('../models/Settings')
const User = require('../models/User')
const Auction = require('../models/Auction')
const { getIO } = require('../config/socket')
const { logAndEmitActivity } = require('./activityController')

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Admin
async function getSettings(req, res, next) {
  try {
    const settings = await Settings.getSettings()
    res.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Admin
async function updateSettings(req, res, next) {
  try {
    const settings = await Settings.updateSettings(req.body)
    res.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update commission rate
// @route   PUT /api/admin/commission-rate
// @access  Admin
async function updateCommissionRate(req, res, next) {
  try {
    const { commissionRate } = req.body

    if (commissionRate < 0 || commissionRate > 1) {
      return res.status(400).json({
        success: false,
        message: 'Commission rate must be between 0 and 1',
      })
    }

    const settings = await Settings.updateSettings({ commissionRate })

    // Emit socket event
    try {
      const io = getIO()
      io.emit('commissionRateUpdated', { commissionRate })
    } catch (socketError) {
      // Socket not initialized
    }

    res.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get categories
// @route   GET /api/admin/categories
// @access  Public
async function getCategories(req, res, next) {
  try {
    const settings = await Settings.getSettings()
    res.json({
      success: true,
      data: settings.categories,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Add category
// @route   POST /api/admin/categories
// @access  Admin
async function addCategory(req, res, next) {
  try {
    const { name } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      })
    }

    const settings = await Settings.getSettings()

    if (settings.categories.includes(name.trim())) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists',
      })
    }

    settings.categories.push(name.trim())
    await settings.save()

    res.status(201).json({
      success: true,
      data: settings.categories,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete category
// @route   DELETE /api/admin/categories/:name
// @access  Admin
async function deleteCategory(req, res, next) {
  try {
    const { name } = req.params
    const settings = await Settings.getSettings()

    const index = settings.categories.indexOf(name)
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      })
    }

    settings.categories.splice(index, 1)
    await settings.save()

    res.json({
      success: true,
      data: settings.categories,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create announcement
// @route   POST /api/admin/announcements
// @access  Admin
async function createAnnouncement(req, res, next) {
  try {
    const { title, message, priority } = req.body

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      })
    }

    const settings = await Settings.getSettings()

    settings.announcements.push({
      title,
      message,
      priority: priority || 'low',
      active: true,
      createdAt: new Date(),
    })

    await settings.save()

    res.status(201).json({
      success: true,
      data: settings.announcements,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get announcements
// @route   GET /api/admin/announcements
// @access  Public
async function getAnnouncements(req, res, next) {
  try {
    const settings = await Settings.getSettings()
    const activeAnnouncements = settings.announcements.filter((a) => a.active)

    res.json({
      success: true,
      data: activeAnnouncements,
    })
  } catch (error) {
    next(error)
  }
}

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
async function getUsers(req, res, next) {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
    res.json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin
async function getUser(req, res, next) {
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

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    user.role = role
    if (role === 'admin') {
      user.isAdmin = true
    } else {
      user.isAdmin = false
    }
    await user.save()

    res.json({
      success: true,
      data: user.toPublicJSON(),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Approve seller
// @route   PUT /api/admin/users/:id/approve
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

    user.sellerStatus = 'approved'
    user.isValidated = true
    await user.save()

    // Log activity
    await logAndEmitActivity({
      type: 'seller_approved',
      message: `Seller approved: ${user.username}`,
      userId: user._id,
      userName: user.username,
      metadata: { email: user.email },
    })

    res.json({
      success: true,
      message: 'Seller approved successfully',
      data: user.toPublicJSON(),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Reject seller
// @route   PUT /api/admin/users/:id/reject
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

    user.sellerStatus = 'rejected'
    user.isValidated = false
    await user.save()

    // Log activity
    await logAndEmitActivity({
      type: 'seller_rejected',
      message: `Seller rejected: ${user.username}`,
      userId: user._id,
      userName: user.username,
      metadata: { email: user.email },
    })

    res.json({
      success: true,
      message: 'Seller rejected',
      data: user.toPublicJSON(),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Ban user
// @route   PUT /api/admin/users/:id/ban
// @access  Admin
async function banUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    user.status = 'banned'
    await user.save()

    // Log activity
    await logAndEmitActivity({
      type: 'user_banned',
      message: `User banned: ${user.username}`,
      userId: user._id,
      userName: user.username,
      metadata: { email: user.email },
    })

    res.json({
      success: true,
      message: 'User banned successfully',
      data: user.toPublicJSON(),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Unban user
// @route   PUT /api/admin/users/:id/unban
// @access  Admin
async function unbanUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      })
    }

    user.status = 'active'
    await user.save()

    res.json({
      success: true,
      message: 'User unbanned successfully',
      data: user.toPublicJSON(),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
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

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Admin
async function getStats(req, res, next) {
  try {
    // User stats
    const totalUsers = await User.countDocuments()
    const totalBidders = await User.countDocuments({ role: 'bidder' })
    const totalSellers = await User.countDocuments({ role: 'seller' })
    const totalAuctioneers = await User.countDocuments({ role: 'auctioneer' })
    const pendingValidations = await User.countDocuments({
      $or: [
        { sellerStatus: 'pending' },
        { role: { $in: ['seller', 'auctioneer'] }, isValidated: false },
      ],
    })
    const suspendedUsers = await User.countDocuments({ status: 'suspended' })
    const bannedUsers = await User.countDocuments({ status: 'banned' })

    // Auction stats
    const now = new Date()
    const allAuctions = await Auction.find({}).lean()

    let liveAuctions = 0
    let endedAuctions = 0
    let bidsToday = 0
    let estimatedRevenue = 0

    // Get commission rate for revenue calculation
    const settings = await Settings.getSettings()
    const commissionRate = settings.commissionRate || 0.05

    // Get start of today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    for (const auction of allAuctions) {
      const endTime = new Date(auction.endTime)

      if (endTime > now && auction.status !== 'ended') {
        liveAuctions++
      } else {
        endedAuctions++
        // Calculate revenue from ended auctions with bids
        if (auction.bids && auction.bids.length > 0) {
          estimatedRevenue += auction.currentPrice * commissionRate
        }
      }

      // Count bids placed today
      if (auction.bids) {
        for (const bid of auction.bids) {
          const bidTime = new Date(bid.timestamp)
          if (bidTime >= todayStart) {
            bidsToday++
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBidders,
        totalSellers: totalSellers + totalAuctioneers,
        totalAuctioneers,
        pendingValidations,
        suspendedUsers,
        bannedUsers,
        liveAuctions,
        endedAuctions,
        bidsToday,
        estimatedRevenue: Math.round(estimatedRevenue * 100) / 100,
      },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getSettings,
  updateSettings,
  updateCommissionRate,
  getCategories,
  addCategory,
  deleteCategory,
  createAnnouncement,
  getAnnouncements,
  getUsers,
  getUser,
  updateUserRole,
  approveSeller,
  rejectSeller,
  banUser,
  unbanUser,
  deleteUser,
  getStats,
}
