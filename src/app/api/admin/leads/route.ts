import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { getUserFromRequest, createAdminClient } from '@/lib/supabase/server'
import { ChemicalFound } from '@/lib/types'

export interface LeadPayload {
  name: string
  email: string
  phone?: string
  productName: string
  brand?: string
  chemicals: ChemicalFound[]
  scanId?: string
  source: 'scan' | 'recall'
  recallProduct?: string
  consent: boolean
}

export async function POST(req: NextRequest) {
  try {
    const lead: LeadPayload = await req.json()

    if (!lead.email || !lead.name || !lead.consent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const auth = await getUserFromRequest(req)
    const admin = createAdminClient()
    const user = auth?.user ?? null

    // Save lead to Supabase
    const { data: savedLead, error: dbError } = await admin
      .from('legal_leads')
      .insert({
        user_id: user?.id ?? null,
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? null,
        product_name: lead.productName,
        brand: lead.brand ?? null,
        chemicals: lead.chemicals,
        source: lead.source,
        recall_product: lead.recallProduct ?? null,
        scan_id: lead.scanId ?? null,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Failed to save lead:', dbError)
      // Still try to forward even if DB save failed
    }

    // Forward to law firm webhook
    const webhookUrl = process.env.LEGAL_LEADS_WEBHOOK_URL
    if (webhookUrl) {
      const payload = JSON.stringify({
        ...lead,
        leadId: savedLead?.id ?? null,
        submittedAt: new Date().toISOString(),
        source_app: 'FoodFactScanner',
      })

      const secret = process.env.LEGAL_LEADS_WEBHOOK_SECRET ?? ''
      const signature = createHmac('sha256', secret).update(payload).digest('hex')

      const webhookRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FFS-Signature': `sha256=${signature}`,
          'X-FFS-Source': 'FoodFactScanner',
        },
        body: payload,
      }).catch(() => null)

      if (savedLead?.id) {
        await admin
          .from('legal_leads')
          .update({
            status: webhookRes?.ok ? 'sent' : 'failed',
            forwarded_at: webhookRes?.ok ? new Date().toISOString() : null,
          })
          .eq('id', savedLead.id)
      }
    }

    return NextResponse.json({ success: true, leadId: savedLead?.id ?? null })
  } catch (err) {
    console.error('Lead submission error:', err)
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getUserFromRequest(req)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = auth
    const admin = createAdminClient()

    // Only admins can list leads
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') ?? '50')
    const offset = parseInt(url.searchParams.get('offset') ?? '0')

    const { data: leads, count } = await admin
      .from('legal_leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return NextResponse.json({ leads: leads ?? [], total: count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}
