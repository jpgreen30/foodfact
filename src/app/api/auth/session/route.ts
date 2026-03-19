import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const auth = await getUserFromRequest(req)
  if (!auth) return NextResponse.json({ user: null, profile: null })

  const { user, admin } = auth
  let { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Auto-create profile if missing
  if (!profile) {
    const adminClient = createAdminClient()
    const { data: created } = await adminClient
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email!.split('@')[0],
      }, { onConflict: 'id' })
      .select()
      .single()
    profile = created
  }

  return NextResponse.json({ user, profile })
}
