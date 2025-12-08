const auctionService = require('../services/auctionService')
const { getIO } = require('../config/socket')
const { logAndEmitActivity } = require('./activityController')

// @desc    Create a new auction
// @route   POST /api/auctions
// @access  Seller
async function createAuction(req, res, next) {
  try {
    const auction = await auctionService.createAuction(req.body, req.user)

    // Emit socket event
    try {
      const io = getIO()
      io.emit('auctionCreated', { auction })
    } catch (socketError) {
      // Socket not initialized
    }

    // Log activity
    await logAndEmitActivity({
      type: 'auction_created',
      message: `New auction: ${auction.title}`,
      userId: req.user._id,
      userName: req.user.username,
      auctionId: auction._id,
      auctionTitle: auction.title,
      amount: auction.startingPrice,
    })

    res.status(201).json({
      success: true,
      data: auction,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all auctions with filters
// @route   GET /api/auctions
// @access  Public
async function getAuctions(req, res, next) {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search,
    }

    const auctions = await auctionService.getAuctions(filters)

    res.json({
      success: true,
      count: auctions.length,
      data: auctions,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get auction by ID
// @route   GET /api/auctions/:id
// @access  Public
async function getAuctionById(req, res, next) {
  try {
    const auction = await auctionService.getAuctionById(req.params.id)

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found',
      })
    }

    res.json({
      success: true,
      data: auction,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update auction
// @route   PUT /api/auctions/:id
// @access  Owner/Admin
async function updateAuction(req, res, next) {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.isAdmin
    const auction = await auctionService.updateAuction(
      req.params.id,
      req.body,
      req.user._id,
      isAdmin
    )

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found',
      })
    }

    // Emit socket event
    try {
      const io = getIO()
      io.emit('auctionUpdated', { auctionId: auction._id, updates: req.body })
    } catch (socketError) {
      // Socket not initialized
    }

    res.json({
      success: true,
      data: auction,
    })
  } catch (error) {
    if (error.message === 'Not authorized to update this auction') {
      return res.status(403).json({
        success: false,
        message: error.message,
      })
    }
    next(error)
  }
}

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
// @access  Admin
async function deleteAuction(req, res, next) {
  try {
    const auction = await auctionService.deleteAuction(req.params.id)

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found',
      })
    }

    // Emit socket event
    try {
      const io = getIO()
      io.emit('auctionRemoved', { auctionId: req.params.id })
    } catch (socketError) {
      // Socket not initialized
    }

    res.json({
      success: true,
      message: 'Auction deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Place bid on auction
// @route   POST /api/auctions/:id/bid
// @access  Authenticated (non-admin)
async function placeBid(req, res, next) {
  try {
    const { amount } = req.body
    const bidderName = req.user.name || req.user.username

    const { auction, previousHighestBid } = await auctionService.placeBid(
      req.params.id,
      req.user._id,
      bidderName,
      parseFloat(amount)
    )

    // Emit socket events
    try {
      const io = getIO()
      io.emit('bidUpdate', {
        auctionId: auction._id,
        newPrice: auction.currentPrice,
        bidderId: req.user._id,
        bidderName: bidderName,
        timestamp: new Date(),
      })

      // Notify previous highest bidder they've been outbid
      if (
        previousHighestBid &&
        previousHighestBid.bidderId.toString() !== req.user._id.toString()
      ) {
        io.emit('outbid', {
          auctionId: auction._id,
          newPrice: auction.currentPrice,
          bidderName: bidderName,
          previousBidderId: previousHighestBid.bidderId,
        })
      }
    } catch (socketError) {
      // Socket not initialized
    }

    // Log bid activity
    await logAndEmitActivity({
      type: 'bid',
      message: `Bid placed: $${amount} on ${auction.title}`,
      userId: req.user._id,
      userName: bidderName,
      auctionId: auction._id,
      auctionTitle: auction.title,
      amount: parseFloat(amount),
    })

    res.json({
      success: true,
      data: auction,
    })
  } catch (error) {
    if (error.message.includes('Auction not found')) {
      return res.status(404).json({ success: false, message: error.message })
    }
    if (error.message.includes('ended') || error.message.includes('higher')) {
      return res.status(400).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Remove bid from auction
// @route   DELETE /api/auctions/:id/bid/:bidId
// @access  Admin
async function removeBid(req, res, next) {
  try {
    const auction = await auctionService.removeBid(
      req.params.id,
      req.params.bidId
    )

    // Emit socket event
    try {
      const io = getIO()
      io.emit('bidUpdate', {
        auctionId: auction._id,
        newPrice: auction.currentPrice,
        bidRemoved: true,
        timestamp: new Date(),
      })
    } catch (socketError) {
      // Socket not initialized
    }

    res.json({
      success: true,
      data: auction,
    })
  } catch (error) {
    if (error.message.includes('Auction not found')) {
      return res.status(404).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Get user's auctions
// @route   GET /api/auctions/user/:userId
// @access  Authenticated
async function getUserAuctions(req, res, next) {
  try {
    const auctions = await auctionService.getAuctionsBySeller(req.params.userId)

    res.json({
      success: true,
      count: auctions.length,
      data: auctions,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  placeBid,
  removeBid,
  getUserAuctions,
}
