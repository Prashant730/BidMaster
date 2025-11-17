// Import React and ReactDOM functions
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Import CSS styles
import './index.css'

// Import the main App component
import App from './App.jsx'

// Get the root element from HTML (div with id="root")
const rootElement = document.getElementById('root')

// Create a React root and render the App component
// StrictMode helps find problems in the application during development
const root = createRoot(rootElement)
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
