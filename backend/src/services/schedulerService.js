const cron = require('node-cron')
const auctionService = require('./auctionService')
const socketService = require('./socketService')

let schedulerTask = null

// Start the auction scheduler
function startScheduler() {
  // Run every minute to check for expired auctions
  schedulerTask = cron.schedule('* * * * *', async () => {
    try {
      const endedAuctions = await auctionService.endExpiredAuctions()

      // Emit events for each ended auction
      for (const auction of endedAuctions) {
        socketService.emitAuctionEnded(auction)
        console.log(
          `Auction ended: ${auction.title} - Winner: ${
            auction.winnerName || 'No winner'
          }`
        )
      }

      if (endedAuctions.length > 0) {
        console.log(`Scheduler: Ended ${endedAuctions.length} auction(s)`)
      }
    } catch (error) {
      console.error('Scheduler error:', error.message)
    }
  })

  console.log('Auction scheduler started - checking every minute')
  return schedulerTask
}

// Stop the scheduler
function stopScheduler() {
  if (schedulerTask) {
    schedulerTask.stop()
    schedulerTask = null
    console.log('Auction scheduler stopped')
  }
}

// Get scheduler status
function isSchedulerRunning() {
  return schedulerTask !== null
}

module.exports = {
  startScheduler,
  stopScheduler,
  isSchedulerRunning,
}
