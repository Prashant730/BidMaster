const { Server } = require('socket.io')

let io = null

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
