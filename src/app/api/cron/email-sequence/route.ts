import { NextRequest, NextResponse } from 'next/server'
import { sendAutomationEmail } from '@/lib/brevo'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(
      'https://api.brevo.com/v3/contacts?limit=1000&offset=0&sort=desc',
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY ?? '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )

    if (!res.ok) {
      console.error('Brevo contacts fetch failed:', res.status, await res.text())
      return NextResponse.json({ error: 'Failed to fetch contacts from Brevo' }, { status: 500 })
    }

    const data = await res.json()
    const contacts: Array<{
      email: string
      attributes?: {
        SIGNUP_DATE?: string
        FIRSTNAME?: string
        PLAN?: string
        MOM_STATUS?: string
      }
    }> = data.contacts ?? []

    const now = Date.now()
    const msPerDay = 24 * 60 * 60 * 1000
    const triggerDays = new Set([2, 5, 7])

    let processed = 0

    for (const contact of contacts) {
      const signupDate = contact.attributes?.SIGNUP_DATE
      if (!signupDate) continue

      const days = Math.floor((now - new Date(signupDate).getTime()) / msPerDay)

      if (!triggerDays.has(days)) continue

      const plan = contact.attributes?.PLAN
      if (plan === 'pro') continue

      await sendAutomationEmail(
        contact.email,
        contact.attributes?.FIRSTNAME ?? 'there',
        days,
        { plan, momStatus: contact.attributes?.MOM_STATUS }
      )

      processed++
    }

    return NextResponse.json({ ok: true, processed })
  } catch (err) {
    console.error('Email sequence cron error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
