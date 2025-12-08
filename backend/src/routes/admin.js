const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const {
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
} = require('../controllers/adminController')
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/roleCheck')

// Validation middleware
function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    })
  }
  next()
}

// @route   GET /api/admin/settings
// @desc    Get platform settings
// @access  Admin
router.get('/settings', protect, isAdmin, getSettings)

// @route   PUT /api/admin/settings
// @desc    Update platform settings
// @access  Admin
router.put('/settings', protect, isAdmin, updateSettings)

// @route   PUT /api/admin/commission-rate
// @desc    Update commission rate
// @access  Admin
router.put(
  '/commission-rate',
  protect,
  isAdmin,
  [
    body('commissionRate')
      .isFloat({ min: 0, max: 1 })
      .withMessage('Commission rate must be between 0 and 1'),
  ],
  validate,
  updateCommissionRate
)

// @route   GET /api/admin/categories
// @desc    Get categories
// @access  Public
router.get('/categories', getCategories)

// @route   POST /api/admin/categories
// @desc    Add category
// @access  Admin
router.post(
  '/categories',
  protect,
  isAdmin,
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  addCategory
)

// @route   DELETE /api/admin/categories/:name
// @desc    Delete category
// @access  Admin
router.delete('/categories/:name', protect, isAdmin, deleteCategory)

// @route   POST /api/admin/announcements
// @desc    Create announcement
// @access  Admin
router.post(
  '/announcements',
  protect,
  isAdmin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
  ],
  validate,
  createAnnouncement
)

// @route   GET /api/admin/announcements
// @desc    Get announcements
// @access  Public
router.get('/announcements', getAnnouncements)

// ==================== USER MANAGEMENT ROUTES ====================

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', protect, isAdmin, getUsers)

// @route   GET /api/admin/users/:id
// @desc    Get single user
// @access  Admin
router.get('/users/:id', protect, isAdmin, getUser)

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin
router.put('/users/:id/role', protect, isAdmin, updateUserRole)

// @route   PUT /api/admin/users/:id/approve
// @desc    Approve seller
// @access  Admin
router.put('/users/:id/approve', protect, isAdmin, approveSeller)

// @route   PUT /api/admin/users/:id/reject
// @desc    Reject seller
// @access  Admin
router.put('/users/:id/reject', protect, isAdmin, rejectSeller)

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban user
// @access  Admin
router.put('/users/:id/ban', protect, isAdmin, banUser)

// @route   PUT /api/admin/users/:id/unban
// @desc    Unban user
// @access  Admin
router.put('/users/:id/unban', protect, isAdmin, unbanUser)

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', protect, isAdmin, deleteUser)

// @route   GET /api/admin/stats
// @desc    Get platform stats
// @access  Admin
router.get('/stats', protect, isAdmin, getStats)

module.exports = router
