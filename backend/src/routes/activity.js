const express = require('express')
const router = express.Router()
const activityController = require('../controllers/activityController')
const { protect } = require('../middleware/auth')
const { isAdmin } = require('../middleware/roleCheck')

// All activity routes require admin authentication
router.use(protect)
router.use(isAdmin)

// GET /api/activity - Get recent activities
router.get('/', activityController.getRecentActivities)

// GET /api/activity/stats - Get activity statistics
router.get('/stats', activityController.getActivityStats)

// GET /api/activity/type/:type - Get activities by type
router.get('/type/:type', activityController.getActivitiesByType)

module.exports = router
