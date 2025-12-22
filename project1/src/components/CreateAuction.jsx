import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadAPI } from '../services/api.js'

function CreateAuction(props) {
  const user = props.user
  const onAddAuction = props.onAddAuction
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startingPrice: '',
    duration: '24'
  })
  const [images, setImages] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Please Login</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">You need to be logged in to create an auction.</p>
          <button onClick={() => navigate('/')} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Back to Home</button>
        </div>
      </div>
    )
  }

  // Check if user is an approved seller
  const isApprovedSeller = user.isAdmin || (user.role === 'seller' && user.isValidated && user.sellerStatus === 'approved')
  const isPendingSeller = user.role === 'seller' && !user.isValidated && user.sellerStatus === 'pending'
  const isRejectedSeller = user.sellerStatus === 'rejected'

  if (!isApprovedSeller) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center transition-colors duration-200 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            {isPendingSeller ? (
              <>
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Seller Request Pending</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your request to become a seller is currently being reviewed by our administrators.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You'll be able to create auctions once your request is approved. This usually takes 24-48 hours.
                </p>
              </>
            ) : isRejectedSeller ? (
              <>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Seller Request Rejected</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Unfortunately, your seller request was not approved at this time.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please contact support if you have questions or would like to reapply.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Seller Approval Required</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You need to be an approved seller to create auctions.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please register as a seller and wait for admin approval to start creating auctions.
                </p>
              </>
            )}
          </div>
          {!user.isAdmin && (
            <button
              onClick={() => navigate('/seller-approval')}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Become a Seller
            </button>
          )}
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!formData.title || !formData.description || !formData.category || !formData.startingPrice) {
      setError('Please fill in all required fields')
      return
    }

    if (parseFloat(formData.startingPrice) <= 0) {
      setError('Starting price must be greater than 0')
      return
    }

    setIsSubmitting(true)

    try {
      let finalImage = imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'

      // If there are uploaded images, upload them first
      if (images.length > 0) {
        try {
          const uploadResponse = await uploadAPI.uploadImages(images)
          if (uploadResponse.data?.success && uploadResponse.data?.data?.urls?.length > 0) {
            finalImage = uploadResponse.data.data.urls[0]
          }
        } catch (uploadError) {
          console.error('Image upload failed, using URL or default:', uploadError)
          // Continue with URL or default image if upload fails
        }
      }

      const auctionData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startingPrice: formData.startingPrice,
        duration: formData.duration,
        image: finalImage
      }

      // Add the auction (now async)
      const result = await onAddAuction(auctionData)

      if (result && result.success === false) {
        setError(result.message || 'Failed to create auction')
        setIsSubmitting(false)
        return
      }

      // Show success message
      setShowSuccess(true)

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        startingPrice: '',
        duration: '24'
      })
      setImages([])
      setImageUrl('')

      // Navigate after a short delay
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      console.error('Error creating auction:', err)
      setError(err.message || 'Failed to create auction. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files)
    // In a real app, these would be uploaded to a server
    const newImages = images.concat(files.slice(0, 4))
    setImages(newImages)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-4 sm:py-6 md:py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="bg-white dark:bg-black rounded-xl sm:rounded-2xl shadow-lg dark:shadow-yellow-500/10 p-4 sm:p-6 md:p-8 dark:border dark:border-yellow-600">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-yellow-400 mb-2">Create New Auction</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-yellow-500/80 mb-6 sm:mb-8">List your item and start receiving bids from our community.</p>

          {showSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm sm:text-base">Auction created successfully! Redirecting...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Image URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-yellow-400 mb-2">Item Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={function(e) {
                  setImageUrl(e.target.value)
                }}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full border border-gray-300 dark:border-yellow-600 dark:bg-black dark:text-yellow-400 rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-yellow-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 dark:text-yellow-500/70 mt-1">Enter an image URL for your item, or leave blank to use a default image</p>
            </div>

            {/* Image Upload (Optional - for local files) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-yellow-400 mb-3 sm:mb-4">Or Upload Images (Up to 4 images)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {images.map(function(image, index) {
                  return (
                    <div key={index} className="relative group">
                      <img src={URL.createObjectURL(image)} alt={'Preview ' + (index + 1)} className="w-full h-32 object-cover rounded-lg" />
                      <button type="button" onClick={function() {
                        const newImages = images.filter(function(_, i) {
                          return i !== index
                        })
                        setImages(newImages)
                      }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  )
                })}
                {images.length < 4 && (
                  <label className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Add Image</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Title</label>
              <input type="text" value={formData.title} onChange={function(e) {
                const newFormData = {
                  title: e.target.value,
                  description: formData.description,
                  category: formData.category,
                  startingPrice: formData.startingPrice,
                  duration: formData.duration,
                  image: formData.image
                }
                setFormData(newFormData)
              }} placeholder="e.g., Vintage Rolex Submariner 1965" className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea value={formData.description} onChange={function(e) {
                const newFormData = {
                  title: formData.title,
                  description: e.target.value,
                  category: formData.category,
                  startingPrice: formData.startingPrice,
                  duration: formData.duration,
                  image: formData.image
                }
                setFormData(newFormData)
              }} rows={6} placeholder="Describe your item in detail. Include condition, features, history, and any relevant information for potential bidders." className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select value={formData.category} onChange={function(e) {
                  const newFormData = {
                    title: formData.title,
                    description: formData.description,
                    category: e.target.value,
                    startingPrice: formData.startingPrice,
                    duration: formData.duration,
                    image: formData.image
                  }
                  setFormData(newFormData)
                }} className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                  <option value="">Select a category</option>
                  <option value="Watches">Watches</option>
                  <option value="Art">Art</option>
                  <option value="Collectibles">Collectibles</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Jewelry">Jewelry</option>
                </select>
              </div>

              {/* Starting Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Starting Price (₹)</label>
                <input type="number" value={formData.startingPrice} onChange={function(e) {
                  const newFormData = {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    startingPrice: e.target.value,
                    duration: formData.duration,
                    image: formData.image
                  }
                  setFormData(newFormData)
                }} placeholder="0.00" min="0" step="0.01" className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
              </div>
            </div>

            {/* Auction Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Auction Duration</label>
              <select value={formData.duration} onChange={function(e) {
                const newFormData = {
                  title: formData.title,
                  description: formData.description,
                  category: formData.category,
                  startingPrice: formData.startingPrice,
                  duration: e.target.value,
                  image: formData.image
                }
                setFormData(newFormData)
              }} className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                <option value="6">6 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
                <option value="48">48 Hours</option>
                <option value="72">72 Hours</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-slate-700">
              <button type="button" onClick={() => navigate('/')} disabled={isSubmitting} className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create Auction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateAuction
