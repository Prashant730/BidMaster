import React, { createContext, useContext, useState, useEffect } from 'react'
import { getSocket } from '../services/socket.js'

const AppContext = createContext()

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export function AppProvider(props) {
  const children = props.children
  const initialAuctions = props.initialAuctions || []
  const initialUsers = props.initialUsers || []
  const initialCommissionRate = props.initialCommissionRate || 0.05
  const [auctions, setAuctions] = useState(initialAuctions)
  const [users, setUsers] = useState(initialUsers)
  const [commissionRate, setCommissionRate] = useState(initialCommissionRate)

  // Set up real-time updates when component loads
  useEffect(function() {
    // Step 1: Get socket connection for real-time updates
    const socket = getSocket()

    // Step 2: Listen for when a user places a bid
    socket.on('bidPlaced', function(data) {
      console.log('Real-time bid update received:', data)
      
      // Step 3: Update auctions list with new bid
      setAuctions(function(prev) {
        // Step 4: Go through each auction and find the one that was bid on
        const updatedAuctions = []
        for (let i = 0; i < prev.length; i++) {
          const auction = prev[i]
          
          // Step 5: If this is the auction that was bid on, update it
          if (auction.id === data.auctionId) {
            // Step 6: Create new bid object
            const newBid = {
              bidder: data.bidderName,
              amount: data.amount,
              time: new Date(data.timestamp || Date.now())
            }
            
            // Step 7: Create updated auction with new bid
            const updatedAuction = {
              id: auction.id,
              title: auction.title,
              description: auction.description,
              category: auction.category,
              startingPrice: auction.startingPrice,
              currentPrice: data.amount,
              image: auction.image,
              endTime: auction.endTime,
              bids: auction.bids.concat([newBid]),
              seller: auction.seller,
              status: auction.status
            }
            updatedAuctions.push(updatedAuction)
          } else {
            // Step 8: Keep other auctions unchanged
            updatedAuctions.push(auction)
          }
        }
        return updatedAuctions
      })
    })

    // Step 9: Listen for auction updates from admin
    socket.on('auctionUpdated', function(data) {
      console.log('Real-time auction update received:', data)
      
      // Step 10: Update the specific auction with new data
      setAuctions(function(prev) {
        const updatedAuctions = []
        for (let i = 0; i < prev.length; i++) {
          const auction = prev[i]
          if (auction.id === data.auctionId) {
            // Step 11: Create updated auction by copying old data and adding updates
            const updatedAuction = Object.assign({}, auction, data.updates)
            updatedAuctions.push(updatedAuction)
          } else {
            // Step 12: Keep other auctions unchanged
            updatedAuctions.push(auction)
          }
        }
        return updatedAuctions
      })
    })

    // Step 13: Listen for auction removal from admin
    socket.on('auctionRemoved', function(data) {
      console.log('Real-time auction removal received:', data)
      
      // Step 14: Remove the auction from the list
      setAuctions(function(prev) {
        const remainingAuctions = []
        for (let i = 0; i < prev.length; i++) {
          const auction = prev[i]
          // Keep auction only if it's not the one being removed
          if (auction.id !== data.auctionId) {
            remainingAuctions.push(auction)
          }
        }
        return remainingAuctions
      })
    })

    // Step 15: Listen for auction creation
    socket.on('auctionCreated', function(data) {
      console.log('Real-time auction creation received:', data)
      
      // Step 16: Add new auction to the beginning of the list
      setAuctions(function(prev) {
        const newAuctions = [data.auction]
        for (let i = 0; i < prev.length; i++) {
          newAuctions.push(prev[i])
        }
        return newAuctions
      })
    })

    // Step 17: Listen for auction ended event (broadcasted when auction time expires)
    socket.on('auctionEnded', function(data) {
      console.log('Real-time auction ended received:', data)
      
      // Step 18: Update auction status to ended
      setAuctions(function(prev) {
        const updatedAuctions = []
        for (let i = 0; i < prev.length; i++) {
          const auction = prev[i]
          if (auction.id === data.auctionId) {
            // Step 19: Create updated auction with ended status
            const updatedAuction = {
              id: auction.id,
              title: auction.title,
              description: auction.description,
              category: auction.category,
              startingPrice: auction.startingPrice,
              currentPrice: auction.currentPrice,
              image: auction.image,
              endTime: data.endTime || auction.endTime,
              bids: auction.bids,
              seller: auction.seller,
              status: 'ended'
            }
            updatedAuctions.push(updatedAuction)
          } else {
            // Step 20: Keep other auctions unchanged
            updatedAuctions.push(auction)
          }
        }
        return updatedAuctions
      })
    })

    // Step 21: Listen for user updates from admin
    socket.on('userUpdated', function(data) {
      console.log('Real-time user update received:', data)
      
      // Step 22: Update the specific user with new data
      setUsers(function(prev) {
        const updatedUsers = []
        for (let i = 0; i < prev.length; i++) {
          const user = prev[i]
          if (user.email === data.userEmail) {
            // Step 23: Create updated user by copying old data and adding updates
            const updatedUser = Object.assign({}, user, data.updates)
            updatedUsers.push(updatedUser)
          } else {
            // Step 24: Keep other users unchanged
            updatedUsers.push(user)
          }
        }
        return updatedUsers
      })
    })

    // Listen for commission rate updates from admin
    socket.on('commissionRateUpdated', function(data) {
      console.log('Real-time commission rate update received:', data)
      setCommissionRate(data.commissionRate)
    })

    // Step 25: Listen for new user registration
    socket.on('userRegistered', function(data) {
      console.log('Real-time user registration received:', data)
      
      // Step 26: Check if user already exists, then add if new
      setUsers(function(prev) {
        // Step 27: Check if user with this email already exists
        let userExists = false
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].email === data.user.email) {
            userExists = true
            break
          }
        }
        
        // Step 28: If user doesn't exist, add them to the list
        if (userExists) {
          return prev
        } else {
          const newUsers = []
          for (let i = 0; i < prev.length; i++) {
            newUsers.push(prev[i])
          }
          newUsers.push(data.user)
          return newUsers
        }
      })
    })

    return function() {
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

  // Function to update an auction and emit socket event
  function updateAuction(auctionId, updates) {
    // Step 1: Update the auction in the list
    setAuctions(function(prev) {
      const updatedAuctions = []
      for (let i = 0; i < prev.length; i++) {
        const auction = prev[i]
        if (auction.id === auctionId) {
          // Step 2: Create updated auction by copying old data and adding updates
          const updated = Object.assign({}, auction, updates)
          
          // Step 3: Emit socket event for real-time sync
          const socket = getSocket()
          socket.emit('auctionUpdate', {
            auctionId: auctionId,
            updates: updates
          })
          // Step 4: Also broadcast to all clients (server should handle this, but we emit for consistency)
          socket.emit('broadcastAuctionUpdate', {
            auctionId: auctionId,
            updates: updates
          })
          updatedAuctions.push(updated)
        } else {
          // Step 5: Keep other auctions unchanged
          updatedAuctions.push(auction)
        }
      }
      return updatedAuctions
    })
  }

  // Function to remove an auction and emit socket event
  function removeAuction(auctionId) {
    // Step 1: Remove the auction from the list
    setAuctions(function(prev) {
      const remainingAuctions = []
      for (let i = 0; i < prev.length; i++) {
        const auction = prev[i]
        // Keep auction only if it's not the one being removed
        if (auction.id !== auctionId) {
          remainingAuctions.push(auction)
        }
      }
      return remainingAuctions
    })
    
    // Step 2: Emit socket event for real-time sync
    const socket = getSocket()
    socket.emit('auctionRemove', { auctionId: auctionId })
  }

  // Function to update a user and emit socket event
  function updateUser(userEmail, updates) {
    // Step 1: Update the user in the list
    setUsers(function(prev) {
      const updatedUsers = []
      for (let i = 0; i < prev.length; i++) {
        const user = prev[i]
        if (user.email === userEmail) {
          // Step 2: Create updated user by copying old data and adding updates
          const updated = Object.assign({}, user, updates)
          
          // Step 3: Emit socket event for real-time sync
          const socket = getSocket()
          socket.emit('userUpdate', {
            userEmail: userEmail,
            updates: updates
          })
          updatedUsers.push(updated)
        } else {
          // Step 4: Keep other users unchanged
          updatedUsers.push(user)
        }
      }
      return updatedUsers
    })
  }

  // Update commission rate function that emits socket event
  function updateCommissionRate(newRate) {
    setCommissionRate(newRate)
    // Emit socket event for real-time sync
    const socket = getSocket()
    socket.emit('commissionRateUpdate', { commissionRate: newRate })
  }

  // Function to place a bid on an auction
  function placeBid(auctionId, bidData) {
    // Step 1: Find the auction by ID
    let auction = null
    for (let i = 0; i < auctions.length; i++) {
      if (auctions[i].id === auctionId) {
        auction = auctions[i]
        break
      }
    }
    
    // Step 2: Check if auction exists
    if (!auction) {
      return { success: false, message: 'Auction not found' }
    }

    // Step 3: Convert endTime to timestamp if it's a Date object
    let endTime = auction.endTime
    if (endTime instanceof Date) {
      endTime = endTime.getTime()
    }
    const now = Date.now()

    // Step 4: Check if auction has ended
    if (endTime <= now) {
      return { success: false, message: 'This auction has ended' }
    }

    // Step 5: Get bidder name and amount from bid data
    const bidderName = bidData.bidderName
    const amount = bidData.amount
    
    // Step 6: Create new bid object
    const newBid = {
      bidder: bidderName,
      amount: amount,
      time: new Date()
    }

    // Step 7: Update the auction with new bid
    setAuctions(function(prev) {
      const updatedAuctions = []
      for (let i = 0; i < prev.length; i++) {
        const currentAuction = prev[i]
        if (currentAuction.id === auctionId) {
          // Step 8: Create updated auction with new bid
          const updatedAuction = {
            id: currentAuction.id,
            title: currentAuction.title,
            description: currentAuction.description,
            category: currentAuction.category,
            startingPrice: currentAuction.startingPrice,
            currentPrice: amount,
            image: currentAuction.image,
            endTime: currentAuction.endTime,
            bids: currentAuction.bids.concat([newBid]),
            seller: currentAuction.seller,
            status: currentAuction.status
          }
          updatedAuctions.push(updatedAuction)
        } else {
          // Step 9: Keep other auctions unchanged
          updatedAuctions.push(currentAuction)
        }
      }
      return updatedAuctions
    })

    // Step 10: Emit socket event for real-time sync
    const socket = getSocket()
    const timestamp = Date.now()
    socket.emit('bidPlace', {
      auctionId: auctionId,
      bidderName: bidderName,
      amount: amount,
      timestamp: timestamp
    })
    // Step 11: Also broadcast to all clients (server should handle this, but we emit for consistency)
    socket.emit('broadcastBidPlace', {
      auctionId: auctionId,
      bidderName: bidderName,
      amount: amount,
      timestamp: timestamp
    })

    // Step 12: Return success
    return { success: true }
  }

  // Function to add a new user or update existing user
  function addUser(user) {
    setUsers(function(prev) {
      // Step 1: Check if user with this email already exists
      let userExists = false
      for (let i = 0; i < prev.length; i++) {
        if (prev[i].email === user.email) {
          userExists = true
          break
        }
      }
      
      // Step 2: If user exists, update them; otherwise add new user
      if (userExists) {
        // Step 3: Update existing user
        const updatedUsers = []
        for (let i = 0; i < prev.length; i++) {
          const u = prev[i]
          if (u.email === user.email) {
            // Step 4: Create updated user by copying old data and adding new data
            const updated = Object.assign({}, u, user)
            updatedUsers.push(updated)
          } else {
            // Step 5: Keep other users unchanged
            updatedUsers.push(u)
          }
        }
        return updatedUsers
      } else {
        // Step 6: Add new user to the list
        // Step 7: Emit socket event for real-time sync
        const socket = getSocket()
        socket.emit('userRegister', { user: user })
        
        // Step 8: Add new user to the list
        const newUsers = []
        for (let i = 0; i < prev.length; i++) {
          newUsers.push(prev[i])
        }
        newUsers.push(user)
        return newUsers
      }
    })
  }

  // Function to delete a user and emit socket event
  function deleteUser(userEmail) {
    // Step 1: Remove the user from the list
    setUsers(function(prev) {
      const remainingUsers = []
      for (let i = 0; i < prev.length; i++) {
        const user = prev[i]
        // Keep user only if it's not the one being deleted
        if (user.email !== userEmail) {
          remainingUsers.push(user)
        }
      }
      return remainingUsers
    })
    
    // Step 2: Emit socket event for real-time sync
    const socket = getSocket()
    socket.emit('userDelete', { userEmail: userEmail })
  }

  // Function to create a new auction
  function createAuction(auctionData) {
    // Step 1: Generate a unique ID for the new auction
    let newId = 1
    if (auctions.length > 0) {
      // Step 2: Find the highest ID in existing auctions
      let maxId = auctions[0].id
      for (let i = 1; i < auctions.length; i++) {
        if (auctions[i].id > maxId) {
          maxId = auctions[i].id
        }
      }
      // Step 3: Set new ID to one more than the highest
      newId = maxId + 1
    }

    // Calculate end time based on duration
    const durationHours = parseInt(auctionData.duration) || 24
    const endTime = Date.now() + (durationHours * 60 * 60 * 1000)

    // Create the new auction object
    let sellerName = 'Anonymous'
    if (auctionData.seller) {
      sellerName = auctionData.seller
    } else if (auctionData.user && auctionData.user.name) {
      sellerName = auctionData.user.name
    }

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
      seller: sellerName,
      status: 'active'
    }

    // Step 4: Add new auction to the beginning of the list
    setAuctions(function(prev) {
      const newAuctions = [newAuction]
      for (let i = 0; i < prev.length; i++) {
        newAuctions.push(prev[i])
      }
      return newAuctions
    })

    // Emit socket event for real-time sync
    const socket = getSocket()
    socket.emit('auctionCreate', { auction: newAuction })
    socket.emit('broadcastAuctionCreate', { auction: newAuction })

    return newAuction
  }

  // Automatic auction ending mechanism - checks every second for expired auctions
  useEffect(function() {
    // Step 1: Set up interval to check auctions every second
    const checkInterval = setInterval(function() {
      const now = Date.now()
      const endedAuctions = []

      // Step 2: Go through all auctions and check if any have ended
      setAuctions(function(prev) {
        const updatedAuctions = []
        for (let i = 0; i < prev.length; i++) {
          const auction = prev[i]
          
          // Step 3: Convert endTime to timestamp if it's a Date object
          let endTime = auction.endTime
          if (endTime instanceof Date) {
            endTime = endTime.getTime()
          }

          // Step 4: Check if auction should be ended
          if (endTime <= now && auction.status !== 'ended') {
            // Step 5: Mark this auction as ended
            endedAuctions.push(auction.id)
            const updatedAuction = {
              id: auction.id,
              title: auction.title,
              description: auction.description,
              category: auction.category,
              startingPrice: auction.startingPrice,
              currentPrice: auction.currentPrice,
              image: auction.image,
              endTime: auction.endTime,
              bids: auction.bids,
              seller: auction.seller,
              status: 'ended'
            }
            updatedAuctions.push(updatedAuction)
          } else {
            // Step 6: Keep auction unchanged if it hasn't ended
            updatedAuctions.push(auction)
          }
        }
        return updatedAuctions
      })

      // Step 7: Broadcast ended auctions to all clients via socket
      if (endedAuctions.length > 0) {
        const socket = getSocket()
        for (let i = 0; i < endedAuctions.length; i++) {
          const auctionId = endedAuctions[i]
          socket.emit('auctionEnd', {
            auctionId: auctionId,
            endTime: now
          })
          // Step 8: Also broadcast to all clients
          socket.emit('broadcastAuctionEnd', {
            auctionId: auctionId,
            endTime: now
          })
        }
      }
    }, 1000) // Check every second

    // Step 9: Clean up interval when component unmounts
    return function() {
      clearInterval(checkInterval)
    }
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

