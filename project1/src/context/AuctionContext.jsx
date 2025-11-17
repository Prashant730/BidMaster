import React, { createContext, useContext, useState, useEffect } from 'react'
import { auctionsAPI } from '../services/api.js'
import { getSocket } from '../services/socket.js'

const AuctionContext = createContext()

export function useAuction() {
  const context = useContext(AuctionContext)
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider')
  }
  return context
}

export function AuctionProvider(props) {
  const children = props.children
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    search: '',
    status: 'active'
  })

  // Set up when component loads
  useEffect(function() {
    // Step 1: Load auctions from API
    loadAuctions()

    // Step 2: Connect to socket for real-time updates
    const socket = getSocket()

    // Step 3: Listen for bid updates
    socket.on('bidUpdate', function(data) {
      // Step 4: Update auctions list with new bid
      setAuctions(function(prev) {
        const updatedAuctions = []
        for (let i = 0; i < prev.length; i++) {
          const auction = prev[i]
          if (auction._id === data.auctionId) {
            // Step 5: Create new bid object
            const newBid = {
              bidderId: data.bidderId,
              bidderName: data.bidderName,
              amount: data.newPrice,
              timestamp: data.timestamp
            }
            // Step 6: Create updated auction with new bid
            const updatedAuction = Object.assign({}, auction, {
              currentPrice: data.newPrice,
              bids: auction.bids.concat([newBid])
            })
            updatedAuctions.push(updatedAuction)
          } else {
            // Step 7: Keep other auctions unchanged
            updatedAuctions.push(auction)
          }
        }
        return updatedAuctions
      })
    })

    // Step 8: Listen for auction ended event
    socket.on('auctionEnded', function(data) {
      // Step 9: Update auction status to ended
      setAuctions(function(prev) {
        const updatedAuctions = []
        for (let i = 0; i < prev.length; i++) {
          const auction = prev[i]
          if (auction._id === data.auctionId) {
            // Step 10: Create updated auction with ended status
            const updatedAuction = Object.assign({}, auction, {
              status: 'ended',
              winnerId: data.winnerId,
              winnerName: data.winnerName
            })
            updatedAuctions.push(updatedAuction)
          } else {
            // Step 11: Keep other auctions unchanged
            updatedAuctions.push(auction)
          }
        }
        return updatedAuctions
      })
    })

    socket.on('outbid', function(data) {
      // Handle outbid notification
      console.log('You were outbid:', data)
    })

    return function() {
      socket.off('bidUpdate')
      socket.off('auctionEnded')
      socket.off('outbid')
    }
  }, [])

  async function loadAuctions() {
    try {
      setLoading(true)
      const params = {}

      if (filters.category !== 'all') {
        params.category = filters.category
      }
      if (filters.minPrice) {
        params.minPrice = filters.minPrice
      }
      if (filters.maxPrice) {
        params.maxPrice = filters.maxPrice
      }
      if (filters.search) {
        params.search = filters.search
      }
      if (filters.status) {
        params.status = filters.status
      }

      const response = await auctionsAPI.getAll(params)
      setAuctions(response.data)
    } catch (error) {
      console.error('Error loading auctions:', error)
    } finally {
      setLoading(false)
    }
  }

  function updateFilters(newFilters) {
    setFilters(function(prev) {
      return Object.assign({}, prev, newFilters)
    })
  }

  useEffect(() => {
    loadAuctions()
  }, [filters])

  async function createAuction(auctionData) {
    try {
      const response = await auctionsAPI.create(auctionData)
      const newAuction = response.data
      setAuctions(function(prev) {
        return [newAuction].concat(prev)
      })
      return { success: true, auction: newAuction }
    } catch (error) {
      let errorMessage = 'Failed to create auction'
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      }
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  async function placeBid(auctionId, amount) {
    try {
      const response = await auctionsAPI.placeBid(auctionId, amount)
      const updatedAuction = response.data

      // Step 1: Update in local state
      setAuctions(function(prev) {
        const updatedAuctions = []
        for (let i = 0; i < prev.length; i++) {
          const auction = prev[i]
          if (auction._id === auctionId) {
            // Step 2: Replace the auction with updated version
            updatedAuctions.push(updatedAuction)
          } else {
            // Step 3: Keep other auctions unchanged
            updatedAuctions.push(auction)
          }
        }
        return updatedAuctions
      })

      // Emit socket event for real-time update
      const socket = getSocket()
      const lastBid = updatedAuction.bids[updatedAuction.bids.length - 1]
      socket.emit('newBid', {
        auctionId: auctionId,
        bidAmount: amount,
        bidderName: lastBid.bidderName,
        bidderId: lastBid.bidderId
      })

      return { success: true, auction: updatedAuction }
    } catch (error) {
      let errorMessage = 'Failed to place bid'
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      }
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  const value = {
    auctions,
    loading,
    filters,
    updateFilters,
    loadAuctions,
    createAuction,
    placeBid
  }

  return <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>
}
