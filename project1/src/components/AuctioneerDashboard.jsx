import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

function AuctioneerDashboard(props) {
  const currentUser = props.currentUser
  const auctionsProp = props.auctions
  const { isDark } = useTheme()
  const {
    auctions: contextAuctions,
    updateAuction: updateContextAuction,
    removeAuction: removeContextAuction
  } = useApp()

  const auctions = contextAuctions.length > 0 ? contextAuctions : auctionsProp
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedAuction, setSelectedAuction] = useState(null)
  const [extendTime, setExtendTime] = useState(5) // minutes
  const [threeMinuteRuleEnabled, setThreeMinuteRuleEnabled] = useState(true)

  // Filter auctions by current user (auctioneer)
  const myAuctions = useMemo(function() {
    return auctions.filter(function(a) {
      let sellerMatches = false
      if (currentUser && currentUser.name && a.seller === currentUser.name) {
        sellerMatches = true
      }
      if (!sellerMatches && currentUser && currentUser.email && a.seller) {
        const emailPrefix = currentUser.email.split('@')[0]
        if (emailPrefix) {
          const lowerEmailPrefix = emailPrefix.toLowerCase()
          const lowerSeller = a.seller.toLowerCase()
          if (lowerSeller.includes(lowerEmailPrefix)) {
            sellerMatches = true
          }
        }
      }
      return sellerMatches
    })
  }, [auctions, currentUser])

  // Stats calculation
  const stats = useMemo(function() {
    const now = Date.now()
    const active = myAuctions.filter(function(a) { return (a.endTime - now) > 0 })
    const ended = myAuctions.filter(function(a) { return (a.endTime - now) <= 0 })

    let totalBids = 0
    for (let i = 0; i < myAuctions.length; i++) {
      totalBids += myAuctions[i].bids.length
    }

    const endedWithBids = ended.filter(function(a) { return a.bids.length > 0 })
    let totalRevenue = 0
    for (let i = 0; i < endedWithBids.length; i++) {
      totalRevenue += endedWithBids[i].currentPrice
    }

    const pending = myAuctions.filter(function(a) {
      const timeLeft = a.endTime - now
      return timeLeft > 0 && timeLeft < 3 * 60 * 1000 // Less than 3 minutes
    })

    return {
      total: myAuctions.length,
      active: active.length,
      ended: ended.length,
      totalBids: totalBids,
      totalRevenue: totalRevenue,
      pending: pending.length
    }
  }, [myAuctions])

  // Filtered auctions
  const filteredAuctions = useMemo(function() {
    let filtered = myAuctions

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(function(a) {
        return a.title.toLowerCase().includes(search) ||
               a.description.toLowerCase().includes(search) ||
               a.category.toLowerCase().includes(search)
      })
    }

    // Status filter
    const now = Date.now()
    if (filterStatus === 'active') {
      filtered = filtered.filter(function(a) { return (a.endTime - now) > 0 })
    } else if (filterStatus === 'ended') {
      filtered = filtered.filter(function(a) { return (a.endTime - now) <= 0 })
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(function(a) {
        const timeLeft = a.endTime - now
        return timeLeft > 0 && timeLeft < 3 * 60 * 1000
      })
    }

    filtered.sort(function(a, b) {
      return b.endTime - a.endTime
    })
    return filtered
  }, [myAuctions, searchTerm, filterStatus])

  // Check if user is validated auctioneer
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Please Login</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>You need to be logged in to access the Auctioneer Dashboard.</p>
          <button onClick={() => navigate('/')} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (currentUser.role !== 'auctioneer' && !currentUser.isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Access Denied</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>You must be an auctioneer to view this page.</p>
          <button onClick={() => navigate('/')} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (currentUser.role === 'auctioneer' && !currentUser.isValidated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md">
          <div className={`border rounded-lg p-6 mb-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-yellow-50 border-yellow-200'}`}>
            <svg className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Account Pending Validation</h2>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Your auctioneer account is pending admin approval. Once validated, you'll be able to manage auctions and access all features.
            </p>
          </div>
          <button onClick={() => navigate('/')} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // Auction management functions
  const extendAuctionTime = (auctionId, minutes) => {
    const auction = myAuctions.find(a => a.id === auctionId)
    if (!auction) return

    const now = Date.now()
    const currentEndTime = auction.endTime
    const newEndTime = Math.max(currentEndTime, now) + (minutes * 60 * 1000)

    updateContextAuction(auctionId, { endTime: newEndTime })
    alert(`Auction extended by ${minutes} minutes. New end time: ${new Date(newEndTime).toLocaleString()}`)
  }

  const cancelAuction = (auctionId) => {
    if (window.confirm('Are you sure you want to cancel this auction? This action cannot be undone.')) {
      updateContextAuction(auctionId, { endTime: Date.now() - 1 })
      alert('Auction has been cancelled.')
    }
  }

  const finalizeAuction = (auctionId) => {
    const auction = myAuctions.find(a => a.id === auctionId)
    if (!auction || auction.bids.length === 0) {
      alert('Cannot finalize: No bids placed on this auction.')
      return
    }

    if (window.confirm(`Finalize auction "${auction.title}"? The winner will be ${auction.bids[auction.bids.length - 1].bidder} with a bid of $${auction.currentPrice.toLocaleString()}.`)) {
      updateContextAuction(auctionId, { finalized: true, winner: auction.bids[auction.bids.length - 1].bidder })
      alert('Auction finalized! The transaction can now proceed.')
    }
  }

  const deleteAuction = (auctionId) => {
    if (window.confirm('Are you sure you want to permanently delete this auction? This action cannot be undone.')) {
      removeContextAuction(auctionId)
      alert('Auction deleted successfully.')
    }
  }

  // Auto-extend on bid near end (three-minute rule)
  useEffect(() => {
    if (!threeMinuteRuleEnabled) return

    const interval = setInterval(() => {
      const now = Date.now()
      myAuctions.forEach(auction => {
        const timeLeft = auction.endTime - now
        // If less than 3 minutes left and there was a recent bid (within last minute)
        if (timeLeft > 0 && timeLeft < 3 * 60 * 1000 && auction.bids.length > 0) {
          const lastBid = auction.bids[auction.bids.length - 1]
          const bidTime = new Date(lastBid.time).getTime()
          const timeSinceBid = now - bidTime

          // If bid was placed within the last minute, extend by 3 minutes
          if (timeSinceBid < 60 * 1000 && timeLeft < 3 * 60 * 1000) {
            const newEndTime = now + (3 * 60 * 1000)
            if (newEndTime > auction.endTime) {
              updateContextAuction(auction.id, { endTime: newEndTime })
              console.log(`Auto-extended auction "${auction.title}" by 3 minutes (three-minute rule)`)
            }
          }
        }
      })
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [myAuctions, threeMinuteRuleEnabled, updateContextAuction])

  const formatTimeRemaining = (endTime) => {
    const now = Date.now()
    const remaining = endTime - now

    if (remaining <= 0) return 'Ended'

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const mins = Math.floor((remaining % (1000 * 60)) / 1000)

    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${mins}s`
    return `${mins}s`
  }

  return (
    <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className={`rounded-2xl shadow-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Auctioneer Dashboard</h1>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your auctions, track bids, and finalize sales</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-purple-600 text-white' : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('auctions')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'auctions' ? 'bg-purple-600 text-white' : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                My Auctions
              </button>
              <button
                onClick={() => setActiveTab('bids')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'bids' ? 'bg-purple-600 text-white' : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bid Management
              </button>
              <button
                onClick={() => navigate('/create')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:from-purple-700 hover:to-blue-600 transition-all shadow-lg"
              >
                + Create Auction
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Auctions"
                value={stats.total}
                color="from-purple-500 to-blue-500"
                icon="📊"
              />
              <StatCard
                title="Active Auctions"
                value={stats.active}
                color="from-green-500 to-teal-500"
                icon="🟢"
              />
              <StatCard
                title="Total Bids"
                value={stats.totalBids}
                color="from-yellow-500 to-orange-500"
                icon="💰"
              />
              <StatCard
                title="Total Revenue"
                value={`$${Math.round(stats.totalRevenue).toLocaleString()}`}
                color="from-indigo-500 to-purple-500"
                icon="💵"
              />
            </div>

            {/* Quick Actions */}
            <div className={`rounded-2xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/create')}
                  className={`p-6 border-2 border-dashed rounded-xl hover:border-purple-500 transition-all text-left ${isDark ? 'border-gray-600 bg-gray-700 hover:bg-purple-900/20' : 'border-gray-300 hover:bg-purple-50'}`}
                >
                  <div className="text-3xl mb-2">➕</div>
                  <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Create New Auction</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>List a new item for auction</p>
                </button>
                <button
                  onClick={() => setActiveTab('auctions')}
                  className={`p-6 border-2 border-dashed rounded-xl hover:border-blue-500 transition-all text-left ${isDark ? 'border-gray-600 bg-gray-700 hover:bg-blue-900/20' : 'border-gray-300 hover:bg-blue-50'}`}
                >
                  <div className="text-3xl mb-2">📋</div>
                  <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Manage Auctions</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>View and edit your auctions</p>
                </button>
                <button
                  onClick={() => setActiveTab('bids')}
                  className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left"
                >
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Track Bids</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Monitor all bids on your auctions</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`rounded-2xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Recent Activity</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {function() {
                  const allBids = []
                  for (let i = 0; i < myAuctions.length; i++) {
                    const auction = myAuctions[i]
                    for (let j = 0; j < auction.bids.length; j++) {
                      allBids.push({ auction: auction, bid: auction.bids[j] })
                    }
                  }
                  allBids.sort(function(a, b) {
                    return new Date(b.bid.time) - new Date(a.bid.time)
                  })
                  const recentBids = allBids.slice(0, 10)

                  if (allBids.length === 0) {
                    return <p className="text-center text-gray-500 py-8">No recent activity</p>
                  }

                  return recentBids.map(function(item, idx) {
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-800">{item.bid.bidder}</span>
                          <span className="text-gray-600"> bid </span>
                          <span className="font-semibold text-purple-600">${item.bid.amount.toLocaleString()}</span>
                          <span className="text-gray-600"> on </span>
                          <span className="font-medium">{item.auction.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(item.bid.time).toLocaleString()}</span>
                      </div>
                    )
                  })
                }()}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Auction Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-800">Three-Minute Rule</h3>
                    <p className="text-sm text-gray-600">Automatically extend auction by 3 minutes if a bid is placed within the last 3 minutes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={threeMinuteRuleEnabled}
                      onChange={(e) => setThreeMinuteRuleEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auctions Tab */}
        {activeTab === 'auctions' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">My Auctions</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search auctions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Ending Soon</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAuctions.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-4xl mb-3">📦</div>
                  <p className="text-gray-500 font-medium">No auctions found</p>
                  <button
                    onClick={() => navigate('/create')}
                    className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Create Your First Auction
                  </button>
                </div>
              ) : (
                filteredAuctions.map(auction => {
                  const now = Date.now()
                  const isActive = (auction.endTime - now) > 0
                  const timeRemaining = formatTimeRemaining(auction.endTime)
                  const isEndingSoon = isActive && (auction.endTime - now) < 3 * 60 * 1000

                  return (
                    <div
                      key={auction.id}
                      className={`border rounded-xl p-4 hover:shadow-lg transition-shadow ${
                        isActive ? (isEndingSoon ? 'border-yellow-300 bg-yellow-50/30' : 'border-green-200 bg-green-50/30') : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 flex-1">{auction.title}</h3>
                        {isActive ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isEndingSoon ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {isEndingSoon ? 'ENDING SOON' : 'LIVE'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                            ENDED
                          </span>
                        )}
                      </div>

                      {auction.image && (
                        <img src={auction.image} alt={auction.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                      )}

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Price:</span>
                          <span className="font-semibold text-gray-800">${auction.currentPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Bids:</span>
                          <span className="font-semibold text-gray-800">{auction.bids.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Remaining:</span>
                          <span className={`font-semibold ${isEndingSoon ? 'text-yellow-600' : 'text-gray-800'}`}>
                            {timeRemaining}
                          </span>
                        </div>
                        {auction.bids.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Highest Bidder:</span>
                            <span className="font-semibold text-purple-600">
                              {auction.bids[auction.bids.length - 1].bidder}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/auction/${auction.id}`)}
                          className="flex-1 px-3 py-2 rounded bg-purple-600 text-white text-xs hover:bg-purple-700 transition-colors"
                        >
                          View
                        </button>
                        {isActive && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAuction(auction.id)
                                const minutes = prompt('Extend auction by how many minutes?', extendTime)
                                if (minutes && !isNaN(minutes) && minutes > 0) {
                                  extendAuctionTime(auction.id, parseInt(minutes))
                                }
                              }}
                              className="px-3 py-2 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors"
                            >
                              Extend
                            </button>
                            <button
                              onClick={() => cancelAuction(auction.id)}
                              className="px-3 py-2 rounded bg-orange-600 text-white text-xs hover:bg-orange-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {!isActive && (
                          <button
                            onClick={() => finalizeAuction(auction.id)}
                            className="flex-1 px-3 py-2 rounded bg-green-600 text-white text-xs hover:bg-green-700 transition-colors"
                            disabled={auction.bids.length === 0}
                          >
                            Finalize
                          </button>
                        )}
                        <button
                          onClick={() => deleteAuction(auction.id)}
                          className="px-3 py-2 rounded bg-red-600 text-white text-xs hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Bids Tab */}
        {activeTab === 'bids' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Bid Management</h2>
              <div className="text-sm text-gray-600">
                Total: {myAuctions.reduce((sum, a) => sum + a.bids.length, 0)} bids across all auctions
              </div>
            </div>

            <div className="space-y-4">
              {myAuctions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-3">🎯</div>
                  <p className="text-gray-500 font-medium">No auctions yet</p>
                  <button
                    onClick={() => navigate('/create')}
                    className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Create Your First Auction
                  </button>
                </div>
              ) : (
                myAuctions
                  .filter(function(a) { return a.bids.length > 0 })
                  .map(function(auction) {
                    const now = Date.now()
                    const isActive = (auction.endTime - now) > 0
                    const sortedBids = auction.bids.slice().sort(function(a, b) {
                      return new Date(b.time) - new Date(a.time)
                    })

                    return (
                      <div key={auction.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">{auction.title}</h3>
                              {isActive ? (
                                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                  LIVE
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                  ENDED
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Category: {auction.category}</p>
                            <p className="text-sm text-gray-600">
                              Current Price: <span className="font-semibold text-purple-600">${auction.currentPrice.toLocaleString()}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(`/auction/${auction.id}`)}
                            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 transition-colors"
                          >
                            View Auction
                          </button>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700 mb-3">Bid History ({sortedBids.length} bids)</h4>
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {sortedBids.map((bid, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  idx === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {idx === 0 && (
                                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                      Highest
                                    </span>
                                  )}
                                  <div>
                                    <div className="font-medium text-gray-800">{bid.bidder}</div>
                                    <div className="text-xs text-gray-500">{new Date(bid.time).toLocaleString()}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-purple-600">${bid.amount.toLocaleString()}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {!isActive && auction.bids.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-blue-900">Winner: {sortedBids[0].bidder}</p>
                                  <p className="text-sm text-blue-700">Final Price: ${auction.currentPrice.toLocaleString()}</p>
                                </div>
                                <button
                                  onClick={() => finalizeAuction(auction.id)}
                                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                                  disabled={auction.finalized}
                                >
                                  {auction.finalized ? 'Finalized' : 'Finalize Sale'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
              )}

              {myAuctions.filter(a => a.bids.length > 0).length === 0 && myAuctions.length > 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-3">💭</div>
                  <p className="text-gray-500 font-medium">No bids yet on your auctions</p>
                  <p className="text-sm text-gray-400 mt-1">Bids will appear here once bidders start placing bids</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard(props) {
  const title = props.title
  const value = props.value
  const color = props.color
  const icon = props.icon

  return (
    <div className={'rounded-2xl p-6 text-white bg-gradient-to-r ' + color + ' shadow-lg'}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/80 mb-1">{title}</div>
          <div className="text-3xl font-bold">{value}</div>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}

export default AuctioneerDashboard

