'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Scale, X } from 'lucide-react'
import { AFFILIATE_PRODUCTS } from '@/lib/affiliate-products'

interface RecallAlert {
  id: string
  product: string
  brand: string
  reason: string
  date: string
  severity: 'urgent' | 'warning'
  affectedLots: string
  categories: string[]
}

interface LegalLeadForm {
  name: string
  email: string
  phone: string
  consent: boolean
}

interface RecallAlertsProps {
  userName?: string
  userEmail?: string
}

export default function RecallAlerts({ userName = '', userEmail = '' }: RecallAlertsProps) {
  const [recalls, setRecalls] = useState<RecallAlert[]>([])
  const [expanded, setExpanded] = useState(true)
  const [legalModal, setLegalModal] = useState<RecallAlert | null>(null)
  const [form, setForm] = useState<LegalLeadForm>({ name: userName, email: userEmail, phone: '', consent: false })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recalls')
      .then(r => r.json())
      .then(d => setRecalls(d.recalls ?? []))
      .catch(() => setRecalls([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setForm(f => ({ ...f, name: userName, email: userEmail }))
  }, [userName, userEmail])

  const saferProducts = AFFILIATE_PRODUCTS.filter(p =>
    p.category === 'organic-food' || p.category === 'testing-kits'
  ).slice(0, 2)

  async function submitLegalLead() {
    if (!legalModal) return
    setSubmitting(true)
    try {
      await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          productName: legalModal.product,
          brand: legalModal.brand,
          chemicals: [],
          source: 'recall',
          recallProduct: `${legalModal.product} by ${legalModal.brand} — ${legalModal.reason}`,
          consent: form.consent,
        }),
      })
      setSubmitted(true)
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null
  if (recalls.length === 0) return null

  const urgentCount = recalls.filter(r => r.severity === 'urgent').length

  return (
    <>
      <div className="rounded-2xl border border-red-100 bg-red-50 overflow-hidden mb-4">
        {/* Header */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between p-4 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-bold text-gray-900 text-sm">
              Recall Alerts
            </span>
            {urgentCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {urgentCount} Urgent
              </span>
            )}
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {expanded && (
          <div className="border-t border-red-100">
            {recalls.map((recall) => (
              <div
                key={recall.id}
                className={`p-4 border-b border-red-100 last:border-b-0 ${recall.severity === 'urgent' ? 'bg-white' : 'bg-red-50/50'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${recall.severity === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {recall.severity === 'urgent' ? '🚨 URGENT' : '⚠️ WARNING'}
                      </span>
                      <span className="text-xs text-gray-400">{recall.date}</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{recall.product}</p>
                    <p className="text-xs text-gray-500">by {recall.brand}</p>
                    <p className="text-xs text-gray-600 mt-1">{recall.reason}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Lots: {recall.affectedLots}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <a
                    href="?tab=shop"
                    className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    Shop Safer Alternatives →
                  </a>

                  {recall.severity === 'urgent' && (
                    <button
                      onClick={() => { setLegalModal(recall); setSubmitted(false) }}
                      className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700"
                    >
                      <Scale className="w-3 h-3" />
                      Free Legal Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legal Lead Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setLegalModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Request Submitted!</h3>
                <p className="text-gray-500 text-sm">A legal advocate will review your case and contact you within 24 hours. There is no obligation.</p>
                <button onClick={() => setLegalModal(null)} className="mt-4 btn-primary px-6 py-2 rounded-xl text-sm font-bold">
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Free Legal Case Review</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Regarding: <strong>{legalModal.product}</strong> by {legalModal.brand}
                </p>
                <div className="bg-purple-50 rounded-xl p-3 mb-4">
                  <p className="text-sm text-purple-700">
                    If your child was exposed to this recalled product, our legal partners offer a <strong>free, no-obligation case review</strong>. We sell qualified leads to law firms who specialize in food safety mass-tort claims.
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
                      className="mt-0.5 rounded"
                    />
                    <span className="text-xs text-gray-500">
                      I consent to being contacted by a legal representative regarding this recall. I understand this is a free review with no obligation.
                    </span>
                  </label>
                </div>

                <button
                  onClick={submitLegalLead}
                  disabled={!form.name || !form.email || !form.consent || submitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  {submitting ? 'Submitting…' : 'Get Free Case Review →'}
                </button>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Safer alternatives while you wait:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {saferProducts.map(p => (
                      <a
                        key={p.id}
                        href={p.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-50 rounded-xl p-2 hover:bg-gray-100 transition-colors"
                      >
                        <img src={p.imageUrl} alt={p.title} className="w-full h-16 object-cover rounded-lg mb-1" />
                        <p className="text-xs font-semibold text-gray-700 line-clamp-1">{p.title}</p>
                        <p className="text-xs font-bold text-green-600">{p.price}</p>
                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                          Amazon <ExternalLink className="w-2.5 h-2.5" />
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
