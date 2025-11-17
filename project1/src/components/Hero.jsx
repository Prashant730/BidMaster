import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BeginnerGuide from './BeginnerGuide.jsx'

function Hero(props) {
  const user = props.user
  const navigate = useNavigate()
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(false)

  function handleStartBidding() {
    // Scroll to auctions section
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  function handleHowItWorks() {
    setShowHowItWorks(!showHowItWorks)
  }

  return (
    <section className="bg-gradient-to-br from-purple-600 via-blue-500 to-indigo-700 text-white py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight px-1 sm:px-2">
          Discover Rare Finds &<br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">Win Amazing Deals</span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-5 sm:mb-6 md:mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
          Join thousands of bidders in our live auctions. From luxury items to unique collectibles, find what you love and bid to win!
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 justify-center items-center px-3 sm:px-4 max-w-md sm:max-w-none mx-auto">
          {(!user || !user.isAdmin) && (
            <>
              <button
                onClick={handleStartBidding}
                className="w-full sm:w-auto min-w-[200px] bg-white text-purple-600 hover:bg-gray-100 active:bg-gray-200 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-200 transform active:scale-95 hover:scale-105 shadow-2xl touch-manipulation"
              >
                Start Bidding Now
              </button>
              <button
                onClick={handleHowItWorks}
                className="w-full sm:w-auto min-w-[200px] border-2 border-white text-white hover:bg-white hover:text-purple-600 active:bg-white/80 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-200 touch-manipulation"
              >
                How It Works
              </button>
            </>
          )}
        </div>

        {(!user || !user.isAdmin) && showHowItWorks && (
          <div className="mt-5 sm:mt-6 md:mt-8 max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-left animate-fadeIn">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-center">How BidMaster Works</h3>
            <div className=" grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 text-xl sm:text-2xl font-bold">1</div>
                <h4 className="font-bold mb-1.5 sm:mb-2 text-sm sm:text-base">Browse Auctions</h4>
                <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">Explore our curated collection of unique items and live auctions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 text-xl sm:text-2xl font-bold">2</div>
                <h4 className="font-bold mb-1.5 sm:mb-2 text-sm sm:text-base">Place Your Bid</h4>
                <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">Create an account and start bidding on items you love</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 text-xl sm:text-2xl font-bold">3</div>
                <h4 className="font-bold mb-1.5 sm:mb-2 text-sm sm:text-base">Win & Collect</h4>
                <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">If you're the highest bidder when the auction ends, you win!</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-5 md:mt-6">
              <button
                onClick={() => setShowHowItWorks(false)}
                className="flex-1 bg-white/20 hover:bg-white/30 active:bg-white/40 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-colors touch-manipulation"
              >
                Got it!
              </button>
              <button
                onClick={() => {
                  setShowHowItWorks(false)
                  setShowBeginnerGuide(true)
                }}
                className="flex-1 bg-white text-purple-600 hover:bg-gray-100 active:bg-gray-200 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-colors touch-manipulation"
              >
                Learn More →
              </button>
            </div>
          </div>
        )}

        {(!user || !user.isAdmin) && showBeginnerGuide && <BeginnerGuide onClose={function() { setShowBeginnerGuide(false) }} />}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 md:mt-16 max-w-4xl mx-auto px-3 sm:px-4">
          <div className="text-center py-2 sm:py-0">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">10K+</div>
            <div className="text-xs sm:text-sm md:text-base text-blue-100">Active Bidders</div>
          </div>
          <div className="text-center py-2 sm:py-0">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">500+</div>
            <div className="text-xs sm:text-sm md:text-base text-blue-100">Live Auctions</div>
          </div>
          <div className="text-center py-2 sm:py-0">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">$2M+</div>
            <div className="text-xs sm:text-sm md:text-base text-blue-100">Total Sales</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
