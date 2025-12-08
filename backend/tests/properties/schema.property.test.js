const fc = require('fast-check')
const mongoose = require('mongoose')
const User = require('../../src/models/User')
const Auction = require('../../src/models/Auction')

/**
 * **Feature: auction-backend, Property 15: Schema Validation Enforcement**
 * **Validates: Requirements 9.1, 9.2**
 *
 * For any user or auction data missing required fields, the database
 * should reject the creation with a validation error.
 */
describe('Property 15: Schema Validation Enforcement', () => {
  describe('User Schema Validation', () => {
    test('user without required fields fails validation', async () => {
      // Test missing username
      const userNoUsername = new User({
        email: 'test@example.com',
        password: 'password123',
      })
      await expect(userNoUsername.save()).rejects.toThrow()

      // Test missing email
      const userNoEmail = new User({
        username: 'testuser',
        password: 'password123',
      })
      await expect(userNoEmail.save()).rejects.toThrow()

      // Test missing password
      const userNoPassword = new User({
        username: 'testuser',
        email: 'test@example.com',
      })
      await expect(userNoPassword.save()).rejects.toThrow()
    })

    test('user with invalid email fails validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .string({ minLength: 1, maxLength: 50 })
            .filter((s) => !s.includes('@') || !s.includes('.')),
          async (invalidEmail) => {
            const user = new User({
              username: 'testuser_' + Date.now(),
              email: invalidEmail,
              password: 'password123',
            })

            try {
              await user.save()
              return false // Should have thrown
            } catch (error) {
              return error.name === 'ValidationError'
            }
          }
        ),
        { numRuns: 10 }
      )
    })

    test('user with short password fails validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 5 }),
          async (shortPassword) => {
            const user = new User({
              username: 'testuser_' + Date.now(),
              email: 'test_' + Date.now() + '@example.com',
              password: shortPassword,
            })

            try {
              await user.save()
              return false // Should have thrown
            } catch (error) {
              return error.name === 'ValidationError'
            }
          }
        ),
        { numRuns: 10 }
      )
    })

    test('user with valid data passes validation', async () => {
      const user = new User({
        username: 'validuser_' + Date.now(),
        email: 'valid_' + Date.now() + '@example.com',
        password: 'validpassword123',
      })

      const savedUser = await user.save()
      expect(savedUser._id).toBeDefined()
      expect(savedUser.username).toContain('validuser')

      await User.findByIdAndDelete(savedUser._id)
    })
  })

  describe('Auction Schema Validation', () => {
    let testSeller

    beforeEach(async () => {
      testSeller = await User.create({
        username: 'seller_' + Date.now(),
        email: 'seller_' + Date.now() + '@example.com',
        password: 'password123',
        role: 'seller',
      })
    })

    afterEach(async () => {
      if (testSeller) {
        await User.findByIdAndDelete(testSeller._id)
      }
    })

    test('auction without required fields fails validation', async () => {
      // Test missing title
      const auctionNoTitle = new Auction({
        description: 'Test description',
        category: 'Electronics',
        startingPrice: 100,
        currentPrice: 100,
        endTime: new Date(Date.now() + 86400000),
        seller: testSeller._id,
        sellerName: testSeller.username,
      })
      await expect(auctionNoTitle.save()).rejects.toThrow()

      // Test missing description
      const auctionNoDesc = new Auction({
        title: 'Test Auction',
        category: 'Electronics',
        startingPrice: 100,
        currentPrice: 100,
        endTime: new Date(Date.now() + 86400000),
        seller: testSeller._id,
        sellerName: testSeller.username,
      })
      await expect(auctionNoDesc.save()).rejects.toThrow()

      // Test missing seller
      const auctionNoSeller = new Auction({
        title: 'Test Auction',
        description: 'Test description',
        category: 'Electronics',
        startingPrice: 100,
        currentPrice: 100,
        endTime: new Date(Date.now() + 86400000),
        sellerName: 'Test Seller',
      })
      await expect(auctionNoSeller.save()).rejects.toThrow()
    })

    test('auction with valid data passes validation', async () => {
      const auction = new Auction({
        title: 'Valid Auction',
        description: 'Valid description',
        category: 'Electronics',
        startingPrice: 100,
        currentPrice: 100,
        endTime: new Date(Date.now() + 86400000),
        seller: testSeller._id,
        sellerName: testSeller.username,
      })

      const savedAuction = await auction.save()
      expect(savedAuction._id).toBeDefined()
      expect(savedAuction.title).toBe('Valid Auction')

      await Auction.findByIdAndDelete(savedAuction._id)
    })

    test('auction with negative price fails validation', async () => {
      const auction = new Auction({
        title: 'Test Auction',
        description: 'Test description',
        category: 'Electronics',
        startingPrice: -100,
        currentPrice: -100,
        endTime: new Date(Date.now() + 86400000),
        seller: testSeller._id,
        sellerName: testSeller.username,
      })

      await expect(auction.save()).rejects.toThrow()
    })
  })
})
