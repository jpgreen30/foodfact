import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Fire-and-forget: subscribe to Brevo + send welcome email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    if (baseUrl) {
      fetch(`${baseUrl}/api/email/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, plan: 'free', sendWelcome: true }),
      }).catch(() => {})
    }

    return NextResponse.json({ user: data.user })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
}
