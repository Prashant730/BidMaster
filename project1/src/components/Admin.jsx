import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const Admin = ({ currentUser, users: usersProp, auctions: auctionsProp, commissionRate: commissionRateProp }) => {
  // Use context for real-time updates
  const {
    auctions: contextAuctions,
    users: contextUsers,
    commissionRate: contextCommissionRate,
    setCommissionRate: setContextCommissionRate,
    updateUser: updateContextUser,
    deleteUser: deleteContextUser,
    removeAuction: removeContextAuction,
    updateAuction: updateContextAuction
  } = useApp()

  // Use context values if available, otherwise fall back to props
  const auctions = contextAuctions.length > 0 ? contextAuctions : auctionsProp
  const users = contextUsers.length > 0 ? contextUsers : usersProp
  const commissionRate = contextCommissionRate || commissionRateProp
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [categoryInput, setCategoryInput] = useState('')
  const [categories, setCategories] = useState(['Watches', 'Art', 'Collectibles', 'Furniture', 'Electronics', 'Jewelry'])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [bidSearchTerm, setBidSearchTerm] = useState('')
  const [moderationView, setModerationView] = useState('bids') // 'bids', 'users', 'reports', 'tickets'

  // Password reset state
  const [passwordResetTokens, setPasswordResetTokens] = useState({})

  // Site-wide rules state
  const [siteRules, setSiteRules] = useState({
    defaultAuctionDuration: 24,
    minBidIncrement: 100,
    maxAuctionDuration: 168,
    minStartingPrice: 10,
    termsOfService: 'By using this platform, users agree to abide by all terms and conditions...',
    communityGuidelines: 'Users must treat others with respect and follow all platform policies...'
  })
  const [editingRule, setEditingRule] = useState(null)
  const [ruleEditValue, setRuleEditValue] = useState('')

  // Announcements state
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Welcome to our platform!', message: 'We are excited to have you here.', priority: 'low', active: true, createdAt: new Date() }
  ])
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', priority: 'low' })
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)

  // Reports state
  const [reports, setReports] = useState([
    { id: 1, type: 'auction', targetId: 1, targetTitle: 'Vintage Rolex Submariner', reportedBy: 'User A', reason: 'Misleading description', status: 'pending', createdAt: new Date(Date.now() - 86400000) },
    { id: 2, type: 'user', targetId: 'user@example.com', targetTitle: 'John D.', reportedBy: 'User B', reason: 'Suspicious activity', status: 'pending', createdAt: new Date(Date.now() - 3600000) }
  ])
  const [reportFilter, setReportFilter] = useState('all')

  // Support tickets state
  const [supportTickets, setSupportTickets] = useState([
    { id: 1, userId: 'user1@example.com', userName: 'John Doe', subject: 'Payment issue', category: 'payment', message: 'I cannot complete my payment', status: 'open', priority: 'high', createdAt: new Date(Date.now() - 7200000), responses: [] },
    { id: 2, userId: 'user2@example.com', userName: 'Jane Smith', subject: 'Account access', category: 'account', message: 'I forgot my password', status: 'resolved', priority: 'medium', createdAt: new Date(Date.now() - 172800000), responses: [{ admin: 'Admin', message: 'Password reset link sent', createdAt: new Date(Date.now() - 172000000) }] }
  ])
  const [ticketFilter, setTicketFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketResponse, setTicketResponse] = useState('')

  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You must be an administrator to view this page.</p>
          <button onClick={() => navigate('/')} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Go Home</button>
        </div>
      </div>
    )
  }

  const stats = useMemo(() => {
    const totalUsers = users.length
    const pendingValidations = users.filter(u => u.role === 'auctioneer' && !u.isValidated).length
    const now = Date.now()
    const activeAuctions = auctions.filter(a => {
      const endTime = a.endTime instanceof Date ? a.endTime.getTime() : a.endTime
      return (endTime - now) > 0 && a.status !== 'ended'
    }).length
    const endedAuctions = auctions.filter(a => {
      const endTime = a.endTime instanceof Date ? a.endTime.getTime() : a.endTime
      return (endTime - now) <= 0 || a.status === 'ended'
    }).length
    const bidsToday = auctions.reduce((sum, a) => sum + a.bids.filter(b => isToday(b.time)).length, 0)
    const estimatedRevenue = auctions
      .filter(a => {
        const endTime = a.endTime instanceof Date ? a.endTime.getTime() : a.endTime
        return (endTime - now) <= 0 || a.status === 'ended'
      })
      .filter(a => a.bids.length > 0)
      .reduce((sum, a) => sum + a.currentPrice * commissionRate, 0)
    const totalBidders = users.filter(u => u.role === 'bidder' || !u.role).length
    const totalAuctioneers = users.filter(u => u.role === 'auctioneer').length
    const suspendedUsers = users.filter(u => u.status === 'suspended').length
    const bannedUsers = users.filter(u => u.status === 'banned').length
    return {
      totalUsers,
      pendingValidations,
      activeAuctions,
      endedAuctions,
      bidsToday,
      estimatedRevenue,
      totalBidders,
      totalAuctioneers,
      suspendedUsers,
      bannedUsers
    }
  }, [users, auctions, commissionRate])

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = !searchTerm ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterRole === 'all' ||
        (filterRole === 'admin' && (u.role === 'admin' || u.isAdmin)) ||
        (filterRole === 'auctioneer' && u.role === 'auctioneer') ||
        (filterRole === 'bidder' && (!u.role || u.role === 'bidder') && !u.isAdmin)
      const matchesStatus = filterStatus === 'all' || u.status === filterStatus || (!u.status && filterStatus === 'active')
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, filterRole, filterStatus])

  function isToday(dt) {
    const d = new Date(dt)
    const t = new Date()
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
  }

  const approveUser = (email) => {
    updateContextUser(email, { isValidated: true })
  }
  const suspendUser = (email) => {
    updateContextUser(email, { status: 'suspended' })
  }
  const banUser = (email) => {
    updateContextUser(email, { status: 'banned' })
  }
  const reactivateUser = (email) => {
    updateContextUser(email, { status: 'active' })
  }
  const unbanUser = (email) => {
    updateContextUser(email, { status: 'active' })
  }
  const deleteUser = (email) => {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      deleteContextUser(email)
    }
  }
  const resetPassword = (email) => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setPasswordResetTokens(prev => ({ ...prev, [email]: { token, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } }))
    alert(`Password reset link sent to ${email}\nReset token: ${token}\n(Link expires in 1 hour)`)
  }

  const cancelAuction = (id) => updateContextAuction(id, { endTime: Date.now() - 1 })
  const removeAuction = (id) => {
    if (window.confirm('Are you sure you want to permanently remove this auction? This action cannot be undone.')) {
      removeContextAuction(id)
    }
  }

  const deleteCategory = (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
      setCategories(prev => prev.filter(c => c !== category))
    }
  }

  const updateRule = (key, value) => {
    setSiteRules(prev => ({ ...prev, [key]: value }))
    setEditingRule(null)
  }

  const addAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert('Please fill in both title and message')
      return
    }
    const announcement = {
      id: Date.now(),
      ...newAnnouncement,
      active: true,
      createdAt: new Date()
    }
    setAnnouncements(prev => [announcement, ...prev])
    setNewAnnouncement({ title: '', message: '', priority: 'low' })
  }

  const toggleAnnouncement = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  const deleteAnnouncement = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    }
  }

  const resolveReport = (reportId, action) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved', action, resolvedAt: new Date(), resolvedBy: currentUser.name } : r))
  }

  const addTicketResponse = (ticketId) => {
    if (!ticketResponse.trim()) {
      alert('Please enter a response')
      return
    }
    const response = {
      admin: currentUser.name,
      message: ticketResponse,
      createdAt: new Date()
    }
    setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, responses: [...t.responses, response], status: 'open' } : t))
    setTicketResponse('')
  }

  const updateTicketStatus = (ticketId, status) => {
    setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t))
  }

  const removeBid = (auctionId, bidToRemove) => {
    const auction = auctions.find(a => a.id === auctionId)
    if (!auction) return

    // Find and remove the specific bid by matching bidder, amount, and time
    const newBids = auction.bids.filter((bid) => {
      // Remove the bid that matches the one we want to remove
      // We compare by bidder name, amount, and time to uniquely identify it
      const bidTime = new Date(bid.time).getTime()
      const removeTime = new Date(bidToRemove.time).getTime()
      return !(bid.bidder === bidToRemove.bidder &&
               bid.amount === bidToRemove.amount &&
               Math.abs(bidTime - removeTime) < 1000) // Allow 1 second tolerance for time comparison
    })

    // Recalculate current price from remaining bids
    const newCurrentPrice = newBids.length > 0
      ? Math.max(...newBids.map(b => b.amount))
      : auction.startingPrice

    // Update the auction using context function
    updateContextAuction(auctionId, {
      bids: newBids,
      currentPrice: newCurrentPrice
    })
  }

  // Get all bids from all auctions for moderation view
  const allBids = useMemo(() => {
    return auctions.flatMap(auction =>
      auction.bids.map((bid, bidIndex) => ({
        ...bid,
        auctionId: auction.id,
        auctionTitle: auction.title,
        auctionImage: auction.image,
        bidIndex,
        auctionEndTime: auction.endTime
      }))
    ).sort((a, b) => new Date(b.time) - new Date(a.time))
  }, [auctions])

  const filteredBids = useMemo(() => {
    if (!bidSearchTerm) return allBids
    const search = bidSearchTerm.toLowerCase()
    return allBids.filter(bid =>
      bid.bidder?.toLowerCase().includes(search) ||
      bid.auctionTitle?.toLowerCase().includes(search) ||
      bid.amount.toString().includes(search)
    )
  }, [allBids, bidSearchTerm])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500">Manage users, auctions, and platform settings</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg ${activeTab==='dashboard'?'bg-purple-600 text-white':'bg-gray-100 text-gray-700'}`}>Dashboard</button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg ${activeTab==='users'?'bg-purple-600 text-white':'bg-gray-100 text-gray-700'}`}>Users</button>
            <button onClick={() => setActiveTab('auctions')} className={`px-4 py-2 rounded-lg ${activeTab==='auctions'?'bg-purple-600 text-white':'bg-gray-100 text-gray-700'}`}>Auctions</button>
            <button onClick={() => setActiveTab('financials')} className={`px-4 py-2 rounded-lg ${activeTab==='financials'?'bg-purple-600 text-white':'bg-gray-100 text-gray-700'}`}>Financials</button>
            <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-lg ${activeTab==='config'?'bg-purple-600 text-white':'bg-gray-100 text-gray-700'}`}>Configuration</button>
            <button onClick={() => setActiveTab('moderation')} className={`px-4 py-2 rounded-lg ${activeTab==='moderation'?'bg-purple-600 text-white':'bg-gray-100 text-gray-700'}`}>Moderation</button>
          </div>
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard title="Total Users" value={stats.totalUsers} color="from-purple-500 to-blue-500" />
              <StatCard title="Pending Validations" value={stats.pendingValidations} color="from-yellow-500 to-orange-500" />
              <StatCard title="Live Auctions" value={stats.activeAuctions} color="from-green-500 to-teal-500" />
              <StatCard title="Bids Today" value={stats.bidsToday} color="from-pink-500 to-red-500" />
              <StatCard title="Revenue (est.)" value={`$${Math.round(stats.estimatedRevenue).toLocaleString()}`} color="from-indigo-500 to-purple-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="Bidders" value={stats.totalBidders} color="from-blue-500 to-cyan-500" />
              <StatCard title="Auctioneers" value={stats.totalAuctioneers} color="from-green-500 to-emerald-500" />
              <StatCard title="Suspended" value={stats.suspendedUsers} color="from-orange-500 to-amber-500" />
              <StatCard title="Banned" value={stats.bannedUsers} color="from-red-500 to-rose-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <QuickLink label="Approve Users" onClick={() => setActiveTab('users')} />
                  <QuickLink label="Reported Items" onClick={() => setActiveTab('moderation')} />
                  <QuickLink label="All Auctions" onClick={() => setActiveTab('auctions')} />
                  <QuickLink label="Financial Reports" onClick={() => setActiveTab('financials')} />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Live Activity</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {auctions
                    .flatMap(a => a.bids.map(b => ({ a, b })))
                    .sort((x, y) => new Date(y.b.time) - new Date(x.b.time))
                    .slice(0, 10)
                    .map((x, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">Bid</span>
                          <span className="text-gray-700">${x.b.amount.toLocaleString()} on {x.a.title}</span>
                        </div>
                        <span className="text-gray-500">{new Date(x.b.time).toLocaleTimeString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
              </div>
              <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                Total: {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="bidder">Bidders</option>
                    <option value="auctioneer">Auctioneers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-400 text-4xl mb-3">👤</div>
                        <p className="text-gray-500 font-medium">No users found</p>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.email} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{u.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.role === 'admin' || u.isAdmin ? 'bg-purple-100 text-purple-800' :
                            u.role === 'auctioneer' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role === 'admin' || u.isAdmin ? 'Admin' : (u.role || 'Bidder')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.status === 'active' ? 'bg-green-100 text-green-800' :
                            u.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                            u.status === 'banned' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.isValidated ? (
                            <span className="inline-flex items-center text-green-600 font-semibold">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-orange-600 font-semibold">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            {!u.isValidated && u.role === 'auctioneer' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Approve ${u.name} as an auctioneer?`)) {
                                    approveUser(u.email)
                                  }
                                }}
                                className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors shadow-sm"
                                title="Approve auctioneer"
                              >
                                Approve
                              </button>
                            )}
                            {u.status === 'suspended' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Reactivate ${u.name}?`)) {
                                    reactivateUser(u.email)
                                  }
                                }}
                                className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors shadow-sm"
                                title="Reactivate user"
                              >
                                Reactivate
                              </button>
                            )}
                            {u.status === 'banned' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Unban ${u.name}?`)) {
                                    unbanUser(u.email)
                                  }
                                }}
                                className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors shadow-sm"
                                title="Unban user"
                              >
                                Unban
                              </button>
                            )}
                            {u.status !== 'suspended' && u.status !== 'banned' && (
                              <>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Suspend ${u.name}? They will not be able to access the platform.`)) {
                                      suspendUser(u.email)
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-md bg-yellow-600 text-white text-xs font-medium hover:bg-yellow-700 transition-colors shadow-sm"
                                  title="Suspend user"
                                >
                                  Suspend
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Ban ${u.name}? This action is permanent and will prevent them from using the platform.`)) {
                                      banUser(u.email)
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors shadow-sm"
                                  title="Ban user"
                                >
                                  Ban
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Permanently delete ${u.name}? This action cannot be undone.`)) {
                                  deleteUser(u.email)
                                }
                              }}
                              className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition-colors shadow-sm"
                              title="Delete user"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => resetPassword(u.email)}
                              className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
                              title="Reset password"
                            >
                              Reset PW
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Auctions */}
        {activeTab === 'auctions' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Auction Management</h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  Active: {stats.activeAuctions}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                  Ended: {stats.endedAuctions}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctions.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">No auctions found</div>
              ) : (
                auctions.map(a => {
                  const now = Date.now()
                  const endTime = a.endTime instanceof Date ? a.endTime.getTime() : a.endTime
                  const isActive = (endTime - now) > 0 && a.status !== 'ended'
                  return (
                    <div key={a.id} className={`border rounded-xl p-4 hover:shadow-lg transition-shadow ${
                      isActive ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-gray-800 flex-1">{a.title}</div>
                        {isActive ? (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">LIVE</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">ENDED</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <div>Current: <span className="font-semibold">${a.currentPrice.toLocaleString()}</span></div>
                        <div>Bids: <span className="font-semibold">{a.bids.length}</span></div>
                        <div className="text-xs text-gray-500 mt-1">Ends: {new Date(a.endTime).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => navigate(`/auction/${a.id}`)}
                          className="flex-1 px-3 py-2 rounded bg-purple-600 text-white text-xs hover:bg-purple-700 transition-colors"
                        >
                          View
                        </button>
                        {isActive && (
                          <>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to cancel "${a.title}"?`)) {
                                  cancelAuction(a.id)
                                }
                              }}
                              className="px-3 py-2 rounded bg-orange-600 text-white text-xs hover:bg-orange-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => removeAuction(a.id)}
                              className="px-3 py-2 rounded bg-red-600 text-white text-xs hover:bg-red-700 transition-colors"
                            >
                              Remove
                            </button>
                          </>
                        )}
                        {!isActive && (
                          <button
                            onClick={() => removeAuction(a.id)}
                            className="px-3 py-2 rounded bg-red-600 text-white text-xs hover:bg-red-700 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Financials */}
        {activeTab === 'financials' && (() => {
          const now = Date.now()
          const endedAuctionsWithBids = auctions.filter(a => {
            const endTime = a.endTime instanceof Date ? a.endTime.getTime() : a.endTime
            return (endTime - now <= 0 || a.status === 'ended') && a.bids.length > 0
          })
          const totalRevenue = endedAuctionsWithBids.reduce((sum, a) => sum + a.currentPrice * commissionRate, 0)
          const totalTransactionValue = endedAuctionsWithBids.reduce((sum, a) => sum + a.currentPrice, 0)
          const activeAuctionsWithBids = auctions.filter(a => {
            const endTime = a.endTime instanceof Date ? a.endTime.getTime() : a.endTime
            return (endTime - now > 0 && a.status !== 'ended') && a.bids.length > 0
          })
          const potentialRevenue = activeAuctionsWithBids.reduce((sum, a) => sum + a.currentPrice * commissionRate, 0)

          return (
            <div className="space-y-6">
              {/* Page Header with Description */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Financials & Transactions</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📊 What This Page Does</h3>
                  <p className="text-sm text-blue-800 mb-2">
                    This page provides a comprehensive overview of your platform's financial performance and transaction management.
                    Here you can monitor revenue, adjust commission rates, and track all completed auction transactions.
                  </p>
                  <h3 className="font-semibold text-blue-900 mb-2 mt-3">💡 How It Works</h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li><strong>Commission Rate:</strong> Set the percentage you earn from each completed auction (e.g., 0.05 = 5%)</li>
                    <li><strong>Revenue:</strong> Automatically calculated from ended auctions with winning bids</li>
                    <li><strong>Transactions:</strong> View detailed records of all completed auction sales</li>
                    <li><strong>Potential Revenue:</strong> Estimated earnings from currently active auctions</li>
                  </ul>
                </div>
              </div>

              {/* Key Financial Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white">
                  <div className="text-sm text-white/80 mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold mb-2">${Math.round(totalRevenue).toLocaleString()}</div>
                  <div className="text-xs text-white/70">From {endedAuctionsWithBids.length} completed auctions</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-white">
                  <div className="text-sm text-white/80 mb-1">Total Transaction Value</div>
                  <div className="text-3xl font-bold mb-2">${Math.round(totalTransactionValue).toLocaleString()}</div>
                  <div className="text-xs text-white/70">Total sales before commission</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
                  <div className="text-sm text-white/80 mb-1">Potential Revenue</div>
                  <div className="text-3xl font-bold mb-2">${Math.round(potentialRevenue).toLocaleString()}</div>
                  <div className="text-xs text-white/70">From {activeAuctionsWithBids.length} active auctions</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
                  <div className="text-sm text-white/80 mb-1">Commission Rate</div>
                  <div className="text-3xl font-bold mb-2">{Math.round(commissionRate * 100)}%</div>
                  <div className="text-xs text-white/70">Current platform fee</div>
                </div>
              </div>

              {/* Commission Rate Configuration */}
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Commission Rate Configuration</h3>
                    <p className="text-sm text-gray-600">
                      Adjust the percentage you earn from each completed auction. This rate applies to all future transactions.
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commission Rate (0.00 to 1.00)
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={commissionRate}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0
                            if (val >= 0 && val <= 1) {
                              setContextCommissionRate(val)
                            }
                          }}
                          className="border border-gray-300 rounded-lg px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold"
                        />
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-purple-600">{Math.round(commissionRate * 100)}%</span>
                          <span className="text-xs text-gray-500">Percentage</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Example: A rate of 0.05 (5%) means you earn $50 from a $1,000 auction sale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Transaction History</h3>
                    <p className="text-sm text-gray-600">
                      Complete list of all finished auctions with winning bids. Each transaction shows the sale amount, commission earned, and auction details.
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {endedAuctionsWithBids.length} completed transaction{endedAuctionsWithBids.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {endedAuctionsWithBids.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-gray-400 text-4xl mb-3">💰</div>
                    <p className="text-gray-600 font-medium mb-1">No transactions yet</p>
                    <p className="text-sm text-gray-500">Transactions will appear here once auctions end with winning bids</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-500 border-b-2 border-gray-200">
                          <th className="py-3 pr-4">Auction</th>
                          <th className="py-3 pr-4">Winner</th>
                          <th className="py-3 pr-4">Sale Price</th>
                          <th className="py-3 pr-4">Commission ({Math.round(commissionRate * 100)}%)</th>
                          <th className="py-3 pr-4">Seller Receives</th>
                          <th className="py-3 pr-4">Ended</th>
                        </tr>
                      </thead>
                      <tbody>
                        {endedAuctionsWithBids.map(auction => {
                          const winningBid = auction.bids[auction.bids.length - 1]
                          const commission = auction.currentPrice * commissionRate
                          const sellerReceives = auction.currentPrice - commission
                          return (
                            <tr key={auction.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="py-4 pr-4">
                                <div className="font-medium text-gray-800">{auction.title}</div>
                                <div className="text-xs text-gray-500">ID: {auction.id}</div>
                              </td>
                              <td className="py-4 pr-4">
                                <span className="text-gray-700">{winningBid?.bidder || 'N/A'}</span>
                              </td>
                              <td className="py-4 pr-4">
                                <span className="font-semibold text-gray-800">${auction.currentPrice.toLocaleString()}</span>
                              </td>
                              <td className="py-4 pr-4">
                                <span className="font-semibold text-purple-600">${Math.round(commission).toLocaleString()}</span>
                              </td>
                              <td className="py-4 pr-4">
                                <span className="text-gray-700">${Math.round(sellerReceives).toLocaleString()}</span>
                              </td>
                              <td className="py-4 pr-4">
                                <span className="text-sm text-gray-600">{new Date(auction.endTime).toLocaleDateString()}</span>
                                <div className="text-xs text-gray-500">{new Date(auction.endTime).toLocaleTimeString()}</div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50 font-semibold">
                        <tr>
                          <td colSpan="2" className="py-4 pr-4 text-gray-800">Total</td>
                          <td className="py-4 pr-4 text-gray-800">${Math.round(totalTransactionValue).toLocaleString()}</td>
                          <td className="py-4 pr-4 text-purple-600">${Math.round(totalRevenue).toLocaleString()}</td>
                          <td className="py-4 pr-4 text-gray-700">${Math.round(totalTransactionValue - totalRevenue).toLocaleString()}</td>
                          <td className="py-4 pr-4"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Active Auctions Preview */}
              {activeAuctionsWithBids.length > 0 && (
                <div className="bg-white rounded-2xl shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Active Auctions (Potential Revenue)</h3>
                      <p className="text-sm text-gray-600">
                        These auctions are currently live and have bids. Revenue will be calculated when they end.
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {activeAuctionsWithBids.length} active auction{activeAuctionsWithBids.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeAuctionsWithBids.slice(0, 6).map(auction => {
                      const potentialCommission = auction.currentPrice * commissionRate
                      return (
                        <div key={auction.id} className="border border-green-200 rounded-lg p-4 bg-green-50/30">
                          <div className="font-semibold text-gray-800 mb-2">{auction.title}</div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Current Bid:</span>
                              <span className="font-semibold">${auction.currentPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Potential Commission:</span>
                              <span className="font-semibold text-green-600">${Math.round(potentialCommission).toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Ends: {new Date(auction.endTime).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {activeAuctionsWithBids.length > 6 && (
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      ... and {activeAuctionsWithBids.length - 6} more active auction{activeAuctionsWithBids.length - 6 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })()}

        {/* Configuration */}
        {activeTab === 'config' && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Platform Configuration</h2>
            <div>
              <div className="font-semibold mb-2">Categories</div>
              <div className="flex space-x-2 mb-3">
                <input
                  value={categoryInput}
                  onChange={(e)=>setCategoryInput(e.target.value)}
                  placeholder="Add category"
                  className="border rounded px-3 py-2 flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && categoryInput) {
                      if (!categories.includes(categoryInput)) {
                        setCategories(prev => [...prev, categoryInput])
                        setCategoryInput('')
                      }
                    }
                  }}
                />
                <button
                  onClick={()=>{
                    if(!categoryInput) return
                    if(categories.includes(categoryInput)) {
                      alert('Category already exists')
                      return
                    }
                    setCategories(prev=> [...prev, categoryInput])
                    setCategoryInput('')
                  }}
                  className="px-3 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <span key={c} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm flex items-center gap-2">
                    {c}
                    <button
                      onClick={() => deleteCategory(c)}
                      className="text-red-600 hover:text-red-800 font-bold"
                      title="Delete category"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold mb-3">Site-wide Rules</div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Default Auction Duration (hours)</label>
                    {editingRule === 'defaultAuctionDuration' ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={ruleEditValue}
                          onChange={(e) => setRuleEditValue(e.target.value)}
                          className="border rounded px-3 py-2 w-full"
                          min="1"
                          max="168"
                        />
                        <button onClick={() => updateRule('defaultAuctionDuration', parseInt(ruleEditValue))} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
                        <button onClick={() => setEditingRule(null)} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 font-medium">{siteRules.defaultAuctionDuration} hours</span>
                        <button onClick={() => { setEditingRule('defaultAuctionDuration'); setRuleEditValue(siteRules.defaultAuctionDuration) }} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Minimum Bid Increment ($)</label>
                    {editingRule === 'minBidIncrement' ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={ruleEditValue}
                          onChange={(e) => setRuleEditValue(e.target.value)}
                          className="border rounded px-3 py-2 w-full"
                          min="1"
                        />
                        <button onClick={() => updateRule('minBidIncrement', parseInt(ruleEditValue))} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
                        <button onClick={() => setEditingRule(null)} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 font-medium">${siteRules.minBidIncrement}</span>
                        <button onClick={() => { setEditingRule('minBidIncrement'); setRuleEditValue(siteRules.minBidIncrement) }} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Maximum Auction Duration (hours)</label>
                    {editingRule === 'maxAuctionDuration' ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={ruleEditValue}
                          onChange={(e) => setRuleEditValue(e.target.value)}
                          className="border rounded px-3 py-2 w-full"
                          min="1"
                        />
                        <button onClick={() => updateRule('maxAuctionDuration', parseInt(ruleEditValue))} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
                        <button onClick={() => setEditingRule(null)} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 font-medium">{siteRules.maxAuctionDuration} hours</span>
                        <button onClick={() => { setEditingRule('maxAuctionDuration'); setRuleEditValue(siteRules.maxAuctionDuration) }} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Minimum Starting Price ($)</label>
                    {editingRule === 'minStartingPrice' ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={ruleEditValue}
                          onChange={(e) => setRuleEditValue(e.target.value)}
                          className="border rounded px-3 py-2 w-full"
                          min="0"
                        />
                        <button onClick={() => updateRule('minStartingPrice', parseFloat(ruleEditValue))} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
                        <button onClick={() => setEditingRule(null)} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-800 font-medium">${siteRules.minStartingPrice}</span>
                        <button onClick={() => { setEditingRule('minStartingPrice'); setRuleEditValue(siteRules.minStartingPrice) }} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Terms of Service</label>
                  {editingRule === 'termsOfService' ? (
                    <div className="space-y-2">
                      <textarea
                        value={ruleEditValue}
                        onChange={(e) => setRuleEditValue(e.target.value)}
                        className="border rounded px-3 py-2 w-full h-32"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => updateRule('termsOfService', ruleEditValue)} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
                        <button onClick={() => setEditingRule(null)} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-700 text-sm">{siteRules.termsOfService}</p>
                      <button onClick={() => { setEditingRule('termsOfService'); setRuleEditValue(siteRules.termsOfService) }} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Community Guidelines</label>
                  {editingRule === 'communityGuidelines' ? (
                    <div className="space-y-2">
                      <textarea
                        value={ruleEditValue}
                        onChange={(e) => setRuleEditValue(e.target.value)}
                        className="border rounded px-3 py-2 w-full h-32"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => updateRule('communityGuidelines', ruleEditValue)} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
                        <button onClick={() => setEditingRule(null)} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-700 text-sm">{siteRules.communityGuidelines}</p>
                      <button onClick={() => { setEditingRule('communityGuidelines'); setRuleEditValue(siteRules.communityGuidelines) }} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-3">Announcements</div>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Create New Announcement</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Announcement title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <textarea
                      placeholder="Announcement message"
                      value={newAnnouncement.message}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                      className="border rounded px-3 py-2 w-full h-24"
                    />
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-gray-600">Priority:</label>
                      <select
                        value={newAnnouncement.priority}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                        className="border rounded px-3 py-2"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <button onClick={addAnnouncement} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                        Post Announcement
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Active Announcements ({announcements.filter(a => a.active).length})</h4>
                  {announcements.length === 0 ? (
                    <p className="text-gray-500 text-sm">No announcements yet</p>
                  ) : (
                    announcements.map(announcement => (
                      <div key={announcement.id} className={`border rounded-lg p-4 ${announcement.active ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-gray-800">{announcement.title}</h5>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                announcement.priority === 'high' ? 'bg-red-100 text-red-700' :
                                announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {announcement.priority}
                              </span>
                              {announcement.active ? (
                                <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs">Active</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">Inactive</span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{announcement.message}</p>
                            <p className="text-xs text-gray-500">Created: {new Date(announcement.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => toggleAnnouncement(announcement.id)}
                              className={`px-3 py-1 rounded text-xs ${
                                announcement.active
                                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {announcement.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteAnnouncement(announcement.id)}
                              className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Moderation */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Content Moderation</h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setModerationView('bids')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      moderationView === 'bids'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Manage Bids ({allBids.length})
                  </button>
                  <button
                    onClick={() => setModerationView('users')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      moderationView === 'users'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Manage Users ({users.length})
                  </button>
                  <button
                    onClick={() => setModerationView('reports')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      moderationView === 'reports'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Reports ({reports.filter(r => r.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setModerationView('tickets')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      moderationView === 'tickets'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Support Tickets ({supportTickets.filter(t => t.status === 'open').length})
                  </button>
                </div>
              </div>

              {/* Bids Moderation View */}
              {moderationView === 'bids' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Search bids by bidder name, auction title, or amount..."
                      value={bidSearchTerm}
                      onChange={(e) => setBidSearchTerm(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="text-sm text-gray-600">
                      Showing {filteredBids.length} of {allBids.length} bids
                    </div>
                  </div>

                  {filteredBids.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg mb-2">No bids found</p>
                      <p className="text-sm">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {filteredBids.map((bid) => {
                        const auction = auctions.find(a => a.id === bid.auctionId)
                        const endTime = auction ? (auction.endTime instanceof Date ? auction.endTime.getTime() : auction.endTime) : 0
                        const isActive = auction && (endTime - Date.now() > 0) && auction.status !== 'ended'
                        const isHighestBid = auction && auction.bids.length > 0 &&
                          bid.bidIndex === auction.bids.length - 1

                        return (
                          <div
                            key={`${bid.auctionId}-${bid.bidIndex}`}
                            className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${
                              isHighestBid ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                {bid.auctionImage && (
                                  <img
                                    src={bid.auctionImage}
                                    alt={bid.auctionTitle}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-800">{bid.auctionTitle}</h3>
                                    {isActive ? (
                                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">LIVE</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">ENDED</span>
                                    )}
                                    {isHighestBid && (
                                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Highest Bid</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2">
                                    <span className="font-medium">Bidder:</span> {bid.bidder}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Bid Amount:</span> <span className="text-lg font-bold text-purple-600">${bid.amount.toLocaleString()}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Placed: {new Date(bid.time).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to remove this bid of $${bid.amount.toLocaleString()} by ${bid.bidder} on "${bid.auctionTitle}"? This action cannot be undone.`)) {
                                      removeBid(bid.auctionId, bid)
                                    }
                                  }}
                                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                                >
                                  Remove Bid
                                </button>
                                <button
                                  onClick={() => navigate(`/auction/${bid.auctionId}`)}
                                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors whitespace-nowrap"
                                >
                                  View Auction
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Users Moderation View */}
              {moderationView === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-gray-500">
                        <p className="text-lg mb-2">No users found</p>
                        <p className="text-sm">Try adjusting your search or filter</p>
                      </div>
                    ) : (
                      filteredUsers.map(u => (
                        <div
                          key={u.email}
                          className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${
                            u.status === 'banned' ? 'border-red-200 bg-red-50/30' :
                            u.status === 'suspended' ? 'border-yellow-200 bg-yellow-50/30' :
                            'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-800">{u.name}</h3>
                                {u.isAdmin && (
                                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">Admin</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{u.email}</p>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  u.role === 'auctioneer' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {u.role || 'bidder'}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  u.status === 'active' ? 'bg-green-100 text-green-700' :
                                  u.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                                  u.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {u.status || 'active'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {u.status !== 'suspended' && u.status !== 'banned' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to suspend ${u.name}?`)) {
                                    suspendUser(u.email)
                                  }
                                }}
                                className="flex-1 px-3 py-2 rounded-lg bg-yellow-600 text-white text-xs font-medium hover:bg-yellow-700 transition-colors"
                              >
                                Suspend
                              </button>
                            )}
                            {u.status !== 'banned' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to ban ${u.name}? This will prevent them from using the platform.`)) {
                                    banUser(u.email)
                                  }
                                }}
                                className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                              >
                                Ban User
                              </button>
                            )}
                            {u.status === 'suspended' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to reactivate ${u.name}?`)) {
                                    reactivateUser(u.email)
                                  }
                                }}
                                className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Reactivate
                              </button>
                            )}
                            {u.status === 'banned' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to unban ${u.name}?`)) {
                                    unbanUser(u.email)
                                  }
                                }}
                                className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Unban
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete ${u.name}? This action cannot be undone.`)) {
                                  deleteUser(u.email)
                                }
                              }}
                              className="flex-1 px-3 py-2 rounded-lg bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Reports View */}
              {moderationView === 'reports' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <select
                      value={reportFilter}
                      onChange={(e) => setReportFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Reports</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <div className="text-sm text-gray-600">
                      Showing {reports.filter(r => reportFilter === 'all' || r.status === reportFilter).length} reports
                    </div>
                  </div>

                  {reports.filter(r => reportFilter === 'all' || r.status === reportFilter).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg mb-2">No reports found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.filter(r => reportFilter === 'all' || r.status === reportFilter).map(report => (
                        <div key={report.id} className={`border rounded-xl p-4 ${
                          report.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  report.type === 'auction' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {report.type === 'auction' ? 'Auction Report' : 'User Report'}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {report.status}
                                </span>
                              </div>
                              <h3 className="font-semibold text-gray-800 mb-1">{report.targetTitle}</h3>
                              <p className="text-sm text-gray-600 mb-1"><strong>Reason:</strong> {report.reason}</p>
                              <p className="text-sm text-gray-500">Reported by: {report.reportedBy} • {new Date(report.createdAt).toLocaleString()}</p>
                              {report.resolvedAt && (
                                <p className="text-sm text-gray-500 mt-1">Resolved by: {report.resolvedBy} • {new Date(report.resolvedAt).toLocaleString()}</p>
                              )}
                            </div>
                            {report.status === 'pending' && (
                              <div className="flex flex-col gap-2 ml-4">
                                <button
                                  onClick={() => {
                                    if (window.confirm('Mark this report as resolved?')) {
                                      resolveReport(report.id, 'reviewed')
                                    }
                                  }}
                                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => navigate(report.type === 'auction' ? `/auction/${report.targetId}` : '#')}
                                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
                                >
                                  View
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Support Tickets View */}
              {moderationView === 'tickets' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <select
                      value={ticketFilter}
                      onChange={(e) => setTicketFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Tickets</option>
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <div className="text-sm text-gray-600">
                      Showing {supportTickets.filter(t => ticketFilter === 'all' || t.status === ticketFilter).length} tickets
                    </div>
                  </div>

                  {supportTickets.filter(t => ticketFilter === 'all' || t.status === ticketFilter).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg mb-2">No tickets found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {supportTickets.filter(t => ticketFilter === 'all' || t.status === ticketFilter).map(ticket => (
                        <div key={ticket.id} className={`border rounded-xl p-4 ${
                          ticket.status === 'open' ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-800">{ticket.subject}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {ticket.priority}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                                  ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {ticket.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1"><strong>Category:</strong> {ticket.category}</p>
                              <p className="text-sm text-gray-600 mb-1"><strong>From:</strong> {ticket.userName} ({ticket.userId})</p>
                              <p className="text-sm text-gray-700 mb-2">{ticket.message}</p>
                              <p className="text-xs text-gray-500">Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                              {ticket.responses.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-sm font-medium text-gray-700">Responses:</p>
                                  {ticket.responses.map((response, idx) => (
                                    <div key={idx} className="bg-white rounded p-2 text-sm">
                                      <p className="font-medium text-gray-800">{response.admin}</p>
                                      <p className="text-gray-600">{response.message}</p>
                                      <p className="text-xs text-gray-500">{new Date(response.createdAt).toLocaleString()}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <button
                                onClick={() => setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)}
                                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
                              >
                                {selectedTicket === ticket.id ? 'Hide Reply' : 'Reply'}
                              </button>
                              <select
                                value={ticket.status}
                                onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                                className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
                              >
                                <option value="open">Open</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                          </div>
                          {selectedTicket === ticket.id && (
                            <div className="mt-4 pt-4 border-t">
                              <textarea
                                value={ticketResponse}
                                onChange={(e) => setTicketResponse(e.target.value)}
                                placeholder="Enter your response..."
                                className="w-full border rounded px-3 py-2 mb-2 h-24"
                              />
                              <button
                                onClick={() => addTicketResponse(ticket.id)}
                                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                Send Response
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const StatCard = ({ title, value, color }) => (
  <div className={`rounded-2xl p-5 text-white bg-gradient-to-r ${color}`}>
    <div className="text-sm text-white/80">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
)

const QuickLink = ({ label, onClick }) => (
  <button onClick={onClick} className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm text-left">
    {label}
  </button>
)

export default Admin


