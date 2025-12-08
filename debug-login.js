// BidMaster Login Debugging Script
// Copy and paste this entire code into your browser console (F12 > Console)
// This will help diagnose login issues

;(function debugLogin() {
  console.log('🔍 BidMaster Login Diagnostics')
  console.log('================================\n')

  // 1. Check localStorage
  console.log('1️⃣ Checking localStorage:')
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  console.log('  Token exists:', !!token)
  console.log('  User data exists:', !!user)
  if (token) {
    console.log('  Token:', token.substring(0, 50) + '...')
  }
  if (user) {
    try {
      const userData = JSON.parse(user)
      console.log('  User email:', userData.email)
      console.log('  User role:', userData.role)
    } catch (e) {
      console.log('  ⚠️ User data is corrupted:', e.message)
    }
  }
  console.log()

  // 2. Check API connection
  console.log('2️⃣ Testing API connection:')
  const apiUrl = 'http://localhost:5000/api/health'
  fetch(apiUrl)
    .then((response) => {
      console.log('  ✅ API is reachable')
      console.log('  Status:', response.status)
      return response.json()
    })
    .then((data) => {
      console.log('  Response:', data)
    })
    .catch((error) => {
      console.log('  ❌ API is NOT reachable:', error.message)
    })
  console.log()

  // 3. Quick Login Test Function
  console.log('3️⃣ Quick Login Test Function:')
  console.log('  Use: quickLoginTest("email", "password")')
  console.log()

  window.quickLoginTest = async function (email, password) {
    console.log(`\n🔐 Testing login for: ${email}`)
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Login successful!')
        console.log('Token:', data.token.substring(0, 50) + '...')
        console.log('User:', data.email)
        return data
      } else {
        console.log('❌ Login failed:', data.message)
        return data
      }
    } catch (error) {
      console.log('❌ Error:', error.message)
      return null
    }
  }

  // 4. Clear data function
  console.log('4️⃣ Clear Cache Function:')
  console.log('  Use: clearAndReload() to clear all cached data and reload')
  console.log()

  window.clearAndReload = function () {
    console.log('🧹 Clearing browser data...')
    localStorage.clear()
    sessionStorage.clear()
    console.log('✅ Data cleared, reloading page...')
    location.reload()
  }

  // 5. Session info
  console.log('5️⃣ Current Session Info:')
  console.log('  Frontend URL:', window.location.href)
  console.log('  API Base URL: http://localhost:5000/api')
  console.log('  Has valid token:', !!token && token.length > 0)
  console.log()

  console.log('================================')
  console.log('💡 Helpful Commands:')
  console.log('  - quickLoginTest("admin@auction.com", "admin123")')
  console.log('  - clearAndReload()')
  console.log('  - localStorage.clear()')
  console.log('  - sessionStorage.clear()')
  console.log('  - location.reload()')
  console.log('================================')
})()
