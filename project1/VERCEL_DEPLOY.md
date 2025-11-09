# How to Update Vercel Deployment

## 🔄 Enable Auto-Deployment from GitHub

### Step-by-Step Setup:

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Make sure you're logged in

2. **Import/Connect Your GitHub Repository**
   - Click "Add New..." → "Project"
   - If your repo is already imported, click on your project name
   - Go to **Settings** → **Git**

3. **Connect GitHub Repository**
   - If not connected, click "Connect Git Repository"
   - Select your repository: `Prashant730/BidMaster`
   - Choose the branch: `main` (or `master`)
   - Click "Connect"

4. **Verify Build Settings**
   - Go to **Settings** → **General**
   - Verify these settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
     - **Root Directory**: `./` (or leave empty if project is at root)

5. **Enable Auto-Deployment**
   - In **Settings** → **Git**, make sure:
     - ✅ "Production Branch" is set to `main`
     - ✅ "Auto-deploy" is enabled
     - ✅ "Deploy Pull Requests" is enabled (optional)

6. **Save and Test**
   - After connecting, every push to `main` branch will trigger automatic deployment
   - You'll see deployments appear in the "Deployments" tab

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

**Note:** A `vercel.json` file has been created in your project root with the correct configuration. This ensures Vercel builds your project correctly.

## Troubleshooting Auto-Deployment

### If auto-deployment is not working:

1. **Check Git Connection**
   - Go to Vercel Dashboard → Your Project → Settings → Git
   - Verify the repository is connected
   - Check if the correct branch is selected

2. **Check Deployment Logs**
   - Go to Deployments tab
   - Click on a deployment to see logs
   - Look for any build errors

3. **Verify Build Settings**
   - Settings → General
   - Ensure Build Command is `npm run build`
   - Ensure Output Directory is `dist`

4. **Reconnect Repository**
   - If issues persist, disconnect and reconnect the GitHub repository
   - Settings → Git → Disconnect → Then reconnect

5. **Manual Trigger**
   - Push a new commit to trigger deployment:
     ```bash
     git commit --allow-empty -m "Trigger Vercel deployment"
     git push origin main
     ```

