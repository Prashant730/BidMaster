import { createContext, useContext } from 'react'

const AuctionContext = createContext()

export function useAuction() {
  const context = useContext(AuctionContext)
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider')
  }
  return context
}

// Simplified provider - main auction logic is now in AppContext
export function AuctionProvider({ children }) {
  const value = {}
  return <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>
}
