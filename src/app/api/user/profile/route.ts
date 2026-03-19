import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const auth = await getUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user, admin } = auth
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ profile })
}

export async function PATCH(req: NextRequest) {
  const auth = await getUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user, admin } = auth
  const body = await req.json()
  const allowed = ['name', 'onboarding_complete']
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  // Upsert so it works even if the profile row was never created
  const { data, error } = await admin
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email ?? '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || '',
      ...updates,
    }, { onConflict: 'id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Save extended user_profiles data when provided
  if (body.userProfile) {
    const p = body.userProfile
    await admin.from('user_profiles').upsert({
      user_id: user.id,
      mom_status: p.momStatus ?? null,
      due_date: p.dueDate || null,
      baby_name: p.babyName || null,
      baby_birth_date: p.babyBirthDate || null,
      baby_age_months: p.babyAgeMonths ?? null,
      diet: p.diet ?? [],
      concerns: p.concerns ?? [],
      allergies: p.allergies ?? [],
      breastfeeding: p.breastfeeding ?? false,
      organic_preference: p.organicPreference ?? false,
      notifications_enabled: p.notificationsEnabled ?? true,
      weekly_report_enabled: p.weeklyReportEnabled ?? true,
    }, { onConflict: 'user_id' })
  }

  // When onboarding completes, update Brevo contact with full profile attributes
  if (body.onboarding_complete === true && body.userProfile) {
    const p = body.userProfile
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    fetch(`${baseUrl}/api/email/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: data?.name ?? '',
        momStatus: p.momStatus,
        dueDate: p.dueDate,
        babyAgeMonths: p.babyAgeMonths,
        breastfeeding: p.breastfeeding,
        plan: data?.plan ?? 'free',
        sendWelcome: false,
      }),
    }).catch(console.error)
  }

  return NextResponse.json({ profile: data })
}
