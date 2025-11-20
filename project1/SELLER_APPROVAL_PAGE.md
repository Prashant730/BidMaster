# Seller Approval Page - Quick Guide

## Overview

A dedicated page at `/seller-approval` where users can submit seller requests and admins can review and approve them.

## For Users

### How to Request Seller Status

1. **Login** to your account
2. **Navigate** to the Seller Approval page:
   - Click "Become a Seller" in the user menu, OR
   - Go directly to `/seller-approval`
3. **Fill out the form** with your business details:
   - **Business Name** (required) - Your business or brand name
   - **Business Type** (required) - Select from dropdown (Individual, Small Business, Retailer, etc.)
   - **Description** (required) - Tell us about your business and what you plan to sell
   - **Experience** (optional) - Your experience in selling or relevant industry
   - **Website** (optional) - Your business website
   - **Phone Number** (optional) - Contact phone number
4. **Submit** your request
5. **Wait** for admin approval (typically 24-48 hours)

### What You'll See

- **Before Request**: Form to submit seller request
- **Pending**: "Request Under Review" message with estimated review time
- **Approved**: "You're Already a Seller!" with links to create auctions
- **Rejected**: "Request Not Approved" with link to contact support

## For Admins

### How to Review Seller Requests

1. **Login** with admin account (email ending in @admin.com)
2. **Navigate** to Seller Approvals:
   - Click "Seller Approvals" in the admin menu, OR
   - Go directly to `/seller-approval`, OR
   - Click "Seller Approvals" in Admin Dashboard Quick Access
3. **Review** pending requests:
   - See count of pending requests at the top
   - View detailed information for each applicant:
     - Profile photo and name
     - Email address
     - Business name and type
     - Description and experience
     - Website and phone number
     - Request submission date
4. **Take Action**:
   - Click **"✓ Approve"** to approve the seller
   - Click **"✗ Reject"** to reject the request

### What You'll See

- **Pending Requests**: List of all users awaiting approval with full details
- **No Requests**: "All Caught Up!" message when there are no pending requests
- **Request Count**: Badge showing number of pending requests

## Quick Access Points

### User Menu

- "Become a Seller" link (for non-sellers)

### Admin Menu

- "Seller Approvals" link
- Admin Dashboard → Quick Access → "Seller Approvals"

### Direct URL

- `/seller-approval`

## Features

### User Side

✅ Comprehensive business information form
✅ Clear status indicators
✅ Success confirmation
✅ Helpful guidance throughout the process

### Admin Side

✅ All pending requests in one place
✅ Detailed applicant information
✅ One-click approve/reject
✅ Visual pending count
✅ Clean, organized interface

## Status Flow

```
User Submits Request
        ↓
    [PENDING]
        ↓
   Admin Reviews
        ↓
    ┌───────┐
    ↓       ↓
[APPROVED] [REJECTED]
    ↓       ↓
Can Create  Remains
Auctions    Bidder
```

## Tips

### For Users

- Provide detailed, accurate information to increase approval chances
- Include a website if you have one - it helps build trust
- Be clear about what you plan to sell
- Check your profile regularly for status updates

### For Admins

- Review all provided information carefully
- Check website links if provided
- Consider the business type and description
- Use the reject option for suspicious or incomplete requests
- Pending requests are also visible in the Admin Dashboard Users tab
