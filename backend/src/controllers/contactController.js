const { body, validationResult } = require('express-validator')
const ContactMessage = require('../models/ContactMessage')

const validateContactForm = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email cannot exceed 254 characters'),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters')
    .escape(),
  body('category')
    .trim()
    .isIn(['general', 'bidding', 'payment', 'account', 'technical', 'dispute', 'seller', 'other'])
    .withMessage('Invalid category'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 5000 }).withMessage('Message cannot exceed 5000 characters')
    .escape()
]

async function submitContactForm(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(function (err) {
          return { field: err.path, message: err.msg }
        })
      })
    }

    const { name, email, subject, category, message } = req.body

    const contactMessage = await ContactMessage.create({
      name,
      email,
      subject,
      category,
      message,
      ipAddress: req.ip
    })

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: {
        id: contactMessage._id,
        name: contactMessage.name,
        category: contactMessage.category,
        createdAt: contactMessage.createdAt
      }
    })
  } catch (error) {
    next(error)
  }
}

async function getContactMessages(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 20, 50)
    const skip = (page - 1) * limit
    const statusFilter = req.query.status

    const query = {}
    if (statusFilter && ['new', 'read', 'replied', 'closed'].includes(statusFilter)) {
      query.status = statusFilter
    }

    const [messages, total] = await Promise.all([
      ContactMessage.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactMessage.countDocuments(query)
    ])

    res.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

async function updateMessageStatus(req, res, next) {
  try {
    const { status } = req.body

    if (!status || !['new', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: new, read, replied, closed'
      })
    }

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      })
    }

    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  validateContactForm,
  submitContactForm,
  getContactMessages,
  updateMessageStatus
}
