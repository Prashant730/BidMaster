const { Server } = require('socket.io')

let io = null

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://project1-steel-ten.vercel.app',
        process.env.FRONTEND_URL,
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join auction room for real-time updates
    socket.on('joinAuction', (data) => {
      socket.join('auction_' + data.auctionId)
      console.log('Socket ' + socket.id + ' joined auction_' + data.auctionId)
    })

    // Leave auction room
    socket.on('leaveAuction', (data) => {
      socket.leave('auction_' + data.auctionId)
      console.log('Socket ' + socket.id + ' left auction_' + data.auctionId)
    })

    // Join admin room for live activity feed
    socket.on('joinAdminRoom', () => {
      socket.join('admin_room')
      console.log('Socket ' + socket.id + ' joined admin_room')
    })

    // Leave admin room
    socket.on('leaveAdminRoom', () => {
      socket.leave('admin_room')
      console.log('Socket ' + socket.id + ' left admin_room')
    })

    // Handle bid placement from frontend - broadcast to all clients
    socket.on('bidPlace', (data) => {
      console.log('Bid placed:', data)
      // Broadcast to all clients including sender
      io.emit('bidPlaced', data)
      // Also emit to admin room for live activity
      io.to('admin_room').emit('newActivity', {
        type: 'bid',
        message: 'Bid of $' + data.amount + ' placed',
        userName: data.bidderName,
        auctionId: data.auctionId,
        auctionTitle: data.auctionTitle || 'Unknown Auction',
        amount: data.amount,
        timestamp: data.timestamp || new Date(),
      })
    })

    // Handle broadcast bid place (alternative event name)
    socket.on('broadcastBidPlace', (data) => {
      console.log('Broadcasting bid:', data)
      socket.broadcast.emit('bidPlaced', data)
    })

    // Handle auction updates from frontend
    socket.on('auctionUpdate', (data) => {
      console.log('Auction updated:', data)
      io.emit('auctionUpdated', data)
    })

    socket.on('broadcastAuctionUpdate', (data) => {
      socket.broadcast.emit('auctionUpdated', data)
    })

    // Handle auction removal
    socket.on('auctionRemove', (data) => {
      console.log('Auction removed:', data)
      io.emit('auctionRemoved', data)
    })

    // Handle auction creation
    socket.on('auctionCreate', (data) => {
      console.log('Auction created:', data)
      io.emit('auctionCreated', data)
      // Also emit to admin room for live activity
      io.to('admin_room').emit('newActivity', {
        type: 'auction_created',
        message: 'New auction: ' + data.auction.title,
        userName: data.auction.seller,
        auctionId: data.auction.id,
        auctionTitle: data.auction.title,
        amount: data.auction.startingPrice,
        timestamp: new Date(),
      })
    })

    socket.on('broadcastAuctionCreate', (data) => {
      socket.broadcast.emit('auctionCreated', data)
    })

    // Handle auction end
    socket.on('auctionEnd', (data) => {
      console.log('Auction ended:', data)
      io.emit('auctionEnded', data)
      // Also emit to admin room for live activity
      io.to('admin_room').emit('newActivity', {
        type: 'auction_ended',
        message: 'Auction ended',
        auctionId: data.auctionId,
        timestamp: data.endTime || new Date(),
      })
    })

    socket.on('broadcastAuctionEnd', (data) => {
      socket.broadcast.emit('auctionEnded', data)
    })

    // Handle user registration
    socket.on('userRegister', (data) => {
      console.log('User registered:', data)
      io.emit('userRegistered', data)
      // Also emit to admin room for live activity
      io.to('admin_room').emit('newActivity', {
        type: 'user_registered',
        message: 'New user: ' + data.user.name,
        userName: data.user.name,
        userEmail: data.user.email,
        timestamp: new Date(),
      })
    })

    // Handle user updates
    socket.on('userUpdate', (data) => {
      console.log('User updated:', data)
      io.emit('userUpdated', data)
    })

    // Handle user deletion
    socket.on('userDelete', (data) => {
      console.log('User deleted:', data)
      io.emit('userDeleted', data)
    })

    // Handle commission rate updates
    socket.on('commissionRateUpdate', (data) => {
      console.log('Commission rate updated:', data)
      io.emit('commissionRateUpdated', data)
    })

    // Handle bid update relay (for real-time sync across all clients)
    socket.on('bidUpdate', (data) => {
      console.log('Bid update relay:', data)
      io.emit('bidUpdate', data)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}

module.exports = { initializeSocket, getIO }
