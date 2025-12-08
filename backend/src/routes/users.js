const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  submitSellerRequest,
  getPendingSellers,
  approveSeller,
  rejectSeller,
} = require('../controllers/userController')
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

// @route   GET /api/users
// @desc    Get all users
// @access  Admin
router.get('/', protect, isAdmin, getAllUsers)

// @route   GET /api/users/pending-sellers
// @desc    Get pending seller requests
// @access  Admin
router.get('/pending-sellers', protect, isAdmin, getPendingSellers)

// @route   POST /api/users/seller-request
// @desc    Submit seller request
// @access  Private
router.post(
  '/seller-request',
  protect,
  [
    body('businessName')
      .trim()
      .notEmpty()
      .withMessage('Business name is required'),
    body('businessType')
      .trim()
      .notEmpty()
      .withMessage('Business type is required'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
  ],
  validate,
  submitSellerRequest
)

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Admin
router.get('/:id', protect, isAdmin, getUserById)

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Admin
router.put(
  '/:id',
  protect,
  isAdmin,
  [
    body('status').optional().isIn(['active', 'suspended', 'banned']),
    body('role').optional().isIn(['bidder', 'seller', 'admin']),
    body('sellerStatus')
      .optional()
      .isIn(['none', 'pending', 'approved', 'rejected']),
  ],
  validate,
  updateUser
)

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/:id', protect, isAdmin, deleteUser)

// @route   PUT /api/users/:id/approve-seller
// @desc    Approve seller request
// @access  Admin
router.put('/:id/approve-seller', protect, isAdmin, approveSeller)

// @route   PUT /api/users/:id/reject-seller
// @desc    Reject seller request
// @access  Admin
router.put('/:id/reject-seller', protect, isAdmin, rejectSeller)

module.exports = router
