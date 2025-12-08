# 🎉 BidMaster Auction Platform - Setup Complete!

## ✅ System Status

| Component       | URL                   | Status       |
| --------------- | --------------------- | ------------ |
| **Frontend**    | http://localhost:5175 | ✅ Running   |
| **Backend API** | http://localhost:5000 | ✅ Running   |
| **MongoDB**     | localhost:27017       | ✅ Connected |
| **Socket.IO**   | ws://localhost:5000   | ✅ Active    |
| **Scheduler**   | -                     | ✅ Running   |

## 📊 Database Information

**Database Name:** `auction-platform`
**Collections:**

- `users` - 6 users (1 admin, 2 sellers, 2 bidders, 1 pending seller)
- `auctions` - 7 auctions (6 active, 1 ended)
- `settings` - Platform configuration

## 🔐 Test Accounts

### Admin Account

- **Email:** admin@auction.com
- **Password:** admin123
- **Permissions:** Full access to admin panel, user management, seller approvals

### Seller Accounts

1. **Seller 1 - Luxury Watches**

   - Email: seller1@auction.com
   - Password: seller123
   - Business: Luxury Watches Co

2. **Seller 2 - Fine Arts**
   - Email: seller2@auction.com
   - Password: seller123
   - Business: Fine Arts Gallery

### Bidder Accounts

1. **Bidder 1**

   - Email: bidder1@auction.com
   - Password: bidder123
   - Name: Alice Bidder

2. **Bidder 2**
   - Email: bidder2@auction.com
   - Password: bidder123
   - Name: Bob Collector

### Pending Seller (Needs Approval)

- **Email:** pending@auction.com
- **Password:** pending123
- **Status:** Awaiting admin approval

## 🎯 Sample Auctions

1. **Vintage Rolex Submariner Watch** - $7,500 (2 bids)
2. **Modern Abstract Painting** - $1,500 (no bids)
3. **Antique Victorian Furniture Set** - $3,500 (1 bid)
4. **Rare Baseball Card Collection** - $10,000 (no bids)
5. **MacBook Pro 16" M3 Max** - $3,200 (1 bid)
6. **Diamond Engagement Ring** - $9,500 (2 bids)
7. **Vintage Camera Collection** - $850 (ENDED - Winner: Alice Bidder)

## 🚀 How to Use

### 1. Access the Application

Open your browser and go to: **http://localhost:5175**

### 2. Login or Register

- Click "Login" in the header
- Use one of the test accounts above
- Or register a new account

### 3. Browse Auctions

- View all active auctions on the home page
- Filter by category (Watches, Art, Collectibles, etc.)
- Search for specific items

### 4. Place Bids (Bidder/Seller)

- Click on any auction to view details
- Enter your bid amount (must be higher than current price)
- Submit your bid
- Watch real-time updates as others bid

### 5. Create Auctions (Seller Only)

- Login as a seller account
- Click "Create Auction" in the header
- Fill in auction details
- Set starting price and duration
- Submit to create

### 6. Admin Features (Admin Only)

- Login as admin
- Access admin panel
- Approve/reject pending sellers
- Manage users
- Configure platform settings
- Manage categories

## 🔄 Real-Time Features

The platform uses Socket.IO for real-time updates:

- **Live bid updates** - See new bids instantly
- **Auction status changes** - Get notified when auctions end
- **Outbid notifications** - Know when someone outbids you

## 🛠️ Development Commands

### Backend

```bash
cd backend
npm run dev      # Start development server
npm test         # Run tests
node seed.js     # Reseed database
```

### Frontend

```bash
cd project1
npm run dev      # Start development server
npm run build    # Build for production
```

## 📝 API Endpoints

### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Auctions

- GET `/api/auctions` - Get all auctions
- GET `/api/auctions/:id` - Get auction by ID
- POST `/api/auctions` - Create auction (seller)
- POST `/api/auctions/:id/bid` - Place bid
- GET `/api/auctions/user/:userId` - Get user's auctions

### Users

- GET `/api/users` - Get all users (admin)
- POST `/api/users/seller-request` - Submit seller request
- GET `/api/users/pending-sellers` - Get pending sellers (admin)
- PUT `/api/users/:id/approve-seller` - Approve seller (admin)

### Admin

- GET `/api/admin/settings` - Get platform settings
- GET `/api/admin/categories` - Get categories
- POST `/api/admin/announcements` - Create announcement

## 🎨 Features Implemented

✅ User authentication with JWT
✅ Role-based access control (Admin, Seller, Bidder)
✅ Seller approval workflow
✅ Auction creation and management
✅ Real-time bidding system
✅ Automatic auction ending (scheduler)
✅ Socket.IO real-time updates
✅ Admin configuration panel
✅ Category management
✅ User profile management
✅ Responsive dark theme UI

## 🧪 Testing

The backend has comprehensive test coverage:

- 45 tests passing
- Property-based tests using fast-check
- Integration tests with supertest
- ~56% code coverage

Run tests:

```bash
cd backend
npm test
```

## 🔧 Configuration

### Environment Variables (backend/.env)

```
MONGODB_URI=mongodb://localhost:27017/auction-platform
JWT_SECRET=test-secret-key-for-development-only
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 📚 Next Steps

1. **Explore the platform** - Login with different accounts to see different views
2. **Test bidding** - Place bids on active auctions
3. **Create auctions** - Login as a seller and create new auctions
4. **Admin panel** - Login as admin to approve the pending seller
5. **Real-time updates** - Open multiple browser windows to see live updates

## 🐛 Troubleshooting

### Backend not connecting to MongoDB?

- Make sure MongoDB is installed and running
- Check the MONGODB_URI in backend/.env

### Frontend can't connect to backend?

- Verify backend is running on port 5000
- Check CORS settings in backend/src/app.js

### Port already in use?

- Frontend will automatically try ports 5173, 5174, 5175
- Backend uses port 5000 (change in .env if needed)

## 📞 Support

For issues or questions, check:

- Backend logs in the terminal
- Browser console for frontend errors
- MongoDB connection status

---

**Enjoy your auction platform! 🎉**
