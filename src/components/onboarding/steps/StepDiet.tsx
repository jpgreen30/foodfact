'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'
import { DietType } from '@/lib/types'

interface Props {
  data: OnboardingData
  update: (p: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const DIET_OPTIONS: { value: DietType; emoji: string; label: string; desc: string }[] = [
  { value: 'omnivore', emoji: '🥩', label: 'Omnivore', desc: 'Eats all foods including meat and dairy' },
  { value: 'vegetarian', emoji: '🥗', label: 'Vegetarian', desc: 'No meat, but eats dairy and eggs' },
  { value: 'vegan', emoji: '🌱', label: 'Vegan', desc: 'No animal products at all' },
  { value: 'gluten-free', emoji: '🌾', label: 'Gluten-Free', desc: 'Avoiding wheat, barley, rye' },
  { value: 'dairy-free', emoji: '🥛', label: 'Dairy-Free', desc: 'No milk products or lactose' },
  { value: 'organic-only', emoji: '🌿', label: 'Organic Only', desc: 'Strictly USDA Certified Organic' },
]

export default function StepDiet({ data, update, onNext, onBack }: Props) {
  const toggle = (val: DietType) => {
    const current = data.diet
    if (current.includes(val)) {
      update({ diet: current.filter(d => d !== val) })
    } else {
      update({ diet: [...current, val] })
    }
  }

  const isSelected = (val: DietType) => data.diet.includes(val)

  return (
    <div>
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 mb-3">
          <span className="text-green-600 text-sm font-semibold">🥗 Diet & Nutrition</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">What's your diet style?</h2>
        <p className="text-gray-500 text-sm">Select all that apply. We'll customize recommendations to match your values.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {DIET_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              isSelected(opt.value)
                ? 'border-green-400 bg-green-50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${isSelected(opt.value) ? 'text-green-700' : 'text-gray-800'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isSelected(opt.value) ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {isSelected(opt.value) && <span className="text-white text-xs">✓</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Organic preference */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-green-800 mb-3">🌿 Organic Preference</h3>
        <p className="text-sm text-gray-600 mb-3">
          Even if not strictly organic-only, do you prefer organic baby food when available?
        </p>
        <div className="flex gap-3">
          {[
            { val: true, label: 'Yes, prefer organic' },
            { val: false, label: 'No strong preference' },
          ].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => update({ organicPreference: opt.val })}
              className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                data.organicPreference === opt.val
                  ? 'border-green-500 bg-green-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* What this affects */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">How Diet Affects Recommendations</p>
        <div className="space-y-1.5 text-sm text-gray-600">
          {[
            '✓ Safer alternatives will match your diet style',
            '✓ Vegan/vegetarian iron sources highlighted',
            '✓ Gluten/dairy-free products prioritized',
            '✓ Organic products get preference in rankings',
          ].map(item => (
            <p key={item}>{item}</p>
          ))}
        </div>
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
