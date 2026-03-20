import { NextRequest, NextResponse } from 'next/server'
import { buildScanResultEmail, buildPostScanUpsellEmail, sendTransactionalEmail, subscribeContact } from '@/lib/brevo'
import { ScanResult, UserProfile } from '@/lib/types'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, name, scan, userProfile, plan }: {
      email: string
      name: string
      scan: ScanResult
      userProfile?: UserProfile
      plan?: string
    } = await req.json()

    if (!email || !scan) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Save scan to Supabase if we have a userId
    if (scan.userId) {
      const admin = createAdminClient()
      await admin.from('scans').insert({
        id: scan.id,
        user_id: scan.userId,
        product_name: scan.productName,
        brand: scan.brand,
        overall_score: scan.overallScore,
        chemicals: scan.chemicals,
        ingredients: scan.ingredients,
        image_url: scan.imageUrl ?? null,
        scanned_at: scan.scannedAt,
      }).then(({ error }) => {
        if (error && error.code !== '23505') console.error('Scan save error:', error)
      })
    }

    // Update LAST_SCAN_DATE in Brevo for re-engagement tracking
    await subscribeContact(email, name, {
      LAST_SCAN_DATE: new Date().toISOString().slice(0, 10),
    })

    // Send scan result email
    const subject = scan.overallScore === 'danger'
      ? `⚠️ Danger Alert: ${scan.productName} — Action Required`
      : scan.overallScore === 'caution'
        ? `⚠️ Caution: ${scan.productName} — See Your Scan Result`
        : `✅ Safe Scan: ${scan.productName}`

    const html = buildScanResultEmail(name, scan, userProfile)
    await sendTransactionalEmail(email, name, subject, html)

    // For non-pro users with a flagged scan, send a follow-up upsell (fire-and-forget)
    if (plan !== 'pro' && scan.overallScore !== 'safe') {
      const upsellHtml = buildPostScanUpsellEmail(name, scan, plan ?? 'free')
      sendTransactionalEmail(
        email,
        name,
        `One more thing about your ${scan.productName} scan`,
        upsellHtml
      ).catch(console.error)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
