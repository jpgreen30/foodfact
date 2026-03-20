import { NextRequest, NextResponse } from 'next/server'
import { subscribeContact, buildWelcomeEmail, sendTransactionalEmail } from '@/lib/brevo'

export async function POST(req: NextRequest) {
  try {
    const { email, name, momStatus, dueDate, babyAgeMonths, breastfeeding, plan, sendWelcome } = await req.json()

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // Subscribe/update contact in Brevo (non-blocking)
    // SIGNUP_DATE stored so the cron email sequence can calculate which day to send
    subscribeContact(email, name ?? '', {
      MOM_STATUS: momStatus ?? undefined,
      DUE_DATE: dueDate ?? undefined,
      BABY_AGE_MONTHS: babyAgeMonths ?? undefined,
      PLAN: plan ?? 'free',
      BREASTFEEDING: breastfeeding ?? false,
      SIGNUP_DATE: new Date().toISOString().split('T')[0], // YYYY-MM-DD — used by automation cron
    }).catch(console.error)

    // Send welcome email on first subscribe
    if (sendWelcome !== false) {
      const html = buildWelcomeEmail(name ?? 'there', momStatus)
      sendTransactionalEmail(email, name ?? '', 'Welcome to FoodFactScanner! 🥦', html).catch(console.error)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
