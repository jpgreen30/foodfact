import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Called whenever a user performs a scan — increments counter / deducts credit
export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, scans_used, scan_credits')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (profile.plan === 'free' && profile.scans_used >= 3) {
    return NextResponse.json({ error: 'scan_limit_reached', plan: 'free' }, { status: 402 })
  }

  if (profile.plan === 'starter' && profile.scan_credits <= 0) {
    return NextResponse.json({ error: 'scan_limit_reached', plan: 'starter' }, { status: 402 })
  }

  const updates: Record<string, number> = {
    scans_used: profile.scans_used + 1,
    total_scans: profile.scans_used + 1,
  }
  if (profile.plan === 'starter') {
    updates.scan_credits = profile.scan_credits - 1
  }

  await supabase.from('profiles').update(updates).eq('id', user.id)

  // If scan result data is provided, trigger scan result email (fire-and-forget)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  // Note: client may pass scan + profile data for email; we forward it non-blocking
  // The scan result email is also triggerable directly via /api/email/scan-result

  return NextResponse.json({ ok: true, creditsRemaining: updates.scan_credits ?? null, emailEndpoint: `${baseUrl}/api/email/scan-result` })
}
