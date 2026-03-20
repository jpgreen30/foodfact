import { NextRequest, NextResponse } from 'next/server'
import {
  buildMilestoneEmail,
  buildReengageEmail,
  sendTransactionalEmail,
  subscribeContact,
  getBabyAgeLabel,
} from '@/lib/brevo'
import { createAdminClient } from '@/lib/supabase/server'
import { AFFILIATE_PRODUCTS } from '@/lib/affiliate-products'

const MILESTONE_MONTHS = [4, 6, 8, 12, 18]

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    let milestonesSent = 0
    let reengageSent = 0

    // ── 1. Milestone emails ─────────────────────────────────────────────────
    const { data: milestoneProfiles, error: mpError } = await admin
      .from('user_profiles')
      .select('user_id, baby_birth_date, baby_name, mom_status, milestones_sent')
      .not('baby_birth_date', 'is', null)

    if (mpError) throw mpError

    for (const up of milestoneProfiles ?? []) {
      if (!up.baby_birth_date) continue

      const birthDate = new Date(up.baby_birth_date)
      const ageMs = Date.now() - birthDate.getTime()
      const ageMonths = Math.floor(ageMs / (30.44 * 24 * 60 * 60 * 1000))

      if (!MILESTONE_MONTHS.includes(ageMonths)) continue

      const alreadySent: number[] = up.milestones_sent ?? []
      if (alreadySent.includes(ageMonths)) continue

      // Get profile email/name
      const { data: profile } = await admin
        .from('profiles')
        .select('email, name')
        .eq('id', up.user_id)
        .single()

      if (!profile) continue

      const html = buildMilestoneEmail(profile.name ?? 'there', ageMonths, up.baby_name ?? undefined)
      await sendTransactionalEmail(
        profile.email,
        profile.name ?? 'there',
        `${up.baby_name ? up.baby_name + ' is' : 'Your baby is'} ${getBabyAgeLabel(ageMonths)} — here's what to know`,
        html
      )

      // Mark milestone as sent
      await admin
        .from('user_profiles')
        .update({ milestones_sent: [...alreadySent, ageMonths] })
        .eq('user_id', up.user_id)

      milestonesSent++
    }

    // ── 2. Re-engagement emails ─────────────────────────────────────────────
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Users who have scanned at least once
    const { data: activeProfiles, error: apError } = await admin
      .from('profiles')
      .select('id, email, name, plan')
      .gt('total_scans', 0)

    if (apError) throw apError

    // Users who scanned in the last 7 days
    const { data: recentScans, error: rsError } = await admin
      .from('scans')
      .select('user_id')
      .gte('scanned_at', weekAgo)

    if (rsError) throw rsError

    const recentIds = new Set(recentScans?.map(s => s.user_id) ?? [])

    // Find the date of last scan for lapsed users
    const lapsedProfiles = (activeProfiles ?? []).filter(p => !recentIds.has(p.id))

    const trendingProducts = AFFILIATE_PRODUCTS.filter(p =>
      p.category === 'organic-food' || p.category === 'testing-kits' || p.category === 'baby-formula'
    ).slice(0, 3)

    for (const profile of lapsedProfiles) {
      // Get their last scan date
      const { data: lastScan } = await admin
        .from('scans')
        .select('scanned_at')
        .eq('user_id', profile.id)
        .order('scanned_at', { ascending: false })
        .limit(1)
        .single()

      if (!lastScan) continue

      const daysSince = Math.floor(
        (Date.now() - new Date(lastScan.scanned_at).getTime()) / (24 * 60 * 60 * 1000)
      )

      // Only re-engage users who lapsed 7–30 days ago (avoid spamming very old users)
      if (daysSince < 7 || daysSince > 30) continue

      const html = buildReengageEmail(profile.name ?? 'there', daysSince, trendingProducts)
      await sendTransactionalEmail(
        profile.email,
        profile.name ?? 'there',
        `It's been ${daysSince} days — your family's food safety check-in`,
        html
      )

      // Update LAST_SCAN_DATE in Brevo so we don't re-engage again too soon
      await subscribeContact(profile.email, profile.name ?? '', {
        LAST_SCAN_DATE: new Date().toISOString().slice(0, 10),
      })

      reengageSent++
    }

    return NextResponse.json({ ok: true, milestonesSent, reengageSent })
  } catch (err) {
    console.error('Retention cron error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
