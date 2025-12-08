const fc = require('fast-check')
const request = require('supertest')
const app = require('../../src/app')
const User = require('../../src/models/User')
const Auction = require('../../src/models/Auction')
const auctionService = require('../../src/services/auctionService')
const { generateToken } = require('../../src/controllers/authController')

/**
 * **Feature: auction-backend, Property 8: Auction End Time Calculation**
 * **Validates: Requirements 4.1**
 *
 * For any auction created with a duration in hours, the end time should equal
 * the creation time plus the duration converted to milliseconds.
 */
describe('Property 8: Auction End Time Calculation', () => {
  let sellerUser
  let sellerToken

  beforeAll(async () => {
    sellerUser = await User.create({
      username: 'seller_auction_' + Date.now(),
      email: 'seller_auction_' + Date.now() + '@test.com',
      password: 'password123',
      role: 'seller',
      sellerStatus: 'approved',
      isValidated: true,
    })
    sellerToken = generateToken(sellerUser._id)
  })

  afterAll(async () => {
    await User.findByIdAndDelete(sellerUser._id)
  })

  test('end time equals creation time plus duration', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 168 }), // Duration in hours (1 to 168)
        async (durationHours) => {
          const beforeCreate = Date.now()

          const auctionData = {
            title: 'Test Auction ' + Date.now(),
            description: 'Test description',
            category: 'Electronics',
            startingPrice: 100,
            duration: durationHours,
          }

          const auction = await auctionService.createAuction(
            auctionData,
            sellerUser
          )
          const afterCreate = Date.now()

          // Calculate expected end time range
          const expectedMinEndTime =
            beforeCreate + durationHours * 60 * 60 * 1000
          const expectedMaxEndTime =
            afterCreate + durationHours * 60 * 60 * 1000

          const actualEndTime = new Date(auction.endTime).getTime()

          // Cleanup
          await Auction.findByIdAndDelete(auction._id)

          // End time should be within the expected range
          return (
            actualEndTime >= expectedMinEndTime &&
            actualEndTime <= expectedMaxEndTime
          )
        }
      ),
      { numRuns: 10 }
    )
  })

  test('default duration is 24 hours when not specified', async () => {
    const beforeCreate = Date.now()

    const auctionData = {
      title: 'Test Auction Default Duration',
      description: 'Test description',
      category: 'Electronics',
      startingPrice: 100,
      // No duration specified
    }

    const auction = await auctionService.createAuction(auctionData, sellerUser)
    const afterCreate = Date.now()

    const expectedMinEndTime = beforeCreate + 24 * 60 * 60 * 1000
    const expectedMaxEndTime = afterCreate + 24 * 60 * 60 * 1000

    const actualEndTime = new Date(auction.endTime).getTime()

    expect(actualEndTime).toBeGreaterThanOrEqual(expectedMinEndTime)
    expect(actualEndTime).toBeLessThanOrEqual(expectedMaxEndTime)

    await Auction.findByIdAndDelete(auction._id)
  })
})

/**
 * **Feature: auction-backend, Property 9: Auction Filter Correctness**
 * **Validates: Requirements 4.2**
 *
 * For any set of auctions and any filter criteria (category, price range, status),
 * the filtered results should contain only auctions matching all specified criteria.
 */
describe('Property 9: Auction Filter Correctness', () => {
  let sellerUser
  const createdAuctions = []

  beforeAll(async () => {
    sellerUser = await User.create({
      username: 'seller_filter_' + Date.now(),
      email: 'seller_filter_' + Date.now() + '@test.com',
      password: 'password123',
      role: 'seller',
      sellerStatus: 'approved',
      isValidated: true,
    })

    // Create test auctions with various properties
    const categories = ['Electronics', 'Art', 'Collectibles']
    const prices = [100, 500, 1000, 2000]

    for (let i = 0; i < 6; i++) {
      const auction = await Auction.create({
        title: `Filter Test Auction ${i}`,
        description: 'Test description',
        category: categories[i % categories.length],
        startingPrice: prices[i % prices.length],
        currentPrice: prices[i % prices.length],
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        seller: sellerUser._id,
        sellerName: sellerUser.username,
        status: 'active',
      })
      createdAuctions.push(auction)
    }
  })

  afterAll(async () => {
    for (const auction of createdAuctions) {
      await Auction.findByIdAndDelete(auction._id)
    }
    await User.findByIdAndDelete(sellerUser._id)
  })

  test('category filter returns only matching auctions', async () => {
    const categoryArbitrary = fc.constantFrom(
      'Electronics',
      'Art',
      'Collectibles'
    )

    await fc.assert(
      fc.asyncProperty(categoryArbitrary, async (category) => {
        const auctions = await auctionService.getAuctions({ category })

        // All returned auctions should have the specified category
        const allMatchCategory = auctions.every((a) => a.category === category)

        return allMatchCategory
      }),
      { numRuns: 5 }
    )
  })

  test('price range filter returns only matching auctions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 1000, max: 3000 }),
        async (minPrice, maxPrice) => {
          const auctions = await auctionService.getAuctions({
            minPrice,
            maxPrice,
          })

          // All returned auctions should be within price range
          const allInRange = auctions.every(
            (a) => a.currentPrice >= minPrice && a.currentPrice <= maxPrice
          )

          return allInRange
        }
      ),
      { numRuns: 5 }
    )
  })

  test('combined filters return only matching auctions', async () => {
    const auctions = await auctionService.getAuctions({
      category: 'Electronics',
      minPrice: 50,
      maxPrice: 1500,
    })

    // All returned auctions should match all criteria
    const allMatch = auctions.every(
      (a) =>
        a.category === 'Electronics' &&
        a.currentPrice >= 50 &&
        a.currentPrice <= 1500
    )

    expect(allMatch).toBe(true)
  })
})

/**
 * **Feature: auction-backend, Property 12: Auction Lifecycle Completion**
 * **Validates: Requirements 6.1, 6.2**
 *
 * For any auction whose end time has passed, the scheduler should update its
 * status to 'ended' and set the winner to the highest bidder if bids exist.
 */
describe('Property 12: Auction Lifecycle Completion', () => {
  let sellerUser
  let bidderUser

  beforeAll(async () => {
    sellerUser = await User.create({
      username: 'seller_lifecycle_' + Date.now(),
      email: 'seller_lifecycle_' + Date.now() + '@test.com',
      password: 'password123',
      role: 'seller',
      sellerStatus: 'approved',
      isValidated: true,
    })

    bidderUser = await User.create({
      username: 'bidder_lifecycle_' + Date.now(),
      email: 'bidder_lifecycle_' + Date.now() + '@test.com',
      password: 'password123',
      role: 'bidder',
    })
  })

  afterAll(async () => {
    await User.findByIdAndDelete(sellerUser._id)
    await User.findByIdAndDelete(bidderUser._id)
  })

  test('expired auction with bids sets winner correctly', async () => {
    // Create an expired auction
    const auction = await Auction.create({
      title: 'Expired Auction With Bids',
      description: 'Test description',
      category: 'Electronics',
      startingPrice: 100,
      currentPrice: 500,
      endTime: new Date(Date.now() - 1000), // Already expired
      seller: sellerUser._id,
      sellerName: sellerUser.username,
      status: 'active',
      bids: [
        {
          bidderId: bidderUser._id,
          bidderName: bidderUser.username,
          amount: 500,
          timestamp: new Date(),
        },
      ],
    })

    // Run the scheduler function
    const endedAuctions = await auctionService.endExpiredAuctions()

    // Find our auction in the ended list
    const endedAuction = endedAuctions.find(
      (a) => a._id.toString() === auction._id.toString()
    )

    expect(endedAuction).toBeDefined()
    expect(endedAuction.status).toBe('ended')
    expect(endedAuction.winnerId.toString()).toBe(bidderUser._id.toString())
    expect(endedAuction.winnerName).toBe(bidderUser.username)

    // Cleanup
    await Auction.findByIdAndDelete(auction._id)
  })

  test('expired auction without bids has no winner', async () => {
    // Create an expired auction with no bids
    const auction = await Auction.create({
      title: 'Expired Auction No Bids',
      description: 'Test description',
      category: 'Electronics',
      startingPrice: 100,
      currentPrice: 100,
      endTime: new Date(Date.now() - 1000), // Already expired
      seller: sellerUser._id,
      sellerName: sellerUser.username,
      status: 'active',
      bids: [],
    })

    // Run the scheduler function
    const endedAuctions = await auctionService.endExpiredAuctions()

    // Find our auction in the ended list
    const endedAuction = endedAuctions.find(
      (a) => a._id.toString() === auction._id.toString()
    )

    expect(endedAuction).toBeDefined()
    expect(endedAuction.status).toBe('ended')
    expect(endedAuction.winnerId).toBeUndefined()
    expect(endedAuction.winnerName).toBeUndefined()

    // Cleanup
    await Auction.findByIdAndDelete(auction._id)
  })

  test('active auction is not ended prematurely', async () => {
    // Create an active auction that hasn't expired
    const auction = await Auction.create({
      title: 'Active Auction',
      description: 'Test description',
      category: 'Electronics',
      startingPrice: 100,
      currentPrice: 100,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      seller: sellerUser._id,
      sellerName: sellerUser.username,
      status: 'active',
    })

    // Run the scheduler function
    const endedAuctions = await auctionService.endExpiredAuctions()

    // Our auction should NOT be in the ended list
    const foundAuction = endedAuctions.find(
      (a) => a._id.toString() === auction._id.toString()
    )

    expect(foundAuction).toBeUndefined()

    // Verify auction is still active
    const stillActiveAuction = await Auction.findById(auction._id)
    expect(stillActiveAuction.status).toBe('active')

    // Cleanup
    await Auction.findByIdAndDelete(auction._id)
  })
})
