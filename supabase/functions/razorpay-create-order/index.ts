import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Valid amounts per plan across all pricing regions (INR paise).
// Must stay in sync with src/lib/pricing.ts (PRICING_TABLE) and src/lib/plans.ts (GENERAL_PLANS).
const PLAN_AMOUNTS: Record<string, number[]> = {
  credit_1hr:      [39900, 34000, 51000, 73600, 85000, 68000],
  credit_3hr:      [59900, 85000, 127500, 184000, 212500, 170000],
  credit_10hr:     [199900, 255000, 382500, 552000, 637500, 510000],
  general_30min:   [1000],
  general_monthly: [199900],
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    // 1. Authenticate the caller — only signed-in users may create orders
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing authorization header' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401)
    }

    // 2. Validate request body
    const body = await req.json()
    const planId: string = body?.plan_id
    const amount: number = body?.amount
    const notes: Record<string, unknown> = body?.notes || {}

    const validAmounts = PLAN_AMOUNTS[planId]
    if (!validAmounts || !Number.isInteger(amount) || !validAmounts.includes(amount)) {
      console.error('Invalid plan/amount:', { planId, amount })
      return json({ error: 'Invalid plan or amount' }, 400)
    }

    // 3. Create Razorpay order with automatic capture
    // (payments were landing in "authorized" state without an order_id —
    //  capture settings ensure the payment is captured, not just authorized)
    const keyId = Deno.env.get('RAZORPAY_KEY_ID')
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!keyId || !keySecret) {
      console.error('Razorpay credentials not configured')
      return json({ error: 'Payment gateway not configured' }, 500)
    }

    const receipt = `rcpt_${user.id.replace(/-/g, '').slice(0, 8)}_${Date.now()}` // max 40 chars

    const orderPayload = {
      amount,
      currency: 'INR',
      receipt,
      // user_id forced server-side so webhooks can always resolve the buyer
      notes: { ...notes, user_id: user.id, plan: planId },
      payment: {
        capture: 'automatic',
        capture_options: {
          automatic_expiry_period: 12,
          manual_expiry_period: 7200,
          refund_speed: 'optimum',
        },
      },
    }

    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify(orderPayload),
    })

    const orderData = await orderRes.json()

    if (!orderRes.ok || !orderData?.id) {
      console.error('Razorpay order creation failed:', orderRes.status, orderData)
      return json({ error: orderData?.error?.description || 'Failed to create order' }, 502)
    }

    console.log('Order created:', orderData.id, 'amount:', amount, 'plan:', planId, 'user:', user.id)

    return json({
      order_id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return json({ error: error.message || 'Internal error' }, 500)
  }
})
