import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

const PRICE_IDS: Record<string, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!,
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
}

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json()

    if (!plan || !PRICE_IDS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: plan === 'pro' ? 'subscription' : 'payment',
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${appUrl}/checkout-success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}&userId=${userId ?? ''}`,
      cancel_url: `${appUrl}/#pricing`,
      metadata: { plan, userId: userId ?? '' },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
