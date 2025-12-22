const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { protect } = require('../middleware/auth')
const { isSeller } = require('../middleware/roleCheck')

// @route   POST /api/upload
// @desc    Upload images for auction
// @access  Seller/Admin
router.post('/', protect, isSeller, upload.array('images', 4), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      })
    }

    // Generate URLs for uploaded files
    const baseUrl =
      process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`
    const imageUrls = req.files.map((file) => {
      return `${baseUrl}/uploads/${file.filename}`
    })

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        urls: imageUrls,
        files: req.files.map((file) => ({
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          url: `${baseUrl}/uploads/${file.filename}`,
        })),
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
    })
  }
})

// @route   POST /api/upload/single
// @desc    Upload a single image
// @access  Seller/Admin
router.post(
  '/single',
  protect,
  isSeller,
  upload.single('image'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        })
      }

      const baseUrl =
        process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: imageUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
        },
      })
    } catch (error) {
      console.error('Upload error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
      })
    }
  }
)

// Error handling middleware for multer errors
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 5MB',
    })
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files. Maximum is 4 files',
    })
  }
  if (err.message) {
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }
  next(err)
})

module.exports = router
