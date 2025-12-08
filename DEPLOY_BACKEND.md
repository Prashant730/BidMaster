# Backend Deployment Guide for BidMaster

## Deploy Backend to Render (Recommended - Free Tier)

### Step 1: Create a MongoDB Atlas Database

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/auction-platform`)

### Step 2: Deploy to Render

1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo: `Prashant730/BidMaster`
5. Configure:

   - **Name**: bidmaster-api
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

6. Add Environment Variables:

   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = your-secret-key-here
   - `NODE_ENV` = production
   - `PORT` = 10000

7. Click "Create Web Service"

### Step 3: Update Vercel Frontend

1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add: `VITE_API_URL` = `https://bidmaster-api.onrender.com/api`
4. Redeploy your frontend

## Alternative: Use Vercel Serverless Functions

See the `/api` folder for serverless function setup.
