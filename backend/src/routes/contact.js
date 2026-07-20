const express = require('express')
const rateLimit = require('express-rate-limit')
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/roleCheck')
const {
  validateContactForm,
  submitContactForm,
  getContactMessages,
  updateMessageStatus
} = require('../controllers/contactController')

const router = express.Router()

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many messages sent. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
})

router.post('/', contactLimiter, validateContactForm, submitContactForm)

router.get('/', protect, isAdmin, getContactMessages)

router.put('/:id/status', protect, isAdmin, updateMessageStatus)

module.exports = router
