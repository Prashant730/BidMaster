import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const AuctionDetail = ({ auctions, user, onUpdateAuction, onUserBid, onAdminRemove }) => {
  const { placeBid: placeBidContext } = useApp()
  const { id } = useParams()
  const navigate = useNavigate()
  const auction = auctions.find(a => a.id === parseInt(id))
  const [bidAmount, setBidAmount] = useState('')
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft())
  const [showBidSuccess, setShowBidSuccess] = useState(false)
  const [isAuctionEnded, setIsAuctionEnded] = useState(false)

  function calculateTimeLeft() {
    if (!auction) return {}
    const difference = auction.endTime - new Date()
    let timeLeft = {}

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    }

    return timeLeft
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)

      // Check if auction has ended
      if (auction) {
        const endTime = auction.endTime instanceof Date ? auction.endTime.getTime() : auction.endTime
        const now = Date.now()
        if (endTime <= now || auction.status === 'ended') {
          setIsAuctionEnded(true)
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [auction])

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Auction Not Found</h2>
          <button onClick={() => navigate('/')} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Back to Auctions</button>
        </div>
      </div>
    )
  }

  const handlePlaceBid = (e) => {
    e.preventDefault()
    if (!user) {
      alert('Please login to place a bid')
      return
    }

    if (user?.isAdmin) {
      alert('Admins are not allowed to place bids')
      return
    }

    if (isAuctionEnded) {
      alert('This auction has ended')
      return
    }

    // Check auction status from context as well
    const endTime = auction.endTime instanceof Date ? auction.endTime.getTime() : auction.endTime
    if (endTime <= Date.now() || auction.status === 'ended') {
      alert('This auction has ended')
      setIsAuctionEnded(true)
      return
    }

    const bid = parseFloat(bidAmount)
    if (isNaN(bid) || bid <= 0) {
      alert('Please enter a valid bid amount')
      return
    }

    if (bid <= auction.currentPrice) {
      alert(`Bid must be higher than current price of $${auction.currentPrice.toLocaleString()}`)
      return
    }

    // Use context to place bid (will emit socket event for real-time sync)
    const result = placeBidContext(auction.id, {
      bidderName: user.name,
      amount: bid
    })

    // Check if bid was successful
    if (result && !result.success) {
      alert(result.message || 'Failed to place bid')
      if (result.message && result.message.includes('ended')) {
        setIsAuctionEnded(true)
      }
      return
    }

    // Also update via callback for local state (if needed)
    if (onUpdateAuction) {
      const newBid = {
        bidder: user.name,
        amount: bid,
        time: new Date()
      }
      onUpdateAuction(auction.id, {
        currentPrice: bid,
        bids: [...auction.bids, newBid]
      })
    }

    // Update user's bid list
    if (onUserBid) {
      onUserBid(auction.id)
    }

    // Show success message
    setShowBidSuccess(true)
    setTimeout(() => setShowBidSuccess(false), 3000)
    setBidAmount('')
  }

  const endTime = auction.endTime instanceof Date ? auction.endTime.getTime() : auction.endTime
  const isEndingSoon = !isAuctionEnded && (endTime - Date.now() < 3600000)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Auctions</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <img src={auction.image} alt={auction.title} className="w-full h-96 object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="bg-white rounded-lg shadow p-1 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="w-full h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Auction Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{auction.title}</h1>
                  <div className="flex items-center space-x-4">
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-bold">{auction.category}</span>
                    {isAuctionEnded ? (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">ENDED</span>
                    ) : isEndingSoon ? (
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">ENDING SOON</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user?.isAdmin && (
                    <button
                      onClick={() => { onAdminRemove && onAdminRemove(auction.id); navigate('/') }}
                      className="px-3 py-1 rounded bg-red-600 text-white text-xs"
                    >
                      Remove
                    </button>
                  )}
                  {isAuctionEnded ? (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">ENDED</span>
                  ) : (
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold">LIVE</span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{auction.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">${auction.currentPrice.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Current Bid</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">{auction.bids.length}</div>
                  <div className="text-sm text-gray-500">Total Bids</div>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6">
                <div className="text-center mb-2">
                  <div className="text-sm text-gray-600 mb-1">Auction Ends In</div>
                  <div className="text-2xl font-bold text-gray-800">{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${((auction.endTime - new Date()) / (24 * 60 * 60 * 1000)) * 100}%` }}></div>
                </div>
              </div>

              {/* Bid Form */}
              {!isAuctionEnded ? (
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter Your Bid</label>
                    <div className="flex space-x-4">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Minimum $${(auction.currentPrice + 100).toLocaleString()}`}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min={auction.currentPrice + 100}
                        step="100"
                      />
                      <button
                        type="submit"
                        disabled={!user || user?.isAdmin}
                        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        {user ? (user.isAdmin ? 'Admins cannot bid' : 'Place Bid') : 'Login to Bid'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-gray-600 font-medium">This auction has ended</p>
                  {auction.bids.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Winning bid: ${auction.currentPrice.toLocaleString()} by {auction.bids[auction.bids.length - 1].bidder}
                    </p>
                  )}
                </div>
              )}

              {showBidSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 animate-pulse">
                  <div className="flex items-center space-x-2 text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Bid placed successfully!</span>
                  </div>
                </div>
              )}
            </div>

              {/* Bid History */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Bid History ({auction.bids.length} bids)</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {auction.bids.length > 0 ? (
                  [...auction.bids]
                    .sort((a, b) => new Date(b.time) - new Date(a.time))
                    .map((bid, index, arr) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{(bid.bidder || '').charAt(0)}</div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {bid.bidder}
                              {index === 0 && (
                                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Highest</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{new Date(bid.time).toLocaleDateString()} at {new Date(bid.time).toLocaleTimeString()}</div>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-800">${bid.amount.toLocaleString()}</div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No bids yet. Be the first to bid!</div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Seller Information</h3>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">{auction.seller.charAt(0)}</div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">{auction.seller}</div>
                  <div className="text-gray-600">Verified Seller</div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <span>⭐ 4.9 Rating</span>
                    <span>•</span>
                    <span>50+ Sales</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuctionDetail
