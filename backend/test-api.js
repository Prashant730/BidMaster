#!/usr/bin/env node

/**
 * BidMaster API Test Script
 * Tests all endpoints to verify backend-frontend integration
 */

const http = require('http')

const baseURL = 'http://localhost:5000/api'
const tests = []

function test(name, method, endpoint, body = null, expectedStatus = 200) {
  tests.push({ name, method, endpoint, body, expectedStatus })
}

// Define tests
test('Health Check', 'GET', '/health', null, 200)
test(
  'Register User',
  'POST',
  '/auth/register',
  {
    username: 'testuser123',
    email: 'testuser123@test.com',
    password: 'test123456',
    role: 'bidder',
  },
  201
)

test(
  'Login Admin',
  'POST',
  '/auth/login',
  {
    email: 'admin@auction.com',
    password: 'admin123',
  },
  200
)

test('Get All Auctions', 'GET', '/auctions', null, 200)

// Run tests
async function runTests() {
  console.log('\n🧪 BidMaster API Test Suite\n')
  console.log('═'.repeat(60))

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      const result = await makeRequest(test)
      if (result.status === test.expectedStatus) {
        console.log(`✅ PASS: ${test.name}`)
        passed++
      } else {
        console.log(
          `❌ FAIL: ${test.name} (Expected ${test.expectedStatus}, got ${result.status})`
        )
        failed++
      }
    } catch (error) {
      console.log(`❌ ERROR: ${test.name} - ${error.message}`)
      failed++
    }
  }

  console.log('═'.repeat(60))
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`)

  if (failed === 0) {
    console.log(
      '✅ All tests passed! Backend-Frontend integration is working!\n'
    )
    process.exit(0)
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Check backend logs.\n`)
    process.exit(1)
  }
}

function makeRequest(testCase) {
  return new Promise((resolve, reject) => {
    const url = new URL(testCase.endpoint, baseURL)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data ? JSON.parse(data) : null,
        })
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    if (testCase.body) {
      req.write(JSON.stringify(testCase.body))
    }

    req.end()
  })
}

// Run tests if not already running
runTests().catch(console.error)
