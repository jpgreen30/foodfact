import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

// Use service role for webhook — bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const plan = session.metadata?.plan as 'starter' | 'pro' | undefined
    const userId = session.metadata?.userId

    if (!plan || !userId) {
      console.error('Missing plan or userId in metadata')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    if (plan === 'starter') {
      // Top up 50 credits — additive so multiple purchases stack
      const { data: profile } = await supabase
        .from('profiles')
        .select('scan_credits')
        .eq('id', userId)
        .single()

      await supabase
        .from('profiles')
        .update({
          plan: 'starter',
          scan_credits: (profile?.scan_credits ?? 0) + 50,
          stripe_customer_id: session.customer as string,
        })
        .eq('id', userId)
    }

    if (plan === 'pro') {
      await supabase
        .from('profiles')
        .update({
          plan: 'pro',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq('id', userId)
    }
  }

  // Handle subscription cancellation / expiry
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await supabase
      .from('profiles')
      .update({ plan: 'free', stripe_subscription_id: null })
      .eq('stripe_subscription_id', subscription.id)
  }

  return NextResponse.json({ received: true })
}
