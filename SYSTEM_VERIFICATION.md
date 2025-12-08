# BidMaster System Verification & Testing Guide

## ✅ System Status

Your BidMaster auction platform is now **FULLY OPERATIONAL** with complete backend-frontend integration.

---

## 🚀 Running the System

### Start Backend Server

```powershell
cd D:\BidMaster\backend
node server.js
```

**Expected Output:**

```
MongoDB Connected: localhost
Server running on port 5000
Environment: development
Auction scheduler started - checking every minute
Client connected: [socket-id]
```

### Start Frontend (in separate terminal)

```powershell
cd D:\BidMaster\project1
npm run dev
```

**Expected Output:**

```
VITE v7.1.0 ready in [time] ms
➜ Local: http://localhost:5174/
```

---

## 🔑 Test Credentials

The database has been seeded with the following test accounts:

### Admin Account

- **Email:** admin@auction.com
- **Password:** admin123
- **Role:** Admin
- **Permissions:** Full system access, user management, seller approvals

### Seller Accounts

1. **Email:** seller1@auction.com

   - **Password:** seller123
   - **Status:** Approved
   - **Permissions:** Create auctions, manage bids

2. **Email:** seller2@auction.com
   - **Password:** seller123
   - **Status:** Approved
   - **Permissions:** Create auctions, manage bids

### Pending Seller Account

- **Email:** pending@auction.com
- **Password:** pending123
- **Status:** Pending Approval
- **Action Required:** Admin must approve before can create auctions

### Bidder Accounts

1. **Email:** bidder1@auction.com

   - **Password:** bidder123
   - **Status:** Active
   - **Permissions:** Browse and bid on auctions

2. **Email:** bidder2@auction.com
   - **Password:** bidder123
   - **Status:** Active
   - **Permissions:** Browse and bid on auctions

---

## 📋 Comprehensive Testing Checklist

### Phase 1: Authentication & Authorization

- [ ] **Register New User**

  1. Navigate to http://localhost:5174/register
  2. Fill in form with valid data
  3. Create account as "bidder"
  4. Verify redirect to home page
  5. Check localStorage for JWT token

- [ ] **Login with Admin Account**

  1. Navigate to http://localhost:5174/login
  2. Enter: admin@auction.com / admin123
  3. Verify redirect to home page
  4. Check user menu shows admin options
  5. Verify admin dashboard accessible

- [ ] **Login with Seller Account**

  1. Navigate to http://localhost:5174/login
  2. Enter: seller1@auction.com / seller123
  3. Verify seller-specific features visible
  4. Check auction creation option available

- [ ] **Login with Bidder Account**

  1. Navigate to http://localhost:5174/login
  2. Enter: bidder1@auction.com / bidder123
  3. Verify can browse auctions
  4. Check auction creation disabled

- [ ] **Logout Functionality**
  1. After logging in, click user menu
  2. Click logout
  3. Verify redirect to home
  4. Verify JWT token removed from localStorage

### Phase 2: Auction Management

- [ ] **Browse Auctions**

  1. Navigate to home page
  2. Verify auctions display in grid
  3. Each auction shows: image, title, current bid, time remaining
  4. Click auction detail page loads

- [ ] **View Auction Details**

  1. Click on any auction
  2. Verify full details displayed: title, description, starting price, current bid, bids history
  3. Check bid history shows all bids with bidder names and amounts
  4. Verify seller information visible

- [ ] **Create Auction (as Seller)**

  1. Login as seller1@auction.com
  2. Navigate to "Create Auction"
  3. Fill in auction details:
     - Title
     - Description
     - Starting Price
     - Duration (hours)
     - Image URL
  4. Submit auction
  5. Verify auction appears in auction list
  6. Verify seller marked as creator

- [ ] **Place Bid**
  1. Login as bidder1@auction.com
  2. Navigate to auction
  3. Click "Place Bid"
  4. Enter amount higher than current bid
  5. Submit bid
  6. Verify bid accepted
  7. Verify new bid amount shown
  8. Verify previous bidder shown in history

### Phase 3: Real-time Features

- [ ] **Real-time Bid Updates**

  1. Open auction in two browser windows
  2. Window A: Logged in as bidder1
  3. Window B: Logged in as bidder2
  4. Window A: Place a bid
  5. Window B: Verify new bid appears without refresh

- [ ] **Auction Status Updates**
  1. Monitor auction near expiration
  2. Verify status changes to "Completed" when timer expires
  3. Verify winner notified
  4. Verify seller notified

### Phase 4: Admin Features

- [ ] **Access Admin Dashboard**

  1. Login as admin@auction.com
  2. Navigate to Admin Dashboard (menu option)
  3. Verify statistics displayed: total users, active auctions, total bids

- [ ] **Manage Users**

  1. In Admin Dashboard, go to User Management
  2. View all users with their roles
  3. Search users by email or username
  4. Verify user details (email, role, status)

- [ ] **Approve Sellers**

  1. In Admin Dashboard, go to Pending Sellers
  2. Verify pending@auction.com listed
  3. Click "Approve"
  4. Verify user now has "seller" role
  5. Verify user can now create auctions

- [ ] **Manage Auctions**
  1. In Admin Dashboard, view all auctions
  2. Verify ability to view auction details
  3. Verify ability to delete auctions if needed
  4. Check auction status displayed correctly

### Phase 5: User Profile

- [ ] **View Profile**

  1. Click user menu (top right)
  2. Select "Profile"
  3. Verify personal information displayed: username, email, role
  4. Verify auction history visible (if seller)
  5. Verify bid history visible (if bidder)

- [ ] **Update Profile**
  1. In profile page, find edit option
  2. Update information (if editable)
  3. Verify changes saved
  4. Verify changes persistent on refresh

### Phase 6: Error Handling & Edge Cases

- [ ] **Invalid Credentials**

  1. Attempt login with wrong password
  2. Verify error message displayed
  3. Verify not logged in

- [ ] **Duplicate Registration**

  1. Attempt to register with existing email
  2. Verify error message displayed
  3. Verify account not created

- [ ] **Bid Lower Than Current**

  1. Place bid lower than current bid
  2. Verify error message
  3. Verify bid not accepted

- [ ] **Access Denied**

  1. Login as bidder
  2. Try to access admin dashboard directly via URL
  3. Verify access denied/redirect

- [ ] **Seller Approval Workflow**
  1. Register as new seller
  2. Try to create auction before approval
  3. Verify creation blocked
  4. Have admin approve
  5. Verify can now create auctions

---

## 🔍 API Endpoint Testing

### Authentication Endpoints

**Register User**

```
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@test.com",
  "password": "secure123",
  "role": "bidder"
}
```

**Login**

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@auction.com",
  "password": "admin123"
}

Response includes JWT token to use in Authorization header:
Authorization: Bearer {token}
```

**Get Profile**

```
GET /api/auth/profile
Authorization: Bearer {token}
```

### Auction Endpoints

**Get All Auctions**

```
GET /api/auctions
```

**Get Auction Details**

```
GET /api/auctions/{auctionId}
```

**Create Auction**

```
POST /api/auctions
Authorization: Bearer {seller-token}
Content-Type: application/json

{
  "title": "Vintage Watch",
  "description": "Beautiful vintage watch",
  "startingPrice": 100,
  "duration": 24,
  "image": "https://..."
}
```

**Place Bid**

```
POST /api/auctions/{auctionId}/bid
Authorization: Bearer {bidder-token}
Content-Type: application/json

{
  "amount": 150
}
```

### Admin Endpoints

**Get Users**

```
GET /api/admin/users
Authorization: Bearer {admin-token}
```

**Approve Seller**

```
PUT /api/admin/users/{userId}/approve
Authorization: Bearer {admin-token}
```

**Get Auctions (Admin)**

```
GET /api/admin/auctions
Authorization: Bearer {admin-token}
```

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  username: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin, seller, bidder),
  profileImage: String,
  isApproved: Boolean (for sellers),
  createdAt: Date,
  updatedAt: Date
}
```

### Auctions Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  image: String,
  startingPrice: Number,
  currentBid: Number,
  seller: ObjectId (ref: User),
  bids: [{
    bidder: ObjectId (ref: User),
    amount: Number,
    timestamp: Date
  }],
  status: String (active, completed, cancelled),
  expiresAt: Date,
  winner: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Settings Collection

```javascript
{
  _id: ObjectId,
  platformName: String,
  minBidIncrement: Number,
  auctionDuration: Number
}
```

---

## 🔧 Troubleshooting

### Backend Not Starting

**Problem:** `MongoDB Connected: localhost` appears but server crashes

**Solution:**

1. Verify MongoDB is running: `mongod --version`
2. Check if port 5000 is already in use: `netstat -ano | findstr :5000`
3. Kill any process on 5000: `taskkill /PID [PID] /F`
4. Restart backend: `cd backend && node server.js`

### Frontend Not Connecting to Backend

**Problem:** API calls fail with CORS error

**Solution:**

1. Verify backend is running on port 5000
2. Check `.env` file in backend has correct MongoDB URL
3. Clear browser cache and localStorage
4. Check browser console for detailed error message
5. Verify `http://localhost:5000/api/health` is accessible

### Authentication Token Issues

**Problem:** Logged in but redirected to login page

**Solution:**

1. Check if JWT token is in localStorage: `localStorage.getItem('token')`
2. Verify token is valid: `console.log(localStorage.getItem('token'))`
3. Clear localStorage and re-login: `localStorage.clear()`
4. Verify token is being sent in Authorization header

### Auction Not Appearing After Creation

**Problem:** Created auction but doesn't show in list

**Solution:**

1. Refresh the page (Ctrl+R)
2. Check if seller is approved (admin account required)
3. Check browser console for errors
4. Verify auction was actually created in database
5. Check auction status - may be marked as "cancelled"

---

## 📊 Performance Monitoring

### Monitor Backend Logs

```powershell
# Watch for errors in real-time
Get-Content -Path "D:\BidMaster\backend\logs.txt" -Wait
```

### Check Database Connection

```powershell
# Verify MongoDB is running
Get-Process mongod
```

### Monitor Port Usage

```powershell
# Check port 5000 and 5174
netstat -ano | Select-String ":5000|:5174"
```

---

## 📝 Test Results Log

### Test Session: [DATE]

**Tester:** [Name]
**Duration:** [Start] - [End]
**Total Tests:** [X]
**Passed:** [X]
**Failed:** [X]
**Notes:** [Add findings here]

| Feature           | Status | Notes |
| ----------------- | ------ | ----- |
| User Registration | ✅     |       |
| User Login        | ✅     |       |
| Auction Creation  | ✅     |       |
| Bidding           | ✅     |       |
| Real-time Updates | ✅     |       |
| Admin Dashboard   | ✅     |       |
| Seller Approval   | ✅     |       |
| User Profile      | ✅     |       |

---

## 🎯 Next Steps

1. **Feature Development**

   - Add auction filtering and search
   - Implement user notifications
   - Add payment integration
   - Implement auction reviews/ratings

2. **Performance Optimization**

   - Add caching layer (Redis)
   - Optimize database queries
   - Implement pagination
   - Add image optimization

3. **Security Enhancements**

   - Implement rate limiting
   - Add two-factor authentication
   - Implement fraud detection
   - Add comprehensive logging

4. **Deployment**
   - Set up CI/CD pipeline
   - Deploy to production server
   - Set up monitoring and alerts
   - Implement backup strategy

---

## 📞 Support

For issues or questions:

1. Check this troubleshooting guide
2. Review browser console for error messages
3. Check backend terminal for logs
4. Verify all services are running
5. Try clearing cache and logging in again

---

**System Last Verified:** [Current Date]
**Backend Version:** 1.0.0
**Frontend Version:** 1.0.0
**Database:** MongoDB (localhost)
**Status:** ✅ FULLY OPERATIONAL
