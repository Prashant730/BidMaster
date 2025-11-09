# Fix Vercel Build Error: "package.json not found"

## The Problem
Vercel is looking for `package.json` at the repository root, but your project files are in the `project1/` subdirectory. This causes the error: `Could not read package.json: Error: ENOENT: no such file or directory`.

## Solution: Update Vercel Project Settings

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Click on your project: **project1**

### Step 2: Set Root Directory (IMPORTANT!)
1. Go to **Settings** → **General**
2. Scroll down to **Root Directory**
3. Click **Edit**
4. Set Root Directory to: `project1`
5. Click **Save**

### Step 3: Update Build Settings
1. Still in **Settings** → **General**
2. Scroll down to **Build & Development Settings**
3. Make sure these settings are EXACTLY as follows:

   **Framework Preset:** `Other` (or `Vite` if available, but then check the commands below)
   
   **Build Command:** `npm run build`
   
   **Output Directory:** `dist`
   
   **Install Command:** `npm install` (or leave empty - Vercel will auto-detect)

### Step 4: Override Framework Detection (if needed)
If Vercel is still trying to use `vite build` directly:

1. In **Settings** → **General** → **Build & Development Settings**
2. **Override** the build command by checking "Override" next to Build Command
3. Set it to: `npm run build`
4. Make sure "Override" is checked for Install Command too
5. Set Install Command to: `npm install`

### Step 5: Save and Redeploy
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
Your Git repository root is at `D:/project`, but your actual project files (including `package.json`) are in the `project1/` subdirectory. Vercel needs to know where to find your project files, so you must set the **Root Directory** to `project1` in the Vercel dashboard.

## Verify It's Working
After updating settings and redeploying, check the build logs. You should see:
- ✅ `npm install` running first
- ✅ `npm run build` executing
- ✅ Build completing successfully

