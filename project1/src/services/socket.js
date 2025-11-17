import { io } from 'socket.io-client'

// Get the socket URL from environment variables, or use default localhost URL
let SOCKET_URL = 'http://localhost:5000'
if (import.meta.env && import.meta.env.VITE_SOCKET_URL) {
  SOCKET_URL = import.meta.env.VITE_SOCKET_URL
}

// Variable to store the socket connection
let socket = null

// Function to handle successful connection
function handleConnect() {
  console.log('Connected to server')
}

// Function to handle disconnection
function handleDisconnect() {
  console.log('Disconnected from server')
}

// Function to connect to the socket server
export function connectSocket() {
  // Only create a new connection if one doesn't exist
  if (!socket) {
    // Create socket connection with configuration
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    // Listen for connection event
    socket.on('connect', handleConnect)

    // Listen for disconnection event
    socket.on('disconnect', handleDisconnect)
  }
  return socket
}

// Function to disconnect from the socket server
export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Function to get the socket connection (creates one if it doesn't exist)
export function getSocket() {
  if (!socket) {
    return connectSocket()
  }
  return socket
}

export default socket

