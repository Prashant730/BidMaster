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
    <section className="bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Discover Rare Finds &<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">Win Amazing Deals</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
          Join thousands of bidders in our live auctions. From luxury items to unique collectibles, find what you love and bid to win!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {!user?.isAdmin && (
            <>
              <button
                onClick={handleStartBidding}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl"
              >
                Start Bidding Now
              </button>
              <button
                onClick={handleHowItWorks}
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200"
              >
                How It Works
              </button>
            </>
          )}
        </div>

        {!user?.isAdmin && showHowItWorks && (
          <div className="mt-8 max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left animate-fadeIn">
            <h3 className="text-2xl font-bold mb-4 text-center">How BidMaster Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">10K+</div>
            <div className="text-blue-100">Active Bidders</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">500+</div>
            <div className="text-blue-100">Live Auctions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">$2M+</div>
            <div className="text-blue-100">Total Sales</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
