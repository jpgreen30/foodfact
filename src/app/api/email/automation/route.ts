import { NextRequest, NextResponse } from 'next/server'
import { sendAutomationEmail } from '@/lib/brevo'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email, name, day, plan, momStatus } = await req.json()

    if (!email || day === undefined || day === null) {
      return NextResponse.json({ error: 'email and day are required' }, { status: 400 })
    }

    await sendAutomationEmail(email, name ?? 'there', day, { plan, momStatus })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Automation email error:', err)
    return NextResponse.json({ error: 'Failed to send automation email' }, { status: 500 })
  }
}
