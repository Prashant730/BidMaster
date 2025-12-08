const fc = require('fast-check')
const request = require('supertest')
const app = require('../../src/app')
const User = require('../../src/models/User')
const { generateToken } = require('../../src/controllers/authController')

/**
 * **Feature: auction-backend, Property 6: Seller Approval Workflow Consistency**
 * **Validates: Requirements 3.2, 3.3**
 *
 * For any user with a pending seller request, approving should set role to 'seller'
 * and isValidated to true, while rejecting should set sellerStatus to 'rejected'.
 */
describe('Property 6: Seller Approval Workflow Consistency', () => {
  test('approving pending seller sets correct fields', async () => {
    // Create admin for this test
    const adminUser = await User.create({
      username: 'admin_approve_' + Date.now(),
      email: 'admin_approve_' + Date.now() + '@test.com',
      password: 'adminpass123',
      role: 'admin',
      isAdmin: true,
    })
    const adminToken = generateToken(adminUser._id)

    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 3, maxLength: 8 })
          .filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
        async (uniqueId) => {
          const timestamp = Date.now()
          // Create user with pending seller request
          const pendingUser = await User.create({
            username: `pending_${uniqueId}_${timestamp}`,
            email: `pending_${uniqueId}_${timestamp}@test.com`,
            password: 'password123',
            role: 'seller',
            sellerStatus: 'pending',
            isValidated: false,
            businessName: 'Test Business',
            businessType: 'Retail',
            description: 'Test description',
          })

          // Approve seller
          const res = await request(app)
            .put(`/api/users/${pendingUser._id}/approve-seller`)
            .set('Authorization', `Bearer ${adminToken}`)

          expect(res.status).toBe(200)
          expect(res.body.success).toBe(true)

          // Verify in database
          const approvedUser = await User.findById(pendingUser._id)
          const correctRole = approvedUser.role === 'seller'
          const correctStatus = approvedUser.sellerStatus === 'approved'
          const isValidated = approvedUser.isValidated === true

          // Cleanup
          await User.findByIdAndDelete(pendingUser._id)

          return correctRole && correctStatus && isValidated
        }
      ),
      { numRuns: 5 }
    )

    // Cleanup admin
    await User.findByIdAndDelete(adminUser._id)
  })

  test('rejecting pending seller sets correct fields', async () => {
    // Create admin for this test
    const adminUser = await User.create({
      username: 'admin_reject_' + Date.now(),
      email: 'admin_reject_' + Date.now() + '@test.com',
      password: 'adminpass123',
      role: 'admin',
      isAdmin: true,
    })
    const adminToken = generateToken(adminUser._id)

    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 3, maxLength: 8 })
          .filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
        async (uniqueId) => {
          const timestamp = Date.now()
          // Create user with pending seller request
          const pendingUser = await User.create({
            username: `reject_${uniqueId}_${timestamp}`,
            email: `reject_${uniqueId}_${timestamp}@test.com`,
            password: 'password123',
            role: 'seller',
            sellerStatus: 'pending',
            isValidated: false,
            businessName: 'Test Business',
            businessType: 'Retail',
            description: 'Test description',
          })

          // Reject seller
          const res = await request(app)
            .put(`/api/users/${pendingUser._id}/reject-seller`)
            .set('Authorization', `Bearer ${adminToken}`)

          expect(res.status).toBe(200)
          expect(res.body.success).toBe(true)

          // Verify in database
          const rejectedUser = await User.findById(pendingUser._id)
          const correctRole = rejectedUser.role === 'bidder'
          const correctStatus = rejectedUser.sellerStatus === 'rejected'
          const isValidated = rejectedUser.isValidated === true

          // Cleanup
          await User.findByIdAndDelete(pendingUser._id)

          return correctRole && correctStatus && isValidated
        }
      ),
      { numRuns: 5 }
    )

    // Cleanup admin
    await User.findByIdAndDelete(adminUser._id)
  })
})

/**
 * **Feature: auction-backend, Property 7: Pending Sellers Filter Accuracy**
 * **Validates: Requirements 3.4**
 *
 * For any set of users with various seller statuses, the pending sellers endpoint
 * should return exactly those users with sellerStatus='pending'.
 */
describe('Property 7: Pending Sellers Filter Accuracy', () => {
  let adminUser
  let adminToken

  beforeAll(async () => {
    adminUser = await User.create({
      username: 'admin_filter_' + Date.now(),
      email: 'admin_filter_' + Date.now() + '@test.com',
      password: 'adminpass123',
      role: 'admin',
      isAdmin: true,
    })
    adminToken = generateToken(adminUser._id)
  })

  afterAll(async () => {
    await User.findByIdAndDelete(adminUser._id)
  })

  // Seller status arbitrary
  const sellerStatusArbitrary = fc.constantFrom(
    'none',
    'pending',
    'approved',
    'rejected'
  )

  test('pending sellers endpoint returns only pending users', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(sellerStatusArbitrary, { minLength: 3, maxLength: 8 }),
        async (statuses) => {
          const timestamp = Date.now()
          const createdUsers = []

          // Create users with various seller statuses
          for (let i = 0; i < statuses.length; i++) {
            const user = await User.create({
              username: `filter_${timestamp}_${i}`,
              email: `filter_${timestamp}_${i}@test.com`,
              password: 'password123',
              sellerStatus: statuses[i],
              role: statuses[i] === 'approved' ? 'seller' : 'bidder',
              isValidated: statuses[i] !== 'pending',
            })
            createdUsers.push(user)
          }

          // Get pending sellers
          const res = await request(app)
            .get('/api/users/pending-sellers')
            .set('Authorization', `Bearer ${adminToken}`)

          expect(res.status).toBe(200)
          expect(res.body.success).toBe(true)

          // Count expected pending users from our created set
          const expectedPendingIds = createdUsers
            .filter((u) => u.sellerStatus === 'pending')
            .map((u) => u._id.toString())

          // Check that all our pending users are in the response
          const returnedIds = res.body.data.map((u) => u._id.toString())
          const allPendingFound = expectedPendingIds.every((id) =>
            returnedIds.includes(id)
          )

          // Check that no non-pending users from our set are in the response
          const nonPendingIds = createdUsers
            .filter((u) => u.sellerStatus !== 'pending')
            .map((u) => u._id.toString())
          const noNonPendingIncluded = nonPendingIds.every(
            (id) => !returnedIds.includes(id)
          )

          // Cleanup
          for (const user of createdUsers) {
            await User.findByIdAndDelete(user._id)
          }

          return allPendingFound && noNonPendingIncluded
        }
      ),
      { numRuns: 5 }
    )
  })

  test('submitting seller request creates pending status', async () => {
    const timestamp = Date.now()
    // Create regular user
    const regularUser = await User.create({
      username: `regular_${timestamp}`,
      email: `regular_${timestamp}@test.com`,
      password: 'password123',
    })
    const userToken = generateToken(regularUser._id)

    // Submit seller request
    const res = await request(app)
      .post('/api/users/seller-request')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        businessName: 'Test Business',
        businessType: 'Retail',
        description: 'Test description',
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    // Verify user is now pending
    const updatedUser = await User.findById(regularUser._id)
    expect(updatedUser.sellerStatus).toBe('pending')
    expect(updatedUser.role).toBe('seller')
    expect(updatedUser.isValidated).toBe(false)

    // Cleanup
    await User.findByIdAndDelete(regularUser._id)
  })
})
