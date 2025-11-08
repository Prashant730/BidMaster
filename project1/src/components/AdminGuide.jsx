import React from 'react'

const AdminGuide = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Guide</h1>
          <p className="text-gray-600 mb-6">How to manage users, auctions, and settings.</p>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Access</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Open the menu avatar and click <span className="font-semibold">Admin Panel</span>.</li>
                <li>Admins cannot place bids and do not see bidder-only CTAs.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Users</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Approve sellers awaiting validation.</li>
                <li>Suspend or ban accounts when necessary.</li>
                <li>Reset user passwords when requested.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Auctions</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Review live auctions and click <span className="font-semibold">Remove</span> to take down listings that violate policy.</li>
                <li>End auctions early via <span className="font-semibold">Cancel</span> in the admin Auctions tab.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Financials</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Adjust commission rate; revenue estimates update automatically.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Configuration</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Manage categories and site-wide rules.</li>
                <li>Post announcements for users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Moderation</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Review reports and support tickets in the Moderation tab.</li>
              </ul>
            </section>

            <div className="mt-6 p-4 bg-purple-50 text-purple-700 rounded-lg">
              Tip: As an admin, bidding is disabled to maintain platform integrity.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminGuide


