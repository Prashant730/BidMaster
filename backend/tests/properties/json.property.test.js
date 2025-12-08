const fc = require('fast-check')
const User = require('../../src/models/User')
const Auction = require('../../src/models/Auction')

/**
 * **Feature: auction-backend, Property 14: JSON Round-Trip**
 * **Validates: Requirements 9.4, 9.5**
 *
 * For any valid API request/response data, serializing to JSON and
 * deserializing should produce equivalent data.
 */
describe('Property 14: JSON Round-Trip', () => {
  let testSeller

  beforeAll(async () => {
    testSeller = await User.create({
      username: 'json_seller_' + Date.now(),
      email: 'json_seller_' + Date.now() + '@test.com',
      password: 'password123',
      role: 'seller',
      sellerStatus: 'approved',
      isValidated: true,
    })
  })

  afterAll(async () => {
    await User.findByIdAndDelete(testSeller._id)
  })

  test('user data survives JSON round-trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 3, maxLength: 10 })
          .filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
        fc.string({ minLength: 6, maxLength: 20 }),
        async (username, password) => {
          const timestamp = Date.now()
          const userData = {
            username: `rt_${username}_${timestamp}`,
            email: `rt_${username}_${timestamp}@test.com`,
            password: password,
          }

          // Create user
          const user = await User.create(userData)

          // Get user as JSON (simulating API response)
          const userJson = user.toPublicJSON()

          // Serialize to JSON string
          const jsonString = JSON.stringify(userJson)

          // Deserialize back
          const parsed = JSON.parse(jsonString)

          // Verify key fields survived round-trip
          const usernameMatch = parsed.username === userJson.username
          const emailMatch = parsed.email === userJson.email
          const roleMatch = parsed.role === userJson.role
          const idMatch = parsed._id.toString() === userJson._id.toString()

          // Cleanup
          await User.findByIdAndDelete(user._id)

          return usernameMatch && emailMatch && roleMatch && idMatch
        }
      ),
      { numRuns: 10 }
    )
  })

  test('auction data survives JSON round-trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 100, max: 10000 }),
        async (title, price) => {
          const timestamp = Date.now()
          const auctionData = {
            title: `RT Auction ${title} ${timestamp}`,
            description: 'Test description for round-trip',
            category: 'Electronics',
            startingPrice: price,
            currentPrice: price,
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            seller: testSeller._id,
            sellerName: testSeller.username,
            status: 'active',
          }

          // Create auction
          const auction = await Auction.create(auctionData)

          // Convert to plain object (simulating API response)
          const auctionObj = auction.toObject()

          // Serialize to JSON string
          const jsonString = JSON.stringify(auctionObj)

          // Deserialize back
          const parsed = JSON.parse(jsonString)

          // Verify key fields survived round-trip
          const titleMatch = parsed.title === auctionObj.title
          const priceMatch = parsed.currentPrice === auctionObj.currentPrice
          const categoryMatch = parsed.category === auctionObj.category
          const statusMatch = parsed.status === auctionObj.status

          // Cleanup
          await Auction.findByIdAndDelete(auction._id)

          return titleMatch && priceMatch && categoryMatch && statusMatch
        }
      ),
      { numRuns: 10 }
    )
  })

  test('bid data survives JSON round-trip', async () => {
    const timestamp = Date.now()

    // Create auction with bids
    const auction = await Auction.create({
      title: 'Bid Round-Trip Test',
      description: 'Test description',
      category: 'Electronics',
      startingPrice: 100,
      currentPrice: 500,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      seller: testSeller._id,
      sellerName: testSeller.username,
      status: 'active',
      bids: [
        {
          bidderId: testSeller._id,
          bidderName: 'Test Bidder',
          amount: 200,
          timestamp: new Date(),
        },
        {
          bidderId: testSeller._id,
          bidderName: 'Test Bidder 2',
          amount: 500,
          timestamp: new Date(),
        },
      ],
    })

    // Convert to plain object
    const auctionObj = auction.toObject()

    // Serialize and deserialize
    const jsonString = JSON.stringify(auctionObj)
    const parsed = JSON.parse(jsonString)

    // Verify bids survived round-trip
    expect(parsed.bids.length).toBe(auctionObj.bids.length)
    expect(parsed.bids[0].amount).toBe(auctionObj.bids[0].amount)
    expect(parsed.bids[1].amount).toBe(auctionObj.bids[1].amount)
    expect(parsed.bids[0].bidderName).toBe(auctionObj.bids[0].bidderName)

    // Cleanup
    await Auction.findByIdAndDelete(auction._id)
  })

  test('nested objects survive JSON round-trip', async () => {
    const complexData = {
      user: {
        name: 'Test User',
        profile: {
          address: '123 Test St',
          phone: '555-1234',
        },
      },
      auction: {
        title: 'Test Auction',
        bids: [
          { amount: 100, bidder: 'User1' },
          { amount: 200, bidder: 'User2' },
        ],
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    }

    // Serialize and deserialize
    const jsonString = JSON.stringify(complexData)
    const parsed = JSON.parse(jsonString)

    // Verify structure survived
    expect(parsed.user.name).toBe(complexData.user.name)
    expect(parsed.user.profile.address).toBe(complexData.user.profile.address)
    expect(parsed.auction.bids.length).toBe(complexData.auction.bids.length)
    expect(parsed.metadata.version).toBe(complexData.metadata.version)
  })
})
