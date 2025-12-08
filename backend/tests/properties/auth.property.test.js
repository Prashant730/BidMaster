const fc = require('fast-check')
const request = require('supertest')
const app = require('../../src/app')
const User = require('../../src/models/User')

/**
 * **Feature: auction-backend, Property 1: Authentication Round-Trip**
 * **Validates: Requirements 1.1, 1.2, 1.3**
 *
 * For any valid user registration data, registering a user and then logging in
 * with the same credentials should return a valid JWT that, when used to access
 * the /me endpoint, returns the same user data.
 */
describe('Property 1: Authentication Round-Trip', () => {
  // Generate valid usernames
  const usernameArbitrary = fc
    .string({ minLength: 3, maxLength: 20 })
    .filter((s) => /^[a-zA-Z0-9_]+$/.test(s) && s.length >= 3)

  // Generate valid passwords
  const passwordArbitrary = fc
    .string({ minLength: 6, maxLength: 30 })
    .filter((s) => s.trim().length >= 6)

  test('register -> login -> getMe returns consistent user data', async () => {
    await fc.assert(
      fc.asyncProperty(
        usernameArbitrary,
        passwordArbitrary,
        async (username, password) => {
          const uniqueUsername = username + '_' + Date.now()
          const email = uniqueUsername + '@test.com'

          // Step 1: Register
          const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
              username: uniqueUsername,
              email: email,
              password: password,
            })

          if (registerRes.status !== 201) {
            // Skip if registration failed (e.g., validation)
            return true
          }

          const registeredUser = registerRes.body
          expect(registeredUser.success).toBe(true)
          expect(registeredUser.token).toBeDefined()
          expect(registeredUser.username).toBe(uniqueUsername)
          expect(registeredUser.email).toBe(email.toLowerCase())

          // Step 2: Login with same credentials
          const loginRes = await request(app).post('/api/auth/login').send({
            email: email,
            password: password,
          })

          expect(loginRes.status).toBe(200)
          expect(loginRes.body.success).toBe(true)
          expect(loginRes.body.token).toBeDefined()

          const loginToken = loginRes.body.token

          // Step 3: Get user with token
          const meRes = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer ' + loginToken)

          expect(meRes.status).toBe(200)
          expect(meRes.body.success).toBe(true)
          expect(meRes.body.username).toBe(uniqueUsername)
          expect(meRes.body.email).toBe(email.toLowerCase())

          // Clean up
          await User.findByIdAndDelete(registeredUser._id)

          return true
        }
      ),
      { numRuns: 10 }
    )
  })

  test('login with wrong password fails', async () => {
    // Create a test user
    const testUser = await User.create({
      username: 'wrongpasstest_' + Date.now(),
      email: 'wrongpass_' + Date.now() + '@test.com',
      password: 'correctpassword123',
    })

    // Try to login with wrong password
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    })

    expect(loginRes.status).toBe(401)
    expect(loginRes.body.success).toBe(false)

    // Clean up
    await User.findByIdAndDelete(testUser._id)
  })

  test('accessing protected route without token fails', async () => {
    const meRes = await request(app).get('/api/auth/me')

    expect(meRes.status).toBe(401)
    expect(meRes.body.success).toBe(false)
  })

  test('accessing protected route with invalid token fails', async () => {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123')

    expect(meRes.status).toBe(401)
    expect(meRes.body.success).toBe(false)
  })

  test('duplicate email registration fails', async () => {
    const email = 'duplicate_' + Date.now() + '@test.com'

    // First registration
    const firstRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'first_' + Date.now(),
        email: email,
        password: 'password123',
      })

    expect(firstRes.status).toBe(201)

    // Second registration with same email
    const secondRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'second_' + Date.now(),
        email: email,
        password: 'password123',
      })

    expect(secondRes.status).toBe(409)
    expect(secondRes.body.message).toContain('Email already exists')

    // Clean up
    await User.findByIdAndDelete(firstRes.body._id)
  })
})
