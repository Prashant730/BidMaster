import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { contactAPI } from '../services/api.js'

function ContactSupport() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const MAX_LENGTHS = {
    name: 100,
    email: 254,
    subject: 200,
    message: 5000
  }

  function validateForm() {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length > MAX_LENGTHS.name) {
      errors.name = 'Name cannot exceed ' + MAX_LENGTHS.name + ' characters'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address'
    } else if (formData.email.trim().length > MAX_LENGTHS.email) {
      errors.email = 'Email cannot exceed ' + MAX_LENGTHS.email + ' characters'
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required'
    } else if (formData.subject.trim().length > MAX_LENGTHS.subject) {
      errors.subject = 'Subject cannot exceed ' + MAX_LENGTHS.subject + ' characters'
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters'
    } else if (formData.message.trim().length > MAX_LENGTHS.message) {
      errors.message = 'Message cannot exceed ' + MAX_LENGTHS.message + ' characters'
    }

    return errors
  }

  function handleChange(e) {
    const fieldName = e.target.name
    const fieldValue = e.target.value

    if (fieldErrors[fieldName]) {
      setFieldErrors(function (prev) {
        const updated = { ...prev }
        delete updated[fieldName]
        return updated
      })
    }

    setFormData(function(prev) {
      const newFormData = {
        name: prev.name,
        email: prev.email,
        subject: prev.subject,
        category: prev.category,
        message: prev.message
      }
      newFormData[fieldName] = fieldValue
      return newFormData
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitStatus(null)
    setErrorMessage('')
    setFieldErrors({})

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await contactAPI.submit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        category: formData.category,
        message: formData.message.trim()
      })

      if (response.data.success) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: ''
        })

        setTimeout(function() {
          setSubmitStatus(null)
        }, 8000)
      }
    } catch (error) {
      setSubmitStatus('error')

      if (error.response) {
        const status = error.response.status
        const data = error.response.data

        if (status === 429) {
          setErrorMessage('You have sent too many messages. Please wait 15 minutes before trying again.')
        } else if (status === 400 && data.errors) {
          const serverErrors = {}
          data.errors.forEach(function (err) {
            serverErrors[err.field] = err.message
          })
          setFieldErrors(serverErrors)
          setErrorMessage('Please fix the errors below and try again.')
        } else {
          setErrorMessage(data.message || 'Something went wrong. Please try again later.')
        }
      } else if (error.request) {
        setErrorMessage('Unable to reach the server. Please check your internet connection and try again.')
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const supportCategories = [
    { value: 'general', label: 'General Inquiry', icon: '💬' },
    { value: 'bidding', label: 'Bidding Help', icon: '💰' },
    { value: 'payment', label: 'Payment Issues', icon: '💳' },
    { value: 'account', label: 'Account Issues', icon: '👤' },
    { value: 'technical', label: 'Technical Support', icon: '🔧' },
    { value: 'dispute', label: 'Dispute Resolution', icon: '⚖️' },
    { value: 'seller', label: 'Seller Support', icon: '🏪' },
    { value: 'other', label: 'Other', icon: '📋' }
  ]

  const faqItems = [
    {
      question: 'How do I place a bid?',
      answer: 'Simply browse our auctions, click on an item you\'re interested in, and enter your bid amount. Make sure you\'re logged in and have a payment method on file.'
    },
    {
      question: 'What happens if I win an auction?',
      answer: 'You\'ll receive an email notification immediately. You have 48 hours to complete payment. Once payment is confirmed, the seller will ship your item.'
    },
    {
      question: 'Can I cancel a bid?',
      answer: 'Bids are generally final once submitted. However, you may contact support within 1 hour if there was a technical error. See our Bidding Policy for more details.'
    },
    {
      question: 'How do I get a refund?',
      answer: 'Refunds are handled on a case-by-case basis. Contact support with your order number and reason for refund request. We\'ll review your case within 7 business days.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes! We use industry-standard encryption and never store your full payment details. All transactions are processed through secure payment gateways.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Shipping times vary by seller and location. Typically, items ship within 5-7 business days after payment confirmation. You\'ll receive tracking information once shipped.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Contact Support</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                We're here to help! Get in touch with our support team for any questions or concerns.
              </p>
            </div>
            <button
              onClick={function() { navigate('/') }}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Get in Touch</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Email</h3>
                    <a href="mailto:support@bidmaster.com" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                      support@bidmaster.com
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Phone</h3>
                    <a href="tel:18002436278" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                      1-800-BID-MASTER
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mon-Fri: 9 AM - 6 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Live Chat</h3>
                    <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                      Start Chat
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Address</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      123 Auction Street<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 transition-colors duration-200">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Response Times</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Live Chat:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">Immediate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Email:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">Within 24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">During business hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Disputes:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100">7 business days</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">Helpful Resources</h3>
              <div className="space-y-2">
                <button
                  onClick={function() { navigate('/policy') }}
                  className="block w-full text-left text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                >
                  📜 Bidding Policy
                </button>
                <button
                  onClick={function() {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="block w-full text-left text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                >
                  📚 Beginner's Guide
                </button>
                <a
                  href="#faq"
                  className="block text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                >
                  ❓ Frequently Asked Questions
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 transition-colors duration-200">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Send us a Message</h2>

              {submitStatus === 'success' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Message sent successfully! We'll get back to you soon.</span>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={MAX_LENGTHS.name}
                      className={'w-full border rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent dark:bg-slate-700 dark:text-gray-100 ' + (fieldErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-slate-600 focus:ring-purple-500')}
                      placeholder="John Doe"
                    />
                    {fieldErrors.name && <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength={MAX_LENGTHS.email}
                      className={'w-full border rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent dark:bg-slate-700 dark:text-gray-100 ' + (fieldErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-slate-600 focus:ring-purple-500')}
                      placeholder="john@example.com"
                    />
                    {fieldErrors.email && <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    id="contact-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {supportCategories.map(function(cat) {
                      return (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={MAX_LENGTHS.subject}
                    className={'w-full border rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent dark:bg-slate-700 dark:text-gray-100 ' + (fieldErrors.subject ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-slate-600 focus:ring-purple-500')}
                    placeholder="Brief description of your inquiry"
                  />
                  {fieldErrors.subject && <p className="mt-1 text-sm text-red-500">{fieldErrors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={MAX_LENGTHS.message}
                    rows={6}
                    className={'w-full border rounded-lg px-4 py-3 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none dark:bg-slate-700 dark:text-gray-100 ' + (fieldErrors.message ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 dark:border-slate-600 focus:ring-purple-500')}
                    placeholder="Please provide as much detail as possible so we can assist you better..."
                  />
                  <div className="flex justify-between mt-1">
                    {fieldErrors.message ? (
                      <p className="text-sm text-red-500">{fieldErrors.message}</p>
                    ) : (
                      <span></span>
                    )}
                    <span className={'text-xs ' + (formData.message.length > MAX_LENGTHS.message * 0.9 ? 'text-orange-500' : 'text-gray-400')}>
                      {formData.message.length}/{MAX_LENGTHS.message}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            <div id="faq" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 transition-colors duration-200">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqItems.map(function(faq, index) {
                  return (
                    <div key={index} className="border-b border-gray-200 dark:border-slate-700 pb-4 last:border-0">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{faq.answer}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactSupport
