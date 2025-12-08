const fc = require('fast-check')
const User = require('../../src/models/User')
const Auction = require('../../src/models/Auction')
const auctionService = require('../../src/services/auctionService')

/**
 * **Feature: auction-backend, Property 10: Bid Validity and Price Update**
 * **Validates: Requirements 5.1**
 *
 * For any active auction and any bid amount greater than the current price,
 * placing the bid should update the auction's current price to the bid amount
 * and add the bid to the bid history.
 */
describe('Property 10: Bid Validity and Price Update', () => {
  let sellerUser
  let bidderUser

  beforeAll(async () => {
    sellerUser = await User.create({
      username: 'seller_bid_' + Date.now(),
      email: 'seller_bid_' + Date.now() + '@test.com',
      password: 'password123',
      role: 'seller',
      sellerStatus: 'approved',
      isValidated: true,
    })

    bidderUser = await User.create({
      username: 'bidder_' + Date.now(),
      email: 'bidder_' + Date.now() + '@test.com',
      password: 'password123',
      role: 'bidder',
    })
  })

  afterAll(async () => {
    await User.findByIdAndDelete(sellerUser._id)
    await User.findByIdAndDelete(bidderUser._id)
  })

  test('valid bid updates current price and adds to history', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 10000 }), // Starting price
        fc.integer({ min: 1, max: 5000 }), // Bid increment
        async (startingPrice, bidIncrement) => {
          // Create auction
          const auction = await Auction.create({
            title: 'Bid Test Auction ' + Date.now(),
            description: 'Test description',
            category: 'Electronics',
            startingPrice: startingPrice,
            currentPrice: startingPrice,
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            seller: sellerUser._id,
            sellerName: sellerUser.username,
            status: 'active',
          })

          const bidAmount = startingPrice + bidIncrement
          const initialBidCount = auction.bids.length

          // Place bid
          const { auction: updatedAuction } = await auctionService.placeBid(
            auction._id,
            bidderUser._id,
            bidderUser.username,
            bidAmount
          )

          // Verify price updated
          const priceUpdated = updatedAuction.currentPrice === bidAmount

          // Verify bid added to history
          const bidAdded = updatedAuction.bids.length === initialBidCount + 1

          // Verify bid details
          const lastBid = updatedAuction.bids[updatedAuction.bids.length - 1]
          const bidCorrect =
            lastBid.amount === bidAmount &&
            lastBid.bidderId.toString() === bidderUser._id.toString()

          // Cleanup
          await Auction.findByIdAndDelete(auction._id)

          return priceUpdated && bidAdded && bidCorrect
        }
      ),
      { numRuns: 10 }
    )
  })

  test('bid lower than current price is rejected', async () => {
    const auction = await Auction.create({
      title: 'Low Bid Test Auction',
      description: 'Test description',
      category: 'Electronics',
      startingPrice: 1000,
      currentPrice: 1000,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      seller: sellerUser._id,
      sellerName: sellerUser.username,
      status: 'active',
    })

    // Try to place a bid lower than current price
    await expect(
      auctionService.placeBid(
        auction._id,
        bidderUser._id,
        bidderUser.username,
        500
      )
    ).rejects.toThrow('Bid must be higher than current price')

    // Cleanup
    await Auction.findByIdAndDelete(auction._id)
  })

  test('bid on ended auction is rejected', async () => {
    const auction = await Auction.create({
      title: 'Ended Auction Test',
      description: 'Test description',
      category: 'Electronics',
      startingPrice: 100,
      currentPrice: 100,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      seller: sellerUser._id,
      sellerName: sellerUser.username,
      status: 'ended',
    })

    await expect(
      auctionService.placeBid(
        auction._id,
        bidderUser._id,
        bidderUser.username,
        200
      )
    ).rejects.toThrow('This auction has ended')

    await Auction.findByIdAndDelete(auction._id)
  })
})

/**
 * **Feature: auction-backend, Property 11: Bid Removal Price Recalculation**
 * **Validates: Requirements 5.5**
 *
 * For any auction with multiple bids, removing a bid should recalculate the
 * current price to be the maximum of the remaining bids or the starting price
 * if no bids remain.
 */
describe('Property 11: Bid Removal Price Recalculation', () => {
  let sellerUser
  let bidderUsers = []

  beforeAll(async () => {
    sellerUser = await User.create({
      username: 'seller_remove_' + Date.now(),
      email: 'seller_remove_' + Date.now() + '@test.com',
      password: 'password123',
      role: 'seller',
      sellerStatus: 'approved',
      isValidated: true,
    })

    // Create multiple bidders
    for (let i = 0; i < 3; i++) {
      const bidder = await User.create({
        username: `bidder_remove_${i}_${Date.now()}`,
        email: `bidder_remove_${i}_${Date.now()}@test.com`,
        password: 'password123',
        role: 'bidder',
      })
      bidderUsers.push(bidder)
    }
  })

  afterAll(async () => {
    await User.findByIdAndDelete(sellerUser._id)
    for (const bidder of bidderUsers) {
      await User.findByIdAndDelete(bidder._id)
    }
  })

  test('removing highest bid recalculates price to next highest', async () => {
    const startingPrice = 100

    // Create auction
    const auction = await Auction.create({
      title: 'Remove Bid Test',
      description: 'Test description',
      category: 'Electronics',
      startingPrice: startingPrice,
      currentPrice: startingPrice,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      seller: sellerUser._id,
      sellerName: sellerUser.username,
      status: 'active',
    })

    // Place multiple bids
    await auctionService.placeBid(
      auction._id,
      bidderUsers[0]._id,
      bidderUsers[0].username,
      200
    )
    await auctionService.placeBid(
      auction._id,
      bidderUsers[1]._id,
      bidderUsers[1].username,
      300
    )
    const { auction: auctionWithBids } = await auctionService.placeBid(
      auction._id,
      bidderUsers[2]._id,
      bidderUsers[2].username,
      500
    )

    expect(auctionWithBids.currentPrice).toBe(500)
    expect(auctionWithBids.bids.length).toBe(3)

    // Remove highest bid
    const highestBidId = auctionWithBids.bids[2]._id
    const updatedAuction = await auctionService.removeBid(
      auction._id,
      highestBidId
    )

    // Price should be recalculated to next highest (300)
    expect(updatedAuction.currentPrice).toBe(300)
    expect(updatedAuction.bids.length).toBe(2)

    // Cleanup
    await Auction.findByIdAndDelete(auction._id)
  })

  test('removing all bids resets price to starting price', async () => {
    const startingPrice = 100

    // Create auction
    const auction = await Auction.create({
      title: 'Remove All Bids Test',
      description: 'Test description',
      category: 'Electronics',
      startingPrice: startingPrice,
      currentPrice: startingPrice,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      seller: sellerUser._id,
      sellerName: sellerUser.username,
      status: 'active',
    })

    // Place a bid
    const { auction: auctionWithBid } = await auctionService.placeBid(
      auction._id,
      bidderUsers[0]._id,
      bidderUsers[0].username,
      200
    )

    expect(auctionWithBid.currentPrice).toBe(200)

    // Remove the bid
    const bidId = auctionWithBid.bids[0]._id
    const updatedAuction = await auctionService.removeBid(auction._id, bidId)

    // Price should reset to starting price
    expect(updatedAuction.currentPrice).toBe(startingPrice)
    expect(updatedAuction.bids.length).toBe(0)

    // Cleanup
    await Auction.findByIdAndDelete(auction._id)
  })

  test('removing middle bid maintains correct price', async () => {
    const startingPrice = 100

    // Create auction
    const auction = await Auction.create({
      title: 'Remove Middle Bid Test',
      description: 'Test description',
      category: 'Electronics',
      startingPrice: startingPrice,
      currentPrice: startingPrice,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      seller: sellerUser._id,
      sellerName: sellerUser.username,
      status: 'active',
    })

    // Place multiple bids
    await auctionService.placeBid(
      auction._id,
      bidderUsers[0]._id,
      bidderUsers[0].username,
      200
    )
    await auctionService.placeBid(
      auction._id,
      bidderUsers[1]._id,
      bidderUsers[1].username,
      300
    )
    const { auction: auctionWithBids } = await auctionService.placeBid(
      auction._id,
      bidderUsers[2]._id,
      bidderUsers[2].username,
      500
    )

    // Remove middle bid (300)
    const middleBidId = auctionWithBids.bids[1]._id
    const updatedAuction = await auctionService.removeBid(
      auction._id,
      middleBidId
    )

    // Price should still be 500 (highest remaining)
    expect(updatedAuction.currentPrice).toBe(500)
    expect(updatedAuction.bids.length).toBe(2)

    // Cleanup
    await Auction.findByIdAndDelete(auction._id)
  })
})
