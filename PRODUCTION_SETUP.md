# Production Setup for helplyai.co

## ✅ Current Status
Your app is deployed to **https://helplyai.co** via Netlify.

## 🔧 Required: Configure Supabase for Production

### Step 1: Add Production Redirect URL
1. Go to https://supabase.com/dashboard/project/vodhulbrqziyamcpdokz
2. Click **Authentication** in the left sidebar
3. Click **URL Configuration**
4. Under **Redirect URLs**, add:
   ```
   https://helplyai.co/auth/callback
   ```
5. Click **Save**

### Step 2: Verify Site URL
1. In the same **URL Configuration** section
2. Set **Site URL** to:
   ```
   https://helplyai.co
   ```
3. Click **Save**

## ✅ Already Configured

- ✅ **Netlify deployment** - Build command: `npm run build`, Publish: `dist`
- ✅ **SPA routing** - `netlify.toml` configured for client-side routing
- ✅ **Dynamic redirect URLs** - Code automatically uses correct domain (localhost or production)
- ✅ **Environment variables** - Supabase credentials configured in Netlify

## 🧪 Testing Production

After configuring Supabase:

1. Go to https://helplyai.co
2. Click **Sign In** in the navigation
3. Click **Continue with Google**
4. Complete sign-in → Should redirect to **https://helplyai.co/settings/dashboard**
5. All pages should work:
   - Dashboard
   - Profile
   - Latest Updates
   - Tutorials
   - History
   - Reminders
   - Language
   - Billing
   - Help Center

## 📱 Pages Available

| Route | Page | Status |
|-------|------|--------|
| `/` | Home | ✅ |
| `/about` | About | ✅ |
| `/privacy` | Privacy Policy | ✅ |
| `/refund` | Refund Policy | ✅ |
| `/settings/dashboard` | Dashboard | ✅ |
| `/settings/profile` | Profile | ✅ |
| `/settings/updates` | Latest Updates | ✅ |
| `/settings/tutorials` | Tutorials | ✅ |
| `/settings/history` | History | ✅ |
| `/settings/reminders` | Reminders | ✅ |
| `/settings/language` | Language | ✅ |
| `/settings/billing` | Billing | ✅ |
| `/settings/help` | Help Center | ✅ |
| `/auth/callback` | OAuth Callback | ✅ |

## 🚨 Common Issues

### Issue: "PKCE code verifier not found"
**Solution**: Add `https://helplyai.co/auth/callback` to Supabase redirect URLs (see Step 1 above)

### Issue: Pages showing 404 on refresh
**Solution**: Already fixed with `netlify.toml` redirect rules

### Issue: Environment variables not set
**Solution**: Verify in Netlify dashboard → Site settings → Environment variables:
- `VITE_SUPABASE_URL` = `https://vodhulbrqziyamcpdokz.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (your anon key)

## 🔄 Deployment

Code is automatically deployed to Netlify when you push to GitHub:
```bash
git push origin main
```

Netlify will:
1. Pull latest code
2. Run `npm install`
3. Run `npm run build`
4. Deploy `dist` folder to https://helplyai.co
