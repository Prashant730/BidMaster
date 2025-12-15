# Registration & Login Pages

## Overview

Added dedicated registration and login pages to BidMaster for a better user experience.

## New Pages

### 1. Register Page (`/register`)

- **Location**: `src/components/Register.jsx`
- **Features**:
  - Full form validation with error messages
  - Username, email, full name, phone (optional), and password fields
  - Password visibility toggle
  - Confirm password field with matching validation
  - Seller account request checkbox
  - Terms and conditions agreement
  - Password strength requirement (minimum 6 characters)
  - Loading state during registration
  - Automatic redirect after successful registration
  - Link to login page for existing users
  - Visual benefits showcase (Bid on Items, Track Auctions, Sell Items)
  - Responsive design with gradient background
  - Dark mode support

### 2. Login Page (`/login`)

- **Location**: `src/components/Login.jsx`
- **Features**:
  - Email and password fields
  - Password visibility toggle
  - Form validation with error messages
  - Remember me checkbox
  - Forgot password link (redirects to contact)
  - Loading state during login
  - Automatic redirect after successful login
  - Link to registration page
  - Responsive design with gradient background
  - Dark mode support

## Updates

### Header Component

- Replaced single "Login/Register" button with separate buttons:
  - "Login" button (text only, hover effect)
  - "Sign Up" button (gradient background)
- Updated mobile menu to include both login and register links
- Links navigate to dedicated pages instead of opening modal

### App.jsx

- Added new routes:
  - `/login` - Login page
  - `/register` - Register page
- Imported new Login and Register components

## Validation Rules

### Registration

- **Username**: 3-30 characters, required
- **Email**: Valid email format, required
- **Name**: Required
- **Phone**: Optional
- **Password**: Minimum 6 characters, required
- **Confirm Password**: Must match password, required
- **Terms**: Must be agreed to

### Login

- **Email**: Valid email format, required
- **Password**: Required

## User Flow

1. **New User Registration**:

   - User clicks "Sign Up" in header
   - Fills out registration form
   - Optionally requests seller account
   - Agrees to terms
   - Submits form
   - Redirected to home page if successful

2. **Existing User Login**:

   - User clicks "Login" in header
   - Enters email and password
   - Submits form
   - Redirected to home page if successful

3. **Auto-redirect**:
   - Both pages check if user is already authenticated
   - If yes, automatically redirect to home page

## Design Features

- **Gradient backgrounds**: Purple-to-pink gradient for visual appeal
- **Card-based forms**: White/dark cards with shadows
- **Error handling**: Inline validation messages with icons
- **Loading states**: Spinner animation during API calls
- **Responsive**: Mobile-first design, adapts to all screen sizes
- **Dark mode**: Full support with appropriate color schemes
- **Accessibility**: Proper labels, ARIA attributes, keyboard navigation

## Benefits

1. **Better UX**: Dedicated pages instead of modal
2. **More Information**: Space to explain benefits and features
3. **SEO Friendly**: Dedicated URLs for search engines
4. **Mobile Friendly**: Full-screen forms work better on mobile
5. **Validation**: Comprehensive client-side validation
6. **Professional**: Matches modern web application standards
