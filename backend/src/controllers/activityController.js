const Activity = require('../models/Activity')
const socketService = require('../services/socketService')

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const activities = await Activity.getRecent(limit)
    res.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ message: 'Server error fetching activities' })
  }
}

// Get activities by type
exports.getActivitiesByType = async (req, res) => {
  try {
    const { type } = req.params
    const limit = parseInt(req.query.limit) || 20
    const activities = await Activity.getByType(type, limit)
    res.json(activities)
  } catch (error) {
    console.error('Error fetching activities by type:', error)
    res.status(500).json({ message: 'Server error fetching activities' })
  }
}

// Get activity statistics
exports.getActivityStats = async (req, res) => {
  try {
    // Get count of each activity type in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const stats = await Activity.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ])

    const totalToday = stats.reduce((sum, s) => sum + s.count, 0)

    res.json({
      totalToday,
      byType: stats.reduce((acc, s) => {
        acc[s._id] = s.count
        return acc
      }, {}),
    })
  } catch (error) {
    console.error('Error fetching activity stats:', error)
    res.status(500).json({ message: 'Server error fetching activity stats' })
  }
}

// Helper function to log activity and emit via socket
exports.logAndEmitActivity = async (activityData) => {
  try {
    const activity = await Activity.logActivity(activityData)
    if (activity) {
      // Emit to all connected admin clients
      socketService.emitActivity(activity)
    }
    return activity
  } catch (error) {
    console.error('Error in logAndEmitActivity:', error)
    return null
  }
}
