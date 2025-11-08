import React, { createContext, useContext, useState, useEffect } from 'react'
import { auctionsAPI } from '../services/api.js'
import { getSocket } from '../services/socket.js'

const AuctionContext = createContext()

export const useAuction = () => {
  const context = useContext(AuctionContext)
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider')
  }
  return context
}

export const AuctionProvider = ({ children }) => {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    search: '',
    status: 'active'
  })

  useEffect(() => {
    loadAuctions()

    // Connect to socket for real-time updates
    const socket = getSocket()

    socket.on('bidUpdate', (data) => {
      setAuctions(prev => prev.map(auction => {
        if (auction._id === data.auctionId) {
          return {
            ...auction,
            currentPrice: data.newPrice,
            bids: [...auction.bids, {
              bidderId: data.bidderId,
              bidderName: data.bidderName,
              amount: data.newPrice,
              timestamp: data.timestamp
            }]
          }
        }
        return auction
      }))
    })

    socket.on('auctionEnded', (data) => {
      setAuctions(prev => prev.map(auction => {
        if (auction._id === data.auctionId) {
          return {
            ...auction,
            status: 'ended',
            winnerId: data.winnerId,
            winnerName: data.winnerName
          }
        }
        return auction
      }))
    })

    socket.on('outbid', (data) => {
      // Handle outbid notification
      console.log('You were outbid:', data)
    })

    return () => {
      socket.off('bidUpdate')
      socket.off('auctionEnded')
      socket.off('outbid')
    }
  }, [])

  const loadAuctions = async () => {
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

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  useEffect(() => {
    loadAuctions()
  }, [filters])

  const createAuction = async (auctionData) => {
    try {
      const response = await auctionsAPI.create(auctionData)
      const newAuction = response.data
      setAuctions(prev => [newAuction, ...prev])
      return { success: true, auction: newAuction }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create auction'
      }
    }
  }

  const placeBid = async (auctionId, amount) => {
    try {
      const response = await auctionsAPI.placeBid(auctionId, amount)
      const updatedAuction = response.data

      // Update in local state
      setAuctions(prev => prev.map(auction =>
        auction._id === auctionId ? updatedAuction : auction
      ))

      // Emit socket event for real-time update
      const socket = getSocket()
      socket.emit('newBid', {
        auctionId,
        bidAmount: amount,
        bidderName: updatedAuction.bids[updatedAuction.bids.length - 1].bidderName,
        bidderId: updatedAuction.bids[updatedAuction.bids.length - 1].bidderId
      })

      return { success: true, auction: updatedAuction }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to place bid'
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
