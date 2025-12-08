# 🚀 Quick Start Guide

## Step 1: Install MongoDB

Choose ONE option:

### Option A: MongoDB Atlas (Cloud - EASIEST)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account and cluster (takes 5 minutes)
3. Get connection string (see BACKEND_SETUP_GUIDE.md for details)

### Option B: MongoDB Local

1. Download from https://www.mongodb.com/try/download/community
2. Install and run MongoDB service

## Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env   # Windows
# OR
cp .env.example .env     # Mac/Linux

# Edit .env file and add your MongoDB connection string
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/auction-platform
# For Local: mongodb://localhost:27017/auction-platform
```

## Step 3: Setup Frontend

```bash
# Open new terminal, navigate to frontend
cd project1

# Install dependencies
npm install

# No .env needed (uses defaults)
```

## Step 4: Start Both Servers

### Terminal 1 - Backend:

```bash
cd backend
npm run dev
```

Should see:

```
Server running on port 5000
MongoDB Connected: ...
```

### Terminal 2 - Frontend:

```bash
cd project1
npm run dev
```

Should see:

```
Local: http://localhost:5174/
```

## Step 5: Seed Database (Optional)

```bash
# In backend folder
node seed.js
```

Creates test users:

- **Admin**: admin@auction.com / admin123
- **Seller**: seller1@auction.com / seller123
- **Bidder**: bidder1@auction.com / bidder123

## Step 6: Open & Test

1. Open browser: http://localhost:5174
2. Go to Register page: http://localhost:5174/register
3. Create account
4. Start bidding!

## Verify Everything Works:

✅ Backend health: http://localhost:5000/api/health
✅ Frontend: http://localhost:5174
✅ Can register new user
✅ Can login
✅ Can see auctions

## Troubleshooting

**Cannot connect to MongoDB?**

- Check connection string in `backend/.env`
- For Atlas: Check IP whitelist
- For Local: Make sure MongoDB service is running

**Port already in use?**

- Backend: Change PORT in `backend/.env`
- Frontend: Vite will auto-select next port

**See full guide:** BACKEND_SETUP_GUIDE.md

## Common MongoDB Connection Strings

**Atlas (Cloud):**

```
mongodb+srv://bidmaster_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/auction-platform?retryWrites=true&w=majority
```

**Local (Windows/Mac/Linux):**

```
mongodb://localhost:27017/auction-platform
```

That's it! 🎉
