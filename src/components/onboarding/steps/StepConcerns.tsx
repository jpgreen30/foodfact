'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'
import { Concern } from '@/lib/types'

interface Props {
  data: OnboardingData
  update: (p: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const CONCERN_OPTIONS: { value: Concern; emoji: string; label: string; desc: string; severity: string }[] = [
  {
    value: 'heavy-metals',
    emoji: '⚗️',
    label: 'Heavy Metals (Lead, Arsenic, Cadmium)',
    desc: 'Developmental, cognitive & cancer risks',
    severity: 'Critical',
  },
  {
    value: 'pesticides',
    emoji: '🌿',
    label: 'Pesticide Residues',
    desc: 'Neurotoxins linked to developmental delays',
    severity: 'High',
  },
  {
    value: 'artificial-additives',
    emoji: '🎨',
    label: 'Artificial Colors & Preservatives',
    desc: 'Linked to ADHD and hyperactivity',
    severity: 'Medium',
  },
  {
    value: 'allergens',
    emoji: '🤧',
    label: 'Top 9 Allergens',
    desc: 'Milk, eggs, peanuts, tree nuts, soy, wheat, fish, shellfish, sesame',
    severity: 'Variable',
  },
  {
    value: 'bpa',
    emoji: '🧴',
    label: 'BPA, BPS & Phthalates',
    desc: 'Endocrine disruptors from plastic packaging',
    severity: 'Medium',
  },
  {
    value: 'nitrates',
    emoji: '🥬',
    label: 'Nitrates & Nitrites',
    desc: 'Risk of infant methemoglobinemia',
    severity: 'High',
  },
  {
    value: 'sugar',
    emoji: '🍭',
    label: 'Added Sugars & Sweeteners',
    desc: 'WHO recommends zero added sugar for under 2s',
    severity: 'Medium',
  },
  {
    value: 'sodium',
    emoji: '🧂',
    label: 'High Sodium Content',
    desc: 'Kidney stress and long-term hypertension risk',
    severity: 'Medium',
  },
]

const severityColors: Record<string, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Variable: 'bg-purple-100 text-purple-700',
}

export default function StepConcerns({ data, update, onNext, onBack }: Props) {
  const toggle = (val: Concern) => {
    const current = data.concerns
    if (current.includes(val)) {
      update({ concerns: current.filter(c => c !== val) })
    } else {
      update({ concerns: [...current, val] })
    }
  }

  const isSelected = (val: Concern) => data.concerns.includes(val)

  const selectAll = () => update({ concerns: CONCERN_OPTIONS.map(o => o.value) })
  const clearAll = () => update({ concerns: [] })

  return (
    <div>
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 py-1.5 mb-3">
          <span className="text-red-600 text-sm font-semibold">⚠️ Safety Concerns</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          What are you most concerned about?
        </h2>
        <p className="text-gray-500 text-sm">
          We'll prioritize these in your scan results and send alerts when detected. We recommend selecting all.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={selectAll} className="text-sm text-brand-600 font-semibold hover:underline">
          Select All (Recommended)
        </button>
        <span className="text-gray-300">·</span>
        <button onClick={clearAll} className="text-sm text-gray-400 hover:text-gray-600">
          Clear
        </button>
      </div>

      <div className="space-y-2 mb-6">
        {CONCERN_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              isSelected(opt.value)
                ? 'border-red-300 bg-red-50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <span className="text-2xl mt-0.5">{opt.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className={`font-semibold text-sm ${isSelected(opt.value) ? 'text-red-700' : 'text-gray-800'}`}>
                  {opt.label}
                </p>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${severityColors[opt.severity]}`}>
                  {opt.severity}
                </span>
              </div>
              <p className="text-xs text-gray-400">{opt.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
              isSelected(opt.value) ? 'bg-red-500 border-red-500' : 'border-gray-300'
            }`}>
              {isSelected(opt.value) && <span className="text-white text-xs">✓</span>}
            </div>
          </button>
        ))}
      </div>

      {data.concerns.length > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6">
          <p className="text-brand-700 text-sm font-semibold">
            ✓ Monitoring {data.concerns.length} concern{data.concerns.length !== 1 ? 's' : ''}
          </p>
          <p className="text-brand-600 text-xs mt-1">
            Every scan will prioritize these and alert you when found.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2 flex-1 justify-center">
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
