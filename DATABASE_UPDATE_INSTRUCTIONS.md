# Database Update Instructions - Fix Billing Dates

## Problem
After successful Razorpay payment, the billing table is not showing start and end dates properly in the UI.

## Solution
Run the SQL migration to add `plan_start_date` and `plan_end_date` columns and update the `record_payment` function.

---

## Step 1: Run SQL Migration in Supabase

1. **Go to Supabase SQL Editor**
   - Visit: https://supabase.com/dashboard/project/vodhulbrqziyamcpdokz/sql/new
   - Or navigate to: Project → SQL Editor → New Query

2. **Copy and paste this SQL:**

```sql
-- Add columns for plan start and end dates if they don't exist
ALTER TABLE public.billing ADD COLUMN IF NOT EXISTS plan_start_date TIMESTAMPTZ;
ALTER TABLE public.billing ADD COLUMN IF NOT EXISTS plan_end_date TIMESTAMPTZ;

-- Update the record_payment function to set start and end dates
CREATE OR REPLACE FUNCTION public.record_payment(
  p_user_id UUID,
  p_plan TEXT,
  p_amount INTEGER,
  p_currency TEXT,
  p_razorpay_payment_id TEXT,
  p_razorpay_order_id TEXT DEFAULT NULL,
  p_razorpay_signature TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  v_next_billing TIMESTAMPTZ;
  v_plan_end_date TIMESTAMPTZ;
  v_billing_cycle TEXT;
  v_plan_name TEXT;
  v_amount_display TEXT;
  v_payment_id UUID;
  result JSON;
BEGIN
  -- Calculate next billing date and end date based on plan
  IF p_plan = 'test' THEN
    v_next_billing := NOW() + INTERVAL '1 hour';
    v_plan_end_date := NOW() + INTERVAL '1 hour';
    v_billing_cycle := 'hourly';
    v_plan_name := 'Test Pass';
  ELSIF p_plan = 'day' THEN
    v_next_billing := NOW() + INTERVAL '24 hours';
    v_plan_end_date := NOW() + INTERVAL '24 hours';
    v_billing_cycle := 'daily';
    v_plan_name := 'Day Pass';
  ELSIF p_plan = 'weekly' THEN
    v_next_billing := NOW() + INTERVAL '7 days';
    v_plan_end_date := NOW() + INTERVAL '7 days';
    v_billing_cycle := 'weekly';
    v_plan_name := 'Weekly';
  ELSIF p_plan = 'pro' THEN
    v_next_billing := NOW() + INTERVAL '1 month';
    v_plan_end_date := NOW() + INTERVAL '1 month';
    v_billing_cycle := 'monthly';
    v_plan_name := 'Pro Monthly';
  ELSIF p_plan = 'pro_plus' THEN
    v_next_billing := NOW() + INTERVAL '1 year';
    v_plan_end_date := NOW() + INTERVAL '1 year';
    v_billing_cycle := 'annually';
    v_plan_name := 'Pro Yearly';
  ELSE
    v_next_billing := NULL;
    v_plan_end_date := NULL;
    v_billing_cycle := 'monthly';
    v_plan_name := 'Free';
  END IF;

  -- Format amount display
  IF p_currency = 'INR' THEN
    v_amount_display := '₹' || (p_amount / 100)::TEXT;
  ELSIF p_currency = 'USD' THEN
    v_amount_display := '$' || (p_amount / 100)::TEXT;
  ELSIF p_currency = 'EUR' THEN
    v_amount_display := '€' || (p_amount / 100)::TEXT;
  ELSIF p_currency = 'GBP' THEN
    v_amount_display := '£' || (p_amount / 100)::TEXT;
  ELSE
    v_amount_display := p_currency || ' ' || (p_amount / 100)::TEXT;
  END IF;

  -- 1. Insert payment record
  INSERT INTO public.payments (
    user_id, plan, plan_name, amount, currency, amount_display,
    razorpay_payment_id, razorpay_order_id, razorpay_signature,
    payment_method, status, period_start, period_end, metadata
  ) VALUES (
    p_user_id, p_plan, v_plan_name, p_amount, p_currency, v_amount_display,
    p_razorpay_payment_id, p_razorpay_order_id, p_razorpay_signature,
    p_payment_method, 'success', NOW(), v_plan_end_date, p_metadata
  ) RETURNING id INTO v_payment_id;

  -- 2. Update billing table with new plan and dates
  UPDATE public.billing SET
    plan = p_plan,
    billing_cycle = v_billing_cycle,
    next_billing_date = v_next_billing,
    plan_start_date = NOW(),
    plan_end_date = v_plan_end_date,
    trial_end_date = v_plan_end_date,
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_order_id = p_razorpay_order_id,
    last_payment_amount = p_amount,
    last_payment_currency = p_currency,
    last_payment_status = 'success',
    last_payment_date = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Return payment details
  SELECT json_build_object(
    'payment_id', v_payment_id,
    'plan', p_plan,
    'plan_name', v_plan_name,
    'amount_display', v_amount_display,
    'next_billing_date', v_next_billing,
    'plan_start_date', NOW(),
    'plan_end_date', v_plan_end_date,
    'status', 'success'
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. **Click "Run"** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

4. **Verify Success**
   - You should see "Success. No rows returned"
   - This means the migration ran successfully

---

## Step 2: Test the Payment Flow

1. **Go to billing page**: https://helplyai.co/settings/billing

2. **Make a test payment**:
   - Select "Test Pass" (₹2) or "Day Pass" (₹450)
   - Complete the payment via Razorpay

3. **Verify the dates appear**:
   - After payment, refresh the page
   - You should see:
     - **Start Date**: Current date and time
     - **Trial Ends** (or **Pass Expires**): End date based on plan duration
   - For Day Pass: Shows exact time (e.g., "Feb 28, 2026, 10:15 AM")
   - For other plans: Shows date

---

## What This Migration Does

### 1. Adds New Columns to `billing` Table
- `plan_start_date`: When the paid plan started
- `plan_end_date`: When the paid plan expires

### 2. Updates `record_payment` Function
- Sets `plan_start_date` to NOW() when payment succeeds
- Calculates `plan_end_date` based on plan type:
  - **Test Pass**: +1 hour
  - **Day Pass**: +24 hours
  - **Weekly**: +7 days
  - **Pro**: +1 month
  - **Pro Plus**: +1 year
- Also sets `trial_end_date` for backward compatibility

### 3. Frontend Already Updated
- `BillingPage.tsx` now reads `plan_start_date` and `plan_end_date`
- Displays dates with proper formatting
- Shows time for hourly/daily plans

---

## Troubleshooting

### Dates Still Not Showing?
1. Check if migration ran successfully in Supabase SQL Editor
2. Make a new test payment (old payments won't have the new dates)
3. Refresh the billing page after payment
4. Check browser console for errors

### Webhook Not Updating Database?
1. Check Razorpay webhook deliveries: https://dashboard.razorpay.com/app/website-app-settings/webhooks
2. Check Supabase Edge Function logs:
   ```bash
   supabase functions logs razorpay-webhook --tail
   ```
3. Verify webhook secret is set correctly in Supabase

### Wrong Dates Showing?
- The dates are calculated server-side in UTC
- Your browser will display them in your local timezone
- This is correct behavior

---

## Summary

After running this migration:
- ✅ New columns added to billing table
- ✅ Payment function updates start and end dates automatically
- ✅ UI displays dates properly with time for short-duration plans
- ✅ Desktop app will pick up plan status automatically
- ✅ Works end-to-end from payment to display
