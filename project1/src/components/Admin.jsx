import React, { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { adminAPI, activityAPI } from '../services/api.js'
import { getSocket } from '../services/socket.js'

function Admin(props) {
  const currentUser = props.currentUser
  const usersProp = props.users
  const auctionsProp = props.auctions
  const commissionRateProp = props.commissionRate
  const { isDark } = useTheme()
  // Use context for real-time updates
  const appContext = useApp()
  const contextAuctions = appContext.auctions
  const contextUsers = appContext.users
  const contextCommissionRate = appContext.commissionRate
  const setContextCommissionRate = appContext.setCommissionRate
  const updateContextUser = appContext.updateUser
  const deleteContextUser = appContext.deleteUser
  const removeContextAuction = appContext.removeAuction
  const updateContextAuction = appContext.updateAuction

  // State for users fetched from backend
  const [backendUsers, setBackendUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [usersError, setUsersError] = useState(null)

  // State for live activities
  const [liveActivities, setLiveActivities] = useState([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [activitiesError, setActivitiesError] = useState(null)

  // State for dashboard stats from backend
  const [backendStats, setBackendStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Fetch users from backend on component mount
  useEffect(function() {
    fetchUsers()
    fetchStats()
  }, [])

  async function fetchUsers() {
    try {
      setLoadingUsers(true)
      setUsersError(null)
      const response = await adminAPI.getUsers()
      if (response.data && response.data.success) {
        setBackendUsers(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsersError('Failed to load users from server')
    } finally {
      setLoadingUsers(false)
    }
  }

  // Fetch dashboard stats from backend
  async function fetchStats() {
    try {
      setLoadingStats(true)
      const response = await adminAPI.getStats()
      if (response.data && response.data.success) {
        setBackendStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  // Fetch live activities from backend
  async function fetchActivities() {
    try {
      setLoadingActivities(true)
      setActivitiesError(null)
      const response = await activityAPI.getRecent(50)
      if (response.data) {
        setLiveActivities(response.data)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivitiesError('Failed to load activities')
    } finally {
      setLoadingActivities(false)
    }
  }

  // Set up Socket.IO connection for real-time activity updates
  useEffect(function() {
    fetchActivities()

    // Use shared socket connection
    const socket = getSocket()

    // Join admin room for activity updates
    socket.emit('joinAdminRoom')
    console.log('Admin joined admin room for activity feed')

    // Listen for new activities from admin room
    socket.on('newActivity', function(activity) {
      setLiveActivities(function(prev) {
        // Add new activity to the front, keep only last 50
        const updated = [activity, ...prev].slice(0, 50)
        return updated
      })
    })

    // Also listen for direct bid events
    socket.on('bidPlaced', function(data) {
      console.log('Bid placed event received:', data)
      const activity = {
        type: 'bid',
        message: 'Bid placed: $' + data.amount,
        userName: data.bidderName,
        auctionId: data.auctionId,
        auctionTitle: data.auctionTitle || 'Unknown Auction',
        amount: data.amount,
        timestamp: data.timestamp || new Date()
      }
      setLiveActivities(function(prev) {
        const updated = [activity, ...prev].slice(0, 50)
        return updated
      })
    })

    // Listen for auction created events
    socket.on('auctionCreated', function(data) {
      console.log('Auction created event received:', data)
      const activity = {
        type: 'auction_created',
        message: 'New auction: ' + (data.auction ? data.auction.title : 'Unknown'),
        userName: data.auction ? data.auction.seller : 'Unknown',
        auctionId: data.auction ? data.auction.id : null,
        auctionTitle: data.auction ? data.auction.title : 'Unknown',
        amount: data.auction ? data.auction.startingPrice : 0,
        timestamp: new Date()
      }
      setLiveActivities(function(prev) {
        const updated = [activity, ...prev].slice(0, 50)
        return updated
      })
    })

    // Listen for auction ended events
    socket.on('auctionEnded', function(data) {
      console.log('Auction ended event received:', data)
      const activity = {
        type: 'auction_ended',
        message: 'Auction ended',
        auctionId: data.auctionId,
        timestamp: data.endTime || new Date()
      }
      setLiveActivities(function(prev) {
        const updated = [activity, ...prev].slice(0, 50)
        return updated
      })
    })

    // Listen for user registered events
    socket.on('userRegistered', function(data) {
      console.log('User registered event received:', data)
      const activity = {
        type: 'user_registered',
        message: 'New user registered: ' + (data.user ? data.user.name : 'Unknown'),
        userName: data.user ? data.user.name : 'Unknown',
        userEmail: data.user ? data.user.email : '',
        timestamp: new Date()
      }
      setLiveActivities(function(prev) {
        const updated = [activity, ...prev].slice(0, 50)
        return updated
      })
    })

    socket.on('disconnect', function() {
      console.log('Admin disconnected from activity feed')
    })

    // Cleanup on unmount - leave admin room but don't disconnect shared socket
    return function() {
      socket.emit('leaveAdminRoom')
      socket.off('newActivity')
      socket.off('bidPlaced')
      socket.off('auctionCreated')
      socket.off('auctionEnded')
      socket.off('userRegistered')
    }
  }, [])

  // Use backend users if available, otherwise fall back to context/props
  const auctions = contextAuctions.length > 0 ? contextAuctions : auctionsProp
  const users = backendUsers.length > 0 ? backendUsers : (contextUsers.length > 0 ? contextUsers : usersProp)
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

  // Calculate statistics for dashboard - use backend stats if available
  // NOTE: This useMemo must be BEFORE any early returns to follow React hooks rules
  const stats = useMemo(function() {
    // If backend stats are available, use them
    if (backendStats) {
      return {
        totalUsers: backendStats.totalUsers || 0,
        pendingValidations: backendStats.pendingValidations || 0,
        activeAuctions: backendStats.liveAuctions || 0,
        endedAuctions: backendStats.endedAuctions || 0,
        bidsToday: backendStats.bidsToday || 0,
        estimatedRevenue: backendStats.estimatedRevenue || 0,
        totalBidders: backendStats.totalBidders || 0,
        totalAuctioneers: backendStats.totalAuctioneers || backendStats.totalSellers || 0,
        suspendedUsers: backendStats.suspendedUsers || 0,
        bannedUsers: backendStats.bannedUsers || 0
      }
    }

    // Fallback: Calculate from local data if backend stats not available
    // Step 1: Count total users
    const totalUsers = users.length

    // Step 2: Count pending validations (sellers waiting for approval)
    let pendingValidations = 0
    for (let i = 0; i < users.length; i++) {
      if ((users[i].role === 'auctioneer' || users[i].role === 'seller') && !users[i].isValidated) {
        pendingValidations = pendingValidations + 1
      }
      if (users[i].sellerStatus === 'pending') {
        pendingValidations = pendingValidations + 1
      }
    }

    // Step 3: Count active and ended auctions
    const now = Date.now()
    let activeAuctions = 0
    let endedAuctions = 0

    for (let i = 0; i < auctions.length; i++) {
      const auction = auctions[i]
      let endTime = auction.endTime
      if (endTime instanceof Date) {
        endTime = endTime.getTime()
      }

      if ((endTime - now) > 0 && auction.status !== 'ended') {
        activeAuctions = activeAuctions + 1
      } else {
        endedAuctions = endedAuctions + 1
      }
    }

    // Step 4: Count bids placed today
    let bidsToday = 0
    for (let i = 0; i < auctions.length; i++) {
      const auction = auctions[i]
      for (let j = 0; j < auction.bids.length; j++) {
        if (isToday(auction.bids[j].time)) {
          bidsToday = bidsToday + 1
        }
      }
    }

    // Step 5: Calculate estimated revenue from ended auctions
    let estimatedRevenue = 0
    for (let i = 0; i < auctions.length; i++) {
      const auction = auctions[i]
      let endTime = auction.endTime
      if (endTime instanceof Date) {
        endTime = endTime.getTime()
      }

      if ((endTime - now) <= 0 || auction.status === 'ended') {
        if (auction.bids.length > 0) {
          const revenue = auction.currentPrice * commissionRate
          estimatedRevenue = estimatedRevenue + revenue
        }
      }
    }

    // Step 6: Count users by role
    let totalBidders = 0
    let totalAuctioneers = 0
    let suspendedUsers = 0
    let bannedUsers = 0

    for (let i = 0; i < users.length; i++) {
      const currentUser = users[i]
      if (currentUser.role === 'bidder' || !currentUser.role) {
        totalBidders = totalBidders + 1
      }
      if (currentUser.role === 'auctioneer') {
        totalAuctioneers = totalAuctioneers + 1
      }
      if (currentUser.status === 'suspended') {
        suspendedUsers = suspendedUsers + 1
      }
      if (currentUser.status === 'banned') {
        bannedUsers = bannedUsers + 1
      }
    }

    // Return all calculated statistics
    return {
      totalUsers: totalUsers,
      pendingValidations: pendingValidations,
      activeAuctions: activeAuctions,
      endedAuctions: endedAuctions,
      bidsToday: bidsToday,
      estimatedRevenue: estimatedRevenue,
      totalBidders: totalBidders,
      totalAuctioneers: totalAuctioneers,
      suspendedUsers: suspendedUsers,
      bannedUsers: bannedUsers
    }
  }, [users, auctions, commissionRate, backendStats])

  // Filter users based on search term, role, and status
  const filteredUsers = useMemo(function() {
    const filtered = []

    for (let i = 0; i < users.length; i++) {
      const u = users[i]
      let matchesSearch = true
      let matchesRole = true
      let matchesStatus = true

      // Check if user matches search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const nameLower = u.name ? u.name.toLowerCase() : ''
        const emailLower = u.email ? u.email.toLowerCase() : ''
        if (!nameLower.includes(searchLower) && !emailLower.includes(searchLower)) {
          matchesSearch = false
        }
      }

      // Check if user matches selected role
      if (filterRole === 'all') {
        matchesRole = true
      } else if (filterRole === 'admin') {
        if (u.role !== 'admin' && !u.isAdmin) {
          matchesRole = false
        }
      } else if (filterRole === 'auctioneer') {
        if (u.role !== 'auctioneer') {
          matchesRole = false
        }
      } else if (filterRole === 'bidder') {
        if ((u.role && u.role !== 'bidder') || u.isAdmin) {
          matchesRole = false
        }
      }

      // Check if user matches selected status
      if (filterStatus === 'all') {
        matchesStatus = true
      } else {
        if (u.status === filterStatus) {
          matchesStatus = true
        } else if (!u.status && filterStatus === 'active') {
          matchesStatus = true
        } else {
          matchesStatus = false
        }
      }

      // Add user to filtered list if all conditions match
      if (matchesSearch && matchesRole && matchesStatus) {
        filtered.push(u)
      }
    }

    return filtered
  }, [users, searchTerm, filterRole, filterStatus])

  function isToday(dt) {
    const d = new Date(dt)
    const t = new Date()
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
  }

  function approveUser(email) {
    updateContextUser(email, { isValidated: true, sellerStatus: 'approved' })
  }

  function rejectSellerRequest(email) {
    updateContextUser(email, { role: 'bidder', sellerStatus: 'rejected', isValidated: true })
  }

  function suspendUser(email) {
    updateContextUser(email, { status: 'suspended' })
  }

  function banUser(email) {
    updateContextUser(email, { status: 'banned' })
  }

  function reactivateUser(email) {
    updateContextUser(email, { status: 'active' })
  }

  function unbanUser(email) {
    updateContextUser(email, { status: 'active' })
  }

  function deleteUser(email) {
    if (window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      deleteContextUser(email)
    }
  }

  function resetPassword(email) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const newTokens = { ...passwordResetTokens }
    newTokens[email] = { token: token, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) }
    setPasswordResetTokens(newTokens)
    alert('Password reset link sent to ' + email + '\nReset token: ' + token + '\n(Link expires in 1 hour)')
  }

  function cancelAuction(id) {
    updateContextAuction(id, { endTime: Date.now() - 1 })
  }

  function removeAuction(id) {
    if (window.confirm('Are you sure you want to permanently remove this auction? This action cannot be undone.')) {
      removeContextAuction(id)
    }
  }

  function deleteCategory(category) {
    if (window.confirm('Are you sure you want to delete the category "' + category + '"?')) {
      const newCategories = categories.filter(function(c) {
        return c !== category
      })
      setCategories(newCategories)
    }
  }

  function updateRule(key, value) {
    const newRules = { ...siteRules }
    newRules[key] = value
    setSiteRules(newRules)
    setEditingRule(null)
  }

  function addAnnouncement() {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert('Please fill in both title and message')
      return
    }
    const announcement = {
      id: Date.now(),
      title: newAnnouncement.title,
      message: newAnnouncement.message,
      priority: newAnnouncement.priority,
      active: true,
      createdAt: new Date()
    }
    const newAnnouncements = [announcement, ...announcements]
    setAnnouncements(newAnnouncements)
    setNewAnnouncement({ title: '', message: '', priority: 'low' })
  }

  function toggleAnnouncement(id) {
    const newAnnouncements = announcements.map(function(a) {
      if (a.id === id) {
        return { ...a, active: !a.active }
      }
      return a
    })
    setAnnouncements(newAnnouncements)
  }

  function deleteAnnouncement(id) {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      const newAnnouncements = announcements.filter(function(a) {
        return a.id !== id
      })
      setAnnouncements(newAnnouncements)
    }
  }

  function resolveReport(reportId, action) {
    const newReports = reports.map(function(r) {
      if (r.id === reportId) {
        return { ...r, status: 'resolved', action: action, resolvedAt: new Date(), resolvedBy: currentUser.name }
      }
      return r
    })
    setReports(newReports)
  }

  function addTicketResponse(ticketId) {
    if (!ticketResponse.trim()) {
      alert('Please enter a response')
      return
    }
    const response = {
      admin: currentUser.name,
      message: ticketResponse,
      createdAt: new Date()
    }
    const newTickets = supportTickets.map(function(t) {
      if (t.id === ticketId) {
        const newResponses = [...t.responses, response]
        return { ...t, responses: newResponses, status: 'open' }
      }
      return t
    })
    setSupportTickets(newTickets)
    setTicketResponse('')
  }

  function updateTicketStatus(ticketId, status) {
    const newTickets = supportTickets.map(function(t) {
      if (t.id === ticketId) {
        return { ...t, status: status }
      }
      return t
    })
    setSupportTickets(newTickets)
  }

  function removeBid(auctionId, bidToRemove) {
    const auction = auctions.find(function(a) {
      return a.id === auctionId
    })
    if (!auction) return

    // Find and remove the specific bid by matching bidder, amount, and time
    const newBids = auction.bids.filter(function(bid) {
      // Remove the bid that matches the one we want to remove
      // We compare by bidder name, amount, and time to uniquely identify it
      const bidTime = new Date(bid.time).getTime()
      const removeTime = new Date(bidToRemove.time).getTime()
      const isMatch = bid.bidder === bidToRemove.bidder &&
               bid.amount === bidToRemove.amount &&
               Math.abs(bidTime - removeTime) < 1000
      return !isMatch
    })

    // Recalculate current price from remaining bids
    let newCurrentPrice = auction.startingPrice
    if (newBids.length > 0) {
      const amounts = newBids.map(function(b) {
        return b.amount
      })
      newCurrentPrice = Math.max.apply(null, amounts)
    }

    // Update the auction using context function
    updateContextAuction(auctionId, {
      bids: newBids,
      currentPrice: newCurrentPrice
    })
  }

  // Get all bids from all auctions for moderation view
  const allBids = useMemo(function() {
    const allBidsList = []
    for (let i = 0; i < auctions.length; i++) {
      const auction = auctions[i]
      for (let j = 0; j < auction.bids.length; j++) {
        const bid = auction.bids[j]
        allBidsList.push({
          bidder: bid.bidder,
          amount: bid.amount,
          time: bid.time,
          auctionId: auction.id,
          auctionTitle: auction.title,
          auctionImage: auction.image,
          bidIndex: j,
          auctionEndTime: auction.endTime
        })
      }
    }
    allBidsList.sort(function(a, b) {
      return new Date(b.time) - new Date(a.time)
    })
    return allBidsList
  }, [auctions])

  const filteredBids = useMemo(function() {
    if (!bidSearchTerm) return allBids
    const search = bidSearchTerm.toLowerCase()
    return allBids.filter(function(bid) {
      const bidderMatch = bid.bidder && bid.bidder.toLowerCase().includes(search)
      const titleMatch = bid.auctionTitle && bid.auctionTitle.toLowerCase().includes(search)
      const amountMatch = bid.amount.toString().includes(search)
      return bidderMatch || titleMatch || amountMatch
    })
  }, [allBids, bidSearchTerm])

  // Access check - must be AFTER all hooks
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Access Denied</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>You must be an administrator to view this page.</p>
          <button onClick={function() { navigate('/') }} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Go Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className={`rounded-2xl shadow-lg p-6 mb-6 flex items-center justify-between ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Admin Dashboard</h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Manage users, auctions, and platform settings</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={function() { setActiveTab('dashboard') }} className={'px-4 py-2 rounded-lg ' + (activeTab==='dashboard'?'bg-purple-600 text-white':isDark?'bg-gray-700 text-gray-200':'bg-gray-100 text-gray-700')}>Dashboard</button>
            <button onClick={function() { setActiveTab('users') }} className={'px-4 py-2 rounded-lg ' + (activeTab==='users'?'bg-purple-600 text-white':isDark?'bg-gray-700 text-gray-200':'bg-gray-100 text-gray-700')}>Users</button>
            <button onClick={function() { setActiveTab('auctions') }} className={'px-4 py-2 rounded-lg ' + (activeTab==='auctions'?'bg-purple-600 text-white':isDark?'bg-gray-700 text-gray-200':'bg-gray-100 text-gray-700')}>Auctions</button>
            <button onClick={function() { setActiveTab('financials') }} className={'px-4 py-2 rounded-lg ' + (activeTab==='financials'?'bg-purple-600 text-white':isDark?'bg-gray-700 text-gray-200':'bg-gray-100 text-gray-700')}>Financials</button>
            <button onClick={function() { setActiveTab('config') }} className={'px-4 py-2 rounded-lg ' + (activeTab==='config'?'bg-purple-600 text-white':isDark?'bg-gray-700 text-gray-200':'bg-gray-100 text-gray-700')}>Configuration</button>
            <button onClick={function() { setActiveTab('moderation') }} className={'px-4 py-2 rounded-lg ' + (activeTab==='moderation'?'bg-purple-600 text-white':isDark?'bg-gray-700 text-gray-200':'bg-gray-100 text-gray-700')}>Moderation</button>
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
              <div className={`rounded-2xl shadow p-6 lg:col-span-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Quick Access</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <QuickLink label="Seller Approvals" onClick={() => navigate('/seller-approval')} />
                  <QuickLink label="Approve Users" onClick={() => setActiveTab('users')} />
                  <QuickLink label="Reported Items" onClick={() => setActiveTab('moderation')} />
                  <QuickLink label="All Auctions" onClick={() => setActiveTab('auctions')} />
                  <QuickLink label="Financial Reports" onClick={() => setActiveTab('financials')} />
                </div>
              </div>
              <div className={`rounded-2xl shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Live Activity</h2>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Real-time</span>
                  </div>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {loadingActivities ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading activities...</span>
                    </div>
                  ) : activitiesError ? (
                    <div className="text-center py-4">
                      <p className="text-red-500 text-sm">{activitiesError}</p>
                      <button onClick={fetchActivities} className="text-purple-500 text-sm mt-2 hover:underline">Retry</button>
                    </div>
                  ) : liveActivities.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-4xl">📊</span>
                      <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No activities yet</p>
                    </div>
                  ) : (
                    liveActivities.slice(0, 15).map(function(activity, i) {
                      // Determine icon and color based on activity type
                      var typeConfig = {
                        bid: { icon: '💰', bg: isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700', label: 'Bid' },
                        auction_created: { icon: '🎯', bg: isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700', label: 'New Auction' },
                        auction_updated: { icon: '✏️', bg: isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700', label: 'Updated' },
                        auction_ended: { icon: '🏁', bg: isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700', label: 'Ended' },
                        auction_deleted: { icon: '🗑️', bg: isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700', label: 'Deleted' },
                        user_registered: { icon: '👤', bg: isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700', label: 'New User' },
                        user_login: { icon: '🔑', bg: isDark ? 'bg-cyan-900 text-cyan-200' : 'bg-cyan-100 text-cyan-700', label: 'Login' },
                        user_updated: { icon: '✏️', bg: isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700', label: 'Updated' },
                        seller_request: { icon: '📝', bg: isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-700', label: 'Seller Request' },
                        seller_approved: { icon: '✅', bg: isDark ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-700', label: 'Approved' },
                        seller_rejected: { icon: '❌', bg: isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700', label: 'Rejected' },
                        user_suspended: { icon: '⏸️', bg: isDark ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-700', label: 'Suspended' },
                        user_banned: { icon: '🚫', bg: isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700', label: 'Banned' },
                        user_reactivated: { icon: '▶️', bg: isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700', label: 'Reactivated' },
                        user_deleted: { icon: '🗑️', bg: isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700', label: 'Deleted' },
                        payment: { icon: '💳', bg: isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-700', label: 'Payment' },
                        commission_updated: { icon: '💹', bg: isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-700', label: 'Commission' },
                        admin_action: { icon: '⚙️', bg: isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700', label: 'Admin' },
                      }
                      var config = typeConfig[activity.type] || { icon: '📌', bg: isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700', label: activity.type }

                      // Build detailed display based on activity type
                      var displayContent = null
                      if (activity.type === 'bid' && activity.amount) {
                        displayContent = (
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>${activity.amount.toLocaleString()}</span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>by</span>
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{activity.userName || 'Unknown'}</span>
                            </div>
                            {activity.auctionTitle && (
                              <span className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>on {activity.auctionTitle}</span>
                            )}
                          </div>
                        )
                      } else if (activity.type === 'auction_created' && activity.auctionTitle) {
                        displayContent = (
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{activity.auctionTitle}</span>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>by {activity.userName || 'Unknown'}</span>
                          </div>
                        )
                      } else if (activity.type === 'auction_ended' && activity.auctionTitle) {
                        displayContent = (
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{activity.auctionTitle}</span>
                            {activity.amount && (
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Final: ${activity.amount.toLocaleString()}</span>
                            )}
                          </div>
                        )
                      } else {
                        displayContent = (
                          <span className={`truncate flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{activity.message}</span>
                        )
                      }

                      return (
                        <div key={activity._id || i} className={`flex items-start space-x-2 text-sm p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <span className="text-lg mt-0.5">{config.icon}</span>
                          <span className={`px-2 py-0.5 rounded font-semibold text-xs whitespace-nowrap ${config.bg}`}>{config.label}</span>
                          {displayContent}
                          <span className={`text-xs whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(activity.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className={`rounded-2xl shadow-lg p-6 space-y-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>User Management</h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manage user accounts, roles, and permissions</p>
              </div>
              <div className={`text-sm px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'text-gray-600 bg-gray-100'}`}>
                Total: {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Search and Filters */}
            <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Search</label>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'}`}
                  >
                    <option value="all">All Roles</option>
                    <option value="bidder">Bidders</option>
                    <option value="auctioneer">Auctioneers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'}`}
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
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">👤</div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No users found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u._id || u.email} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">{u.name || u.username || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 dark:text-gray-300">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              u.role === 'admin' || u.isAdmin ? 'bg-purple-100 text-purple-800' :
                              u.role === 'auctioneer' ? 'bg-blue-100 text-blue-800' :
                              u.role === 'seller' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {u.role === 'admin' || u.isAdmin ? 'Admin' : (u.role === 'seller' ? 'Seller' : (u.role || 'Bidder'))}
                            </span>
                            {u.sellerStatus === 'pending' && (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Seller Request Pending
                              </span>
                            )}
                            {u.sellerStatus === 'approved' && (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Seller Approved
                              </span>
                            )}
                            {u.sellerStatus === 'rejected' && (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Seller Rejected
                              </span>
                            )}
                          </div>
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
                            {!u.isValidated && (u.role === 'auctioneer' || u.role === 'seller') && (
                              <>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Approve ${u.name} as a seller?`)) {
                                      approveUser(u.email)
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors shadow-sm"
                                  title="Approve seller"
                                >
                                  Approve Seller
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Reject ${u.name}'s seller request?`)) {
                                      rejectSellerRequest(u.email)
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors shadow-sm"
                                  title="Reject seller request"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {u.sellerStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Approve ${u.name} as a seller?`)) {
                                      approveUser(u.email)
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors shadow-sm"
                                  title="Approve seller"
                                >
                                  Approve Seller
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Reject ${u.name}'s seller request?`)) {
                                      rejectSellerRequest(u.email)
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors shadow-sm"
                                  title="Reject seller request"
                                >
                                  Reject
                                </button>
                              </>
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
              <div className={`rounded-2xl shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Financials & Transactions</h2>
                <div className={`rounded-lg p-4 mb-4 border ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>📊 What This Page Does</h3>
                  <p className={`text-sm mb-2 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                    This page provides a comprehensive overview of your platform's financial performance and transaction management.
                    Here you can monitor revenue, adjust commission rates, and track all completed auction transactions.
                  </p>
                  <h3 className={`font-semibold mb-2 mt-3 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>💡 How It Works</h3>
                  <ul className={`text-sm space-y-1 list-disc list-inside ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
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
              <div className={`rounded-2xl shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Commission Rate Configuration</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Adjust the percentage you earn from each completed auction. This rate applies to all future transactions.
                    </p>
                  </div>
                </div>
                <div className={`rounded-lg p-4 border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Commission Rate (0.00 to 1.00)
                      </label>
                      <div className={`flex items-center space-x-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
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
                          className={`border rounded-lg px-4 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold ${isDark ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'}`}
                        />
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-purple-600">{Math.round(commissionRate * 100)}%</span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Percentage</span>
                        </div>
                      </div>
                      <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        💡 Example: A rate of 0.05 (5%) means you earn $50 from a $1,000 auction sale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className={`rounded-2xl shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Transaction History</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Complete list of all finished auctions with winning bids. Each transaction shows the sale amount, commission earned, and auction details.
                    </p>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {endedAuctionsWithBids.length} completed transaction{endedAuctionsWithBids.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {endedAuctionsWithBids.length === 0 ? (
                  <div className={`text-center py-12 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-4xl mb-3">💰</div>
                    <p className={`font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No transactions yet</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Transactions will appear here once auctions end with winning bids</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className={`text-left text-sm border-b-2 ${isDark ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200'}`}>
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
                            <tr key={auction.id} className={`border-b transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                              <td className="py-4 pr-4">
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{auction.title}</div>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ID: {auction.id}</div>
                              </td>
                              <td className="py-4 pr-4">
                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{winningBid && winningBid.bidder ? winningBid.bidder : 'N/A'}</span>
                              </td>
                              <td className="py-4 pr-4">
                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>${auction.currentPrice.toLocaleString()}</span>
                              </td>
                              <td className="py-4 pr-4">
                                <span className="font-semibold text-purple-500">${Math.round(commission).toLocaleString()}</span>
                              </td>
                              <td className="py-4 pr-4">
                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>${Math.round(sellerReceives).toLocaleString()}</span>
                              </td>
                              <td className="py-4 pr-4">
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(auction.endTime).toLocaleDateString()}</span>
                                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(auction.endTime).toLocaleTimeString()}</div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className={`font-semibold ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                          <td colSpan="2" className={`py-4 pr-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Total</td>
                          <td className={`py-4 pr-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>${Math.round(totalTransactionValue).toLocaleString()}</td>
                          <td className="py-4 pr-4 text-purple-500">${Math.round(totalRevenue).toLocaleString()}</td>
                          <td className={`py-4 pr-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${Math.round(totalTransactionValue - totalRevenue).toLocaleString()}</td>
                          <td className="py-4 pr-4"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Active Auctions Preview */}
              {activeAuctionsWithBids.length > 0 && (
                <div className={`rounded-2xl shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Active Auctions (Potential Revenue)</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        These auctions are currently live and have bids. Revenue will be calculated when they end.
                      </p>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {activeAuctionsWithBids.length} active auction{activeAuctionsWithBids.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-800">
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
            <h2 className="text-xl font-bold text-gray-800 ">Platform Configuration</h2>
            <div>
              <div className="font-semibold mb-2  text-gray-800">Categories</div>
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
              <div className="font-semibold mb-3  text-gray-800">Site-wide Rules</div>
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
              <div className="font-semibold mb-3  text-gray-800">Announcements</div>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-3  text-gray-800">Create New Announcement</h4>
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
                        className="border rounded px-3 py-2  text-gray-800"
                      >
                        <option value="low ">Low</option>
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
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Active Announcements ({announcements.filter(a => a.active).length})</h4>
                  {announcements.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No announcements yet</p>
                  ) : (
                    announcements.map(announcement => (
                      <div key={announcement.id} className={`border rounded-lg p-4 ${announcement.active ? (isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200') : (isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{announcement.title}</h5>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                announcement.priority === 'high' ? (isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700') :
                                announcement.priority === 'medium' ? (isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700') :
                                (isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700')
                              }`}>
                                {announcement.priority}
                              </span>
                              {announcement.active ? (
                                <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>Active</span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>Inactive</span>
                              )}
                            </div>
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{announcement.message}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Created: {new Date(announcement.createdAt).toLocaleString()}</p>
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
            <div className={`rounded-2xl shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Content Moderation</h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setModerationView('bids')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      moderationView === 'bids'
                        ? 'bg-purple-600 text-white'
                        : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Manage Bids ({allBids.length})
                  </button>
                  <button
                    onClick={() => setModerationView('users')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      moderationView === 'users'
                        ? 'bg-purple-600 text-white'
                        : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Manage Users ({users.length})
                  </button>
                  <button
                    onClick={() => setModerationView('reports')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      moderationView === 'reports'
                        ? 'bg-purple-600 text-white'
                        : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Reports ({reports.filter(r => r.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setModerationView('tickets')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      moderationView === 'tickets'
                        ? 'bg-purple-600 text-white'
                        : isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

function StatCard(props) {
  const title = props.title
  const value = props.value
  const color = props.color
  return (
    <div className={'rounded-2xl p-5 text-white bg-gradient-to-r ' + color}>
      <div className="text-sm text-white/80">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function QuickLink(props) {
  const label = props.label
  const onClick = props.onClick
  return (
    <button onClick={onClick} className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm text-left">
      {label}
    </button>
  )
}

export default Admin


