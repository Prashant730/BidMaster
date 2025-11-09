# Fix Vercel Build Error: "vite: command not found"

## The Problem
Vercel is trying to run `vite build` directly instead of `npm run build`, which causes the error because `vite` isn't in the system PATH (it's in node_modules).

## Solution: Update Vercel Project Settings

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Click on your project: **project1**

### Step 2: Update Build Settings
1. Go to **Settings** → **General**
2. Scroll down to **Build & Development Settings**
3. Make sure these settings are EXACTLY as follows:

   **Framework Preset:** `Other` (or `Vite` if available, but then check the commands below)

   **Build Command:** `npm run build`

   **Output Directory:** `dist`

   **Install Command:** `npm install` (or leave empty - Vercel will auto-detect)

   **Root Directory:** `./` (leave empty if your project is at the root)

### Step 3: Override Framework Detection
If Vercel is still trying to use `vite build` directly:

1. In **Settings** → **General** → **Build & Development Settings**
2. **Override** the build command by checking "Override" next to Build Command
3. Set it to: `npm run build`
4. Make sure "Override" is checked for Install Command too
5. Set Install Command to: `npm install`

### Step 4: Save and Redeploy
1. Click **Save** at the bottom
2. Go to **Deployments** tab
3. Click the three dots (⋯) on the latest deployment
4. Click **Redeploy**

## Alternative: Use Vercel CLI to Deploy

If dashboard settings don't work, you can deploy manually:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd project1
vercel --prod
```

## Why This Happens
Vercel auto-detects Vite projects and sometimes tries to run `vite` directly from PATH instead of using `npm run build`. The fix is to explicitly tell Vercel to use npm commands.

## Verify It's Working
After updating settings and redeploying, check the build logs. You should see:
- ✅ `npm install` running first
- ✅ `npm run build` executing
- ✅ Build completing successfully

