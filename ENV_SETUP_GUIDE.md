# 🔧 Environment Variables Setup Guide

## ⚠️ Critical: This Must Be Done Before Deployment Works

The error you're seeing means environment variables are **not configured** on your hosting platform.

---

## 📋 Required Environment Variables

You need to add these **exact** variables to your hosting platform:

```env
VITE_SUPABASE_URL=https://vodhulbrqziyamcpdokz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGh1bGJycXppeWFtY3Bkb2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc5MzUsImV4cCI6MjA4NTQ1MzkzNX0.4HUs9qd7i6XbKwBcxprgk4_59Nx4l8DKZJO5VuzXruY
```

---

## 🔷 For Vercel

### Step 1: Go to Project Settings
1. Open https://vercel.com/dashboard
2. Click on your project (AIAstent-Web)
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add Variables
For **each** variable:

1. **Key:** `VITE_SUPABASE_URL`
   **Value:** `https://vodhulbrqziyamcpdokz.supabase.co`
   **Environments:** Check all (Production, Preview, Development)
   Click **Save**

2. **Key:** `VITE_SUPABASE_ANON_KEY`
   **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGh1bGJycXppeWFtY3Bkb2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc5MzUsImV4cCI6MjA4NTQ1MzkzNX0.4HUs9qd7i6XbKwBcxprgk4_59Nx4l8DKZJO5VuzXruY`
   **Environments:** Check all (Production, Preview, Development)
   Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the **three dots (...)** on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

---

## 🟠 For Cloudflare Pages

### Step 1: Go to Project Settings
1. Open https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Click on your project
4. Click **Settings** tab
5. Scroll to **Environment variables**

### Step 2: Add Variables
Click **Add variable** for each:

1. **Variable name:** `VITE_SUPABASE_URL`
   **Value:** `https://vodhulbrqziyamcpdokz.supabase.co`
   **Environment:** Production (and Preview if needed)
   Click **Save**

2. **Variable name:** `VITE_SUPABASE_ANON_KEY`
   **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGh1bGJycXppeWFtY3Bkb2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc5MzUsImV4cCI6MjA4NTQ1MzkzNX0.4HUs9qd7i6XbKwBcxprgk4_59Nx4l8DKZJO5VuzXruY`
   **Environment:** Production (and Preview if needed)
   Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest deployment
3. Or push a new commit to trigger automatic deployment
4. Wait 2-3 minutes

---

## ✅ Verification

After adding environment variables and redeploying:

1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. Visit your site: https://helplyai.co
3. The error should be **gone**
4. You should see the login form **without** the red error message
5. Login/signup should work correctly

---

## 🐛 Troubleshooting

### Error Still Shows After Adding Variables

**Problem:** Environment variables not applied

**Solutions:**
1. ✅ Verify variables are saved in platform dashboard
2. ✅ Ensure variable names are **exact** (case-sensitive)
3. ✅ Trigger a **fresh deployment** (not just restart)
4. ✅ Wait 2-3 minutes for deployment to complete
5. ✅ Clear browser cache completely
6. ✅ Try incognito/private browsing mode

### Variables Show in Dashboard But Still Not Working

**Problem:** Build cache issue

**Solution:**
```bash
# For Vercel: Force rebuild
1. Go to Settings → General
2. Scroll to "Build & Development Settings"
3. Clear build cache
4. Redeploy

# For Cloudflare: Retry deployment
1. Go to Deployments
2. Click "Retry deployment"
3. This forces a fresh build
```

### How to Test Locally

```bash
# In your project directory
cd /Users/hayjoe/Desktop/AIA!/AIAstent-Web

# Verify .env file exists and has correct values
cat .env

# Should show:
# VITE_SUPABASE_URL=https://vodhulbrqziyamcpdokz.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Test build
npm run build

# Preview production build
npm run preview

# Open http://localhost:4173
# Should work without errors
```

---

## 📊 Environment Variable Checklist

Before considering deployment complete:

- [ ] `VITE_SUPABASE_URL` added to hosting platform
- [ ] `VITE_SUPABASE_ANON_KEY` added to hosting platform
- [ ] Variables applied to **Production** environment
- [ ] Fresh deployment triggered after adding variables
- [ ] Deployment completed successfully (check logs)
- [ ] Browser cache cleared
- [ ] Site loads without Supabase error
- [ ] Login form appears correctly
- [ ] Can sign in with email/password
- [ ] Can sign in with Google
- [ ] Dashboard loads after login

---

## 🎯 Quick Copy-Paste Values

**For Vercel/Cloudflare Dashboard:**

```
Variable 1:
Name: VITE_SUPABASE_URL
Value: https://vodhulbrqziyamcpdokz.supabase.co

Variable 2:
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGh1bGJycXppeWFtY3Bkb2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc5MzUsImV4cCI6MjA4NTQ1MzkzNX0.4HUs9qd7i6XbKwBcxprgk4_59Nx4l8DKZJO5VuzXruY
```

---

## 🔒 Security Note

These are **public** anon keys meant for client-side use. They're safe to expose in your frontend code. Supabase uses Row Level Security (RLS) to protect your data.

**Never expose:**
- ❌ Service role keys
- ❌ Database passwords
- ❌ API secret keys

**Safe to expose:**
- ✅ Supabase URL
- ✅ Supabase anon key
- ✅ Any `VITE_*` environment variables (they're public by design)

---

## 📞 Still Having Issues?

If the error persists after following all steps:

1. Check deployment logs for build errors
2. Verify the exact error message
3. Ensure you're testing the **production** URL (not preview)
4. Try deploying to a fresh project
5. Contact hosting platform support

---

**Once environment variables are configured, your application will work perfectly! 🎉**
