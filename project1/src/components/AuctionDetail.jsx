import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

function AuctionDetail(props) {
  const auctions = props.auctions
  const user = props.user
  const onUpdateAuction = props.onUpdateAuction
  const onUserBid = props.onUserBid
  const onAdminRemove = props.onAdminRemove
  const { placeBid: placeBidContext } = useApp()
  const { id } = useParams()
  const navigate = useNavigate()
  const [bidLoading, setBidLoading] = useState(false)

  // Find auction by id (supports both numeric id and MongoDB _id)
  const auction = auctions.find(function(a) {
    return a.id === id || a._id === id || a.id === parseInt(id)
  })
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

    return function() {
      clearInterval(timer)
    }
  }, [auction])

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Auction Not Found</h2>
          <button onClick={() => navigate('/')} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Back to Auctions</button>
        </div>
      </div>
    )
  }

  // Function to handle when user clicks "Place Bid" button
  async function handlePlaceBid(e) {
    // Step 1: Prevent form from submitting normally
    e.preventDefault()

    // Step 2: Check if user is logged in
    if (!user) {
      alert('Please login to place a bid')
      return
    }

    // Step 3: Check if user is admin (admins cannot bid)
    if (user && user.isAdmin) {
      alert('Admins are not allowed to place bids')
      return
    }

    // Step 4: Check if auction has already ended
    if (isAuctionEnded) {
      alert('This auction has ended')
      return
    }

    // Step 5: Check auction end time from context
    let endTime = auction.endTime
    if (endTime instanceof Date) {
      endTime = endTime.getTime()
    }
    const currentTime = Date.now()
    if (endTime <= currentTime || auction.status === 'ended') {
      alert('This auction has ended')
      setIsAuctionEnded(true)
      return
    }

    // Step 6: Convert bid amount to number
    const bid = parseFloat(bidAmount)

    // Step 7: Check if bid amount is valid
    if (isNaN(bid) || bid <= 0) {
      alert('Please enter a valid bid amount')
      return
    }

    // Step 8: Check if bid is higher than current price
    if (bid <= auction.currentPrice) {
      const priceText = '$' + auction.currentPrice.toLocaleString()
      alert('Bid must be higher than current price of ' + priceText)
      return
    }

    // Step 9: Use context to place bid (calls API to save to database)
    setBidLoading(true)
    const bidData = {
      bidderName: user.name,
      amount: bid
    }

    // Use the correct auction ID (MongoDB _id or local id)
    const auctionId = auction._id || auction.id
    const result = await placeBidContext(auctionId, bidData)
    setBidLoading(false)

    // Step 10: Check if bid was successful
    if (result && !result.success) {
      const errorMessage = result.message || 'Failed to place bid'
      alert(errorMessage)
      if (result.message && result.message.includes('ended')) {
        setIsAuctionEnded(true)
      }
      return
    }

    // Step 11: Also update via callback for local state (if needed)
    if (onUpdateAuction) {
      const newBid = {
        bidder: user.name,
        amount: bid,
        time: new Date()
      }
      const updatedBids = auction.bids.concat([newBid])
      onUpdateAuction(auctionId, {
        currentPrice: bid,
        bids: updatedBids
      })
    }

    // Update user's bid list
    if (onUserBid) {
      onUserBid(auctionId)
    }

    // Show success message
    setShowBidSuccess(true)
    setTimeout(() => setShowBidSuccess(false), 3000)
    setBidAmount('')
  }

  const isEndingSoon = !isAuctionEnded && (auction.endTime - Date.now() < 3600000)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-4 sm:py-6 md:py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Back button */}
        <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 mb-4 sm:mb-6 transition-colors text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Auctions</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Image Gallery */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <img src={auction.image} alt={auction.title} className="w-full h-64 sm:h-80 md:h-96 object-cover" />
            </div>
          </div>

          {/* Auction Details */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{auction.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">{auction.category}</span>
                    {isAuctionEnded ? (
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">ENDED</span>
                    ) : isEndingSoon ? (
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold animate-pulse">ENDING SOON</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {user && user.isAdmin && (
                    <button
                      onClick={function() {
                        if (onAdminRemove) {
                          onAdminRemove(auction.id)
                        }
                        navigate('/')
                      }}
                      className="px-2 sm:px-3 py-1 rounded bg-red-600 text-white text-xs sm:text-sm"
                    >
                      Remove
                    </button>
                  )}
                  {isAuctionEnded ? (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">ENDED</span>
                  ) : (
                    <span className="bg-green-100 dark:bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-400 text-green-600 dark:text-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold animate-pulse">LIVE</span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{auction.description}</p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-yellow-500/10 dark:border dark:border-yellow-600/50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-yellow-400">₹{auction.currentPrice.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-yellow-500/70">Current Bid</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 dark:bg-yellow-500/10 dark:border dark:border-yellow-600/50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-yellow-400">{auction.bids.length}</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-yellow-500/70">Total Bids</div>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-yellow-500/10 dark:to-yellow-600/10 dark:border dark:border-yellow-600/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="text-center mb-2">
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-yellow-400 mb-1">Auction Ends In</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-yellow-400">{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-yellow-900/30 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 dark:from-yellow-500 dark:to-yellow-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, ((auction.endTime - new Date()) / (24 * 60 * 60 * 1000)) * 100))}%` }}></div>
                </div>
              </div>

              {/* Bid Form */}
              {!isAuctionEnded ? (
                <form onSubmit={handlePlaceBid} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-yellow-400 mb-2">Enter Your Bid</label>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Minimum ₹${(auction.currentPrice + 100).toLocaleString()}`}
                        className="flex-1 border border-gray-300 dark:border-yellow-600 dark:bg-black dark:text-yellow-400 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-500 dark:placeholder-yellow-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-yellow-500 focus:border-transparent"
                        min={auction.currentPrice + 100}
                        step="100"
                      />
                      <button
                        type="submit"
                        disabled={!user || (user && user.isAdmin) || bidLoading}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-500 dark:from-yellow-500 dark:to-yellow-400 hover:from-purple-700 hover:to-blue-600 dark:hover:from-yellow-400 dark:hover:to-yellow-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white dark:text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-yellow-500/30"
                      >
                        {bidLoading ? 'Placing Bid...' : (user ? (user.isAdmin ? 'Admins cannot bid' : 'Place Bid') : 'Login to Bid')}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-100 dark:bg-yellow-500/10 dark:border dark:border-yellow-600/50 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-gray-600 dark:text-yellow-400 font-medium text-sm sm:text-base">This auction has ended</p>
                  {auction.bids.length > 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-yellow-500/70 mt-2">
                      Winning bid: ₹{auction.currentPrice.toLocaleString()} by {auction.bids[auction.bids.length - 1].bidder}
                    </p>
                  )}
                </div>
              )}

              {showBidSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4 animate-pulse">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm sm:text-base">Bid placed successfully!</span>
                  </div>
                </div>
              )}
            </div>

              {/* Bid History */}
            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">Bid History ({auction.bids.length} bids)</h3>
              <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto">
                {auction.bids.length > 0 ? (
                  (function() {
                    const sortedBids = auction.bids.slice()
                    sortedBids.sort(function(a, b) {
                      return new Date(b.time) - new Date(a.time)
                    })
                    return sortedBids
                  }()).map(function(bid, index) {
                    return (
                      <div key={index} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${index === 0 ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800' : 'bg-gray-50 dark:bg-slate-700'}`}>
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{(bid.bidder || '').charAt(0)}</div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base truncate">
                              {bid.bidder}
                              {index === 0 && (
                                <span className="ml-2 text-xs bg-yellow-500 dark:bg-gradient-to-r dark:from-yellow-500 dark:to-amber-500 text-black px-1.5 sm:px-2 py-0.5 rounded-full font-bold">Highest</span>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{new Date(bid.time).toLocaleDateString()} at {new Date(bid.time).toLocaleTimeString()}</div>
                          </div>
                        </div>
                        <div className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 flex-shrink-0 ml-2">₹{bid.amount.toLocaleString()}</div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base">No bids yet. Be the first to bid!</div>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">Seller Information</h3>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">{auction.seller.charAt(0)}</div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-800 dark:text-gray-100 text-base sm:text-lg truncate">{auction.seller}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Verified Seller</div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
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
