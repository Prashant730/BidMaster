require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./src/models/User')

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const user = await User.findOne({ email: 'admin@auction.com' }).select(
      '+password'
    )

    if (user) {
      console.log('User found: YES')
      console.log('Email:', user.email)
      console.log('Username:', user.username)
      console.log('Password hash:', user.password)
      console.log(
        'Is hashed (starts with $2):',
        user.password?.startsWith('$2')
      )

      // Test password comparison
      const isMatch = await user.comparePassword('admin123')
      console.log('Password "admin123" matches:', isMatch)
    } else {
      console.log('User NOT found')
    }

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkUser()
