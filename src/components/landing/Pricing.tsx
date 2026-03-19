'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Zap } from 'lucide-react'

export default function Pricing() {
  const [annual, setAnnual] = useState(true)

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for trying out FoodFactScanner',
      badge: null,
      features: [
        '5 scans per month',
        'Basic safety scores',
        'Top 3 chemical alerts',
        'FDA recall notifications',
        'Basic scan history (30 days)',
      ],
      notIncluded: [
        'Unlimited scans',
        'Detailed chemical breakdown',
        'Safer alternatives',
        'Exposure tracking',
        'Pre/Post-natal tools',
        'Weekly safety reports',
        'Priority support',
      ],
      cta: 'Start Free',
      ctaLink: '/login?signup=true&plan=free',
      highlight: false,
    },
    {
      name: 'Pro',
      price: { monthly: 9.99, annual: 6.99 },
      description: 'For parents who want complete peace of mind',
      badge: 'Most Popular',
      features: [
        'Unlimited scans',
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
      notIncluded: [
        'Family member profiles',
        'Dedicated phone support',
      ],
      cta: 'Start 7-Day Free Trial',
      ctaLink: '/login?signup=true&plan=pro',
      highlight: true,
    },
    {
      name: 'Family',
      price: { monthly: 14.99, annual: 10.99 },
      description: 'For families with multiple children',
      badge: 'Best Value',
      features: [
        'Everything in Pro',
        'Up to 5 child profiles',
        'Per-child exposure tracking',
        'Partner account included',
        'Pediatrician-shareable reports',
        'Priority phone & chat support',
        'Early access to new features',
        'Annual safety summary report',
        'Dedicated family advisor',
      ],
      notIncluded: [],
      cta: 'Start 7-Day Free Trial',
      ctaLink: '/login?signup=true&plan=family',
      highlight: false,
    },
  ]

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
          <p className="text-lg text-gray-600 mb-8">
            Start free. Upgrade anytime. Cancel anytime. No contracts.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!annual ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Annual
              <span className="bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">Save 30%</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border-2 p-7 relative transition-transform hover:-translate-y-1 ${
                plan.highlight
                  ? 'bg-brand-600 border-brand-500 shadow-2xl shadow-brand-600/30'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg ${
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
                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-brand-200' : 'text-gray-400'}`}>
                      /month{annual ? ' billed annually' : ''}
                    </span>
                  )}
                </div>
                {plan.price.monthly > 0 && annual && (
                  <p className={`text-sm mt-1 ${plan.highlight ? 'text-brand-200' : 'text-gray-400'}`}>
                    <span className="line-through">${plan.price.monthly}/mo</span> → ${plan.price.annual}/mo
                  </p>
                )}
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
                {plan.name !== 'Free' && <Zap className="w-4 h-4" />}
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
          ))}
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
