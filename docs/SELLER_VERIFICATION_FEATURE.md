# Seller Verification Feature

## Overview

This feature implements a seller verification system where users must request permission from administrators before they can create and sell items at auctions.

## How It Works

### 1. User Registration with Seller Request

- When registering, users can check a box to "Request Seller Account"
- This sets their role to 'seller' and sellerStatus to 'pending'
- Users without seller approval remain as regular 'bidder' accounts

### 2. Admin Approval Process

- Admins can view all pending seller requests in the Admin Dashboard
- The dashboard shows a count of pending validations
- In the Users tab, pending sellers are clearly marked with:
  - "Seller Request Pending" badge
  - "Approve Seller" and "Reject" buttons

### 3. Seller Status States

- **Pending**: User has requested seller status, awaiting admin approval
- **Approved**: Admin has approved the request, user can create auctions
- **Rejected**: Admin has rejected the request, user remains a bidder

### 4. Auction Creation Restrictions

- Only approved sellers can access the Create Auction page
- Users see different messages based on their status:
  - **Pending**: "Your request is being reviewed" (yellow warning)
  - **Rejected**: "Your request was not approved" (red error)
  - **Not Requested**: "You need to be an approved seller" (purple info)

### 5. User Profile Display

- Users can see their seller status in their profile
- Status cards show:
  - Pending: Yellow card with review time estimate
  - Approved: Green card with "Create Auction" button
  - Rejected: Red card with "Contact Support" button

## Accessing the Seller Approval Page

### For Users:

- Navigate to `/seller-approval` or click "Become a Seller" in the user menu
- Fill out the seller request form with business details
- Submit and wait for admin approval

### For Admins:

- Navigate to `/seller-approval` or click "Seller Approvals" in the admin menu
- View all pending seller requests with detailed information
- Approve or reject requests with one click

## Files Created

1. **SellerApproval.jsx** (NEW)
   - Dedicated page for seller approval requests
   - User view: Form to submit seller request with business details
   - Admin view: List of all pending requests with approve/reject buttons
   - Shows different states: pending, approved, rejected, already seller

## Files Modified

1. **LoginModal.jsx**

   - Added checkbox for seller request during registration
   - Updated form state to include `requestSeller` field

2. **App.jsx**

   - Updated `handleLogin` to accept `requestSeller` parameter
   - Sets user role to 'seller' and sellerStatus to 'pending' when requested

3. **Admin.jsx**

   - Updated stats to count pending seller requests
   - Added `rejectSellerRequest` function
   - Updated user table to show seller status badges
   - Added "Approve Seller" and "Reject" buttons for pending requests

4. **CreateAuction.jsx**

   - Added seller verification check before allowing auction creation
   - Shows appropriate messages for pending, rejected, or non-seller users

5. **UserProfile.jsx**

   - Added seller status card in overview section
   - Shows current status with appropriate styling and actions
   - Added "Become a Seller" card for non-sellers with link to approval page

6. **Header.jsx**
   - Added "Seller Approvals" link in admin menu
   - Added "Become a Seller" link for regular users
   - Links appear in both desktop and mobile menus

## Key Features of Seller Approval Page

### User Features:

- ✅ Comprehensive form to provide business details
- ✅ Required fields: Business Name, Type, Description
- ✅ Optional fields: Experience, Website, Phone
- ✅ Clear status messages for pending/approved/rejected states
- ✅ Success confirmation after submission
- ✅ Helpful information about the approval process

### Admin Features:

- ✅ Centralized view of all pending seller requests
- ✅ Detailed information display for each request
- ✅ One-click approve/reject buttons
- ✅ Visual count of pending requests
- ✅ Clean, organized interface
- ✅ Empty state when no pending requests

## Testing the Feature

### Method 1: During Registration

1. Register a new account and check "Request Seller Account"
2. Login and view your profile - you'll see "Seller Request Pending"
3. Try to create an auction - you'll be blocked with a pending message

### Method 2: Using Seller Approval Page (Recommended)

1. Login with a regular account
2. Click "Become a Seller" in the user menu or navigate to `/seller-approval`
3. Fill out the seller request form with:
   - Business Name (required)
   - Business Type (required)
   - Description (required)
   - Experience (optional)
   - Website (optional)
   - Phone Number (optional)
4. Submit the request
5. View your profile to see "Seller Request Pending" status

### As an Admin:

**Option 1: Via Seller Approval Page (Recommended)**

1. Login with an email ending in @admin.com
2. Click "Seller Approvals" in the admin menu or navigate to `/seller-approval`
3. View all pending requests with full details:
   - User profile information
   - Business name and type
   - Description and experience
   - Contact information
4. Click "✓ Approve" to approve or "✗ Reject" to reject

**Option 2: Via Admin Dashboard**

1. Login with an email ending in @admin.com
2. Go to Admin Dashboard
3. Navigate to Users tab
4. Find users with "Seller Request Pending" badge
5. Click "Approve Seller" or "Reject" to process the request

### After Approval:

1. User can now access Create Auction page
2. Profile shows "Seller Account Approved" with green badge
3. User can create and manage auctions

## Benefits

- **Security**: Prevents spam and ensures quality sellers
- **Control**: Admins can vet sellers before allowing them to create auctions
- **Transparency**: Users always know their seller status
- **User Experience**: Clear messaging at every step of the process
- **Detailed Information**: Admins can review comprehensive business details before approval
- **Centralized Management**: Single page for all seller approval operations
- **Flexible Request Methods**: Users can request during registration or later via dedicated page
