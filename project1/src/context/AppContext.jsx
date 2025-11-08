import React, { createContext, useContext, useState, useEffect } from 'react'
import { getSocket } from '../services/socket.js'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children, initialAuctions = [], initialUsers = [], initialCommissionRate = 0.05 }) => {
  const [auctions, setAuctions] = useState(initialAuctions)
  const [users, setUsers] = useState(initialUsers)
  const [commissionRate, setCommissionRate] = useState(initialCommissionRate)

  useEffect(() => {
    // Connect to socket for real-time updates
    const socket = getSocket()

    // Listen for bid updates from users
    socket.on('bidPlaced', (data) => {
      console.log('Real-time bid update received:', data)
      setAuctions(prev => prev.map(auction => {
        if (auction.id === data.auctionId) {
          return {
            ...auction,
            currentPrice: data.amount,
            bids: [...auction.bids, {
              bidder: data.bidderName,
              amount: data.amount,
              time: new Date(data.timestamp || Date.now())
            }]
          }
        }
        return auction
      }))
    })

    // Listen for auction updates from admin
    socket.on('auctionUpdated', (data) => {
      console.log('Real-time auction update received:', data)
      setAuctions(prev => prev.map(auction => {
        if (auction.id === data.auctionId) {
          return { ...auction, ...data.updates }
        }
        return auction
      }))
    })

    // Listen for auction removal from admin
    socket.on('auctionRemoved', (data) => {
      console.log('Real-time auction removal received:', data)
      setAuctions(prev => prev.filter(auction => auction.id !== data.auctionId))
    })

    // Listen for auction creation
    socket.on('auctionCreated', (data) => {
      console.log('Real-time auction creation received:', data)
      setAuctions(prev => [data.auction, ...prev])
    })

    // Listen for auction ended event (broadcasted when auction time expires)
    socket.on('auctionEnded', (data) => {
      console.log('Real-time auction ended received:', data)
      setAuctions(prev => prev.map(auction => {
        if (auction.id === data.auctionId) {
          return {
            ...auction,
            status: 'ended',
            endTime: data.endTime || auction.endTime
          }
        }
        return auction
      }))
    })

    // Listen for user updates from admin
    socket.on('userUpdated', (data) => {
      console.log('Real-time user update received:', data)
      setUsers(prev => prev.map(user => {
        if (user.email === data.userEmail) {
          return { ...user, ...data.updates }
        }
        return user
      }))
    })

    // Listen for commission rate updates from admin
    socket.on('commissionRateUpdated', (data) => {
      console.log('Real-time commission rate update received:', data)
      setCommissionRate(data.commissionRate)
    })

    // Listen for new user registration
    socket.on('userRegistered', (data) => {
      console.log('Real-time user registration received:', data)
      setUsers(prev => {
        const exists = prev.find(u => u.email === data.user.email)
        return exists ? prev : [...prev, data.user]
      })
    })

    return () => {
      socket.off('bidPlaced')
      socket.off('auctionUpdated')
      socket.off('auctionRemoved')
      socket.off('auctionCreated')
      socket.off('auctionEnded')
      socket.off('userUpdated')
      socket.off('commissionRateUpdated')
      socket.off('userRegistered')
    }
  }, [])

  // Update auction function that emits socket event
  const updateAuction = (auctionId, updates) => {
    setAuctions(prev => prev.map(auction => {
      if (auction.id === auctionId) {
        const updated = { ...auction, ...updates }
        // Emit socket event for real-time sync
        const socket = getSocket()
        socket.emit('auctionUpdate', {
          auctionId,
          updates
        })
        // Also broadcast to all clients (server should handle this, but we emit for consistency)
        socket.emit('broadcastAuctionUpdate', {
          auctionId,
          updates
        })
        return updated
      }
      return auction
    }))
  }

  // Remove auction function that emits socket event
  const removeAuction = (auctionId) => {
    setAuctions(prev => prev.filter(auction => auction.id !== auctionId))
    // Emit socket event for real-time sync
    const socket = getSocket()
    socket.emit('auctionRemove', { auctionId })
  }

  // Update user function that emits socket event
  const updateUser = (userEmail, updates) => {
    setUsers(prev => prev.map(user => {
      if (user.email === userEmail) {
        const updated = { ...user, ...updates }
        // Emit socket event for real-time sync
        const socket = getSocket()
        socket.emit('userUpdate', {
          userEmail,
          updates
        })
        return updated
      }
      return user
    }))
  }

  // Update commission rate function that emits socket event
  const updateCommissionRate = (newRate) => {
    setCommissionRate(newRate)
    // Emit socket event for real-time sync
    const socket = getSocket()
    socket.emit('commissionRateUpdate', { commissionRate: newRate })
  }

  // Place bid function that emits socket event
  const placeBid = (auctionId, bidData) => {
    // Check if auction has ended before allowing bid
    const auction = auctions.find(a => a.id === auctionId)
    if (!auction) {
      return { success: false, message: 'Auction not found' }
    }

    // Convert endTime to timestamp if it's a Date object
    const endTime = auction.endTime instanceof Date ? auction.endTime.getTime() : auction.endTime
    const now = Date.now()

    if (endTime <= now) {
      return { success: false, message: 'This auction has ended' }
    }

    const { bidderName, amount } = bidData
    const newBid = {
      bidder: bidderName,
      amount: amount,
      time: new Date()
    }

    setAuctions(prev => prev.map(auction => {
      if (auction.id === auctionId) {
        return {
          ...auction,
          currentPrice: amount,
          bids: [...auction.bids, newBid]
        }
      }
      return auction
    }))

    // Emit socket event for real-time sync
    const socket = getSocket()
    socket.emit('bidPlace', {
      auctionId,
      bidderName,
      amount,
      timestamp: Date.now()
    })
    // Also broadcast to all clients (server should handle this, but we emit for consistency)
    socket.emit('broadcastBidPlace', {
      auctionId,
      bidderName,
      amount,
      timestamp: Date.now()
    })

    return { success: true }
  }

  // Add user function that emits socket event
  const addUser = (user) => {
    setUsers(prev => {
      const exists = prev.find(u => u.email === user.email)
      if (exists) {
        return prev.map(u => (u.email === user.email ? { ...u, ...user } : u))
      }
      // Emit socket event for real-time sync
      const socket = getSocket()
      socket.emit('userRegister', { user })
      return [...prev, user]
    })
  }

  // Delete user function that emits socket event
  const deleteUser = (userEmail) => {
    setUsers(prev => prev.filter(user => user.email !== userEmail))
    // Emit socket event for real-time sync
    const socket = getSocket()
    socket.emit('userDelete', { userEmail })
  }

  // Create auction function that emits socket event
  const createAuction = (auctionData) => {
    // Generate a unique ID for the new auction
    const newId = auctions.length > 0 ? Math.max(...auctions.map(a => a.id), 0) + 1 : 1

    // Calculate end time based on duration
    const durationHours = parseInt(auctionData.duration) || 24
    const endTime = Date.now() + (durationHours * 60 * 60 * 1000)

    // Create the new auction object
    const newAuction = {
      id: newId,
      title: auctionData.title,
      description: auctionData.description,
      category: auctionData.category,
      startingPrice: parseFloat(auctionData.startingPrice),
      currentPrice: parseFloat(auctionData.startingPrice),
      image: auctionData.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
      endTime: endTime,
      bids: [],
      seller: auctionData.seller || (auctionData.user?.name || 'Anonymous'),
      status: 'active'
    }

    // Add to state
    setAuctions(prev => [newAuction, ...prev])

    // Emit socket event for real-time sync
    const socket = getSocket()
    socket.emit('auctionCreate', { auction: newAuction })
    socket.emit('broadcastAuctionCreate', { auction: newAuction })

    return newAuction
  }

  // Automatic auction ending mechanism - checks every second for expired auctions
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now()
      const endedAuctions = []

      setAuctions(prev => {
        return prev.map(auction => {
          // Convert endTime to timestamp if it's a Date object
          const endTime = auction.endTime instanceof Date ? auction.endTime.getTime() : auction.endTime

          // Check if auction should be ended
          if (endTime <= now && auction.status !== 'ended') {
            endedAuctions.push(auction.id)
            return {
              ...auction,
              status: 'ended'
            }
          }
          return auction
        })
      })

      // Broadcast ended auctions to all clients via socket
      if (endedAuctions.length > 0) {
        const socket = getSocket()
        endedAuctions.forEach(auctionId => {
          socket.emit('auctionEnd', {
            auctionId,
            endTime: now
          })
          // Also broadcast to all clients
          socket.emit('broadcastAuctionEnd', {
            auctionId,
            endTime: now
          })
        })
      }
    }, 1000) // Check every second

    return () => clearInterval(checkInterval)
  }, []) // Empty dependency array - interval runs independently

  const value = {
    auctions,
    setAuctions,
    users,
    setUsers,
    commissionRate,
    setCommissionRate: updateCommissionRate,
    updateAuction,
    removeAuction,
    updateUser,
    placeBid,
    addUser,
    deleteUser,
    createAuction
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

