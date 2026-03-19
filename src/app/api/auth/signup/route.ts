import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    // Use admin client to create user with email auto-confirmed (bypasses SMTP)
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (adminError) return NextResponse.json({ error: adminError.message }, { status: 400 })

    // Ensure profile row exists (trigger may not be set up in all environments)
    await adminClient.from('profiles').upsert({
      id: adminData.user.id,
      email: adminData.user.email!,
      name: name || email.split('@')[0],
    }, { onConflict: 'id', ignoreDuplicates: true })

    // Sign in immediately so session cookies are set
    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) return NextResponse.json({ error: signInError.message }, { status: 400 })

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
    const message = err instanceof Error ? err.message : String(err)
    console.error('Signup error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
