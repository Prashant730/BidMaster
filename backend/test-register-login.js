const https = require('https')

// First register a new user
const registerData = JSON.stringify({
  username: 'testuser123',
  email: 'testuser123@test.com',
  password: 'test123456',
})

const registerOptions = {
  hostname: 'bidmaster-h63t.onrender.com',
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length,
  },
}

console.log('Registering new user...')
const registerReq = https.request(registerOptions, (res) => {
  let body = ''
  res.on('data', (chunk) => (body += chunk))
  res.on('end', () => {
    console.log('Register Status:', res.statusCode)
    console.log('Register Response:', body)

    // Now try to login with the same credentials
    const loginData = JSON.stringify({
      email: 'testuser123@test.com',
      password: 'test123456',
    })

    const loginOptions = {
      hostname: 'bidmaster-h63t.onrender.com',
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length,
      },
    }

    console.log('\nTrying to login with same credentials...')
    const loginReq = https.request(loginOptions, (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        console.log('Login Status:', res.statusCode)
        console.log('Login Response:', body)
      })
    })

    loginReq.on('error', (e) => console.error('Login Error:', e.message))
    loginReq.write(loginData)
    loginReq.end()
  })
})

registerReq.on('error', (e) => console.error('Register Error:', e.message))
registerReq.write(registerData)
registerReq.end()
