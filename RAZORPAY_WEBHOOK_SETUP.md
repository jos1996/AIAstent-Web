# Razorpay Webhook Integration Setup Guide

## Overview
This guide explains how to set up Razorpay webhooks with Supabase Edge Functions for secure payment processing.

---

## 📋 Prerequisites

1. **Razorpay Account**: Live mode credentials
   - Key ID: `rzp_live_SKtIYRDuyTruqa`
   - Key Secret: `rF8AzL0hMeA7er1FjKxBq2mSTo`

2. **Supabase Project**: `vodhulbrqziyamcpdokz`
   - Project URL: `https://vodhulbrqziyamcpdokz.supabase.co`

---

## 🚀 Step 1: Deploy the Edge Function

### Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```

### Link to your project
```bash
cd /Users/hayjoe/Desktop/AIA!/AIAstent-Web
supabase link --project-ref vodhulbrqziyamcpdokz
```

### Set the secrets (IMPORTANT - Do this first!)
```bash
# Set Razorpay webhook secret (you'll get this after creating webhook in Step 2)
supabase secrets set RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Set Razorpay key secret for payment verification
supabase secrets set RAZORPAY_KEY_SECRET=rF8AzL0hMeA7er1FjKxBq2mSTo
```

### Deploy the Edge Function
```bash
supabase functions deploy razorpay-webhook
```

After deployment, you'll get a URL like:
```
https://vodhulbrqziyamcpdokz.supabase.co/functions/v1/razorpay-webhook
```

**✅ Copy this URL - you'll need it for Step 2!**

---

## 🔗 Step 2: Configure Webhook in Razorpay Dashboard

### 2.1 Go to Razorpay Dashboard
1. Visit: https://dashboard.razorpay.com/app/website-app-settings/webhooks
2. Click **"+ Add New Webhook"**

### 2.2 Fill in the Webhook Setup Form

**Webhook URL:**
```
https://vodhulbrqziyamcpdokz.supabase.co/functions/v1/razorpay-webhook
```

**Alert Email:**
```
dara.egmp05a@iimtrichy.ac.in
```
(Or your preferred email for webhook failure alerts)

**Active Events** - Select these events:
- ✅ `payment.authorized`
- ✅ `payment.captured`
- ✅ `payment.failed`

**Secret:**
- Razorpay will auto-generate a webhook secret
- **IMPORTANT**: Copy this secret immediately after creating the webhook!

### 2.3 Save the Webhook
Click **"Create Webhook"**

### 2.4 Copy the Webhook Secret
After creation, you'll see a **Secret** field. Copy this value.

Example: `whsec_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`

---

## 🔐 Step 3: Update Supabase Secrets with Webhook Secret

Now that you have the webhook secret from Razorpay, update it in Supabase:

```bash
supabase secrets set RAZORPAY_WEBHOOK_SECRET=whsec_YourActualWebhookSecretHere
```

**⚠️ Replace `whsec_YourActualWebhookSecretHere` with the actual secret from Razorpay!**

---

## ✅ Step 4: Test the Integration

### 4.1 Make a Test Payment
1. Go to your billing page: https://helplyai.co/settings/billing
2. Try purchasing the **Test Pass** (₹2)
3. Complete the payment using Razorpay test cards (if in test mode) or real payment

### 4.2 Verify Webhook Received
Check Supabase Edge Function logs:
```bash
supabase functions logs razorpay-webhook
```

You should see logs like:
```
Webhook event: payment.authorized
Payment recorded successfully: pay_XXXXXXXXXX
```

### 4.3 Check Database
Verify the payment was recorded:
```sql
SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;
SELECT * FROM billing WHERE user_id = 'your-user-id';
```

---

## 🔍 Troubleshooting

### Webhook Not Receiving Events
1. **Check URL**: Ensure webhook URL is exactly:
   ```
   https://vodhulbrqziyamcpdokz.supabase.co/functions/v1/razorpay-webhook
   ```

2. **Check Events**: Ensure you selected `payment.authorized`, `payment.captured`, `payment.failed`

3. **Check Logs**:
   ```bash
   supabase functions logs razorpay-webhook --tail
   ```

### "Invalid Signature" Error
- **Cause**: Webhook secret mismatch
- **Fix**: Ensure you copied the correct secret from Razorpay and set it in Supabase:
  ```bash
  supabase secrets set RAZORPAY_WEBHOOK_SECRET=correct_secret_here
  ```

### "Missing user_id" Error
- **Cause**: Payment notes don't include user_id
- **Fix**: Already fixed in `BillingPage.tsx` - the `notes` field now includes `user_id` and `plan`

### Payment Not Updating in Database
1. Check Edge Function logs for errors
2. Verify RPC functions exist:
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('record_payment', 'record_failed_payment');
   ```
3. If missing, run the migration: `/Users/hayjoe/Desktop/AIA!/AIAstent/scripts/migration-v6-payments.sql`

---

## 📊 Monitoring

### View Recent Webhooks in Razorpay
1. Go to: https://dashboard.razorpay.com/app/website-app-settings/webhooks
2. Click on your webhook
3. View **"Recent Deliveries"** tab

### View Edge Function Logs
```bash
# Real-time logs
supabase functions logs razorpay-webhook --tail

# Last 100 logs
supabase functions logs razorpay-webhook --limit 100
```

---

## 🔒 Security Notes

1. **Never commit secrets to Git**
   - Secrets are stored in Supabase, not in code
   - `.env.example` is for documentation only

2. **Webhook signature verification**
   - Every webhook is verified using HMAC-SHA256
   - Invalid signatures are rejected with 401 error

3. **User isolation**
   - Payments are linked to users via `user_id` in notes
   - RLS policies ensure users can only see their own payments

---

## 📝 Summary

**What You Need to Fill in Razorpay Dashboard:**

| Field | Value |
|-------|-------|
| **Webhook URL** | `https://vodhulbrqziyamcpdokz.supabase.co/functions/v1/razorpay-webhook` |
| **Alert Email** | `dara.egmp05a@iimtrichy.ac.in` |
| **Active Events** | ✅ payment.authorized<br>✅ payment.captured<br>✅ payment.failed |
| **Secret** | Auto-generated by Razorpay (copy it!) |

**After Creating Webhook:**
```bash
supabase secrets set RAZORPAY_WEBHOOK_SECRET=<secret_from_razorpay>
```

---

## 🎉 Done!

Your Razorpay webhook integration is now complete. All payments will be automatically recorded in your Supabase database with full transaction history.
