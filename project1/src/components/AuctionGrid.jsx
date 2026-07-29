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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 dark:border-[#2a2825] pb-4 mb-10 space-y-6 md:space-y-0">
          <div className="flex flex-wrap gap-6 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`text-[13px] uppercase tracking-wider font-medium transition-colors whitespace-nowrap pb-1 border-b-2 ${
                  filter === category
                    ? 'border-[#2a2825] dark:border-[#c3a372] text-[#2a2825] dark:text-[#c3a372]'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-gray-900 dark:text-white font-medium text-sm focus:ring-0 cursor-pointer"
            >
              <option value="ending">Ending Soon</option>
              <option value="price">Highest Price</option>
            </select>
          </div>
        </div>

        {/* Auction Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
          {sortedAuctions.map(auction => (
            <AuctionCard key={auction._id || auction.id} auction={auction} currentUser={currentUser} onAdminRemove={onAdminRemove} />
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
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }
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
  const isAuctionEnded = auction.status === 'ended' || (endTime - Date.now() <= 0 && !auction.isPermanent)
  const isEndingSoon = !isAuctionEnded && !auction.isPermanent && (endTime - Date.now() < 3600000) // Less than 1 hour

  // Format time display
  function formatTimeLeft() {
    if (auction.isPermanent) {
      return '∞ Always'
    }
    if (timeLeft.days && timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h`
    }
    return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
  }

  const auctionId = auction._id || auction.id

  return (
    <Link to={`/auction/${auctionId}`} className="h-full flex">
      <div className="bg-transparent group cursor-pointer flex flex-col h-full w-full">
        <div className="relative overflow-hidden flex-shrink-0 border border-gray-100 dark:border-[#2a2825] rounded-sm">
          <img
            src={auction.image}
            alt={auction.title}
            className="w-full h-56 object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {isAuctionEnded ? (
              <span className="bg-[#1a1918]/90 text-[#d4d0c8] px-2 py-1 text-[10px] uppercase tracking-wider font-semibold border border-[#2a2825]">Ended</span>
            ) : (
              <span className="bg-white/95 dark:bg-[#1a1918]/95 text-[#2a2825] dark:text-[#c3a372] px-2 py-1 text-[10px] uppercase tracking-wider font-semibold border border-gray-200 dark:border-[#2a2825] flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c3a372]"></span>Live
              </span>
            )}
            {isEndingSoon && (
              <span className="bg-[#b95757]/95 text-white px-2 py-1 text-[10px] uppercase tracking-wider font-semibold shadow-sm">Ending</span>
            )}
          </div>
          {currentUser && currentUser.isAdmin && (
            <button
              onClick={function(e) {
                e.preventDefault()
                e.stopPropagation()
                if (onAdminRemove) {
                  onAdminRemove(auctionId)
                }
              }}
              className="absolute top-3 left-3 bg-white/90 text-red-600 hover:bg-white px-2 py-1 text-[10px] uppercase tracking-wider font-bold shadow-sm"
              title="Remove auction"
            >
              Remove
            </button>
          )}
        </div>

        <div className="pt-5 pb-2 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="font-serif text-lg text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-[#d4b88f] transition-colors line-clamp-1 flex-1">{auction.title}</h3>
          </div>

          <p className="text-gray-500 dark:text-[#a39f98] text-xs font-light mb-4 flex-shrink-0 uppercase tracking-widest">{auction.category}</p>

          <div className="mt-auto border-t border-gray-100 dark:border-[#2a2825] pt-4 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-[#a39f98] uppercase tracking-wider mb-0.5">Current Bid</p>
              <p className="text-lg font-serif text-gray-900 dark:text-[#c3a372]">₹{auction.currentPrice.toLocaleString()}</p>
            </div>
            
            <div className="text-right">
              <p className="text-[10px] text-gray-400 dark:text-[#a39f98] uppercase tracking-wider mb-0.5">
                {auction.isPermanent ? 'Status' : 'Time Left'}
              </p>
              <p className={`text-sm font-medium ${isEndingSoon && !auction.isPermanent ? 'text-[#b95757]' : 'text-gray-700 dark:text-[#d4d0c8]'}`}>
                {formatTimeLeft()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default AuctionGrid
