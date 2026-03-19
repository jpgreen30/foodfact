'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface Props {
  data: OnboardingData
  update: (p: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const COMMON_ALLERGENS = [
  { name: 'Milk / Dairy', emoji: '🥛' },
  { name: 'Eggs', emoji: '🥚' },
  { name: 'Peanuts', emoji: '🥜' },
  { name: 'Tree Nuts', emoji: '🌰' },
  { name: 'Soy', emoji: '🫘' },
  { name: 'Wheat / Gluten', emoji: '🌾' },
  { name: 'Fish', emoji: '🐟' },
  { name: 'Shellfish', emoji: '🦐' },
  { name: 'Sesame', emoji: '🌻' },
]

export default function StepAllergies({ data, update, onNext, onBack }: Props) {
  const [custom, setCustom] = useState('')

  const toggleAllergen = (name: string) => {
    const current = data.allergies
    if (current.includes(name)) {
      update({ allergies: current.filter(a => a !== name) })
    } else {
      update({ allergies: [...current, name] })
    }
  }

  const addCustom = () => {
    const trimmed = custom.trim()
    if (trimmed && !data.allergies.includes(trimmed)) {
      update({ allergies: [...data.allergies, trimmed] })
      setCustom('')
    }
  }

  const removeAllergen = (name: string) => {
    update({ allergies: data.allergies.filter(a => a !== name) })
  }

  return (
    <div>
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5 mb-3">
          <span className="text-orange-600 text-sm font-semibold">🤧 Allergies & Intolerances</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Any known allergies or intolerances?
        </h2>
        <p className="text-gray-500 text-sm">
          We'll alert you to these in every scan — even hidden sources of allergens in ingredient lists.
        </p>
      </div>

      {/* Common allergens */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Top 9 Allergens (tap to select)</p>
        <div className="grid grid-cols-3 gap-2">
          {COMMON_ALLERGENS.map(allergen => (
            <button
              key={allergen.name}
              onClick={() => toggleAllergen(allergen.name)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                data.allergies.includes(allergen.name)
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">{allergen.emoji}</span>
              <span className={`text-xs font-semibold text-center leading-tight ${
                data.allergies.includes(allergen.name) ? 'text-orange-700' : 'text-gray-600'
              }`}>{allergen.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom allergen input */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-2">Add other allergens</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="e.g., Corn, Sulfites, Mango..."
            className="input-field flex-1"
          />
          <button
            onClick={addCustom}
            disabled={!custom.trim()}
            className="btn-primary flex items-center gap-1 px-4 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Selected allergies */}
      {data.allergies.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-orange-800 mb-2">
            🚨 Monitoring {data.allergies.length} allergen{data.allergies.length !== 1 ? 's' : ''}:
          </p>
          <div className="flex flex-wrap gap-2">
            {data.allergies.map(a => (
              <button
                key={a}
                onClick={() => removeAllergen(a)}
                className="flex items-center gap-1.5 bg-white border border-orange-200 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
              >
                {a}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
          <p className="text-orange-600 text-xs mt-2">Tap any to remove · Click ✕ to clear</p>
        </div>
      )}

      {data.allergies.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
          <p className="text-gray-500 text-sm">
            No allergies selected. You can always add these later in your profile settings.
          </p>
        </div>
      )}

      {/* What this means */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider mb-1">How Allergen Alerts Work</p>
        <p className="text-sm text-blue-600">
          We flag not just obvious allergens but also hidden sources — like "natural flavors" that may contain dairy,
          or "modified starch" that may contain gluten. We also track cross-contamination warnings.
        </p>
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
