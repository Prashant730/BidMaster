const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'bid',
        'auction_created',
        'auction_ended',
        'user_registered',
        'seller_approved',
        'seller_rejected',
        'user_banned',
        'payment',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Reference to related entities
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
    },
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
    },
    auctionTitle: {
      type: String,
    },
    // Additional data
    amount: {
      type: Number,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
activitySchema.index({ createdAt: -1 })
activitySchema.index({ type: 1, createdAt: -1 })

// Static method to log activity
activitySchema.statics.logActivity = async function (activityData) {
  try {
    const activity = await this.create(activityData)
    return activity
  } catch (error) {
    console.error('Error logging activity:', error)
    return null
  }
}

// Static method to get recent activities
activitySchema.statics.getRecent = async function (limit = 50) {
  return this.find({}).sort({ createdAt: -1 }).limit(limit).lean()
}

// Static method to get activities by type
activitySchema.statics.getByType = async function (type, limit = 20) {
  return this.find({ type }).sort({ createdAt: -1 }).limit(limit).lean()
}

const Activity = mongoose.model('Activity', activitySchema)

module.exports = Activity
