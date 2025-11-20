import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

function SellerApproval(props) {
  const currentUser = props.currentUser
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const appContext = useApp()
  const users = appContext.users
  const updateUser = appContext.updateUser

  const [requestForm, setRequestForm] = useState({
    businessName: '',
    businessType: '',
    description: '',
    experience: '',
    website: '',
    phone: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
            <svg className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Login Required</h2>
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Please login to request seller approval
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // Admin view - show all pending requests
  if (currentUser.isAdmin) {
    const pendingRequests = users.filter(u =>
      (u.role === 'seller' || u.role === 'auctioneer') && !u.isValidated && u.sellerStatus === 'pending'
    )

    function handleApprove(userEmail) {
      if (window.confirm('Approve this seller request?')) {
        updateUser(userEmail, {
          isValidated: true,
          sellerStatus: 'approved',
          role: 'seller'
        })
      }
    }

    function handleReject(userEmail) {
      if (window.confirm('Reject this seller request?')) {
        updateUser(userEmail, {
          role: 'bidder',
          sellerStatus: 'rejected',
          isValidated: true
        })
      }
    }

    return (
      <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className={`rounded-2xl shadow-lg p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Seller Approval Requests
                </h1>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  Review and approve seller applications
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
                {pendingRequests.length} Pending
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length === 0 ? (
            <div className={`rounded-2xl shadow-lg p-12 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <svg className={`w-10 h-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                All Caught Up!
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                No pending seller requests at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(user => (
                <div
                  key={user.email}
                  className={`rounded-2xl shadow-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt={user.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {user.name}
                        </h3>
                        <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user.email}
                        </p>

                        {/* User Details */}
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          {user.businessName && (
                            <div>
                              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Business Name
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {user.businessName}
                              </div>
                            </div>
                          )}
                          {user.businessType && (
                            <div>
                              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Business Type
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {user.businessType}
                              </div>
                            </div>
                          )}
                          {user.phone && (
                            <div>
                              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Phone
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {user.phone}
                              </div>
                            </div>
                          )}
                          {user.website && (
                            <div>
                              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Website
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                                  {user.website}
                                </a>
                              </div>
                            </div>
                          )}
                          {user.description && (
                            <div className="md:col-span-2">
                              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Description
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {user.description}
                              </div>
                            </div>
                          )}
                          {user.experience && (
                            <div className="md:col-span-2">
                              <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Experience
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {user.experience}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className={`mt-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Requested: {user.requestedAt ? new Date(user.requestedAt).toLocaleString() : 'Recently'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(user.email)}
                        className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.email)}
                        className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium whitespace-nowrap"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // User view - submit seller request
  const userSellerStatus = currentUser.sellerStatus
  const isAlreadySeller = currentUser.role === 'seller' && currentUser.isValidated

  function handleSubmitRequest(e) {
    e.preventDefault()

    if (!requestForm.businessName || !requestForm.businessType || !requestForm.description) {
      alert('Please fill in all required fields')
      return
    }

    // Update user with seller request
    updateUser(currentUser.email, {
      role: 'seller',
      sellerStatus: 'pending',
      isValidated: false,
      businessName: requestForm.businessName,
      businessType: requestForm.businessType,
      description: requestForm.description,
      experience: requestForm.experience,
      website: requestForm.website,
      phone: requestForm.phone || currentUser.phone,
      requestedAt: new Date().toISOString()
    })

    setShowSuccess(true)
    setTimeout(() => {
      navigate('/profile')
    }, 2000)
  }

  // Show success message
  if (showSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full rounded-2xl shadow-lg p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
            <svg className={`w-10 h-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Request Submitted!
          </h2>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Your seller request has been submitted successfully. An administrator will review your application shortly.
          </p>
        </div>
      </div>
    )
  }

  // Already approved seller
  if (isAlreadySeller) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full rounded-2xl shadow-lg p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
            <svg className={`w-10 h-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            You're Already a Seller!
          </h2>
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Your seller account is approved and active. You can create auctions anytime.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/create')}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Auction
            </button>
            <button
              onClick={() => navigate('/profile')}
              className={`flex-1 px-6 py-3 rounded-lg transition-colors ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Pending request
  if (userSellerStatus === 'pending') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full rounded-2xl shadow-lg p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
            <svg className={`w-10 h-10 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Request Under Review
          </h2>
          <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Your seller request is currently being reviewed by our administrators.
          </p>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Typical review time: 24-48 hours
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Profile
          </button>
        </div>
      </div>
    )
  }

  // Rejected request
  if (userSellerStatus === 'rejected') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full rounded-2xl shadow-lg p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
            <svg className={`w-10 h-10 ${isDark ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Request Not Approved
          </h2>
          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Your previous seller request was no. Please contact support for more information.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/contact')}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => navigate('/')}
              className={`flex-1 px-6 py-3 rounded-lg transition-colors ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Request form for new users
  return (
    <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-3xl">
        <div className={`rounded-2xl shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <svg className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Become a Seller
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Fill out the form below to request seller approval
            </p>
          </div>

          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={requestForm.businessName}
                onChange={(e) => setRequestForm({ ...requestForm, businessName: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                placeholder="Your business or brand name"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Business Type <span className="text-red-500">*</span>
              </label>
              <select
                value={requestForm.businessType}
                onChange={(e) => setRequestForm({ ...requestForm, businessType: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                required
              >
                <option value="">Select business type</option>
                <option value="individual">Individual Seller</option>
                <option value="small-business">Small Business</option>
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="collector">Collector</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                placeholder="Tell us about your business and what you plan to sell"
                rows="4"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Experience
              </label>
              <textarea
                value={requestForm.experience}
                onChange={(e) => setRequestForm({ ...requestForm, experience: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                placeholder="Your experience in selling or relevant industry"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Website
                </label>
                <input
                  type="url"
                  value={requestForm.website}
                  onChange={(e) => setRequestForm({ ...requestForm, website: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={requestForm.phone}
                  onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  placeholder="+1 555 123 4567"
                />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-start space-x-3">
                <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  <p className="font-medium mb-1">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Your request will be reviewed by our admin team</li>
                    <li>Review typically takes 24-48 hours</li>
                    <li>You'll be notified once approved</li>
                    <li>After approval, you can start creating auctions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className={`px-6 py-3 rounded-lg transition-colors font-medium ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SellerApproval
