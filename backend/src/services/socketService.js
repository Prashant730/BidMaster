const { getIO } = require('../config/socket')

// Emit bid update to all clients
function emitBidUpdate(auctionId, bidData) {
  try {
    const io = getIO()
    io.emit('bidUpdate', {
      auctionId,
      newPrice: bidData.newPrice,
      bidderId: bidData.bidderId,
      bidderName: bidData.bidderName,
      timestamp: new Date(),
    })

    // Also emit to auction-specific room
    io.to('auction_' + auctionId).emit('bidUpdate', {
      auctionId,
      newPrice: bidData.newPrice,
      bidderId: bidData.bidderId,
      bidderName: bidData.bidderName,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Socket emit error:', error.message)
  }
}

// Emit outbid notification to previous highest bidder
function emitOutbid(auctionId, previousBidderId, newPrice, bidderName) {
  try {
    const io = getIO()
    io.emit('outbid', {
      auctionId,
      previousBidderId,
      newPrice,
      bidderName,
    })
  } catch (error) {
    console.error('Socket emit error:', error.message)
  }
}

// Emit auction created event
function emitAuctionCreated(auction) {
  try {
    const io = getIO()
    io.emit('auctionCreated', { auction })
  } catch (error) {
    console.error('Socket emit error:', error.message)
  }
}

// Emit auction updated event
function emitAuctionUpdated(auctionId, updates) {
  try {
    const io = getIO()
    io.emit('auctionUpdated', { auctionId, updates })
    io.to('auction_' + auctionId).emit('auctionUpdated', { auctionId, updates })
  } catch (error) {
    console.error('Socket emit error:', error.message)
  }
}

// Emit auction removed event
function emitAuctionRemoved(auctionId) {
  try {
    const io = getIO()
    io.emit('auctionRemoved', { auctionId })
  } catch (error) {
    console.error('Socket emit error:', error.message)
  }
}

// Emit auction ended event
function emitAuctionEnded(auction) {
  try {
    const io = getIO()
    io.emit('auctionEnded', {
      auctionId: auction._id,
      winnerId: auction.winnerId,
      winnerName: auction.winnerName,
      finalPrice: auction.currentPrice,
    })
    io.to('auction_' + auction._id).emit('auctionEnded', {
      auctionId: auction._id,
      winnerId: auction.winnerId,
      winnerName: auction.winnerName,
      finalPrice: auction.currentPrice,
    })
  } catch (error) {
    console.error('Socket emit error:', error.message)
  }
}

// Emit user updated event
function emitUserUpdated(userEmail, updates) {
  try {
    const io = getIO()
    io.emit('userUpdated', { userEmail, updates })
  } catch (error) {
    console.error('Socket emit error:', error.message)
  }
}

// Emit commission rate updated event
function emitCommissionRateUpdated(commissionRate) {
  try {
    const io = getIO()
    io.emit('commissionRateUpdated', { commissionRate })
  } catch (error) {
    console.error('Socket emit error:', error.message)
  }
}

// Emit activity event to admin clients
function emitActivity(activity) {
  try {
    const io = getIO()
    io.emit('newActivity', activity)
    // Also emit to admin room if implemented
    io.to('admin_room').emit('newActivity', activity)
  } catch (error) {
    console.error('Socket emit error:', error.message)
  }
}

module.exports = {
  emitBidUpdate,
  emitOutbid,
  emitAuctionCreated,
  emitAuctionUpdated,
  emitAuctionRemoved,
  emitAuctionEnded,
  emitUserUpdated,
  emitCommissionRateUpdated,
  emitActivity,
}
