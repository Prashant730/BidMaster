// Script to migrate existing bids to Activity collection
require('dotenv').config()
const mongoose = require('mongoose')
const Auction = require('./src/models/Auction')
const Activity = require('./src/models/Activity')

async function migrateBidsToActivity() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/auction-platform'
    )
    console.log('Connected to MongoDB')

    // Get all auctions with bids
    const auctions = await Auction.find({ 'bids.0': { $exists: true } }).lean()
    console.log(`Found ${auctions.length} auctions with bids`)

    let migratedCount = 0

    for (const auction of auctions) {
      for (const bid of auction.bids) {
        // Check if this bid activity already exists
        const existingActivity = await Activity.findOne({
          type: 'bid',
          auctionId: auction._id,
          userId: bid.bidderId,
          amount: bid.amount,
        })

        if (!existingActivity) {
          await Activity.create({
            type: 'bid',
            message: `Bid placed: $${bid.amount} on ${auction.title}`,
            userId: bid.bidderId,
            userName: bid.bidderName,
            auctionId: auction._id,
            auctionTitle: auction.title,
            amount: bid.amount,
            createdAt: bid.timestamp || new Date(),
          })
          migratedCount++
        }
      }
    }

    console.log(`Migrated ${migratedCount} bids to Activity collection`)

    // Show recent activities
    const recentActivities = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
    console.log('\nRecent activities:')
    recentActivities.forEach((a) => {
      console.log(
        `- [${a.type}] ${a.message} (${new Date(a.createdAt).toLocaleString()})`
      )
    })

    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

migrateBidsToActivity()
