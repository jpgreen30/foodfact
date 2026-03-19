'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface Props {
  data: OnboardingData
  update: (p: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const POSTNATAL_CONDITIONS = [
  { id: 'postpartum-depression', label: 'Postpartum Depression / Anxiety', icon: '💙', desc: 'Nutritional support for mental health' },
  { id: 'thyroid', label: 'Postpartum Thyroiditis', icon: '🦋', desc: 'Iodine and selenium tracking' },
  { id: 'diastasis', label: 'Diastasis Recti', icon: '💪', desc: 'Core recovery nutrition' },
  { id: 'hair-loss', label: 'Postpartum Hair Loss', icon: '💇', desc: 'Iron, zinc, and biotin monitoring' },
  { id: 'anemia', label: 'Postpartum Anemia', icon: '🔴', desc: 'Iron absorption optimization' },
  { id: 'c-section', label: 'C-Section Recovery', icon: '🏥', desc: 'Wound healing nutrition' },
  { id: 'mastitis', label: 'Mastitis / Breastfeeding Issues', icon: '🤱', desc: 'Breastfeeding-safe food guidance' },
  { id: 'none', label: 'No conditions', icon: '✅', desc: 'Healthy recovery' },
]

export default function StepPostNatal({ data, update, onNext, onBack }: Props) {
  const toggle = (id: string) => {
    const current = data.postnatalConditions
    if (id === 'none') {
      update({ postnatalConditions: ['none'] })
      return
    }
    const withoutNone = current.filter(c => c !== 'none')
    if (withoutNone.includes(id)) {
      update({ postnatalConditions: withoutNone.filter(c => c !== id) })
    } else {
      update({ postnatalConditions: [...withoutNone, id] })
    }
  }

  const isSelected = (id: string) => data.postnatalConditions.includes(id)

  return (
    <div>
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 mb-3">
          <span className="text-blue-600 text-sm font-semibold">🤱 Postnatal Health Profile</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          How are you doing postpartum?
        </h2>
        <p className="text-gray-500 text-sm">
          Your recovery and wellbeing matter too. We'll personalize recommendations for both you and your baby.
        </p>
      </div>

      {/* Breastfeeding toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4">
        <h3 className="font-bold text-blue-800 mb-3">Are you currently breastfeeding?</h3>
        <div className="flex gap-3">
          {[
            { val: true, label: '🤱 Yes, breastfeeding', desc: "We'll check foods for breastmilk-safety" },
            { val: false, label: '🍼 No / Formula feeding', desc: "We'll focus on formula safety & intro foods" },
          ].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => update({ breastfeeding: opt.val })}
              className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                data.breastfeeding === opt.val
                  ? 'border-blue-400 bg-blue-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className={`font-semibold text-sm ${data.breastfeeding === opt.val ? 'text-blue-700' : 'text-gray-700'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {data.breastfeeding && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
          <p className="text-purple-700 text-sm font-semibold mb-1">🥛 Breastfeeding Mom Mode</p>
          <p className="text-purple-600 text-xs">
            We'll flag foods that may affect milk supply, taste, or safety including caffeine thresholds, alcohol, and foods linked to infant colic.
          </p>
        </div>
      )}

      <h3 className="font-bold text-gray-800 mb-3">Any postpartum health conditions?</h3>
      <div className="space-y-2 mb-6">
        {POSTNATAL_CONDITIONS.map(cond => (
          <button
            key={cond.id}
            onClick={() => toggle(cond.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              isSelected(cond.id)
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <span className="text-2xl">{cond.icon}</span>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${isSelected(cond.id) ? 'text-blue-700' : 'text-gray-800'}`}>
                {cond.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{cond.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
              isSelected(cond.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            }`}>
              {isSelected(cond.id) && <span className="text-white text-xs">✓</span>}
            </div>
          </button>
        ))}
      </div>

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
