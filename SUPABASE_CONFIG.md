# Supabase Configuration for HelplyAI Web App

## Required: Configure Redirect URLs

To fix the PKCE authentication error, you need to add the redirect URL to your Supabase project:

1. Go to https://supabase.com/dashboard/project/vodhulbrqziyamcpdokz
2. Navigate to **Authentication** → **URL Configuration**
3. Add the following to **Redirect URLs**:
   - `http://localhost:5174/auth/callback` (for local development)
   - `https://your-production-domain.netlify.app/auth/callback` (for production)

## Current Configuration

- **Supabase URL**: `https://vodhulbrqziyamcpdokz.supabase.co`
- **Local Dev URL**: `http://localhost:5174`
- **Auth Callback**: `/auth/callback`

## PKCE Flow

The app uses PKCE (Proof Key for Code Exchange) flow for OAuth authentication:
- When user clicks "Continue with Google", a code verifier is stored in localStorage
- Google redirects back to `/auth/callback?code=...`
- Supabase exchanges the code using the verifier from localStorage
- If the redirect URL doesn't match exactly, the verifier is not found → PKCE error

## Troubleshooting

If you see "PKCE code verifier not found in storage":
1. ✅ Add exact redirect URL to Supabase project (see above)
2. ✅ Make sure localStorage is not being cleared
3. ✅ Use the same browser tab (don't open callback in new window)
4. ✅ Check browser console for localStorage errors
