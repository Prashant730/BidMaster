import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function AuctionGrid(props) {
  const auctions = props.auctions
  const currentUser = props.currentUser
  const onAdminRemove = props.onAdminRemove
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('ending')

  const categories = ['all', 'Watches', 'Art', 'Collectibles', 'Furniture', 'Electronics', 'Jewelry']

  const filteredAuctions = auctions.filter(function(auction) {
    return filter === 'all' || auction.category === filter
  })

  const sortedAuctions = filteredAuctions.slice()
  sortedAuctions.sort(function(a, b) {
    if (sortBy === 'ending') {
      return a.endTime - b.endTime
    } else if (sortBy === 'price') {
      return b.currentPrice - a.currentPrice
    }
    return 0
  })

  return (
    <section className="py-8 sm:py-12 bg-gray-50 dark:bg-black transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Filters and Sorting */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-all duration-200 whitespace-nowrap ${
                  filter === category
                    ? 'bg-purple-600 dark:bg-gradient-to-r dark:from-yellow-500 dark:to-amber-500 text-white dark:text-black shadow-lg dark:shadow-yellow-500/20'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shadow dark:border dark:border-gray-700 dark:hover:border-yellow-600/50'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-yellow-500"
            >
              <option value="ending">Ending Soon</option>
              <option value="price">Highest Price</option>
            </select>
          </div>
        </div>

        {/* Auction Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
          {sortedAuctions.map(auction => (
            <AuctionCard key={auction.id} auction={auction} currentUser={currentUser} onAdminRemove={onAdminRemove} />
          ))}
        </div>

        {sortedAuctions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No auctions found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function AuctionCard(props) {
  const auction = props.auction
  const currentUser = props.currentUser
  const onAdminRemove = props.onAdminRemove
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const endTime = auction.endTime instanceof Date ? auction.endTime.getTime() : auction.endTime
    const difference = endTime - Date.now()
    let timeLeft = {}

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    } else {
      timeLeft = { hours: 0, minutes: 0, seconds: 0 }
    }

    return timeLeft
  }

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [auction.endTime, auction.status])

  const endTime = auction.endTime instanceof Date ? auction.endTime.getTime() : auction.endTime
  const isAuctionEnded = auction.status === 'ended' || (endTime - Date.now() <= 0)
  const isEndingSoon = !isAuctionEnded && (endTime - Date.now() < 3600000) // Less than 1 hour

  return (
    <Link to={`/auction/${auction.id}`} className="h-full flex">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-black/50 hover:shadow-2xl dark:hover:shadow-yellow-500/20 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group cursor-pointer flex flex-col h-full w-full dark:border dark:border-gray-800 dark:hover:border-yellow-600/50">
        <div className="relative overflow-hidden flex-shrink-0">
          <img
            src={auction.image}
            alt={auction.title}
            className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            {isAuctionEnded ? (
              <span className="bg-gray-500 dark:bg-gray-800 text-white dark:text-gray-400 px-3 py-1 rounded-full text-sm font-bold">ENDED</span>
            ) : (
              <span className="bg-red-500 dark:bg-gradient-to-r dark:from-yellow-500 dark:to-amber-500 text-white dark:text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse shadow-lg dark:shadow-yellow-500/40">LIVE</span>
            )}
          </div>
          {currentUser && currentUser.isAdmin && (
            <button
              onClick={function(e) {
                e.preventDefault()
                e.stopPropagation()
                if (onAdminRemove) {
                  onAdminRemove(auction.id)
                }
              }}
              className="absolute top-4 left-4 bg-white/90 text-red-600 hover:bg-white px-2 py-1 rounded text-xs font-bold shadow"
              title="Remove auction"
            >
              Remove
            </button>
          )}
          {isEndingSoon && (
            <div className="absolute top-4 left-4">
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">ENDING SOON</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2 flex-1">{auction.title}</h3>
            <span className="bg-purple-100 dark:bg-gray-800 text-purple-600 dark:text-yellow-400 text-xs font-bold px-2 py-1 rounded ml-2 flex-shrink-0 dark:border dark:border-gray-700">{auction.category}</span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-shrink-0">{auction.description}</p>

          <div className="space-y-2 sm:space-y-3 flex-grow">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">Current Bid</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-yellow-400">${auction.currentPrice.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-500 dark:text-gray-500">Time Left</span>
              <span className={`font-bold ${isEndingSoon ? 'text-red-500 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
            </div>

            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-gray-500 dark:text-gray-500">Bids</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{auction.bids.length} bids</span>
            </div>
          </div>

          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{auction.seller.charAt(0)}</div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{auction.seller}</span>
              </div>
              <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0">Place Bid</button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default AuctionGrid
