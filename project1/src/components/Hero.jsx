import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BeginnerGuide from './BeginnerGuide.jsx'

const Hero = ({ user }) => {
  const navigate = useNavigate()
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(false)

  const handleStartBidding = () => {
    // Scroll to auctions section
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  const handleHowItWorks = () => {
    setShowHowItWorks(!showHowItWorks)
  }

  return (
    <section className="bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 text-white py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
          Discover Rare Finds &<br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">Win Amazing Deals</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed px-2">
          Join thousands of bidders in our live auctions. From luxury items to unique collectibles, find what you love and bid to win!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          {!user?.isAdmin && (
            <>
              <button
                onClick={handleStartBidding}
                className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl"
              >
                Start Bidding Now
              </button>
              <button
                onClick={handleHowItWorks}
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200"
              >
                How It Works
              </button>
            </>
          )}
        </div>

        {!user?.isAdmin && showHowItWorks && (
          <div className="mt-6 sm:mt-8 max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-left animate-fadeIn mx-4">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center">How BidMaster Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">1</div>
                <h4 className="font-bold mb-2">Browse Auctions</h4>
                <p className="text-blue-100 text-sm">Explore our curated collection of unique items and live auctions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">2</div>
                <h4 className="font-bold mb-2">Place Your Bid</h4>
                <p className="text-blue-100 text-sm">Create an account and start bidding on items you love</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">3</div>
                <h4 className="font-bold mb-2">Win & Collect</h4>
                <p className="text-blue-100 text-sm">If you're the highest bidder when the auction ends, you win!</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowHowItWorks(false)}
                className="flex-1 bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Got it!
              </button>
              <button
                onClick={() => {
                  setShowHowItWorks(false)
                  setShowBeginnerGuide(true)
                }}
                className="flex-1 bg-white text-purple-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Learn More →
              </button>
            </div>
          </div>
        )}

        {!user?.isAdmin && showBeginnerGuide && <BeginnerGuide onClose={() => setShowBeginnerGuide(false)} />}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-2">10K+</div>
            <div className="text-sm sm:text-base text-blue-100">Active Bidders</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-2">500+</div>
            <div className="text-sm sm:text-base text-blue-100">Live Auctions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold mb-2">$2M+</div>
            <div className="text-sm sm:text-base text-blue-100">Total Sales</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
