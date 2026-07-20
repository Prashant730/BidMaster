import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BeginnerGuide from './BeginnerGuide.jsx';
import { useApp } from '../context/AppContext.jsx';

function Hero(props) {
  const user = props.user;
  const navigate = useNavigate();
  const { auctions } = useApp();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(false);
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  const featuredAuction = auctions?.filter(a => a.status === 'active')?.sort((a, b) => b.currentPrice - a.currentPrice)[0];
  
  const displayAuction = featuredAuction || {
    id: 'demo',
    title: 'Rolex Submariner 1989',
    category: 'Luxury Watches',
    currentPrice: 85000,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop',
    endTime: Date.now() + 2 * 60 * 60 * 1000 + 14 * 60 * 1000 + 45 * 1000
  };

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const end = new Date(displayAuction.endTime).getTime();
      const distance = end - now;
      
      if (distance < 0) {
        setTimeLeft('Ended');
        return;
      }
      
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [displayAuction]);

  function handleStartBidding() {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  }

  function handleFeaturedClick() {
    if (displayAuction.id === 'demo') {
      handleStartBidding();
    } else {
      navigate(`/auction/${displayAuction.id}`);
    }
  }

  return (
    <section className="relative bg-white dark:bg-slate-900 transition-colors duration-200 border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col items-start text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Discover Rare Finds & Win Amazing Deals
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-8 leading-relaxed">
              Join thousands of elite bidders in our exclusive live auctions. From luxury timepieces to rare collectibles, experience the thrill of winning what you love.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {(!user || !user.isAdmin) && (
                <>
                  <button
                    onClick={handleStartBidding}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Start Bidding Now
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setShowHowItWorks(true)}
                    className="px-8 py-3.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center shadow-sm"
                  >
                    How It Works
                  </button>
                </>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 w-full grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">10K+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active Bidders</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Live Auctions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">₹2Cr+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Sales</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-end">
            <div 
              onClick={handleFeaturedClick}
              className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1 duration-300 cursor-pointer group"
            >
              <div className="relative h-72 overflow-hidden bg-gray-100 dark:bg-gray-700">
                 <img src={displayAuction.image} alt={displayAuction.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 
                 <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                   {timeLeft !== 'Ended' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
                   <span className="text-sm font-semibold text-gray-900 dark:text-white">
                     {timeLeft === 'Ended' ? 'Auction Ended' : `Ends in ${timeLeft}`}
                   </span>
                 </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate max-w-[280px]">{displayAuction.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {displayAuction.category ? `${displayAuction.category} • Verified Authentic` : 'Mint Condition • Verified Authentic'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 uppercase tracking-wider">Current Bid</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{displayAuction.currentPrice?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Place Bid
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHowItWorks(false)}></div>
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How BidMaster Works</h2>
              <button onClick={() => setShowHowItWorks(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700/50">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mb-4">1</div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Browse & Discover</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Explore our curated collection of verified, unique items and ongoing live auctions.</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700/50">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mb-4">2</div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Place Your Bid</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Create a secure account, verify your identity, and place competitive bids.</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700/50">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold mb-4">3</div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Win & Collect</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Maintain the highest bid until the timer expires to win! Enjoy secure checkout.</p>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-3">
              <button onClick={() => { setShowHowItWorks(false); setShowBeginnerGuide(true); }} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
                Read Full Guide
              </button>
              <button onClick={() => setShowHowItWorks(false)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {(!user || !user.isAdmin) && showBeginnerGuide && <BeginnerGuide onClose={() => setShowBeginnerGuide(false)} />}
    </section>
  );
}

export default Hero;
