# 🚀 Vercel & Cloudflare Pages Deployment Guide

This guide covers deploying the AIAstent Settings Web App to **Vercel** or **Cloudflare Pages**.

---

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (https://vercel.com) OR Cloudflare account (https://dash.cloudflare.com)
- Supabase project credentials

---

## 🔷 Option 1: Deploy to Vercel

### Step 1: Connect Repository

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repository: `AIAstent-Web`
4. Click **"Import"**

### Step 2: Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Add Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

```
VITE_SUPABASE_URL=https://vodhulbrqziyamcpdokz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGh1bGJycXppeWFtY3Bkb2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc5MzUsImV4cCI6MjA4NTQ1MzkzNX0.4HUs9qd7i6XbKwBcxprgk4_59Nx4l8DKZJO5VuzXruY
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain: `helplyai.co`
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificate

---

## 🟠 Option 2: Deploy to Cloudflare Pages

### Step 1: Create New Project

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages → Pages**
3. Click **"Create a project"**
4. Click **"Connect to Git"**

### Step 2: Connect Repository

1. Authorize Cloudflare to access your GitHub
2. Select repository: `AIAstent-Web`
3. Click **"Begin setup"**

### Step 3: Configure Build Settings

```
Production branch: main
Framework preset: None (or Vite if available)
Build command: npm run build
Build output directory: dist
```

### Step 4: Add Environment Variables

Click **"Add variable"** and add:

```
VITE_SUPABASE_URL=https://vodhulbrqziyamcpdokz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGh1bGJycXppeWFtY3Bkb2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzc5MzUsImV4cCI6MjA4NTQ1MzkzNX0.4HUs9qd7i6XbKwBcxprgk4_59Nx4l8DKZJO5VuzXruY
```

### Step 5: Deploy

1. Click **"Save and Deploy"**
2. Wait for build to complete
3. Your app will be live at: `https://your-project.pages.dev`

### Step 6: Configure Custom Domain

1. Go to **Custom domains** tab
2. Click **"Set up a custom domain"**
3. Enter: `helplyai.co`
4. Follow DNS configuration steps
5. SSL certificate is automatic

---

## 🔧 Configuration Files Included

### For Vercel: `vercel.json`
- Handles SPA routing (rewrites all routes to `/index.html`)
- Configures CORS headers for API routes
- Auto-detected by Vercel

### For Cloudflare Pages: `public/_redirects` & `public/_headers`
- `_redirects`: Routes all paths to index.html (SPA support)
- `_headers`: Security headers and CORS configuration
- Auto-detected by Cloudflare Pages

---

## 🌐 DNS Configuration

### For Root Domain (helplyai.co)

**Cloudflare DNS:**
```
Type: CNAME
Name: @
Target: your-project.pages.dev
Proxy: Enabled (orange cloud)
```

**Or if using Vercel:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
```

### For Subdomain (app.helplyai.co)

```
Type: CNAME
Name: app
Target: cname.vercel-dns.com (for Vercel)
        OR your-project.pages.dev (for Cloudflare)
```

---

## ✅ Post-Deployment Checklist

- [ ] Application loads without 404 errors
- [ ] `/settings` route works correctly
- [ ] `/settings/dashboard` route works
- [ ] `/settings/billing` route works
- [ ] Supabase authentication works
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (HTTPS)
- [ ] Update desktop app environment variable:
  ```
  VITE_SETTINGS_URL=https://helplyai.co
  ```

---

## 🔄 Automatic Deployments

Both Vercel and Cloudflare Pages support automatic deployments:

- **Push to `main` branch** → Automatic production deployment
- **Push to other branches** → Preview deployments
- **Pull requests** → Preview deployments with unique URLs

---

## 🐛 Troubleshooting

### 404 Errors on Routes

**Problem:** `/settings` returns 404

**Solution:** Ensure these files exist:
- `vercel.json` (for Vercel)
- `public/_redirects` (for Cloudflare)
- `_redirects` in root (backup for Cloudflare)

### Environment Variables Not Working

**Problem:** Supabase connection fails

**Solution:**
1. Verify environment variables are set in platform dashboard
2. Ensure variables start with `VITE_` prefix
3. Redeploy after adding variables
4. Check build logs for errors

### Build Failures

**Problem:** Build fails with TypeScript errors

**Solution:**
```bash
# Locally test build
npm run build

# If it works locally, check:
# 1. Node version matches (use Node 20)
# 2. All dependencies in package.json
# 3. No missing environment variables
```

---

## 📊 Performance Optimization

### Vercel
- Automatic edge caching
- Global CDN
- Serverless functions support

### Cloudflare Pages
- Global CDN (200+ locations)
- Automatic DDoS protection
- Free unlimited bandwidth

---

## 💰 Cost Comparison

### Vercel Free Tier
- 100 GB bandwidth/month
- Unlimited deployments
- Custom domains
- SSL certificates
- **Upgrade:** $20/month for Pro

### Cloudflare Pages Free Tier
- Unlimited bandwidth
- Unlimited deployments
- Custom domains
- SSL certificates
- **Always free** for most use cases

---

## 🎯 Recommended Setup

For production, we recommend:

1. **Cloudflare Pages** for hosting (free unlimited bandwidth)
2. **Cloudflare DNS** for domain management
3. **Automatic deployments** from GitHub
4. **Custom domain:** `helplyai.co`

This gives you:
- ✅ Zero hosting costs
- ✅ Global CDN
- ✅ Automatic SSL
- ✅ DDoS protection
- ✅ Unlimited bandwidth

---

## 📞 Support

If you encounter issues:

1. Check build logs in platform dashboard
2. Verify environment variables are set
3. Test build locally: `npm run build`
4. Check browser console for errors
5. Verify DNS propagation: https://dnschecker.org

---

## 🚀 Quick Deploy Commands

### Vercel CLI (Optional)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Cloudflare Wrangler (Optional)
```bash
npm install -g wrangler
wrangler login
wrangler pages publish dist
```

---

**Your application is now ready for production deployment! 🎉**
