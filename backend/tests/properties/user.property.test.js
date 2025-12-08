const fc = require('fast-check')
const bcrypt = require('bcryptjs')
const User = require('../../src/models/User')

/**
 * **Feature: auction-backend, Property 2: Password Security**
 * **Validates: Requirements 1.6**
 *
 * For any user created in the system, the stored password should not equal
 * the plaintext password and should be verifiable using bcrypt.compare.
 */
describe('Property 2: Password Security', () => {
  // Generate valid password strings
  const passwordArbitrary = fc
    .string({ minLength: 6, maxLength: 50 })
    .filter((s) => s.trim().length >= 6)

  test('stored password is hashed and verifiable', async () => {
    await fc.assert(
      fc.asyncProperty(
        passwordArbitrary,
        fc
          .string({ minLength: 3, maxLength: 5 })
          .filter((s) => /^[a-zA-Z0-9]+$/.test(s)),
        async (plainPassword, uniqueId) => {
          // Keep username under 30 chars: 'u_' (2) + uniqueId (5) + '_' (1) + timestamp (13) = 21 max
          const timestamp = Date.now().toString().slice(-8)
          const userData = {
            username: 'u_' + uniqueId + '_' + timestamp,
            email: 't_' + uniqueId + '_' + timestamp + '@example.com',
            password: plainPassword,
          }

          const user = new User(userData)
          await user.save()

          // Fetch user with password field
          const savedUser = await User.findById(user._id).select('+password')

          // Property 1: Stored password should NOT equal plaintext
          const passwordNotPlaintext = savedUser.password !== plainPassword

          // Property 2: Stored password should be verifiable with bcrypt
          const passwordVerifiable = await bcrypt.compare(
            plainPassword,
            savedUser.password
          )

          // Property 3: User's comparePassword method should work
          const methodWorks = await savedUser.comparePassword(plainPassword)

          // Clean up
          await User.findByIdAndDelete(user._id)

          return passwordNotPlaintext && passwordVerifiable && methodWorks
        }
      ),
      { numRuns: 5 } // Reduced for faster test execution
    )
  }, 60000)

  test('wrong password fails verification', async () => {
    await fc.assert(
      fc.asyncProperty(
        passwordArbitrary,
        passwordArbitrary.filter((p) => p.length >= 6),
        async (correctPassword, wrongPassword) => {
          // Skip if passwords happen to be the same
          if (correctPassword === wrongPassword) return true

          const userData = {
            username: 'testuser_' + Date.now(),
            email: 'test_' + Date.now() + '@example.com',
            password: correctPassword,
          }

          const user = new User(userData)
          await user.save()

          const savedUser = await User.findById(user._id).select('+password')
          const wrongPasswordFails = !(await savedUser.comparePassword(
            wrongPassword
          ))

          await User.findByIdAndDelete(user._id)

          return wrongPasswordFails
        }
      ),
      { numRuns: 5 }
    )
  }, 60000)
})
