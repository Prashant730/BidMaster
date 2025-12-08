# ✅ BidMaster Setup Checklist

Follow this step-by-step checklist to get your project running.

---

## Phase 1: MongoDB Setup (Choose One)

### ☐ Option A: MongoDB Atlas (Cloud - Easiest)

- [ ] Go to https://www.mongodb.com/cloud/atlas/register
- [ ] Create account
- [ ] Create free M0 cluster (takes 3-5 minutes)
- [ ] Create database user with password
- [ ] Add your IP to whitelist (or allow all: 0.0.0.0/0)
- [ ] Get connection string
- [ ] Replace `<password>` and add `/auction-platform` before `?`
- [ ] Save connection string for next step

**Your connection string should look like:**

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/auction-platform?retryWrites=true&w=majority
```

### ☐ Option B: MongoDB Local

- [ ] Download from https://www.mongodb.com/try/download/community
- [ ] Install MongoDB (choose "Complete" installation)
- [ ] Install as Windows Service (or start manually)
- [ ] Verify it's running: `mongosh` in terminal
- [ ] Your connection string is: `mongodb://localhost:27017/auction-platform`

---

## Phase 2: Backend Setup

### ☐ Install Dependencies

```bash
cd backend
npm install
```

**Expected output:**

```
added 150 packages...
```

### ☐ Create Environment File

1. Copy example file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

2. Edit `backend/.env` file:

```env
MONGODB_URI=<YOUR_CONNECTION_STRING_HERE>
JWT_SECRET=bidmaster-secret-key-2025-change-this-to-random-32-chars
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```

3. Replace `<YOUR_CONNECTION_STRING_HERE>` with:
   - Atlas string from Phase 1
   - OR `mongodb://localhost:27017/auction-platform` for local

### ☐ Start Backend Server

```bash
npm run dev
```

**Expected output:**

```
Server running on port 5000
Environment: development
MongoDB Connected: cluster0.xxxxx.mongodb.net (or localhost)
Auction scheduler started - checking every minute
```

**✅ If you see this, backend is working!**

**❌ If you see errors:**

- "Cannot connect to MongoDB" → Check connection string
- "Port 5000 in use" → Change PORT in .env
- Other errors → Check BACKEND_SETUP_GUIDE.md

---

## Phase 3: Frontend Setup

### ☐ Install Dependencies

**Open NEW terminal** (keep backend running):

```bash
cd project1
npm install
```

**Expected output:**

```
added 300 packages...
```

### ☐ Start Frontend Server

```bash
npm run dev
```

**Expected output:**

```
VITE v7.2.2 ready in 500ms
➜ Local: http://localhost:5174/
```

**✅ Frontend is running!**

---

## Phase 4: Seed Database (Optional but Recommended)

### ☐ Add Test Data

**Open NEW terminal:**

```bash
cd backend
node seed.js
```

**Expected output:**

```
MongoDB Connected
✅ Admin user created
✅ Seller users created
✅ Bidder users created
✅ Auctions created
✅ Database seeded successfully!
```

**Test accounts created:**

- Admin: `admin@auction.com` / `admin123`
- Seller 1: `seller1@auction.com` / `seller123`
- Seller 2: `seller2@auction.com` / `seller123`
- Bidder 1: `bidder1@auction.com` / `bidder123`
- Bidder 2: `bidder2@auction.com` / `bidder123`

---

## Phase 5: Test Everything

### ☐ Test Backend Health

1. Open browser
2. Go to: http://localhost:5000/api/health
3. Should see: `{"status":"ok","timestamp":"..."}`

**✅ Backend API is responding!**

### ☐ Test Frontend

1. Go to: http://localhost:5174
2. Should see homepage with auctions
3. No white screen or errors

**✅ Frontend is working!**

### ☐ Test Registration

1. Click "Sign Up" button
2. Go to: http://localhost:5174/register
3. Fill in form:
   - Username: `testuser`
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `test123`
   - Confirm: `test123`
   - Check "Agree to terms"
4. Click "Create Account"
5. Should redirect to homepage, logged in

**✅ Registration works!**

### ☐ Test Login

1. Logout (user menu → Logout)
2. Click "Login" button
3. Go to: http://localhost:5174/login
4. Enter:
   - Email: `test@example.com`
   - Password: `test123`
5. Click "Sign In"
6. Should redirect to homepage, logged in

**✅ Login works!**

### ☐ Test Admin Login (if seeded)

1. Logout
2. Login with:
   - Email: `admin@auction.com`
   - Password: `admin123`
3. Click user menu → Should see "Admin Panel"
4. Go to admin panel
5. Should see dashboard with stats

**✅ Admin access works!**

### ☐ Test Auction Creation (as Seller)

1. Login as seller:
   - Email: `seller1@auction.com`
   - Password: `seller123`
2. Go to "Sell Item" page
3. Fill in auction details
4. Submit
5. Should see new auction on homepage

**✅ Auction creation works!**

### ☐ Test Bidding

1. Login as bidder:
   - Email: `bidder1@auction.com`
   - Password: `bidder123`
2. Click on any auction
3. Place a bid (higher than current price)
4. Should see bid confirmed
5. Open same auction in another browser/tab
6. Should see bid update in real-time

**✅ Bidding works!**

---

## Phase 6: Verify Database

### ☐ Check MongoDB Compass (if installed)

1. Open MongoDB Compass
2. Connect using your connection string
3. Navigate to `auction-platform` database
4. Check collections:
   - [ ] `users` - Should have users
   - [ ] `auctions` - Should have auctions
   - [ ] Each auction should have bids array

**✅ Data is being saved to MongoDB!**

### ☐ OR Check via MongoDB Shell

```bash
mongosh "YOUR_CONNECTION_STRING"

# Commands:
use auction-platform
db.users.find().pretty()
db.auctions.find().pretty()
db.users.countDocuments()
db.auctions.countDocuments()
```

---

## Phase 7: Browser DevTools Check

### ☐ Console Check

1. Open browser DevTools (F12)
2. Go to Console tab
3. Should see:
   - "Connected to Socket.IO" or similar
   - No red errors

**✅ No JavaScript errors!**

### ☐ Network Check

1. Open Network tab in DevTools
2. Perform actions (login, bid, etc.)
3. Should see successful requests:
   - POST `/api/auth/login` → Status 200
   - GET `/api/auctions` → Status 200
   - POST `/api/auctions/:id/bid` → Status 200

**✅ API communication working!**

### ☐ Application Storage Check

1. Go to Application tab (or Storage)
2. Check Local Storage
3. Should see:
   - `token`: JWT token string
   - `user`: User object JSON

**✅ Authentication persisting!**

---

## Common Issues & Solutions

### ❌ Backend won't start

**Issue**: "Cannot connect to MongoDB"

- **Solution**: Check `.env` MONGODB_URI is correct
- For Atlas: Check password, IP whitelist
- For Local: Make sure MongoDB is running

**Issue**: "Port 5000 already in use"

- **Solution**: Change PORT in `.env` to 5001 or kill process:

  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <NUMBER> /F

  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### ❌ Frontend shows white screen

**Issue**: White screen, no content

- **Solution**: Check browser console for errors
- Make sure AuthProvider is in App.jsx (already fixed)
- Clear browser cache and localStorage

### ❌ Cannot register/login

**Issue**: Registration fails

- **Solution**: Check backend is running
- Check Network tab for request errors
- Verify MongoDB connection

**Issue**: "CORS error"

- **Solution**: Check FRONTEND_URL in backend `.env`
- Should match frontend port (usually 5174)

### ❌ Auctions not loading

**Issue**: No auctions shown

- **Solution**: Seed database: `node seed.js`
- Check `/api/auctions` endpoint directly
- Check MongoDB has data

### ❌ Real-time updates not working

**Issue**: Bids don't update instantly

- **Solution**: Check Socket.IO connection in console
- Verify FRONTEND_URL in backend
- Try refreshing page

---

## Final Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5174
- [ ] MongoDB connected (Atlas or Local)
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can see auctions on homepage
- [ ] Can view auction details
- [ ] Can place bids (as bidder)
- [ ] Can create auctions (as seller)
- [ ] Can access admin panel (as admin)
- [ ] Real-time updates working
- [ ] No console errors
- [ ] Data saving to MongoDB

---

## What's Next?

### Suggested Order:

1. **Explore as different users**:

   - Login as admin, seller, bidder
   - Test different features

2. **Create your own auctions**:

   - Login as seller
   - Create unique auctions

3. **Test edge cases**:

   - Try bidding lower amount (should fail)
   - Try accessing admin as regular user (should block)
   - Wait for auction to end (auto-end via scheduler)

4. **Customize**:

   - Change theme colors
   - Add new features
   - Modify auction categories

5. **Deploy** (future):
   - Deploy backend to Render/Railway
   - Deploy frontend to Vercel/Netlify
   - Use production MongoDB Atlas cluster

---

## Need Help?

**Check these files:**

- `BACKEND_SETUP_GUIDE.md` - Detailed backend setup
- `ARCHITECTURE.md` - How everything works
- `QUICKSTART.md` - Quick commands reference

**Common Commands:**

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd project1 && npm run dev

# Seed database
cd backend && node seed.js

# Check MongoDB connection
mongosh "YOUR_CONNECTION_STRING"

# View backend logs
# Just check terminal where backend is running
```

**Everything working?** 🎉 Congratulations! Your auction platform is live!

**Still having issues?** Check the console errors and refer to the troubleshooting section above.
