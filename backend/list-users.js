require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./src/models/User')

async function listAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    console.log('Database:', mongoose.connection.name)
    console.log('Host:', mongoose.connection.host)

    const users = await User.find({}).select('email username createdAt')

    console.log('\nAll users in database:')
    console.log('======================')
    users.forEach((user) => {
      console.log(
        `- ${user.email} (${user.username}) - Created: ${user.createdAt}`
      )
    })
    console.log(`\nTotal users: ${users.length}`)

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error.message)
  }
}

listAllUsers()
