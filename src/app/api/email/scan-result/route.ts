import { NextRequest, NextResponse } from 'next/server'
import { buildScanResultEmail, sendTransactionalEmail } from '@/lib/brevo'
import { ScanResult, UserProfile } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { email, name, scan, userProfile }: {
      email: string
      name: string
      scan: ScanResult
      userProfile?: UserProfile
    } = await req.json()

    if (!email || !scan) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const subject = scan.overallScore === 'danger'
      ? `⚠️ Danger Alert: ${scan.productName} — Action Required`
      : scan.overallScore === 'caution'
        ? `⚠️ Caution: ${scan.productName} — See Your Scan Result`
        : `✅ Safe Scan: ${scan.productName}`

    const html = buildScanResultEmail(name, scan, userProfile)
    await sendTransactionalEmail(email, name, subject, html)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
