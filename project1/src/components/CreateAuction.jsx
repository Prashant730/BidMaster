import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CreateAuction = ({ user, onAddAuction }) => {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to create an auction.</p>
          <button onClick={() => navigate('/')} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">Back to Home</button>
        </div>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category || !formData.startingPrice) {
      alert('Please fill in all required fields')
      return
    }

    if (parseFloat(formData.startingPrice) <= 0) {
      alert('Starting price must be greater than 0')
      return
    }

    // Use image URL if provided, otherwise use a default image
    const finalImage = imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800'

    const auctionData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      startingPrice: formData.startingPrice,
      duration: formData.duration,
      image: finalImage
    }

    // Add the auction
    onAddAuction(auctionData)

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
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    // In a real app, these would be uploaded to a server
    setImages(prev => [...prev, ...files.slice(0, 4)])
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-4 sm:py-6 md:py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Create New Auction</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">List your item and start receiving bids from our community.</p>

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

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Image URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Enter an image URL for your item, or leave blank to use a default image</p>
            </div>

            {/* Image Upload (Optional - for local files) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">Or Upload Images (Up to 4 images)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== index))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                ))}
                {images.length < 4 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-sm text-gray-600">Add Image</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Vintage Rolex Submariner 1965" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={6} placeholder="Describe your item in detail. Include condition, features, history, and any relevant information for potential bidders." className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Starting Price ($)</label>
                <input type="number" value={formData.startingPrice} onChange={(e) => setFormData(prev => ({ ...prev, startingPrice: e.target.value }))} placeholder="0.00" min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
              </div>
            </div>

            {/* Auction Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auction Duration</label>
              <select value={formData.duration} onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" required>
                <option value="6">6 Hours</option>
                <option value="12">12 Hours</option>
                <option value="24">24 Hours</option>
                <option value="48">48 Hours</option>
                <option value="72">72 Hours</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-slate-700">
              <button type="button" onClick={() => navigate('/')} className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base">Cancel</button>
              <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-lg">Create Auction</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateAuction
