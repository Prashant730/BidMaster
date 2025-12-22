const mongoose = require('mongoose')

async function connectDB() {
  try {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      'mongodb+srv://Prashant:ssmhepcsg@cluster0.bbhzvk0.mongodb.net/auction-platform'

    const conn = await mongoose.connect(uri)
    console.log('MongoDB Connected: ' + conn.connection.host)
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB
