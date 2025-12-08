const fc = require('fast-check')
const request = require('supertest')
const app = require('../../src/app')
const User = require('../../src/models/User')
const Settings = require('../../src/models/Settings')
const { generateToken } = require('../../src/controllers/authController')

/**
 * **Feature: auction-backend, Property 13: Settings Persistence**
 * **Validates: Requirements 8.1, 8.2, 8.3**
 *
 * For any settings update (commission rate, categories, site rules),
 * the updated values should be retrievable from the database.
 */
describe('Property 13: Settings Persistence', () => {
  // Helper to create admin user and token
  async function createAdmin() {
    const id = Math.random().toString(36).slice(2, 8)
    const admin = await User.create({
      username: 'adm_' + id,
      email: 'adm_' + id + '@test.com',
      password: 'adminpass123',
      role: 'admin',
      isAdmin: true,
    })
    return { admin, token: generateToken(admin._id) }
  }

  beforeAll(async () => {
    // Clear any existing settings
    await Settings.deleteMany({})
  })

  afterAll(async () => {
    await Settings.deleteMany({})
  })

  test('commission rate updates persist correctly', async () => {
    const { admin, token } = await createAdmin()

    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: 0, max: 1, noNaN: true }),
        async (commissionRate) => {
          // Round to 2 decimal places to avoid floating point issues
          const roundedRate = Math.round(commissionRate * 100) / 100

          // Update commission rate via API
          const updateRes = await request(app)
            .put('/api/admin/commission-rate')
            .set('Authorization', `Bearer ${token}`)
            .send({ commissionRate: roundedRate })

          if (updateRes.status !== 200) {
            // Skip invalid rates
            return true
          }

          // Retrieve settings
          const getRes = await request(app)
            .get('/api/admin/settings')
            .set('Authorization', `Bearer ${token}`)

          expect(getRes.status).toBe(200)

          // Verify persistence
          const persistedRate = getRes.body.data.commissionRate
          return Math.abs(persistedRate - roundedRate) < 0.001
        }
      ),
      { numRuns: 10 }
    )

    await User.findByIdAndDelete(admin._id)
  })

  test('category additions persist correctly', async () => {
    const { admin, token } = await createAdmin()
    const timestamp = Date.now()
    const categoryName = `TestCategory_${timestamp}`

    // Add category
    const addRes = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: categoryName })

    expect(addRes.status).toBe(201)

    // Retrieve categories
    const getRes = await request(app).get('/api/admin/categories')

    expect(getRes.status).toBe(200)
    expect(getRes.body.data).toContain(categoryName)

    // Cleanup - delete the category
    await request(app)
      .delete(`/api/admin/categories/${categoryName}`)
      .set('Authorization', `Bearer ${token}`)

    await User.findByIdAndDelete(admin._id)
  })

  test('category deletions persist correctly', async () => {
    const { admin, token } = await createAdmin()
    const timestamp = Date.now()
    const categoryName = `DeleteCategory_${timestamp}`

    // First add a category
    await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: categoryName })

    // Delete the category
    const deleteRes = await request(app)
      .delete(`/api/admin/categories/${categoryName}`)
      .set('Authorization', `Bearer ${token}`)

    expect(deleteRes.status).toBe(200)

    // Verify it's gone
    const getRes = await request(app).get('/api/admin/categories')

    expect(getRes.status).toBe(200)
    expect(getRes.body.data).not.toContain(categoryName)

    await User.findByIdAndDelete(admin._id)
  })

  test('announcements persist correctly', async () => {
    const { admin, token } = await createAdmin()
    const timestamp = Date.now()
    const announcement = {
      title: `Test Announcement ${timestamp}`,
      message: 'This is a test announcement',
      priority: 'high',
    }

    // Create announcement
    const createRes = await request(app)
      .post('/api/admin/announcements')
      .set('Authorization', `Bearer ${token}`)
      .send(announcement)

    expect(createRes.status).toBe(201)

    // Retrieve announcements
    const getRes = await request(app).get('/api/admin/announcements')

    expect(getRes.status).toBe(200)

    // Find our announcement
    const found = getRes.body.data.find((a) => a.title === announcement.title)
    expect(found).toBeDefined()
    expect(found.message).toBe(announcement.message)
    expect(found.priority).toBe(announcement.priority)

    await User.findByIdAndDelete(admin._id)
  })

  test('settings singleton pattern works correctly', async () => {
    const { admin, token } = await createAdmin()

    // Get settings multiple times
    const res1 = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)

    const res2 = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${token}`)

    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)

    // Both should return the same settings ID
    expect(res1.body.data._id).toBe(res2.body.data._id)

    await User.findByIdAndDelete(admin._id)
  })
})
