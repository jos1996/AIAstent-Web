import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
}

interface RazorpayWebhookPayload {
  entity: string
  account_id: string
  event: string
  contains: string[]
  payload: {
    payment: {
      entity: {
        id: string
        entity: string
        amount: number
        currency: string
        status: string
        order_id: string
        invoice_id: string | null
        international: boolean
        method: string
        amount_refunded: number
        refund_status: string | null
        captured: boolean
        description: string | null
        card_id: string | null
        bank: string | null
        wallet: string | null
        vpa: string | null
        email: string
        contact: string
        notes: Record<string, any>
        fee: number
        tax: number
        error_code: string | null
        error_description: string | null
        error_source: string | null
        error_step: string | null
        error_reason: string | null
        created_at: number
      }
    }
  }
}

// Verify Razorpay webhook signature
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const encoder = new TextEncoder()
  const key = encoder.encode(secret)
  const data = encoder.encode(body)
  
  return crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(cryptoKey => 
    crypto.subtle.sign('HMAC', cryptoKey, data)
  ).then(signatureBuffer => {
    const signatureArray = Array.from(new Uint8Array(signatureBuffer))
    const expectedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return expectedSignature === signature
  }).catch(() => false)
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get webhook secret from environment
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get signature from headers
    const signature = req.headers.get('x-razorpay-signature')
    if (!signature) {
      console.error('Missing webhook signature')
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get raw body for signature verification
    const rawBody = await req.text()
    
    // Verify signature
    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse webhook payload
    const payload: RazorpayWebhookPayload = JSON.parse(rawBody)
    console.log('Webhook event:', payload.event)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different webhook events
    switch (payload.event) {
      case 'payment.authorized':
      case 'payment.captured': {
        const payment = payload.payload.payment.entity
        
        // Extract user_id from payment notes (must be set during payment creation)
        const userId = payment.notes?.user_id
        if (!userId) {
          console.error('Missing user_id in payment notes')
          return new Response(
            JSON.stringify({ error: 'Missing user_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const plan = payment.notes?.plan || 'day'
        
        // Record successful payment
        const { error } = await supabase.rpc('record_payment', {
          p_user_id: userId,
          p_plan: plan,
          p_amount: payment.amount,
          p_currency: payment.currency,
          p_razorpay_payment_id: payment.id,
          p_razorpay_order_id: payment.order_id,
          p_razorpay_signature: null,
          p_payment_method: payment.method,
          p_metadata: {
            email: payment.email,
            contact: payment.contact,
            captured: payment.captured,
            fee: payment.fee,
            tax: payment.tax,
            created_at: payment.created_at,
          }
        })

        if (error) {
          console.error('Failed to record payment:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to record payment' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Payment recorded successfully:', payment.id)
        break
      }

      case 'payment.failed': {
        const payment = payload.payload.payment.entity
        const userId = payment.notes?.user_id
        
        if (!userId) {
          console.error('Missing user_id in payment notes')
          return new Response(
            JSON.stringify({ error: 'Missing user_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const plan = payment.notes?.plan || 'day'

        // Record failed payment
        const { error } = await supabase.rpc('record_failed_payment', {
          p_user_id: userId,
          p_plan: plan,
          p_amount: payment.amount,
          p_currency: payment.currency,
          p_razorpay_payment_id: payment.id,
          p_failure_reason: payment.error_description || 'Payment failed',
          p_failure_code: payment.error_code,
          p_metadata: {
            email: payment.email,
            contact: payment.contact,
            error_source: payment.error_source,
            error_step: payment.error_step,
            error_reason: payment.error_reason,
          }
        })

        if (error) {
          console.error('Failed to record payment failure:', error)
        }

        console.log('Payment failure recorded:', payment.id)
        break
      }

      default:
        console.log('Unhandled webhook event:', payload.event)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
