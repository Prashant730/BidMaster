import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import AuctionGrid from './components/AuctionGrid.jsx'
import AuctionDetail from './components/AuctionDetail.jsx'
import CreateAuction from './components/CreateAuction.jsx'
import UserProfile from './components/UserProfile.jsx'
import LoginModal from './components/LoginModal.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import BiddingPolicy from './components/BiddingPolicy.jsx'
import ContactSupport from './components/ContactSupport.jsx'
import Admin from './components/Admin.jsx'
import AdminGuide from './components/AdminGuide.jsx'
import AuctioneerDashboard from './components/AuctioneerDashboard.jsx'
import SellerApproval from './components/SellerApproval.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AuctionProvider } from './context/AuctionContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AppProvider, useApp } from './context/AppContext.jsx'
import './index.css'
import './dark-theme-professional.css'

// Mock data for auctions
const mockAuctions = [
  {
    id: 1,
    title: 'Vintage Rolex Submariner',
    description: 'Beautiful vintage Rolex Submariner from 1965, excellent condition with original papers.',
    currentPrice: 12500,
    startingPrice: 10000,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    bids: [
      { bidder: 'John D.', amount: 12500, time: new Date(Date.now() - 3600000) },
      { bidder: 'Sarah M.', amount: 12200, time: new Date(Date.now() - 7200000) }
    ],
    seller: 'Luxury Watches Inc.',
    category: 'Watches'
  },
  {
    id: 2,
    title: 'Renaissance Oil Portrait – 19th Century',
    description: 'Exquisite oil portrait from the late 1800s. Gilt wood frame, museum quality restoration.',
    currentPrice: 4500,
    startingPrice: 3500,
    image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    bids: [
      { bidder: 'Art Historian', amount: 4500, time: new Date(Date.now() - 1800000) },
      { bidder: 'Museum Curator', amount: 4200, time: new Date(Date.now() - 3600000) }
    ],
    seller: 'Classical Art Gallery',
    category: 'Art'
  },
  {
    id: 3,
    title: 'Rare Vintage Wine Collection',
    description: "Collection of 6 bottles of Château Margaux 1982, perfectly stored.",
    currentPrice: 8500,
    startingPrice: 7000,
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800',
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    bids: [
      { bidder: 'Wine Connoisseur', amount: 8500, time: new Date(Date.now() - 5400000) },
      { bidder: 'Collector', amount: 8200, time: new Date(Date.now() - 10800000) }
    ],
    seller: 'Vintage Cellars',
    category: 'Collectibles'
  },
  {
    id: 4,
    title: 'Designer Leather Sofa',
    description: 'Italian designer leather sofa in pristine condition, 3-seater.',
    currentPrice: 1800,
    startingPrice: 1500,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    bids: [
      { bidder: 'Home Decor', amount: 1800, time: new Date(Date.now() - 900000) }
    ],
    seller: 'Furniture World',
    category: 'Furniture'
  },
  {
    id: 5,
    title: 'MacBook Pro 16" M3 Max',
    description: 'Brand new MacBook Pro 16-inch with M3 Max chip, 32GB RAM, 1TB SSD. Latest generation, sealed in box.',
    currentPrice: 3200,
    startingPrice: 2800,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
    endTime: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
    bids: [
      { bidder: 'Tech Enthusiast', amount: 3200, time: new Date(Date.now() - 2400000) },
      { bidder: 'Developer Pro', amount: 3100, time: new Date(Date.now() - 4800000) }
    ],
    seller: 'Tech Store Premium',
    category: 'Electronics'
  },
  {
    id: 6,
    title: 'Sony PlayStation 5 Pro Bundle',
    description: 'PlayStation 5 Pro console with 2TB SSD, 2 controllers, and 5 exclusive games. Limited edition.',
    currentPrice: 850,
    startingPrice: 700,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
    endTime: new Date(Date.now() + 30 * 60 * 60 * 1000), // 30 hours from now
    bids: [
      { bidder: 'Gamer Elite', amount: 850, time: new Date(Date.now() - 1200000) }
    ],
    seller: 'Gaming Hub',
    category: 'Electronics'
  },
  {
    id: 7,
    title: 'Diamond Solitaire Ring - 2 Carat',
    description: 'Exquisite 2-carat diamond solitaire ring in 18k white gold. GIA certified, excellent cut and clarity.',
    currentPrice: 18500,
    startingPrice: 15000,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
    endTime: new Date(Date.now() + 36 * 60 * 60 * 1000), // 36 hours from now
    bids: [
      { bidder: 'Luxury Collector', amount: 18500, time: new Date(Date.now() - 3600000) },
      { bidder: 'Diamond Lover', amount: 17500, time: new Date(Date.now() - 7200000) },
      { bidder: 'Jewelry Enthusiast', amount: 16500, time: new Date(Date.now() - 10800000) }
    ],
    seller: 'Prestige Jewelers',
    category: 'Jewelry'
  },
  {
    id: 8,
    title: 'Pearl Necklace - Akoya Classic',
    description: 'Stunning 18-inch Akoya pearl necklace with 14k gold clasp. Perfect luster, AAA grade pearls.',
    currentPrice: 2800,
    startingPrice: 2200,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    endTime: new Date(Date.now() + 20 * 60 * 60 * 1000),
    bids: [
      { bidder: 'Elegance Seeker', amount: 2800, time: new Date(Date.now() - 1800000) },
      { bidder: 'Classic Style', amount: 2600, time: new Date(Date.now() - 3600000) }
    ],
    seller: 'Pearl Masters',
    category: 'Jewelry'
  },
  {
    id: 9,
    title: 'Mid-Century Modern Walnut Dining Table',
    description: 'Authentic 1960s Danish walnut dining table. Seats 8, extendable leaves included. Excellent condition.',
    currentPrice: 2800,
    startingPrice: 2000,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
    endTime: new Date(Date.now() + 15 * 60 * 60 * 1000),
    bids: [
      { bidder: 'Vintage Collector', amount: 2800, time: new Date(Date.now() - 1500000) },
      { bidder: 'Interior Designer', amount: 2500, time: new Date(Date.now() - 3000000) }
    ],
    seller: 'Retro Furnishings Co',
    category: 'Furniture'
  },
  {
    id: 10,
    title: 'Limited Edition iPhone 15 Pro Max – Collector Box',
    description: 'Limited edition iPhone 15 Pro Max 1TB in sealed collector packaging. Rare production batch.',
    currentPrice: 1400,
    startingPrice: 1200,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    endTime: new Date(Date.now() + 15 * 60 * 60 * 1000),
    bids: [
      { bidder: 'Tech Collector', amount: 1400, time: new Date(Date.now() - 1500000) },
      { bidder: 'Gadget Archivist', amount: 1350, time: new Date(Date.now() - 3000000) }
    ],
    seller: 'RareTech Vault',
    category: 'Collectibles'
  },
  {
    id: 11,
    title: 'Abstract Acrylic Painting – Modern Expression',
    description: 'Original hand-painted abstract artwork on canvas. Signed by the artist, one of a kind.',
    currentPrice: 1400,
    startingPrice: 1200,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    endTime: new Date(Date.now() + 15 * 60 * 60 * 1000),
    bids: [
      { bidder: 'Art Investor', amount: 1400, time: new Date(Date.now() - 1500000) },
      { bidder: 'Gallery Buyer', amount: 1350, time: new Date(Date.now() - 3000000) }
    ],
    seller: 'Urban Canvas Studio',
    category: 'Art'
  },
  {
    id: 12,
    title: 'Omega Speedmaster Professional Moonwatch',
    description: 'Iconic Omega Speedmaster Professional with manual-wind movement. The watch worn on the moon. Complete set with box and papers.',
    currentPrice: 5800,
    startingPrice: 4500,
    image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800',
    endTime: new Date(Date.now() + 15 * 60 * 60 * 1000),
    bids: [
      { bidder: 'Space Enthusiast', amount: 5800, time: new Date(Date.now() - 1500000) },
      { bidder: 'Vintage Watch Lover', amount: 5500, time: new Date(Date.now() - 3000000) }
    ],
    seller: 'Chronograph Masters',
    category: 'Watches'
  }
]

// Component to redirect to home on page reload
function RedirectToHome() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(function() {
    // Check if this is a fresh page load (not navigation within app)
    const isPageReload = !sessionStorage.getItem('app_loaded')

    if (isPageReload && location.pathname !== '/') {
      // Use window.location for hard redirect to avoid React Router issues
      sessionStorage.setItem('app_loaded', 'true')
      window.location.href = '/'
      return
    }

    // Mark that app has loaded
    sessionStorage.setItem('app_loaded', 'true')
  }, [location.pathname, navigate])

  return null
}

function AppContent() {
  // Get data and functions from AppContext
  const appContext = useApp()
  const auctions = appContext.auctions
  const users = appContext.users
  const commissionRate = appContext.commissionRate
  const updateAuction = appContext.updateAuction
  const removeAuction = appContext.removeAuction
  const addUser = appContext.addUser
  const createAuction = appContext.createAuction

  // Get user from AuthContext (this is the actual logged-in user from backend)
  const { user: authUser, isAuthenticated, logout, loading } = useAuth()

  // State for showing login modal
  const [showLogin, setShowLogin] = useState(false)
  // Use AuthContext user if available, otherwise fall back to local state
  const [localUser, setLocalUser] = useState(null)
  const user = authUser || localUser

  // Function to handle when user logs in
  function handleLogin(email, password, name, requestSeller) {
    // Note: In a real app, this would be an API call to verify login

    // Step 1: Check if email ends with @admin.com to determine if user is admin
    let isAdmin = false
    if (email && email.endsWith('@admin.com')) {
      isAdmin = true
    }

    // Step 2: Check if email ends with @seller.com OR user requested seller status
    let isSeller = false
    if (email && email.endsWith('@seller.com')) {
      isSeller = true
    } else if (requestSeller === true) {
      isSeller = true
    }

    // Step 3: Determine user role based on email and request
    let userRole = 'bidder'
    if (isAdmin) {
      userRole = 'admin'
    } else if (isSeller) {
      userRole = 'seller'
    }

    // Step 4: Determine if user is validated (sellers need admin approval, others don't)
    let isValidated = true
    let sellerStatus = null
    if (isSeller) {
      isValidated = false
      sellerStatus = 'pending' // pending, approved, rejected
    }

    // Step 5: Set user name, use provided name or default to 'Demo User'
    let userName = 'Demo User'
    if (name) {
      userName = name
    }

    // Create new user object
    const newUser = {
      name: userName,
      email: email,
      bids: [1, 2],
      wonItems: [3],
      address: '',
      phone: '',
      profilePhoto: '',
      status: 'active',
      role: userRole,
      isValidated: isValidated,
      isAdmin: isAdmin,
      sellerStatus: sellerStatus
    }

    // Set the current user
    setLocalUser(newUser)
    // Add user to shared context (will emit socket event)
    addUser(newUser)
    // Hide login modal
    setShowLogin(false)
  }

  // Function to handle auction updates
  function onUpdateAuction(auctionId, updates) {
    // Uses context function (will emit socket event)
    updateAuction(auctionId, updates)
  }

  // Function to handle when user places a bid
  function onUserBid(auctionId) {
    setLocalUser(function(prev) {
      // If no user, return previous state
      if (!prev) {
        return prev
      }

      // Check if user already has this auction in their bids
      let alreadyHasBid = false
      if (prev.bids && prev.bids.includes(auctionId)) {
        alreadyHasBid = true
      }

      // If already has bid, return previous state unchanged
      if (alreadyHasBid) {
        return prev
      }

      // Add auction ID to user's bids list
      let userBids = []
      if (prev.bids) {
        userBids = prev.bids.slice()
      }
      userBids.push(auctionId)

      // Return updated user object
      return {
        name: prev.name,
        email: prev.email,
        bids: userBids,
        wonItems: prev.wonItems,
        address: prev.address,
        phone: prev.phone,
        profilePhoto: prev.profilePhoto,
        status: prev.status,
        role: prev.role,
        isValidated: prev.isValidated,
        isAdmin: prev.isAdmin
      }
    })
  }

  // Function to handle user logout
  function handleLogout() {
    // Use AuthContext logout if available
    if (logout) {
      logout()
    }
    setLocalUser(null)
  }

  // Function to show login modal
  function handleShowLogin() {
    setShowLogin(true)
  }

  // Function to hide login modal
  function handleHideLogin() {
    setShowLogin(false)
  }

  // Function to handle creating auction
  function handleCreateAuction(auctionData) {
    const auctionWithUser = {
      title: auctionData.title,
      description: auctionData.description,
      category: auctionData.category,
      startingPrice: auctionData.startingPrice,
      duration: auctionData.duration,
      image: auctionData.image,
      user: user
    }
    createAuction(auctionWithUser)
  }

  // Function to handle updating user profile
  function handleUpdateUser(updated) {
    setLocalUser(updated)
  }

  return (
    <Router>
      <RedirectToHome />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        {/* Header component - shows navigation and user menu */}
        <Header user={user} onLoginClick={handleShowLogin} onLogout={handleLogout} />

        {/* Routes - define different pages in the application */}
        <Routes>
          {/* Home page - shows hero section and auction grid */}
          <Route
            path="/"
            element={
              <>
                <Hero user={user} />
                <AuctionGrid auctions={auctions} currentUser={user} onAdminRemove={removeAuction} />
              </>
            }
          />

          {/* Auction detail page - shows single auction details */}
          <Route
            path="/auction/:id"
            element={
              <AuctionDetail
                auctions={auctions}
                user={user}
                onUpdateAuction={onUpdateAuction}
                onUserBid={onUserBid}
                onAdminRemove={removeAuction}
              />
            }
          />

          {/* Create auction page - form to create new auction */}
          <Route
            path="/create"
            element={
              <CreateAuction
                user={user}
                onAddAuction={handleCreateAuction}
              />
            }
          />

          {/* Admin page - admin dashboard */}
          <Route
            path="/admin"
            element={
              <Admin
                currentUser={user}
                users={users}
                auctions={auctions}
                commissionRate={commissionRate}
              />
            }
          />

          {/* User profile page - shows user information */}
          <Route
            path="/profile"
            element={
              <UserProfile
                user={user}
                auctions={auctions}
                onUpdateUser={handleUpdateUser}
                users={users}
              />
            }
          />

          {/* Bidding policy page */}
          <Route path="/policy" element={<BiddingPolicy />} />

          {/* Contact support page */}
          <Route path="/contact" element={<ContactSupport />} />

          {/* Admin guide page */}
          <Route path="/admin-guide" element={<AdminGuide />} />

          {/* Login page */}
          <Route path="/login" element={<Login />} />

          {/* Register page */}
          <Route path="/register" element={<Register />} />

          {/* Auctioneer dashboard page */}
          <Route
            path="/auctioneer"
            element={
              <AuctioneerDashboard
                currentUser={user}
                auctions={auctions}
              />
            }
          />

          {/* Seller approval page */}
          <Route
            path="/seller-approval"
            element={
              <SellerApproval
                currentUser={user}
              />
            }
          />
        </Routes>

        {/* Show login modal if showLogin is true */}
        {showLogin && <LoginModal onClose={handleHideLogin} onLogin={handleLogin} />}
      </div>
    </Router>
  )
}

function App() {
  // Mock data for auctions
  const mockAuctions = [
    {
      id: 1,
      title: 'Vintage Rolex Submariner',
      description: 'Beautiful vintage Rolex Submariner from 1965, excellent condition with original papers.',
      currentPrice: 12500,
      startingPrice: 10000,
      image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime(), // 24 hours from now
      bids: [
        { bidder: 'John D.', amount: 12500, time: new Date(Date.now() - 3600000) },
        { bidder: 'Sarah M.', amount: 12200, time: new Date(Date.now() - 7200000) }
      ],
      seller: 'Luxury Watches Inc.',
      category: 'Watches'
    },
    {
      id: 2,
      title: 'Renaissance Oil Portrait – 19th Century',
      description: 'Exquisite oil portrait from the late 1800s. Gilt wood frame, museum quality restoration.',
      currentPrice: 4500,
      startingPrice: 3500,
      image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).getTime(),
      bids: [
        { bidder: 'Art Historian', amount: 4500, time: new Date(Date.now() - 1800000) },
        { bidder: 'Museum Curator', amount: 4200, time: new Date(Date.now() - 3600000) }
      ],
      seller: 'Classical Art Gallery',
      category: 'Art'
    },
    {
      id: 3,
      title: 'Rare Vintage Wine Collection',
      description: "Collection of 6 bottles of Château Margaux 1982, perfectly stored.",
      currentPrice: 8500,
      startingPrice: 7000,
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800',
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).getTime(), // 48 hours from now
      bids: [
        { bidder: 'Wine Connoisseur', amount: 8500, time: new Date(Date.now() - 5400000) },
        { bidder: 'Collector', amount: 8200, time: new Date(Date.now() - 10800000) }
      ],
      seller: 'Vintage Cellars',
      category: 'Collectibles'
    },
    {
      id: 4,
      title: 'Designer Leather Sofa',
      description: 'Italian designer leather sofa in pristine condition, 3-seater.',
      currentPrice: 1800,
      startingPrice: 1500,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).getTime(), // 6 hours from now
      bids: [
        { bidder: 'Home Decor', amount: 1800, time: new Date(Date.now() - 900000) }
      ],
      seller: 'Furniture World',
      category: 'Furniture'
    },
    {
      id: 5,
      title: 'MacBook Pro 16" M3 Max',
      description: 'Brand new MacBook Pro 16-inch with M3 Max chip, 32GB RAM, 1TB SSD. Latest generation, sealed in box.',
      currentPrice: 3200,
      startingPrice: 2800,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
      endTime: new Date(Date.now() + 18 * 60 * 60 * 1000).getTime(), // 18 hours from now
      bids: [
        { bidder: 'Tech Enthusiast', amount: 3200, time: new Date(Date.now() - 2400000) },
        { bidder: 'Developer Pro', amount: 3100, time: new Date(Date.now() - 4800000) }
      ],
      seller: 'Tech Store Premium',
      category: 'Electronics'
    },
    {
      id: 6,
      title: 'Sony PlayStation 5 Pro Bundle',
      description: 'PlayStation 5 Pro console with 2TB SSD, 2 controllers, and 5 exclusive games. Limited edition.',
      currentPrice: 850,
      startingPrice: 700,
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800',
      endTime: new Date(Date.now() + 30 * 60 * 60 * 1000).getTime(), // 30 hours from now
      bids: [
        { bidder: 'Gamer Elite', amount: 850, time: new Date(Date.now() - 1200000) }
      ],
      seller: 'Gaming Hub',
      category: 'Electronics'
    },
    {
      id: 7,
      title: 'Diamond Solitaire Ring - 2 Carat',
      description: 'Exquisite 2-carat diamond solitaire ring in 18k white gold. GIA certified, excellent cut and clarity.',
      currentPrice: 18500,
      startingPrice: 15000,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      endTime: new Date(Date.now() + 36 * 60 * 60 * 1000).getTime(), // 36 hours from now
      bids: [
        { bidder: 'Luxury Collector', amount: 18500, time: new Date(Date.now() - 3600000) },
        { bidder: 'Diamond Lover', amount: 17500, time: new Date(Date.now() - 7200000) },
        { bidder: 'Jewelry Enthusiast', amount: 16500, time: new Date(Date.now() - 10800000) }
      ],
      seller: 'Prestige Jewelers',
      category: 'Jewelry'
    },
    {
      id: 8,
      title: 'Pearl Necklace - Akoya Classic',
      description: 'Stunning 18-inch Akoya pearl necklace with 14k gold clasp. Perfect luster, AAA grade pearls.',
      currentPrice: 2800,
      startingPrice: 2200,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
      endTime: new Date(Date.now() + 20 * 60 * 60 * 1000).getTime(), // 20 hours from now
      bids: [
        { bidder: 'Elegance Seeker', amount: 2800, time: new Date(Date.now() - 1800000) },
        { bidder: 'Classic Style', amount: 2600, time: new Date(Date.now() - 3600000) }
      ],
      seller: 'Pearl Masters',
      category: 'Jewelry'
    },
    {
      id: 9,
      title: 'Mid-Century Modern Walnut Dining Table',
      description: 'Authentic 1960s Danish walnut dining table. Seats 8, extendable leaves included. Excellent condition.',
      currentPrice: 2800,
      startingPrice: 2000,
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
      endTime: new Date(Date.now() + 15 * 60 * 60 * 1000).getTime(),
      bids: [
        { bidder: 'Vintage Collector', amount: 2800, time: new Date(Date.now() - 1500000) },
        { bidder: 'Interior Designer', amount: 2500, time: new Date(Date.now() - 3000000) }
      ],
      seller: 'Retro Furnishings Co',
      category: 'Furniture'
    },
    {
      id: 10,
      title: 'Limited Edition iPhone 15 Pro Max – Collector Box',
      description: 'Limited edition iPhone 15 Pro Max 1TB in sealed collector packaging. Rare production batch.',
      currentPrice: 1400,
      startingPrice: 1200,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      endTime: new Date(Date.now() + 15 * 60 * 60 * 1000).getTime(),
      bids: [
        { bidder: 'Tech Collector', amount: 1400, time: new Date(Date.now() - 1500000) },
        { bidder: 'Gadget Archivist', amount: 1350, time: new Date(Date.now() - 3000000) }
      ],
      seller: 'RareTech Vault',
      category: 'Collectibles'
    },
    {
      id: 11,
      title: 'Abstract Acrylic Painting – Modern Expression',
      description: 'Original hand-painted abstract artwork on canvas. Signed by the artist, one of a kind.',
      currentPrice: 1400,
      startingPrice: 1200,
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      endTime: new Date(Date.now() + 15 * 60 * 60 * 1000).getTime(),
      bids: [
        { bidder: 'Art Investor', amount: 1400, time: new Date(Date.now() - 1500000) },
        { bidder: 'Gallery Buyer', amount: 1350, time: new Date(Date.now() - 3000000) }
      ],
      seller: 'Urban Canvas Studio',
      category: 'Art'
    },
    {
      id: 12,
      title: 'Omega Speedmaster Professional Moonwatch',
      description: 'Iconic Omega Speedmaster Professional with manual-wind movement. The watch worn on the moon. Complete set with box and papers.',
      currentPrice: 5800,
      startingPrice: 4500,
      image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800',
      endTime: new Date(Date.now() + 15 * 60 * 60 * 1000).getTime(),
      bids: [
        { bidder: 'Space Enthusiast', amount: 5800, time: new Date(Date.now() - 1500000) },
        { bidder: 'Vintage Watch Lover', amount: 5500, time: new Date(Date.now() - 3000000) }
      ],
      seller: 'Chronograph Masters',
      category: 'Watches'
    }
  ]

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AuctionProvider>
            <AppProvider
              initialAuctions={mockAuctions}
              initialUsers={[]}
              initialCommissionRate={0.05}
            >
              <AppContent />
            </AppProvider>
          </AuctionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
