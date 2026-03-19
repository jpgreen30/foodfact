'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'
import { MomStatus } from '@/lib/types'

interface Props {
  data: OnboardingData
  update: (p: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const STATUS_OPTIONS: { value: MomStatus; label: string; emoji: string; desc: string }[] = [
  { value: 'planning', emoji: '💭', label: 'Planning to Conceive', desc: 'Getting ready for pregnancy' },
  { value: 'expecting', emoji: '🤰', label: 'Currently Expecting', desc: 'Pregnant and preparing' },
  { value: 'newborn', emoji: '👶', label: 'New Baby (0-12 months)', desc: 'Just starting solid foods journey' },
  { value: 'toddler', emoji: '🧒', label: 'Toddler (1-3 years)', desc: 'Growing and exploring foods' },
  { value: 'other', emoji: '👩‍👧', label: 'Other / Multiple Children', desc: 'Family with various ages' },
]

export default function StepJourney({ data, update, onNext, onBack }: Props) {
  const needsBabyDate = data.momStatus === 'newborn' || data.momStatus === 'toddler'
  const canContinue =
    !!data.momStatus &&
    (data.momStatus !== 'expecting' || !!data.dueDate) &&
    (!needsBabyDate || !!data.babyBirthDate)

  const handleStatusSelect = (status: MomStatus) => {
    update({ momStatus: status })
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Where are you on your journey?</h2>
        <p className="text-gray-500">This helps us personalize safety thresholds and recommendations for you.</p>
      </div>

      <div className="space-y-3 mb-8">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleStatusSelect(opt.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left hover:shadow-md ${
              data.momStatus === opt.value
                ? 'border-brand-500 bg-brand-50 shadow-md'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <span className="text-3xl">{opt.emoji}</span>
            <div className="flex-1">
              <p className={`font-semibold ${data.momStatus === opt.value ? 'text-brand-700' : 'text-gray-800'}`}>
                {opt.label}
              </p>
              <p className="text-sm text-gray-500">{opt.desc}</p>
            </div>
            {data.momStatus === opt.value && (
              <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Conditional date fields */}
      {data.momStatus === 'expecting' && (
        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-pink-800 mb-3">
            📅 When is your due date? <span className="text-red-500">*</span>
          </h3>
          <input
            type="date"
            value={data.dueDate}
            onChange={e => update({ dueDate: e.target.value })}
            className={`input-field ${!data.dueDate ? 'border-red-300 focus:border-red-400' : ''}`}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          {!data.dueDate && (
            <p className="text-red-500 text-xs mt-1 font-medium">Required — needed to personalise your trimester tips.</p>
          )}
          {data.dueDate && (
            <p className="text-pink-600 text-xs mt-2">
              We'll use this to track your trimester and adjust prenatal safety recommendations.
            </p>
          )}
        </div>
      )}

      {(data.momStatus === 'newborn' || data.momStatus === 'toddler') && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 space-y-4">
          <h3 className="font-bold text-blue-800">👶 Tell us about your baby</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Baby's Name (optional)</label>
            <input
              type="text"
              value={data.babyName}
              onChange={e => update({ babyName: e.target.value })}
              placeholder="e.g., Lily"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={data.babyBirthDate}
              onChange={e => {
                const dob = new Date(e.target.value)
                const now = new Date()
                const ageMs = now.getTime() - dob.getTime()
                const ageMonths = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 30.44))
                update({ babyBirthDate: e.target.value, babyAgeMonths: Math.max(0, ageMonths) })
              }}
              className={`input-field ${!data.babyBirthDate ? 'border-red-300 focus:border-red-400' : ''}`}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            {!data.babyBirthDate && (
              <p className="text-red-500 text-xs mt-1 font-medium">Required — used to personalise age-specific safety tips.</p>
            )}
          </div>
          {data.babyAgeMonths > 0 && (
            <div className="bg-blue-100 rounded-xl p-3">
              <p className="text-blue-700 text-sm font-semibold">
                🎂 Age: {data.babyAgeMonths} months
              </p>
              <p className="text-blue-600 text-xs mt-1">
                {data.babyAgeMonths < 6
                  ? "Safety thresholds set for 0-6 months (most sensitive)"
                  : data.babyAgeMonths < 12
                  ? "Safety thresholds set for 6-12 months"
                  : "Safety thresholds set for 12+ months"}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="btn-primary flex items-center gap-2 flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
