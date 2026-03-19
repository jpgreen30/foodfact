import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  // Sign in using the anon key (returns session tokens)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return NextResponse.json({ error: error.message }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  return NextResponse.json({ user: data.user, profile })
}
