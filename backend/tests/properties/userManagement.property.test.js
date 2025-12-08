const fc = require('fast-check')
const request = require('supertest')
const app = require('../../src/app')
const User = require('../../src/models/User')
const { generateToken } = require('../../src/controllers/authController')

/**
 * **Feature: auction-backend, Property 3: User List Completeness**
 * **Validates: Requirements 2.1**
 *
 * For any set of users created in the system, an admin request to get all users
 * should return a list containing all created users.
 */
describe('Property 3: User List Completeness', () => {
  let adminUser
  let adminToken

  beforeAll(async () => {
    // Create admin user for testing
    adminUser = await User.create({
      username: 'admin_test_' + Date.now(),
      email: 'admin_test_' + Date.now() + '@test.com',
      password: 'adminpass123',
      role: 'admin',
      isAdmin: true,
    })
    adminToken = generateToken(adminUser._id)
  })

  afterAll(async () => {
    await User.findByIdAndDelete(adminUser._id)
  })

  test('admin can retrieve all created users', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 5 }), async (numUsers) => {
        const createdUsers = []
        const timestamp = Date.now()

        // Create random users
        for (let i = 0; i < numUsers; i++) {
          const user = await User.create({
            username: `user_${timestamp}_${i}`,
            email: `user_${timestamp}_${i}@test.com`,
            password: 'password123',
          })
          createdUsers.push(user)
        }

        // Get all users as admin
        const res = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`)

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)

        // Verify all created users are in the response
        const returnedIds = res.body.data.map((u) => u._id.toString())
        const allUsersFound = createdUsers.every((u) =>
          returnedIds.includes(u._id.toString())
        )

        // Cleanup
        for (const user of createdUsers) {
          await User.findByIdAndDelete(user._id)
        }

        return allUsersFound
      }),
      { numRuns: 5 }
    )
  })

  test('non-admin cannot access user list', async () => {
    const regularUser = await User.create({
      username: 'regular_' + Date.now(),
      email: 'regular_' + Date.now() + '@test.com',
      password: 'password123',
    })
    const regularToken = generateToken(regularUser._id)

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${regularToken}`)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)

    await User.findByIdAndDelete(regularUser._id)
  })
})

/**
 * **Feature: auction-backend, Property 4: User Status Update Consistency**
 * **Validates: Requirements 2.2, 2.3**
 *
 * For any user and any status transition (active→suspended, active→banned,
 * suspended→active, banned→active), updating the user's status should persist
 * the new status in the database.
 */
describe('Property 4: User Status Update Consistency', () => {
  let adminUser
  let adminToken

  beforeAll(async () => {
    adminUser = await User.create({
      username: 'admin_status_' + Date.now(),
      email: 'admin_status_' + Date.now() + '@test.com',
      password: 'adminpass123',
      role: 'admin',
      isAdmin: true,
    })
    adminToken = generateToken(adminUser._id)
  })

  afterAll(async () => {
    await User.findByIdAndDelete(adminUser._id)
  })

  // Status transition arbitrary
  const statusArbitrary = fc.constantFrom('active', 'suspended', 'banned')

  test('status updates persist correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        statusArbitrary,
        statusArbitrary,
        async (fromStatus, toStatus) => {
          // Create user with initial status
          const testUser = await User.create({
            username:
              'statustest_' +
              Date.now() +
              '_' +
              Math.random().toString(36).slice(2, 7),
            email:
              'statustest_' +
              Date.now() +
              '_' +
              Math.random().toString(36).slice(2, 7) +
              '@test.com',
            password: 'password123',
            status: fromStatus,
          })

          // Update status via API
          const res = await request(app)
            .put(`/api/users/${testUser._id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: toStatus })

          expect(res.status).toBe(200)
          expect(res.body.success).toBe(true)
          expect(res.body.data.status).toBe(toStatus)

          // Verify in database
          const updatedUser = await User.findById(testUser._id)
          const statusPersisted = updatedUser.status === toStatus

          // Cleanup
          await User.findByIdAndDelete(testUser._id)

          return statusPersisted
        }
      ),
      { numRuns: 10 }
    )
  })
})

/**
 * **Feature: auction-backend, Property 5: User Deletion Completeness**
 * **Validates: Requirements 2.4**
 *
 * For any user deleted by an admin, subsequent queries for that user
 * should return no results.
 */
describe('Property 5: User Deletion Completeness', () => {
  let adminUser
  let adminToken

  beforeAll(async () => {
    adminUser = await User.create({
      username: 'admin_delete_' + Date.now(),
      email: 'admin_delete_' + Date.now() + '@test.com',
      password: 'adminpass123',
      role: 'admin',
      isAdmin: true,
    })
    adminToken = generateToken(adminUser._id)
  })

  afterAll(async () => {
    await User.findByIdAndDelete(adminUser._id)
  })

  test('deleted users cannot be found', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 3, maxLength: 8 })
          .filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
        async (uniqueId) => {
          const timestamp = Date.now()
          // Create user
          const testUser = await User.create({
            username: `del_${uniqueId}_${timestamp}`,
            email: `del_${uniqueId}_${timestamp}@test.com`,
            password: 'password123',
          })

          const userId = testUser._id

          // Delete user via API
          const deleteRes = await request(app)
            .delete(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)

          expect(deleteRes.status).toBe(200)
          expect(deleteRes.body.success).toBe(true)

          // Try to get deleted user
          const getRes = await request(app)
            .get(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)

          expect(getRes.status).toBe(404)

          // Verify in database
          const deletedUser = await User.findById(userId)
          return deletedUser === null
        }
      ),
      { numRuns: 5 }
    )
  })
})
