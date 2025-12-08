# 📋 Quick Reference Card

## 🚀 Start Commands

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd project1
npm run dev
```

## 🌐 URLs

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 👥 Test Accounts (after seeding)

```
Admin:
  Email: admin@auction.com
  Password: admin123

Seller:
  Email: seller1@auction.com
  Password: seller123

Bidder:
  Email: bidder1@auction.com
  Password: bidder123
```

## 🔌 MongoDB Connection Strings

```bash
# Atlas (Cloud)
mongodb+srv://username:password@cluster.mongodb.net/auction-platform?retryWrites=true&w=majority

# Local
mongodb://localhost:27017/auction-platform
```

## 📁 Important Files

```
backend/.env              # Backend configuration
project1/.env             # Frontend configuration (optional)
backend/seed.js           # Seed test data
backend/server.js         # Backend entry point
project1/src/App.jsx      # Frontend entry point
```

## 🛠️ Useful Commands

```bash
# Seed database
cd backend
node seed.js

# Install dependencies
npm install

# Run tests
npm test

# Check MongoDB connection
mongosh "YOUR_CONNECTION_STRING"

# Kill process on port
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

## 🔍 Debugging

```bash
# Check backend console
# See errors in terminal where backend runs

# Check frontend console
# Press F12 → Console tab

# Check Network requests
# Press F12 → Network tab

# Check Local Storage
# Press F12 → Application/Storage → Local Storage

# View MongoDB data
# Use MongoDB Compass or mongosh
```

## 📊 MongoDB Shell Commands

```javascript
// Connect
mongosh "YOUR_CONNECTION_STRING"

// Use database
use auction-platform

// View users
db.users.find().pretty()

// View auctions
db.auctions.find().pretty()

// Count documents
db.users.countDocuments()
db.auctions.countDocuments()

// Find specific user
db.users.findOne({ email: "admin@auction.com" })

// Update user to admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true, role: "admin" } }
)

// Delete all auctions
db.auctions.deleteMany({})

// Delete all users
db.users.deleteMany({})
```

## 🔐 Environment Variables

### backend/.env

```env
MONGODB_URI=<connection-string>
JWT_SECRET=<random-32-chars>
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```

### project1/.env (optional)

```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 API Endpoints

### Authentication

```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user
```

### Auctions

```
GET    /api/auctions          - Get all auctions
GET    /api/auctions/:id      - Get single auction
POST   /api/auctions          - Create auction (seller)
PUT    /api/auctions/:id      - Update auction (owner)
DELETE /api/auctions/:id      - Delete auction (admin)
POST   /api/auctions/:id/bid  - Place bid
```

### Admin

```
GET    /api/admin/users       - Get all users
PUT    /api/admin/users/:id   - Update user
DELETE /api/admin/users/:id   - Delete user
```

## 🔄 Common Workflows

### Register New User

```
1. Go to /register
2. Fill form
3. Submit
4. Auto-login and redirect
```

### Place Bid

```
1. Login as bidder
2. Click on auction
3. Enter bid amount (> current price)
4. Click "Place Bid"
5. See confirmation
```

### Create Auction

```
1. Login as seller
2. Go to "Sell Item"
3. Fill auction details
4. Submit
5. See on homepage
```

### Admin Panel

```
1. Login as admin
2. Click user menu → Admin Panel
3. View stats, manage users/auctions
```

## ⚠️ Common Errors

### "Cannot connect to MongoDB"

→ Check MONGODB_URI in .env

### "Port already in use"

→ Kill process or change PORT

### "CORS error"

→ Check FRONTEND_URL matches frontend port

### "Token invalid"

→ Clear localStorage and login again

### "White screen"

→ Check browser console for errors

## 📚 Documentation

- `BACKEND_SETUP_GUIDE.md` - Complete backend setup
- `ARCHITECTURE.md` - System architecture
- `QUICKSTART.md` - Quick setup guide
- `SETUP_CHECKLIST.md` - Step-by-step checklist

## 🎨 Frontend Routes

```
/                   - Homepage (auctions grid)
/register           - Registration page
/login              - Login page
/auction/:id        - Auction detail page
/create             - Create auction (seller)
/profile            - User profile
/admin              - Admin dashboard
/auctioneer         - Auctioneer dashboard
/seller-approval    - Seller verification
/policy             - Bidding policy
/contact            - Contact support
```

## 🏗️ Project Structure

```
BidMaster/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation
│   │   └── config/         # DB, Socket.IO
│   ├── .env               # Configuration
│   ├── server.js          # Entry point
│   └── seed.js            # Test data
│
└── project1/
    ├── src/
    │   ├── components/    # React components
    │   ├── context/       # State management
    │   ├── services/      # API calls
    │   └── App.jsx        # Main app
    └── .env              # Configuration
```

## 🎉 Success Indicators

✅ Backend shows: "MongoDB Connected"
✅ Backend shows: "Server running on port 5000"
✅ Frontend shows: "Local: http://localhost:5174"
✅ Can register and login
✅ Can see auctions
✅ Can place bids
✅ Real-time updates work
✅ Data saves to MongoDB

---

**Keep this card handy for quick reference!** 📌
