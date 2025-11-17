import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function UserProfile(props) {
  const user = props.user
  const auctions = props.auctions
  const onUpdateUser = props.onUpdateUser
  const users = props.users
  const setUsers = props.setUsers
  const navigate = useNavigate()
  const [activeBids, setActiveBids] = useState([])
  const [wonItems, setWonItems] = useState([])
  const [totalBiddingAmount, setTotalBiddingAmount] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [recentActivity, setRecentActivity] = useState([])

  // Admin-specific stats
  const adminStats = useMemo(function() {
    if (!user || !user.isAdmin || !users || !auctions) return null
    const now = Date.now()
    const totalUsers = users.length
    const pendingValidations = users.filter(function(u) { return u.role === 'auctioneer' && !u.isValidated }).length
    const activeAuctions = auctions.filter(function(a) { return (a.endTime - now) > 0 }).length
    
    const endedWithBids = auctions.filter(function(a) {
      return (a.endTime - now) <= 0 && a.bids.length > 0
    })
    let totalRevenue = 0
    for (let i = 0; i < endedWithBids.length; i++) {
      totalRevenue += endedWithBids[i].currentPrice * 0.05
    }
    
    const actionsToday = users.filter(function(u) {
      // Mock: count users modified today (in real app, track action timestamps)
      return u.status === 'suspended' || u.status === 'banned'
    }).length

    return {
      totalUsers: totalUsers,
      pendingValidations: pendingValidations,
      activeAuctions: activeAuctions,
      totalRevenue: totalRevenue,
      actionsToday: actionsToday
    }
  }, [user, users, auctions])

  const [formValues, setFormValues] = useState({
    name: '',
    address: '',
    phone: '',
    profilePhoto: ''
  })
  const [photoPreview, setPhotoPreview] = useState('')

  // Update form values when user changes
  useEffect(function() {
    if (!user) {
      return
    }
    // Set form values from user data
    setFormValues({
      name: user.name || '',
      address: user.address || '',
      phone: user.phone || '',
      profilePhoto: user.profilePhoto || ''
    })
    // Set photo preview
    setPhotoPreview(user.profilePhoto || '')
  }, [user])

  useEffect(function() {
    // Check if user and auctions exist
    if (!user || !auctions) {
      return
    }

    // Function to compute user data
    function compute() {
      // Step 1: Get all auctions where user has placed bids
      const userBidAuctions = []
      for (let i = 0; i < auctions.length; i++) {
        const auction = auctions[i]
        if (user.bids && user.bids.includes(auction.id)) {
          userBidAuctions.push(auction)
        }
      }

      // Step 2: Separate active and ended auctions
      const now = Date.now()
      const active = []
      const ended = []
      
      for (let i = 0; i < userBidAuctions.length; i++) {
        const auction = userBidAuctions[i]
        const timeLeft = auction.endTime - now
        
        if (timeLeft > 0) {
          // Auction is still active
          active.push(auction)
        } else {
          // Auction has ended, check if user won
          if (auction.bids.length > 0) {
            const highestBid = auction.bids[auction.bids.length - 1]
            if (highestBid.bidder === user.name) {
              ended.push(auction)
            }
          }
        }
      }

      // Step 3: Update active bids and won items
      setActiveBids(active)
      setWonItems(ended)

      // Step 4: Calculate total bidding amount
      let total = 0
      for (let i = 0; i < userBidAuctions.length; i++) {
        const auction = userBidAuctions[i]
        // Find user's bid in this auction
        let userBid = null
        for (let j = 0; j < auction.bids.length; j++) {
          if (auction.bids[j].bidder === user.name) {
            userBid = auction.bids[j]
            break
          }
        }
        // Add bid amount to total if found
        if (userBid) {
          total = total + userBid.amount
        }
      }
      setTotalBiddingAmount(total)

      // Recent activity (only render if exists)
      const allBids = []
      for (let i = 0; i < auctions.length; i++) {
        const auction = auctions[i]
        for (let j = 0; j < auction.bids.length; j++) {
          allBids.push({ auction: auction, bid: auction.bids[j] })
        }
      }
      const userBids = allBids.filter(function(x) { return x.bid.bidder === user.name })
      userBids.sort(function(a, b) {
        return new Date(b.bid.time) - new Date(a.bid.time)
      })
      const activities = userBids.slice(0, 10)
      setRecentActivity(activities)

      // Update user's wonItems if needed
      const wonItemIds = ended.map(function(auction) { return auction.id })
      if (onUpdateUser && user.wonItems) {
        const sortedWonItems = user.wonItems.slice().sort()
        const sortedWonItemIds = wonItemIds.slice().sort()
        if (JSON.stringify(sortedWonItems) !== JSON.stringify(sortedWonItemIds)) {
          const updatedUser = {
            name: user.name,
            email: user.email,
            bids: user.bids,
            wonItems: wonItemIds,
            address: user.address,
            phone: user.phone,
            profilePhoto: user.profilePhoto,
            status: user.status,
            role: user.role,
            isValidated: user.isValidated,
            isAdmin: user.isAdmin
          }
          onUpdateUser(updatedUser)
        }
      }
    }

    compute()
    const intervalId = setInterval(compute, 1000)
    return () => clearInterval(intervalId)
  }, [user, auctions, onUpdateUser])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Please Login</h2>
          <p className="text-gray-600 dark:text-gray-300">You need to be logged in to view your profile.</p>
        </div>
      </div>
    )
  }

  // If admin, show admin profile view
  if (user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-200">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Admin Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center space-x-6">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-white/30" />
              ) : (
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-semibold">Administrator</span>
                </div>
                <p className="text-purple-100">{user.email}</p>
                {(user.address || user.phone) && (
                  <div className="text-sm text-purple-100 mt-2">
                    {user.address && <div>{user.address}</div>}
                    {user.phone && <div>{user.phone}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Menu */}
            <aside className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 h-max lg:sticky lg:top-24 transition-colors duration-200">
              <div className="mb-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Signed in as</div>
                <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</div>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Admin Account</div>
              </div>
              <nav className="space-y-2">
                <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>
                  Admin Overview
                </button>
                <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>
                  Profile Settings
                </button>
                <div className="pt-4 border-t">
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full text-left px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium"
                  >
                    Go to Admin Panel →
                  </button>
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl p-6 text-center">
                      <div className="text-3xl font-bold mb-2">{adminStats && adminStats.totalUsers ? adminStats.totalUsers : 0}</div>
                      <div className="text-purple-100 text-sm">Total Users</div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-6 text-center">
                      <div className="text-3xl font-bold mb-2">{adminStats && adminStats.pendingValidations ? adminStats.pendingValidations : 0}</div>
                      <div className="text-yellow-100 text-sm">Pending Validations</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl p-6 text-center">
                      <div className="text-3xl font-bold mb-2">{adminStats && adminStats.activeAuctions ? adminStats.activeAuctions : 0}</div>
                      <div className="text-green-100 text-sm">Active Auctions</div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-6 text-center">
                      <div className="text-3xl font-bold mb-2">${Math.round(adminStats && adminStats.totalRevenue ? adminStats.totalRevenue : 0).toLocaleString()}</div>
                      <div className="text-indigo-100 text-sm">Total Revenue</div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 transition-colors duration-200">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Admin Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => navigate('/admin')}
                        className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                      >
                        <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Manage Users</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">View and manage all platform users</div>
                      </button>
                      <button
                        onClick={() => navigate('/admin')}
                        className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                      >
                        <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Manage Auctions</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Oversee all active and ended auctions</div>
                      </button>
                      <button
                        onClick={() => navigate('/admin')}
                        className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                      >
                        <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Financial Reports</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">View revenue and transaction data</div>
                      </button>
                      <button
                        onClick={() => navigate('/admin')}
                        className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                      >
                        <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Platform Settings</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Configure platform-wide settings</div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 transition-colors duration-200">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Admin Information</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-100">Account Type</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Full administrative access</div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">Admin</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-100">Permissions</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">User management, auction oversight, platform configuration</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-gray-100">Last Login</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Active now</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 transition-colors duration-200">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Admin Profile Settings</h2>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xl font-bold text-white">
                          {formValues.name ? formValues.name.charAt(0) : 'A'}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onloadend = function() {
                              const dataUrl = reader.result
                              setPhotoPreview(dataUrl)
                              setFormValues(function(prev) {
                                return {
                                  name: prev.name,
                                  address: prev.address,
                                  phone: prev.phone,
                                  profilePhoto: dataUrl
                                }
                              })
                            }
                            reader.readAsDataURL(file)
                          }}
                          className="block text-sm text-gray-600 dark:text-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formValues.name}
                        onChange={function(e) {
                          setFormValues(function(prev) {
                            return {
                              name: e.target.value,
                              address: prev.address,
                              phone: prev.phone,
                              profilePhoto: prev.profilePhoto
                            }
                          })
                        }}
                        className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                      <input
                        type="text"
                        value={formValues.address}
                        onChange={function(e) {
                          setFormValues(function(prev) {
                            return {
                              name: prev.name,
                              address: e.target.value,
                              phone: prev.phone,
                              profilePhoto: prev.profilePhoto
                            }
                          })
                        }}
                        className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Street, City, Country"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formValues.phone}
                        onChange={(e) => setFormValues(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g. +1 555 123 4567"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          if (!onUpdateUser) return
                          onUpdateUser({ ...user, ...formValues })
                        }}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8 transition-colors duration-200">
          <div className="flex items-center space-x-6">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">{user.name.charAt(0)}</div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              {(user.address || user.phone) && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {user.address && <div>{user.address}</div>}
                  {user.phone && <div>{user.phone}</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Menu */}
          <aside className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 h-max lg:sticky lg:top-24 transition-colors duration-200">
            <div className="mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Signed in as</div>
              <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</div>
            </div>
            <nav className="space-y-2">
              <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>Overview</button>
              <button onClick={() => setActiveTab('bids')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'bids' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>My Bids</button>
              <button onClick={() => setActiveTab('won')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'won' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>Won Items</button>
              <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>Settings</button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold mb-2">${totalBiddingAmount.toLocaleString()}</div>
                    <div className="text-purple-100">Total Bidding Amount</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold mb-2">{wonItems.length}</div>
                    <div className="text-green-100">Auctions Won</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold mb-2">{activeBids.length + wonItems.length > 0 ? Math.round((wonItems.length / (activeBids.length + wonItems.length)) * 100) : 0}%</div>
                    <div className="text-orange-100">Success Rate</div>
                  </div>
                </div>
                {recentActivity.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 transition-colors duration-200">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                      {recentActivity.map(({ auction, bid }, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 dark:border-slate-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img src={auction.image} alt={auction.title} className="w-10 h-10 rounded object-cover" />
                            <div>
                              <div className="font-semibold text-gray-800 dark:text-gray-100">Bid ${bid.amount.toLocaleString()} on {auction.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(bid.time).toLocaleString()}</div>
                            </div>
                          </div>
                          <button onClick={() => navigate(`/auction/${auction.id}`)} className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">View</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {(activeTab === 'bids' || activeTab === 'overview') && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 transition-colors duration-200">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Active Bids</h2>
                <div className="space-y-4">
                  {activeBids.length > 0 ? (
                    activeBids.map(auction => {
                      const userBid = auction.bids.find(bid => bid.bidder === user.name)
                      const isHighestBidder = auction.bids.length > 0 && auction.bids[auction.bids.length - 1].bidder === user.name
                      const timeLeft = auction.endTime - new Date()
                      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))

                      return (
                        <div
                          key={auction.id}
                          className="flex items-center space-x-4 p-4 border border-gray-100 dark:border-slate-700 rounded-lg hover:border-purple-200 dark:hover:border-purple-700 transition-colors cursor-pointer"
                          onClick={() => navigate(`/auction/${auction.id}`)}
                        >
                          <img src={auction.image} alt={auction.title} className="w-16 h-16 object-cover rounded-lg" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{auction.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Your Bid: ${userBid ? userBid.amount.toLocaleString() : 'N/A'} | Current: ${auction.currentPrice.toLocaleString()}</p>
                            {isHighestBidder && (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full mt-1 inline-block">You're winning!</span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">LIVE</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{hoursLeft}h left</div>
                          </div>
                        </div>
                      )
                    })
                  ) : null}
                </div>
              </div>
            )}

            {(activeTab === 'won' || activeTab === 'overview') && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 transition-colors duration-200">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Items Won</h2>
                <div className="space-y-4">
                  {wonItems.length > 0 ? (
                    wonItems.map(auction => (
                      <div
                        key={auction.id}
                        className="flex items-center space-x-4 p-4 border border-gray-100 dark:border-slate-700 rounded-lg hover:border-green-200 dark:hover:border-green-700 transition-colors cursor-pointer"
                        onClick={() => navigate(`/auction/${auction.id}`)}
                      >
                        <img src={auction.image} alt={auction.title} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{auction.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Winning Bid: ${auction.currentPrice.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ended: {auction.endTime.toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600 dark:text-green-400">WON</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                        </div>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 transition-colors duration-200">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300">
                        {formValues.name ? formValues.name.charAt(0) : 'U'}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            const dataUrl = reader.result
                            setPhotoPreview(dataUrl)
                            setFormValues(prev => ({ ...prev, profilePhoto: dataUrl }))
                          }
                          reader.readAsDataURL(file)
                        }}
                        className="block text-sm text-gray-600 dark:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formValues.name}
                      onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                    <input
                      type="text"
                      value={formValues.address}
                      onChange={(e) => setFormValues(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Street, City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formValues.phone}
                      onChange={(e) => setFormValues(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. +1 555 123 4567"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (!onUpdateUser) return
                        onUpdateUser({ ...user, ...formValues })
                      }}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
