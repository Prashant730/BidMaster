# 🚀 BidMaster Backend Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Setup](#mongodb-setup)
3. [Backend Configuration](#backend-configuration)
4. [Running the Backend](#running-the-backend)
5. [Frontend Connection](#frontend-connection)
6. [Testing the Connection](#testing-the-connection)
7. [Seeding Database](#seeding-database)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Install Required Software:

1. **Node.js** (v18 or higher)

   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** - Choose ONE option:

   **Option A: MongoDB Atlas (Cloud - Recommended for beginners)**

   - Free cloud database
   - No installation needed
   - Always accessible

   **Option B: MongoDB Community (Local)**

   - Free local database
   - Runs on your computer
   - Faster for development

---

## 2. MongoDB Setup

### Option A: MongoDB Atlas (Cloud) - RECOMMENDED

#### Step 1: Create Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a new project named "BidMaster"

#### Step 2: Create Cluster

1. Click "Build a Database"
2. Choose **FREE** M0 tier
3. Select cloud provider (AWS recommended)
4. Choose region closest to you
5. Click "Create Cluster" (takes 3-5 minutes)

#### Step 3: Create Database User

1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Username: `bidmaster_user`
4. Password: Generate secure password (save it!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

#### Step 4: Whitelist IP Address

1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

#### Step 5: Get Connection String

1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://bidmaster_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name before the `?`:
   ```
   mongodb+srv://bidmaster_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/auction-platform?retryWrites=true&w=majority
   ```

---

### Option B: MongoDB Local Installation

#### For Windows:

1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Install as Windows Service (check the box)
5. Install MongoDB Compass (GUI tool)

#### For Mac:

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### For Linux (Ubuntu):

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Verify Local Installation:

```bash
# Check if MongoDB is running
mongosh

# You should see MongoDB shell
# Type 'exit' to quit
```

**Your connection string for local MongoDB:**

```
mongodb://localhost:27017/auction-platform
```

---

## 3. Backend Configuration

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:

- express (web framework)
- mongoose (MongoDB ODM)
- jsonwebtoken (authentication)
- bcryptjs (password hashing)
- socket.io (real-time features)
- cors (cross-origin requests)
- dotenv (environment variables)
- node-cron (auction scheduler)

### Step 3: Create Environment File

Create a file named `.env` in the `backend` folder:

```bash
# For Windows PowerShell
New-Item -Path .env -ItemType File

# For Mac/Linux
touch .env
```

### Step 4: Configure Environment Variables

Open `backend/.env` and add:

```env
# MongoDB Connection String
# FOR ATLAS (Cloud):
MONGODB_URI=mongodb+srv://bidmaster_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/auction-platform?retryWrites=true&w=majority

# FOR LOCAL:
# MONGODB_URI=mongodb://localhost:27017/auction-platform

# JWT Secret (change to random string in production)
JWT_SECRET=bidmaster-secret-key-2025-change-this-in-production

# JWT Token Expiration
JWT_EXPIRE=7d

# Server Port
PORT=5000

# Environment
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5174
```

**Important Notes:**

- Replace `YOUR_PASSWORD` with your MongoDB Atlas password
- Replace `cluster0.xxxxx` with your actual cluster address
- Change `JWT_SECRET` to a random string (at least 32 characters)
- Update `FRONTEND_URL` if your frontend runs on different port

---

## 4. Running the Backend

### Start Backend Server:

```bash
# In backend folder
npm run dev
```

You should see:

```
Server running on port 5000
Environment: development
MongoDB Connected: cluster0.xxxxx.mongodb.net (or localhost)
Auction scheduler started - checking every minute
```

### What's Running:

- ✅ Express server on port 5000
- ✅ MongoDB connection established
- ✅ Socket.IO for real-time updates
- ✅ Cron job for auction expiration
- ✅ CORS enabled for frontend

---

## 5. Frontend Connection

### Step 1: Update Frontend Environment (Optional)

Create `project1/.env` file (optional, defaults work):

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 2: Start Frontend

```bash
# In project1 folder
cd ../project1
npm run dev
```

### How Frontend Connects to Backend:

1. **API Service** (`src/services/api.js`):

   - Axios instance configured with base URL
   - Auto-adds JWT token to all requests
   - Handles authentication errors

2. **Auth Context** (`src/context/AuthContext.jsx`):

   - `login()` → POST to `/api/auth/login`
   - `register()` → POST to `/api/auth/register`
   - `getMe()` → GET to `/api/auth/me`

3. **Auction Context** (`src/context/AuctionContext.jsx`):
   - Fetches auctions from API
   - Listens to Socket.IO for real-time updates

---

## 6. Testing the Connection

### Test 1: Check Backend Health

Open browser: http://localhost:5000/api/health

Should see:

```json
{
  "status": "ok",
  "timestamp": "2025-12-07T..."
}
```

### Test 2: Register New User

1. Go to http://localhost:5174/register
2. Fill in registration form
3. Click "Create Account"
4. Check browser Network tab (F12)
5. Should see successful POST to `/api/auth/register`

### Test 3: Login

1. Go to http://localhost:5174/login
2. Enter credentials
3. Click "Sign In"
4. Should redirect to homepage with user logged in

### Test 4: Check Database

#### Using MongoDB Compass (GUI):

1. Open MongoDB Compass
2. Connect using your connection string
3. Browse `auction-platform` database
4. See `users` collection with your registered user

#### Using MongoDB Shell:

```bash
# Connect to MongoDB
mongosh "YOUR_CONNECTION_STRING"

# Switch to database
use auction-platform

# View users
db.users.find().pretty()

# View auctions
db.auctions.find().pretty()

# Count documents
db.users.countDocuments()
```

---

## 7. Seeding Database

### Option A: Use Seed Script

The backend includes a seed script to populate test data:

```bash
# In backend folder
node seed.js
```

This creates:

- **Admin user**: admin@auction.com / admin123
- **Seller users**: seller1@auction.com / seller123
- **Bidder users**: bidder1@auction.com / bidder123
- **Sample auctions**: 6 active auctions with bids

### Option B: Manual Registration

1. Register users through the frontend `/register` page
2. For admin access, manually update user in database:

```javascript
// In MongoDB shell
use auction-platform

db.users.updateOne(
  { email: "your@email.com" },
  {
    $set: {
      isAdmin: true,
      role: "admin"
    }
  }
)
```

### Option C: Create Sellers

Users can request seller status:

1. Register with "Request Seller Account" checked
2. Admin approves in Admin Panel
3. OR manually update in database:

```javascript
db.users.updateOne(
  { email: 'seller@email.com' },
  {
    $set: {
      role: 'seller',
      sellerStatus: 'approved',
      isValidated: true,
    },
  }
)
```

---

## 8. Troubleshooting

### Problem: "Cannot connect to MongoDB"

**Solution:**

1. Check MongoDB is running (local) or connection string is correct (Atlas)
2. Verify `.env` file has correct `MONGODB_URI`
3. For Atlas: Check IP whitelist and user permissions
4. Test connection string in MongoDB Compass first

```bash
# Test MongoDB connection
mongosh "YOUR_CONNECTION_STRING"
```

### Problem: "Port 5000 already in use"

**Solution:**

```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9

# OR change port in .env
PORT=5001
```

### Problem: "CORS error in browser"

**Solution:**

1. Check backend `.env` has correct `FRONTEND_URL`
2. Restart backend server
3. Verify CORS settings in `backend/src/app.js`

### Problem: "JWT token invalid"

**Solution:**

1. Clear browser localStorage: `localStorage.clear()`
2. Check `JWT_SECRET` is same in `.env`
3. Try logging in again

### Problem: "Cannot register/login"

**Solution:**

1. Check backend server is running
2. Open browser DevTools → Network tab
3. Look for failed requests
4. Check backend console for errors
5. Verify MongoDB connection is active

### Problem: "Auctions not loading"

**Solution:**

1. Check backend `/api/auctions` endpoint: http://localhost:5000/api/auctions
2. Seed database if empty: `node seed.js`
3. Check Socket.IO connection in browser console
4. Verify `FRONTEND_URL` in backend `.env`

---

## API Endpoints Reference

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Auctions

- `GET /api/auctions` - Get all auctions (public)
- `GET /api/auctions/:id` - Get single auction (public)
- `POST /api/auctions` - Create auction (requires seller role)
- `PUT /api/auctions/:id` - Update auction (requires owner/admin)
- `DELETE /api/auctions/:id` - Delete auction (requires admin)
- `POST /api/auctions/:id/bid` - Place bid (requires authentication)

### Admin

- `GET /api/admin/users` - Get all users (requires admin)
- `PUT /api/admin/users/:id` - Update user (requires admin)
- `DELETE /api/admin/users/:id` - Delete user (requires admin)
- `PUT /api/admin/users/:id/approve-seller` - Approve seller (requires admin)

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/request-seller` - Request seller status

---

## Database Schema

### Users Collection

```javascript
{
  username: String (unique, 3-30 chars),
  email: String (unique, valid email),
  password: String (hashed with bcrypt),
  role: "bidder" | "seller" | "admin",
  sellerStatus: "none" | "pending" | "approved" | "rejected",
  isValidated: Boolean,
  isAdmin: Boolean,
  status: "active" | "suspended" | "banned",
  name: String,
  phone: String,
  address: String,
  profilePhoto: String (URL),
  bids: [ObjectId] (references to Auctions),
  wonItems: [ObjectId] (references to Auctions),
  createdAt: Date,
  updatedAt: Date
}
```

### Auctions Collection

```javascript
{
  title: String (max 200 chars),
  description: String (max 5000 chars),
  category: String,
  startingPrice: Number,
  currentPrice: Number,
  image: String (URL),
  endTime: Date,
  status: "active" | "ended" | "cancelled",
  seller: ObjectId (reference to User),
  sellerName: String,
  winnerId: ObjectId (reference to User),
  winnerName: String,
  bids: [{
    bidderId: ObjectId,
    bidderName: String,
    amount: Number,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Quick Start Commands

```bash
# 1. Setup MongoDB Atlas (follow steps above)

# 2. Backend Setup
cd backend
npm install
# Create .env file with MongoDB connection string
npm run dev

# 3. Open new terminal for Frontend
cd ../project1
npm install
npm run dev

# 4. Seed database (optional)
cd ../backend
node seed.js

# 5. Open browser
# Frontend: http://localhost:5174
# Backend health: http://localhost:5000/api/health

# 6. Test login with seeded data
# Email: admin@auction.com
# Password: admin123
```

---

## Next Steps

1. ✅ Setup MongoDB (Atlas or Local)
2. ✅ Configure backend `.env` file
3. ✅ Start backend server
4. ✅ Start frontend server
5. ✅ Seed database with test data
6. ✅ Test registration and login
7. ✅ Create auctions as seller
8. ✅ Place bids as bidder
9. ✅ Test admin panel features

---

## Need Help?

- Check backend console for errors
- Check browser DevTools → Console for frontend errors
- Check Network tab for failed API requests
- Verify MongoDB connection in Compass
- Make sure both servers are running simultaneously

Good luck! 🚀
