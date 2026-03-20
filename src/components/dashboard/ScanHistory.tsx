'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, ExternalLink, Scale, Star } from 'lucide-react'
import { ScanResult, UserProfile } from '@/lib/types'
import { AFFILIATE_PRODUCTS, getRecommendedProducts } from '@/lib/affiliate-products'
import { proxyImg } from '@/lib/utils'

interface Props {
  scans: ScanResult[]
  userProfile?: UserProfile
  userName?: string
  userEmail?: string
}

const HEAVY_METAL_NAMES = ['Arsenic', 'Lead', 'Cadmium', 'Mercury', 'Inorganic Arsenic']

function getSaferProducts(scan: ScanResult, userProfile?: UserProfile) {
  const hasHeavyMetals = scan.chemicals.some(c => HEAVY_METAL_NAMES.includes(c.name))
  const hasBPA = scan.chemicals.some(c => c.name.toLowerCase().includes('bpa'))
  const hasPesticides = scan.chemicals.some(c => c.name.toLowerCase().includes('pesticide') || c.name.toLowerCase().includes('chlor'))

  const extraConcerns: string[] = []
  if (hasHeavyMetals) extraConcerns.push('heavy-metals')
  if (hasBPA) extraConcerns.push('bpa')
  if (hasPesticides) extraConcerns.push('pesticides')

  const concerns = Array.from(new Set([...(userProfile?.concerns ?? []), ...extraConcerns]))
  return getRecommendedProducts(
    concerns,
    userProfile?.momStatus ?? 'other',
    { babyAgeMonths: userProfile?.babyAgeMonths }
  ).slice(0, 3)
}

interface LegalFormState {
  name: string
  email: string
  phone: string
  consent: boolean
  submitted: boolean
  submitting: boolean
}

export default function ScanHistory({ scans, userProfile, userName = '', userEmail = '' }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'safe' | 'caution' | 'danger'>('all')
  const [legalForms, setLegalForms] = useState<Record<string, LegalFormState>>({})

  const filtered = scans.filter(s => filter === 'all' || s.overallScore === filter)

  const scoreColors = {
    safe: { badge: 'badge-safe', bg: 'bg-green-50 border-green-200', icon: '✅', label: 'SAFE' },
    caution: { badge: 'badge-caution', bg: 'bg-yellow-50 border-yellow-200', icon: '⚠️', label: 'CAUTION' },
    danger: { badge: 'badge-danger', bg: 'bg-red-50 border-red-200', icon: '🚫', label: 'DANGER' },
  }

  const levelColors = { low: 'text-yellow-600 bg-yellow-50', medium: 'text-orange-600 bg-orange-50', high: 'text-red-600 bg-red-50' }

  function getLegalForm(scanId: string): LegalFormState {
    return legalForms[scanId] ?? { name: userName, email: userEmail, phone: '', consent: false, submitted: false, submitting: false }
  }

  function setLegalField<K extends keyof LegalFormState>(scanId: string, key: K, value: LegalFormState[K]) {
    setLegalForms(prev => ({
      ...prev,
      [scanId]: { ...getLegalForm(scanId), [key]: value },
    }))
  }

  async function submitLegalLead(scan: ScanResult) {
    const form = getLegalForm(scan.id)
    setLegalField(scan.id, 'submitting', true)
    try {
      await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          productName: scan.productName,
          brand: scan.brand,
          chemicals: scan.chemicals,
          scanId: scan.id,
          source: 'scan',
          consent: form.consent,
        }),
      })
      setLegalForms(prev => ({ ...prev, [scan.id]: { ...getLegalForm(scan.id), submitted: true, submitting: false } }))
    } catch {
      setLegalField(scan.id, 'submitting', false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">Scan History</h1>
        <span className="text-sm text-gray-500">{scans.length} total scans</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'safe', 'caution', 'danger'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all border-2 ${
              filter === f
                ? f === 'safe' ? 'bg-green-600 text-white border-green-600' :
                  f === 'caution' ? 'bg-yellow-500 text-white border-yellow-500' :
                  f === 'danger' ? 'bg-red-600 text-white border-red-600' :
                  'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f === 'all' ? `All (${scans.length})` :
             f === 'safe' ? `✅ Safe (${scans.filter(s => s.overallScore === 'safe').length})` :
             f === 'caution' ? `⚠️ Caution (${scans.filter(s => s.overallScore === 'caution').length})` :
             `🚫 Danger (${scans.filter(s => s.overallScore === 'danger').length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(scan => {
          const colors = scoreColors[scan.overallScore]
          const isOpen = expanded === scan.id
          const saferProducts = getSaferProducts(scan, userProfile)
          const isBreastfeeding = userProfile?.breastfeeding && scan.chemicals.some(c => c.level === 'high')
          const legalForm = getLegalForm(scan.id)

          return (
            <div key={scan.id} className={`bg-white border-2 rounded-2xl overflow-hidden transition-all ${
              isOpen ? colors.bg : 'border-gray-100'
            }`}>
              <button
                onClick={() => setExpanded(isOpen ? null : scan.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">{colors.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{scan.productName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-gray-500">{scan.brand}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(scan.scannedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {scan.chemicals.length > 0 && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {scan.chemicals.length} chemical{scan.chemicals.length !== 1 ? 's' : ''} detected
                    </p>
                  )}
                </div>
                <span className={`${colors.badge} flex-shrink-0`}>{colors.label}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  {/* Ingredients */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ingredients</p>
                    <p className="text-sm text-gray-600">{scan.ingredients.join(', ')}</p>
                  </div>

                  {/* Chemicals Found */}
                  {scan.chemicals.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chemicals Detected</p>
                      <div className="space-y-3">
                        {scan.chemicals.map(chem => (
                          <div key={chem.name} className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-gray-800">{chem.name}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColors[chem.level]}`}>
                                {chem.level.toUpperCase()} LEVEL
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{chem.description}</p>
                            <p className="text-sm text-red-600 mb-2"><strong>Health Risk:</strong> {chem.healthRisk}</p>
                            {chem.safeLimit && (
                              <div className="flex gap-4 text-xs">
                                <span className="text-gray-500">Safe limit: <strong className="text-green-600">{chem.safeLimit}</strong></span>
                                {chem.detectedAmount && (
                                  <span className="text-gray-500">Detected: <strong className="text-red-600">{chem.detectedAmount}</strong></span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-green-700 font-semibold">No harmful chemicals detected</p>
                      </div>
                      <p className="text-green-600 text-sm mt-1">This product passed all 2,400+ chemical checks.</p>
                    </div>
                  )}

                  {/* Breastfeeding Alert */}
                  {isBreastfeeding && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <p className="text-amber-800 font-bold text-sm">Breastfeeding Alert</p>
                      </div>
                      <p className="text-amber-700 text-sm">High-level chemicals in this product may transfer through breast milk. Consider switching to a safer alternative while breastfeeding.</p>
                    </div>
                  )}

                  {/* Safer Alternatives (caution or danger) */}
                  {(scan.overallScore === 'danger' || scan.overallScore === 'caution') && saferProducts.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        🛡️ Safer Alternatives We Recommend
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {saferProducts.map(product => (
                          <a
                            key={product.id}
                            href={product.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white border border-gray-200 rounded-xl p-3 hover:border-green-300 hover:shadow-sm transition-all group"
                          >
                            <img
                              src={proxyImg(product.imageUrl)}
                              alt={product.title}
                              className="w-full h-20 object-cover rounded-lg mb-2"
                            />
                            <p className="text-xs font-bold text-gray-800 line-clamp-2 mb-1">{product.title}</p>
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount.toLocaleString()})</span>
                            </div>
                            <p className="text-sm font-bold text-green-600 mb-2">{product.price}</p>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
                              Buy on Amazon <ExternalLink className="w-3 h-3" />
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legal CTA (danger only) */}
                  {scan.overallScore === 'danger' && (
                    <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="w-5 h-5 text-purple-600" />
                        <p className="text-purple-900 font-bold text-sm">You May Have a Legal Claim</p>
                      </div>
                      <p className="text-purple-700 text-sm mb-4">
                        If your child consumed this product, our legal partners offer a <strong>free, no-obligation case review</strong>. Families affected by dangerous food products may be entitled to compensation.
                      </p>

                      {legalForm.submitted ? (
                        <div className="bg-white rounded-xl p-3 text-center border border-purple-100">
                          <p className="text-lg mb-1">✅</p>
                          <p className="text-sm font-semibold text-gray-800">Request Submitted!</p>
                          <p className="text-xs text-gray-500">A legal advocate will contact you within 24 hours.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Name *</label>
                              <input
                                type="text"
                                value={legalForm.name}
                                onChange={e => setLegalField(scan.id, 'name', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                placeholder="Your name"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600 block mb-1">Phone (optional)</label>
                              <input
                                type="tel"
                                value={legalForm.phone}
                                onChange={e => setLegalField(scan.id, 'phone', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                placeholder="555-000-0000"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">Email *</label>
                            <input
                              type="email"
                              value={legalForm.email}
                              onChange={e => setLegalField(scan.id, 'email', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                              placeholder="your@email.com"
                            />
                          </div>
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={legalForm.consent}
                              onChange={e => setLegalField(scan.id, 'consent', e.target.checked)}
                              className="mt-0.5"
                            />
                            <span className="text-xs text-gray-500">
                              I consent to being contacted by a legal representative. This is a free review with no obligation.
                            </span>
                          </label>
                          <button
                            onClick={() => submitLegalLead(scan)}
                            disabled={!legalForm.name || !legalForm.email || !legalForm.consent || legalForm.submitting}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                          >
                            {legalForm.submitting ? 'Submitting…' : '⚖️ Get Free Case Review →'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
