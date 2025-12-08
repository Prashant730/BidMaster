require('dotenv').config()
const mongoose = require('mongoose')

async function checkAllDatabases() {
  try {
    // Connect without specifying database
    const uri = process.env.MONGODB_URI.replace('/auction-platform', '')
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')

    // List all databases
    const admin = mongoose.connection.db.admin()
    const dbs = await admin.listDatabases()

    console.log('\nDatabases on this cluster:')
    console.log('==========================')
    for (const db of dbs.databases) {
      console.log(`- ${db.name} (${(db.sizeOnDisk / 1024).toFixed(2)} KB)`)
    }

    // Check 'test' database for users (default database if no name specified)
    const testDb = mongoose.connection.client.db('test')
    const testUsers = await testDb.collection('users').find({}).toArray()
    console.log('\nUsers in "test" database:', testUsers.length)
    testUsers.forEach((u) => console.log(`  - ${u.email}`))

    // Check 'auction-platform' database
    const auctionDb = mongoose.connection.client.db('auction-platform')
    const auctionUsers = await auctionDb.collection('users').find({}).toArray()
    console.log('\nUsers in "auction-platform" database:', auctionUsers.length)
    auctionUsers.forEach((u) => console.log(`  - ${u.email}`))

    await mongoose.disconnect()
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkAllDatabases()
