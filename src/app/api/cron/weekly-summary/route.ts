import { NextRequest, NextResponse } from 'next/server'
import { buildWeeklyScanSummaryEmail, sendTransactionalEmail, WeeklyScanStats } from '@/lib/brevo'
import { createAdminClient } from '@/lib/supabase/server'
import { ChemicalFound } from '@/lib/types'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch all scans from the past 7 days
    const { data: recentScans, error: scansError } = await admin
      .from('scans')
      .select('user_id, overall_score, chemicals')
      .gte('scanned_at', weekAgo)

    if (scansError) throw scansError

    if (!recentScans || recentScans.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 })
    }

    // Group scans by user_id
    const byUser = new Map<string, { total: number; safe: number; caution: number; danger: number; chemicals: string[] }>()

    for (const scan of recentScans) {
      const entry = byUser.get(scan.user_id) ?? { total: 0, safe: 0, caution: 0, danger: 0, chemicals: [] }
      entry.total++
      if (scan.overall_score === 'safe') entry.safe++
      else if (scan.overall_score === 'caution') entry.caution++
      else if (scan.overall_score === 'danger') entry.danger++

      const chemicals: ChemicalFound[] = scan.chemicals ?? []
      for (const c of chemicals) {
        if ((c.level === 'medium' || c.level === 'high') && !entry.chemicals.includes(c.name)) {
          entry.chemicals.push(c.name)
        }
      }
      byUser.set(scan.user_id, entry)
    }

    // Fetch profiles for the users who scanned
    const userIds = Array.from(byUser.keys())
    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('id, email, name')
      .in('id', userIds)

    if (profilesError) throw profilesError

    let processed = 0

    for (const profile of profiles ?? []) {
      const scanData = byUser.get(profile.id)
      if (!scanData) continue

      const stats: WeeklyScanStats = {
        total: scanData.total,
        safe: scanData.safe,
        caution: scanData.caution,
        danger: scanData.danger,
        topChemicals: scanData.chemicals.slice(0, 5),
      }

      const html = buildWeeklyScanSummaryEmail(profile.name ?? 'there', stats)
      await sendTransactionalEmail(
        profile.email,
        profile.name ?? 'there',
        `Your week in food safety: ${stats.total} scan${stats.total !== 1 ? 's' : ''}${stats.danger > 0 ? ` — ${stats.danger} danger alert${stats.danger !== 1 ? 's' : ''}` : stats.caution > 0 ? `, ${stats.caution} caution` : ', all clear ✅'}`,
        html
      )
      processed++
    }

    return NextResponse.json({ ok: true, processed })
  } catch (err) {
    console.error('Weekly summary cron error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
