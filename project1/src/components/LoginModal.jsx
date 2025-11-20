import React, { useState } from 'react'

function LoginModal(props) {
  const onClose = props.onClose
  const onLogin = props.onLogin
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    requestSeller: false
  })

  function handleSubmit(e) {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      alert('Please fill in all required fields')
      return
    }

    if (!isLogin && !formData.name) {
      alert('Please enter your name for registration')
      return
    }

    // Call onLogin with email, password, name, and seller request (if registering)
    onLogin(formData.email, formData.password, isLogin ? null : formData.name, isLogin ? null : formData.requestSeller)

    // Reset form
    setFormData({
      email: '',
      password: '',
      name: '',
      requestSeller: false
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={function(e) {
                    const newFormData = {
                      name: e.target.value,
                      email: formData.email,
                      password: formData.password,
                      requestSeller: formData.requestSeller
                    }
                    setFormData(newFormData)
                  }}
                  className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input type="email" value={formData.email} onChange={function(e) {
                const newFormData = {
                  name: formData.name,
                  email: e.target.value,
                  password: formData.password,
                  requestSeller: formData.requestSeller
                }
                setFormData(newFormData)
              }} className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Enter your email" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input type="password" value={formData.password} onChange={function(e) {
                const newFormData = {
                  name: formData.name,
                  email: formData.email,
                  password: e.target.value,
                  requestSeller: formData.requestSeller
                }
                setFormData(newFormData)
              }} className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Enter your password" required />
            </div>

            {!isLogin && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requestSeller}
                    onChange={(e) => setFormData({ ...formData, requestSeller: e.target.checked })}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Request Seller Account</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Check this box to request permission to create and sell items at auctions. Your request will be reviewed by an administrator.
                    </div>
                  </div>
                </label>
              </div>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-lg">{isLogin ? 'Sign In' : 'Create Account'}</button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <button
              type="button"
              onClick={function() {
                setIsLogin(!isLogin)
                setFormData({
                  email: '',
                  password: '',
                  name: '',
                  requestSeller: false
                })
              }}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
