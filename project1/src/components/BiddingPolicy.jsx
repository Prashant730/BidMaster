import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const BiddingPolicy = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')

  const policySections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: '📋'
    },
    {
      id: 'fair-competition',
      title: 'Fair Competition',
      icon: '⚖️'
    },
    {
      id: 'transparency',
      title: 'Transparency',
      icon: '🔍'
    },
    {
      id: 'bid-submission',
      title: 'Bid Submission',
      icon: '📝'
    },
    {
      id: 'evaluation',
      title: 'Evaluation Criteria',
      icon: '✅'
    },
    {
      id: 'bid-security',
      title: 'Bid Security',
      icon: '🔒'
    },
    {
      id: 'eligibility',
      title: 'Bidder Eligibility',
      icon: '👤'
    },
    {
      id: 'withdrawal',
      title: 'Withdrawal Policy',
      icon: '🚫'
    },
    {
      id: 'award',
      title: 'Contract Award',
      icon: '🏆'
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: '📜'
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-l-4 border-purple-500 dark:border-purple-400 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">BidMaster Bidding Policy</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This policy establishes the rules and procedures for participating in auctions on BidMaster.
                Our goal is to ensure fair competition, transparency, and integrity in all bidding processes.
                All bidders are required to read, understand, and comply with these policies before participating in any auction.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Purpose</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The BidMaster Bidding Policy is designed to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                <li>Promote fair and open competition among all bidders</li>
                <li>Ensure transparency in the bidding and evaluation process</li>
                <li>Protect the interests of both buyers and sellers</li>
                <li>Maintain the integrity of the auction platform</li>
                <li>Establish clear guidelines for bid submission and evaluation</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Scope</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This policy applies to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                <li>All auctions conducted on the BidMaster platform</li>
                <li>All registered bidders and sellers</li>
                <li>All items listed for auction, regardless of category or value</li>
                <li>All stages of the auction process from listing to final delivery</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-300">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                BidMaster reserves the right to update this policy at any time. Users will be notified of significant changes.
              </p>
            </div>
          </div>
        )

      case 'fair-competition':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Fair Competition Policy</h3>
              <p className="text-gray-700 dark:text-gray-300">
                BidMaster is committed to maintaining a fair and competitive bidding environment for all participants.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Principles</h4>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Equal Opportunity</h5>
                  <p className="text-gray-600 dark:text-gray-300">
                    All registered bidders have equal opportunity to participate in auctions. No bidder receives
                    preferential treatment or advance information about other bids.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">No Favoritism</h5>
                  <p className="text-gray-600 dark:text-gray-300">
                    BidMaster prohibits any form of favoritism, collusion, or manipulation of the bidding process.
                    All bids are evaluated based solely on the criteria specified in the auction listing.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Anti-Collusion Measures</h5>
                  <p className="text-gray-600 dark:text-gray-300">
                    Bidders are prohibited from:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4 mt-2">
                    <li>Coordinating bids with other participants</li>
                    <li>Creating fake accounts to inflate bids</li>
                    <li>Engaging in bid shilling or artificial price inflation</li>
                    <li>Sharing confidential bidding information</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">⚠️ Violations</h5>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Violations of fair competition policies may result in account suspension, bid cancellation,
                or permanent ban from the platform.
              </p>
            </div>
          </div>
        )

      case 'transparency':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Transparency Policy</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Complete transparency ensures all bidders have access to the same information and understand the bidding process.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Information Disclosure</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-100">Auction Details</h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      All auction listings include complete item descriptions, images, starting price,
                      current bid, time remaining, and seller information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-100">Bid History</h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      All bids are publicly visible, showing bidder names (anonymized), bid amounts,
                      and timestamps. This ensures transparency in the bidding process.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-100">Time Information</h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      Auction start and end times are clearly displayed in real-time.
                      Countdown timers show exact time remaining for each auction.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-100">Pricing Transparency</h5>
                    <p className="text-gray-600 dark:text-gray-300">
                      All prices, fees, and charges are clearly displayed before bidding.
                      No hidden fees or surprise charges.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Evaluation Process</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                The evaluation and award process is transparent:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                <li>Evaluation criteria are clearly stated in each auction listing</li>
                <li>Bid evaluation is automated and based on objective criteria</li>
                <li>Winning bidder is determined by highest bid at auction close</li>
                <li>All participants can view the final results and winning bid</li>
              </ul>
            </div>
          </div>
        )

      case 'bid-submission':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 dark:border-purple-400 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Bid Submission Requirements</h3>
              <p className="text-gray-700 dark:text-gray-300">
                All bids must be submitted in accordance with these requirements to be considered valid.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Submission Process</h4>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-3 ml-4">
                <li>
                  <strong>Registration Required:</strong> Bidders must have a registered account with verified email address
                </li>
                <li>
                  <strong>Minimum Bid Amount:</strong> Each bid must exceed the current highest bid by at least the minimum increment (typically $100 or 5% of current bid, whichever is higher)
                </li>
                <li>
                  <strong>Bid Timing:</strong> Bids can only be submitted during the active auction period
                </li>
                <li>
                  <strong>Payment Method:</strong> A valid payment method must be on file before bidding
                </li>
                <li>
                  <strong>Confirmation:</strong> All bids require explicit confirmation before being processed
                </li>
              </ol>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Bid Format Requirements</h4>
              <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Bid amount must be entered as a numeric value (no currency symbols)</li>
                  <li>Bids must be in the currency specified for the auction (typically USD)</li>
                  <li>Decimal values are accepted for items with fractional pricing</li>
                  <li>Maximum bid amount may be set for automatic bidding</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Invalid Bids</h4>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-300 font-semibold mb-2">The following bids will be automatically rejected:</p>
                <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-1 ml-4">
                  <li>Bids below the current highest bid</li>
                  <li>Bids below the minimum starting price</li>
                  <li>Bids submitted after auction end time</li>
                  <li>Bids from unverified accounts</li>
                  <li>Bids that violate bid increment requirements</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'evaluation':
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 dark:border-indigo-400 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Bid Evaluation Criteria</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Bids are evaluated based on objective, predetermined criteria to ensure fairness and consistency.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Primary Evaluation Criteria</h4>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                    <span className="text-2xl mr-2">💰</span>
                    Bid Amount (Primary Factor)
                  </h5>
                  <p className="text-gray-600 dark:text-gray-300">
                    The highest bid amount at the time of auction closure is the primary determining factor.
                    In case of identical bids, the earliest bid takes precedence.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                    <span className="text-2xl mr-2">⏰</span>
                    Bid Timing
                  </h5>
                  <p className="text-gray-600 dark:text-gray-300">
                    For bids of equal amount, the bid submitted first is given priority.
                    Timestamps are recorded with millisecond precision.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                    <span className="text-2xl mr-2">✅</span>
                    Bidder Eligibility
                  </h5>
                  <p className="text-gray-600 dark:text-gray-300">
                    Only bids from eligible, verified bidders are considered.
                    Bidders must meet all eligibility requirements at the time of bid submission.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Evaluation Process</h4>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                <li>All bids are automatically validated upon submission</li>
                <li>Bids are ranked by amount (highest first) and timestamp (earliest first)</li>
                <li>At auction close, the highest valid bid is automatically selected as the winner</li>
                <li>Winning bidder is notified immediately via email and platform notification</li>
                <li>All participants can view the final results and winning bid amount</li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">📊 Automated Evaluation</h5>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                BidMaster uses automated systems to ensure objective, consistent, and fair evaluation
                of all bids without human bias or intervention.
              </p>
            </div>
          </div>
        )

      case 'bid-security':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Bid Security Requirements</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Bid security ensures commitment and prevents frivolous bidding on high-value items.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">When Bid Security is Required</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Bid security (also known as Earnest Money Deposit or EMD) may be required for:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
                <li>Auctions with starting price above $10,000</li>
                <li>High-value items (luxury goods, collectibles, electronics)</li>
                <li>Auctions specified by the seller as requiring bid security</li>
                <li>Bidders with limited bidding history or new accounts</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Security Amount</h4>
              <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Typically 5-10% of the starting bid amount</li>
                  <li>Minimum security: $500</li>
                  <li>Maximum security: $5,000</li>
                  <li>Exact amount specified in each auction listing</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Security Forms</h4>
              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Credit Card Hold</h5>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Authorization hold on credit card (most common)</p>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Bank Guarantee</h5>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Bank guarantee letter for high-value items</p>
                </div>
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600">
                  <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Escrow Account</h5>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Funds held in escrow until auction completion</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Security Refund</h4>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-300 font-semibold mb-2">Security is refunded if:</p>
                <ul className="list-disc list-inside text-green-700 dark:text-green-300 space-y-1 ml-4">
                  <li>You are not the winning bidder</li>
                  <li>You win and complete payment within 48 hours</li>
                  <li>The auction is cancelled by the seller</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                <p className="text-red-800 font-semibold mb-2">Security may be forfeited if:</p>
                <ul className="list-disc list-inside text-red-700 space-y-1 ml-4">
                  <li>You win but fail to complete payment within 48 hours</li>
                  <li>You withdraw a winning bid</li>
                  <li>You engage in fraudulent bidding practices</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'eligibility':
        return (
          <div className="space-y-6">
            <div className="bg-teal-50 border-l-4 border-teal-500 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Bidder Eligibility Requirements</h3>
              <p className="text-gray-700">
                All bidders must meet these requirements to participate in auctions.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Basic Requirements</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Account Registration</h5>
                    <p className="text-gray-600">
                      Must have a registered BidMaster account with verified email address
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Age Requirement</h5>
                    <p className="text-gray-600">
                      Must be at least 18 years old to participate in auctions
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Payment Method</h5>
                    <p className="text-gray-600">
                      Must have a valid payment method on file (credit card, debit card, or PayPal)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Identity Verification</h5>
                    <p className="text-gray-600">
                      May be required for high-value auctions or first-time bidders
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Restrictions</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-semibold mb-2">The following are not eligible to bid:</p>
                <ul className="list-disc list-inside text-yellow-700 space-y-1 ml-4">
                  <li>Bidders with suspended or banned accounts</li>
                  <li>Bidders with outstanding payment obligations</li>
                  <li>Bidders who have violated platform policies</li>
                  <li>Minors under 18 years of age</li>
                  <li>Bidders bidding on their own listed items (self-bidding prohibited)</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Power of Attorney</h4>
              <p className="text-gray-600 mb-3">
                If bidding on behalf of another person or organization:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>You must have written authorization (Power of Attorney)</li>
                <li>Authorization must be submitted to BidMaster before bidding</li>
                <li>You are responsible for all obligations as if bidding for yourself</li>
                <li>Both parties may be held liable for payment obligations</li>
              </ul>
            </div>
          </div>
        )

      case 'withdrawal':
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Bid Withdrawal Policy</h3>
              <p className="text-gray-700">
                Once submitted, bids are generally final. However, certain circumstances may allow for withdrawal.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">General Rule</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold text-lg mb-2">
                  ⚠️ Bids Cannot Be Withdrawn After Submission
                </p>
                <p className="text-red-700">
                  Once a bid is submitted and confirmed, it becomes a binding commitment.
                  Withdrawal is not permitted except in exceptional circumstances outlined below.
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Exceptional Circumstances</h4>
              <p className="text-gray-600 mb-3">
                Bid withdrawal may be considered only in the following cases:
              </p>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-1">1. Technical Error</h5>
                  <p className="text-gray-600 text-sm">
                    If a bid was submitted due to a technical error on BidMaster's platform,
                    contact support within 1 hour of bid submission with evidence.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-1">2. Item Misrepresentation</h5>
                  <p className="text-gray-600 text-sm">
                    If the item description was significantly misrepresented and you can prove it,
                    withdrawal may be allowed before auction end.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-1">3. Duplicate Bid</h5>
                  <p className="text-gray-600 text-sm">
                    If you accidentally submitted the same bid twice, the duplicate may be removed
                    if requested within 30 minutes.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Withdrawal Process</h4>
              <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
                <li>Contact BidMaster support immediately with your request</li>
                <li>Provide detailed explanation and supporting evidence</li>
                <li>Request must be made before auction end time</li>
                <li>BidMaster will review and respond within 24 hours</li>
                <li>If approved, bid will be removed and you'll be notified</li>
              </ol>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Consequences of Winning Bid Withdrawal</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">
                  If you win an auction and attempt to withdraw:
                </p>
                <ul className="list-disc list-inside text-red-700 space-y-1 ml-4">
                  <li>Bid security will be forfeited</li>
                  <li>Account may be suspended or banned</li>
                  <li>You may be liable for damages to the seller</li>
                  <li>Negative feedback will be recorded on your account</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'award':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Contract Award Process</h3>
              <p className="text-gray-700">
                The process for awarding the auction to the winning bidder.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Award Determination</h4>
              <ol className="list-decimal list-inside text-gray-600 space-y-3 ml-4">
                <li>
                  <strong>Auction Closure:</strong> Auction automatically closes at the specified end time
                </li>
                <li>
                  <strong>Bid Evaluation:</strong> System automatically identifies the highest valid bid
                </li>
                <li>
                  <strong>Winner Notification:</strong> Winning bidder receives immediate email and platform notification
                </li>
                <li>
                  <strong>Public Announcement:</strong> Winning bid amount is displayed on the auction page
                </li>
                <li>
                  <strong>Payment Request:</strong> Payment instructions sent to winning bidder within 1 hour
                </li>
              </ol>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Award Criteria</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 mb-2">The winning bidder is determined by:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Highest bid amount at auction close</li>
                  <li>Bid submitted before auction end time</li>
                  <li>Bidder meets all eligibility requirements</li>
                  <li>Bid security (if required) is valid and active</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Post-Award Process</h4>
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">1. Payment (48 Hours)</h5>
                  <p className="text-blue-700 text-sm">
                    Winning bidder must complete payment within 48 hours of auction close.
                    Payment methods: Credit card, debit card, or PayPal.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">2. Seller Confirmation (24 Hours)</h5>
                  <p className="text-blue-700 text-sm">
                    Seller confirms receipt of payment and prepares item for shipment.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">3. Shipping (5-7 Business Days)</h5>
                  <p className="text-blue-700 text-sm">
                    Seller ships item with tracking information. Buyer receives tracking details.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 mb-2">4. Delivery & Inspection</h5>
                  <p className="text-blue-700 text-sm">
                    Buyer receives item and has 7 days to inspect and report any issues.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Failure to Complete Payment</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">If payment is not completed within 48 hours:</p>
                <ul className="list-disc list-inside text-red-700 space-y-1 ml-4">
                  <li>Bid security is forfeited</li>
                  <li>Auction may be awarded to the next highest bidder</li>
                  <li>Account may be suspended</li>
                  <li>Negative feedback recorded</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'terms':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border-l-4 border-gray-500 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Terms & Conditions</h3>
              <p className="text-gray-700">
                General terms and conditions governing use of the BidMaster platform.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Platform Usage</h4>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2">Account Responsibility</h5>
                  <p className="text-gray-600 text-sm">
                    You are responsible for maintaining the security of your account credentials.
                    All activities under your account are your responsibility.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h5 className="font-semibold text-gray-800 mb-2">Prohibited Activities</h5>
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-4">
                    <li>Fraudulent bidding or bid manipulation</li>
                    <li>Creating multiple accounts to circumvent restrictions</li>
                    <li>Interfering with other users' bidding activities</li>
                    <li>Posting false or misleading information</li>
                    <li>Violating any applicable laws or regulations</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Fees & Charges</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Buyer's Premium:</strong> None - you pay only the winning bid amount</li>
                  <li><strong>Transaction Fees:</strong> 2.5% processing fee on all payments</li>
                  <li><strong>Shipping:</strong> As specified by seller in auction listing</li>
                  <li><strong>Bid Security:</strong> Refundable if not the winner or if payment completed</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Dispute Resolution</h4>
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">Resolution Process</h5>
                  <ol className="list-decimal list-inside text-yellow-700 text-sm space-y-1 ml-4">
                    <li>Contact seller directly to resolve issues</li>
                    <li>If unresolved, file a dispute through BidMaster support</li>
                    <li>BidMaster will mediate and make a decision within 7 business days</li>
                    <li>Decisions are binding for both parties</li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Limitation of Liability</h4>
              <p className="text-gray-600 mb-3">
                BidMaster acts as a platform connecting buyers and sellers. We are not responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                <li>Item condition, authenticity, or description accuracy</li>
                <li>Shipping delays or damages during transit</li>
                <li>Payment disputes between buyer and seller</li>
                <li>Actions of third-party sellers or buyers</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Policy Updates</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  BidMaster reserves the right to update these policies at any time.
                  Significant changes will be communicated via email and platform notifications.
                  Continued use of the platform constitutes acceptance of updated policies.
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 mb-2">
                  For questions about these policies, contact:
                </p>
                <ul className="list-none text-gray-600 space-y-1 mb-4">
                  <li>📧 Email: support@bidmaster.com</li>
                  <li>📞 Phone: 1-800-BID-MASTER</li>
                  <li>💬 Live Chat: Available 24/7 on platform</li>
                </ul>
                <Link
                  to="/contact"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Visit Contact Support Page →
                </Link>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
             <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Bidding Policy</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Comprehensive rules and procedures for participating in BidMaster auctions
            </p>
          </div>
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 mb-4 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </button>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sticky top-24 transition-colors duration-200">
              <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-4">Policy Sections</h2>
              <nav className="space-y-1">
                {policySections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 transition-colors duration-200">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BiddingPolicy

