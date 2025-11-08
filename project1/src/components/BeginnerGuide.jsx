import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const BeginnerGuide = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('getting-started')

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      icon: '🚀',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-4 rounded">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Welcome to BidMaster!</h4>
            <p className="text-blue-700 dark:text-blue-300">This guide will walk you through everything you need to know to start bidding successfully.</p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg mb-2 flex items-center text-gray-800 dark:text-gray-100">
                <span className="text-2xl mr-2">1️⃣</span>
                Create Your Account
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-2">To start bidding, you need to create an account:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                <li>Click the "Login" button in the top right corner</li>
                <li>Enter your email and password</li>
                <li>Your account will be created automatically on first login</li>
                <li>You can now browse and bid on any auction</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2 flex items-center text-gray-800 dark:text-gray-100">
                <span className="text-2xl mr-2">2️⃣</span>
                Browse Auctions
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Explore our collection of live auctions:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                <li>Use category filters (Watches, Art, Electronics, etc.) to find items you like</li>
                <li>Sort by "Ending Soon" or "Highest Price"</li>
                <li>Click on any auction card to see detailed information</li>
                <li>Check the current bid, time remaining, and bid history</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2 flex items-center text-gray-800 dark:text-gray-100">
                <span className="text-2xl mr-2">3️⃣</span>
                Understand Auction Details
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Each auction shows important information:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                <li><strong>Current Bid:</strong> The highest bid placed so far</li>
                <li><strong>Starting Price:</strong> The minimum price the seller set</li>
                <li><strong>Time Left:</strong> How much time remains before the auction ends</li>
                <li><strong>Bid Count:</strong> Number of bids placed on this item</li>
                <li><strong>Seller Info:</strong> Verified seller details and ratings</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    'how-to-bid': {
      title: 'How to Place a Bid',
      icon: '💰',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 p-4 rounded">
            <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Ready to Bid?</h4>
            <p className="text-green-700 dark:text-green-300">Follow these simple steps to place your bid.</p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg mb-2 flex items-center text-gray-800 dark:text-gray-100">
                <span className="text-2xl mr-2">📋</span>
                Step-by-Step Bidding Process
              </h4>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-3 ml-6">
                <li>
                  <strong>Select an Item:</strong> Click on any auction card that interests you
                </li>
                <li>
                  <strong>Review Details:</strong> Read the description, check the current bid, and review bid history
                </li>
                <li>
                  <strong>Enter Your Bid:</strong> In the bid form, enter an amount higher than the current bid
                  <ul className="list-disc list-inside ml-6 mt-1 text-sm">
                    <li>Minimum bid increment is typically $100</li>
                    <li>Your bid must be higher than the current highest bid</li>
                  </ul>
                </li>
                <li>
                  <strong>Submit Your Bid:</strong> Click "Place Bid" to submit
                </li>
                <li>
                  <strong>Confirmation:</strong> You'll see a success message confirming your bid
                </li>
                <li>
                  <strong>Stay Updated:</strong> Watch the auction to see if others outbid you
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded">
              <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">💡 Pro Tips</h4>
              <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>Set a maximum budget before you start bidding</li>
                <li>Don't get caught up in bidding wars - stick to your limit</li>
                <li>Watch auctions ending soon for last-minute opportunities</li>
                <li>Check bid history to understand bidding patterns</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    'winning-auction': {
      title: 'Winning an Auction',
      icon: '🏆',
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 dark:border-purple-400 p-4 rounded">
            <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-2">Congratulations!</h4>
            <p className="text-purple-700 dark:text-purple-300">You've won an auction! Here's what happens next.</p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg mb-2 flex items-center text-gray-800 dark:text-gray-100">
                <span className="text-2xl mr-2">✅</span>
                When You Win
              </h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-6">
                <li>You'll be notified immediately when the auction ends</li>
                <li>The auction status will change to "ENDED"</li>
                <li>Your winning bid will be displayed prominently</li>
                <li>The item will appear in your "Won Items" section in your profile</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2 flex items-center text-gray-800 dark:text-gray-100">
                <span className="text-2xl mr-2">📦</span>
                Next Steps
              </h4>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-6">
                <li><strong>Payment:</strong> Complete payment within 48 hours of auction end</li>
                <li><strong>Shipping:</strong> Seller will arrange shipping after payment confirmation</li>
                <li><strong>Tracking:</strong> You'll receive tracking information once shipped</li>
                <li><strong>Delivery:</strong> Receive your item and enjoy!</li>
              </ol>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2 flex items-center text-gray-800 dark:text-gray-100">
                <span className="text-2xl mr-2">⭐</span>
                After Receiving Your Item
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-2">Help the community by leaving feedback:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-6">
                <li>Rate the seller based on item condition and shipping</li>
                <li>Leave a review to help other bidders</li>
                <li>Report any issues immediately if the item doesn't match the description</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    'tips-strategies': {
      title: 'Tips & Strategies',
      icon: '🎯',
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 dark:border-indigo-400 p-4 rounded">
            <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2">Master the Art of Bidding</h4>
            <p className="text-indigo-700 dark:text-indigo-300">Learn strategies to improve your bidding success rate.</p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">🎲 Bidding Strategies</h4>
              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Early Bird Strategy</h5>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Place an early bid to show interest, but be prepared for others to outbid you.</p>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Sniper Strategy</h5>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Wait until the last moments to place your bid, giving others less time to respond.</p>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Steady Increment Strategy</h5>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Place consistent bids with reasonable increments to stay competitive.</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">⚠️ Common Mistakes to Avoid</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-6">
                <li><strong>Emotional Bidding:</strong> Don't let competition drive you beyond your budget</li>
                <li><strong>Not Reading Descriptions:</strong> Always read full item descriptions and check all images</li>
                <li><strong>Ignoring Seller Ratings:</strong> Check seller reputation before bidding on high-value items</li>
                <li><strong>Forgetting Time Limits:</strong> Set reminders for auctions you're interested in</li>
                <li><strong>Bidding Too Early:</strong> Sometimes waiting reveals the true competition level</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">✅ Best Practices</h4>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-6">
                <li>Research similar items to understand fair market value</li>
                <li>Set a maximum bid amount and stick to it</li>
                <li>Monitor auctions you're interested in regularly</li>
                <li>Read seller terms and return policies</li>
                <li>Keep your payment method ready for quick checkout</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    'faq': {
      title: 'Frequently Asked Questions',
      icon: '❓',
      content: (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Q: Do I need to pay immediately when I place a bid?</h4>
              <p className="text-gray-600 dark:text-gray-300">A: No, you only pay if you win the auction. Payment is required within 48 hours after the auction ends.</p>
            </div>

            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Q: Can I cancel or retract my bid?</h4>
              <p className="text-gray-600 dark:text-gray-300">A: Bids are final and cannot be canceled. Make sure you're committed before placing a bid.</p>
            </div>

            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Q: What happens if I'm outbid?</h4>
              <p className="text-gray-600 dark:text-gray-300">A: You'll be notified if someone outbids you. You can then place a new bid if you wish to continue competing.</p>
            </div>

            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Q: How do I know if an auction is ending soon?</h4>
              <p className="text-gray-600 dark:text-gray-300">A: Auctions with less than 1 hour remaining show an "ENDING SOON" badge. You can also sort auctions by "Ending Soon" to see them first.</p>
            </div>

            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Q: Can I create my own auction to sell items?</h4>
              <p className="text-gray-600 dark:text-gray-300">A: Yes! Click "Create Auction" in the header to list your own items for bidding. You'll need to be logged in.</p>
            </div>

            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Q: What payment methods are accepted?</h4>
              <p className="text-gray-600 dark:text-gray-300">A: We accept major credit cards, debit cards, and PayPal. Payment details are handled securely after you win.</p>
            </div>

            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Q: How do I track my bids?</h4>
              <p className="text-gray-600 dark:text-gray-300">A: Visit your profile page to see all your active bids, won items, and auction history.</p>
            </div>

            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Q: Is there a buyer's premium or additional fees?</h4>
              <p className="text-gray-600 dark:text-gray-300">A: The final bid amount is what you pay. Shipping costs may apply and will be clearly stated before checkout.</p>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Beginner's Guide to Bidding</h2>
            <p className="text-blue-100">Everything you need to know to start bidding successfully</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Close guide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {Object.entries(sections).map(([key, section]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeSection === key
                    ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-white dark:bg-slate-800'
                    : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow bg-white dark:bg-slate-800">
          <div className="max-w-3xl mx-auto">
            {sections[activeSection].content}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 p-6 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Need more help?{' '}
            <Link
              to="/contact"
              onClick={onClose}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium underline"
            >
              Contact our support team
            </Link>
            .
          </div>
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}

export default BeginnerGuide

