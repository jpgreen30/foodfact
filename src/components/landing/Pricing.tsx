'use client'

import Link from 'next/link'
import { Check, Zap, Package } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: null,
    priceLabel: '$0',
    perLabel: null,
    description: 'Try it out, no card needed',
    badge: null,
    features: [
      '3 scans — free forever',
      'Basic safety scores',
      'Top 3 chemical alerts',
      'FDA recall notifications',
    ],
    notIncluded: [
      'Full chemical breakdown',
      'Safer alternatives',
      'Exposure tracking',
      'Pre/Post-natal tools',
      'Unlimited or extra scans',
    ],
    cta: 'Start Free',
    ctaLink: '/login?signup=true&plan=free',
    highlight: false,
    icon: null,
  },
  {
    name: 'Starter',
    price: '4.99',
    priceLabel: '$4.99',
    perLabel: 'one-time · 50 scans',
    description: 'Perfect for occasional scanning',
    badge: 'No Subscription',
    features: [
      '50 scan credits — never expire',
      'Full chemical breakdown',
      'All 2,400+ chemicals monitored',
      'Safer alternatives with rankings',
      'Exposure tracking & history',
      'FDA recall alerts',
    ],
    notIncluded: [
      'Pre/Post-natal tracking tools',
      'Weekly safety reports',
      'Priority support',
    ],
    cta: 'Buy 50 Scans — $4.99',
    ctaLink: '/checkout?plan=starter',
    highlight: false,
    icon: Package,
  },
  {
    name: 'Pro',
    price: '14.99',
    priceLabel: '$14.99',
    perLabel: '/month',
    description: 'For parents who want complete peace of mind',
    badge: 'Most Popular',
    features: [
      'Unlimited scans — always',
      'Full chemical breakdown with levels',
      'All 2,400+ chemicals monitored',
      'Safer alternatives with rankings',
      'Exposure tracking & history',
      'Pre & Post-natal tracking tools',
      'Weekly safety reports',
      'Age-specific thresholds',
      'FDA recall alerts',
      'Priority email support',
    ],
    notIncluded: [],
    cta: 'Start Pro — $14.99/mo',
    ctaLink: '/checkout?plan=pro',
    highlight: true,
    icon: Zap,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-2 mb-4">
            <span className="text-brand-600 text-sm font-semibold">Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Invest in Your Baby's{' '}
            <span className="text-brand-600">Safety Today</span>
          </h2>
          <p className="text-lg text-gray-600">
            Start free. Buy credits when you need them. Subscribe for unlimited peace of mind.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.name}
                className={`rounded-3xl border-2 p-7 relative transition-transform hover:-translate-y-1 ${
                  plan.highlight
                    ? 'bg-brand-600 border-brand-500 shadow-2xl shadow-brand-600/30'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap ${
                    plan.highlight
                      ? 'bg-yellow-400 text-yellow-900'
                      : 'bg-gray-900 text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? 'text-brand-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-end gap-1.5">
                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      {plan.priceLabel}
                    </span>
                    {plan.perLabel && (
                      <span className={`text-sm mb-1 ${plan.highlight ? 'text-brand-200' : 'text-gray-400'}`}>
                        {plan.perLabel}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={plan.ctaLink}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 mb-6 ${
                    plan.highlight
                      ? 'bg-white text-brand-700 hover:bg-brand-50 shadow-lg'
                      : plan.name === 'Free'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/30'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {plan.cta}
                </Link>

                <div className="space-y-2.5">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-brand-300' : 'text-brand-600'}`} />
                      <span className={`text-sm ${plan.highlight ? 'text-brand-100' : 'text-gray-700'}`}>{feat}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 opacity-40">
                      <span className={`w-4 h-4 mt-0.5 flex-shrink-0 text-center text-xs ${plan.highlight ? 'text-brand-300' : 'text-gray-400'}`}>✕</span>
                      <span className={`text-sm line-through ${plan.highlight ? 'text-brand-200' : 'text-gray-400'}`}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Money back guarantee */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
            <span className="text-3xl">🛡️</span>
            <div className="text-left">
              <p className="font-bold text-gray-900">30-Day Money-Back Guarantee</p>
              <p className="text-gray-500 text-sm">Not satisfied? We'll refund 100% — no questions asked.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
