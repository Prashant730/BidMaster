# How to Update Vercel Deployment

## Automatic Deployment (Recommended)
If your GitHub repository is connected to Vercel, it will automatically deploy when you push to the main branch.

## Manual Deployment Methods

### Method 1: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to the "Deployments" tab
4. Find your latest deployment
5. Click the three dots (⋯) → "Redeploy"

### Method 2: Using Vercel CLI
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   cd project1
   vercel --prod
   ```

### Method 3: Trigger via GitHub
If auto-deployment is enabled, you can trigger a new deployment by:
- Pushing any commit to your main branch
- Creating a new commit (even an empty one):
  ```bash
  git commit --allow-empty -m "Trigger Vercel deployment"
  git push
  ```

## Environment Variables
If your project uses environment variables (like `VITE_API_URL`), make sure they're set in:
- Vercel Dashboard → Your Project → Settings → Environment Variables

## Build Settings
Vercel should automatically detect Vite projects, but verify:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

