# Fix: Redirect worklyweb.netlify.app to helplyai.co

## Problem
Users accessing `worklyweb.netlify.app` are not being redirected to `helplyai.co`.

## Solution: Configure Primary Domain in Netlify

### Step 1: Set Primary Domain
1. Go to https://app.netlify.com/sites/worklyweb/settings/domain
2. Under **Custom domains**, find `helplyai.co`
3. Click **Options** next to `helplyai.co`
4. Click **Set as primary domain**
5. Click **Save**

### Step 2: Enable Automatic Redirects
1. In the same **Domain management** section
2. Scroll down to **HTTPS**
3. Enable **Force HTTPS** if not already enabled
4. Netlify will automatically redirect:
   - `worklyweb.netlify.app` → `helplyai.co`
   - `www.helplyai.co` → `helplyai.co` (if configured)

### Step 3: Verify Redirect
1. Visit `https://worklyweb.netlify.app/settings/dashboard`
2. Should automatically redirect to `https://helplyai.co/settings/dashboard`

## Alternative: Add Custom Redirect Rule

If automatic redirect doesn't work, add this to `netlify.toml`:

```toml
# Redirect default Netlify subdomain to custom domain
[[redirects]]
  from = "https://worklyweb.netlify.app/*"
  to = "https://helplyai.co/:splat"
  status = 301
  force = true
```

Then commit and push:
```bash
git add netlify.toml
git commit -m "Add redirect from worklyweb.netlify.app to helplyai.co"
git push origin main
```

## Why This Happens

- Netlify assigns a default subdomain when you create a site (`worklyweb.netlify.app`)
- When you add a custom domain (`helplyai.co`), both domains work
- You need to explicitly set the custom domain as primary
- This tells Netlify to redirect all traffic from the default subdomain to your custom domain

## Current Status

- ✅ Custom domain added: `helplyai.co`
- ❌ Primary domain not set
- ❌ Automatic redirect not configured

After setting `helplyai.co` as primary, all links will automatically redirect to your custom domain.
