import { NextRequest, NextResponse } from 'next/server'
import { buildNewsletterEmail, sendTransactionalEmail } from '@/lib/brevo'
import { UserProfile } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { email, name, userProfile }: {
      email: string
      name: string
      userProfile: UserProfile
    } = await req.json()

    if (!email || !userProfile) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Fetch recalls from our own route
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const recallRes = await fetch(`${baseUrl}/api/recalls`).catch(() => null)
    const recalls = recallRes ? (await recallRes.json()).recalls ?? [] : []

    const html = buildNewsletterEmail(name, userProfile, recalls)
    await sendTransactionalEmail(email, name, 'Your Weekly Food Safety Newsletter 🥦', html)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 })
  }
}
