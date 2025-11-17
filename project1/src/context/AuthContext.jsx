import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api.js'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider(props) {
  const children = props.children
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Load user when token changes
  useEffect(function() {
    if (token) {
      // Step 1: If token exists, load user data
      loadUser()
    } else {
      // Step 2: If no token, set loading to false
      setLoading(false)
    }
  }, [token])

  async function loadUser() {
    try {
      const response = await authAPI.getMe()
      setUser(response.data)
    } catch (error) {
      console.error('Error loading user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    try {
      const response = await authAPI.login({ email: email, password: password })
      const responseData = response.data
      const newToken = responseData.token
      const userData = {}
      for (let key in responseData) {
        if (key !== 'token') {
          userData[key] = responseData[key]
        }
      }

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(newToken)
      setUser(userData)
      return { success: true }
    } catch (error) {
      let errorMessage = 'Login failed'
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      }
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  async function register(username, email, password, role) {
    if (role === undefined) {
      role = 'bidder'
    }
    try {
      const response = await authAPI.register({ username: username, email: email, password: password, role: role })
      const responseData = response.data
      const newToken = responseData.token
      const userData = {}
      for (let key in responseData) {
        if (key !== 'token') {
          userData[key] = responseData[key]
        }
      }

      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setToken(newToken)
      setUser(userData)
      return { success: true }
    } catch (error) {
      let errorMessage = 'Registration failed'
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.errors && error.response.data.errors.length > 0 && error.response.data.errors[0].msg) {
          errorMessage = error.response.data.errors[0].msg
        }
      }
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

