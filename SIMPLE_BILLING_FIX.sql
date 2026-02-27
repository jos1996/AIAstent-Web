-- ============================================================
-- Simple Fix: Add plan_start_date and plan_end_date columns
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add the two missing columns
ALTER TABLE public.billing ADD COLUMN IF NOT EXISTS plan_start_date TIMESTAMPTZ;
ALTER TABLE public.billing ADD COLUMN IF NOT EXISTS plan_end_date TIMESTAMPTZ;

-- Update the record_payment function to set these dates
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
  -- Calculate dates based on plan
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

  -- Format amount
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

  -- Insert payment record
  INSERT INTO public.payments (
    user_id, plan, plan_name, amount, currency, amount_display,
    razorpay_payment_id, razorpay_order_id, razorpay_signature,
    payment_method, status, period_start, period_end, metadata
  ) VALUES (
    p_user_id, p_plan, v_plan_name, p_amount, p_currency, v_amount_display,
    p_razorpay_payment_id, p_razorpay_order_id, p_razorpay_signature,
    p_payment_method, 'success', NOW(), v_plan_end_date, p_metadata
  ) RETURNING id INTO v_payment_id;

  -- Update billing table with dates
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

  -- Return result
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
