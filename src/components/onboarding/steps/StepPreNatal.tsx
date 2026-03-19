'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface Props {
  data: OnboardingData
  update: (p: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const PRENATAL_CONDITIONS = [
  { id: 'gestational-diabetes', label: 'Gestational Diabetes', icon: '🩸', desc: 'Monitor sugar content in all foods' },
  { id: 'hypertension', label: 'Pregnancy Hypertension / Preeclampsia', icon: '❤️', desc: 'Track sodium levels carefully' },
  { id: 'anemia', label: 'Iron Deficiency Anemia', icon: '🔴', desc: 'Monitor iron absorption inhibitors' },
  { id: 'thyroid', label: 'Thyroid Condition', icon: '🦋', desc: 'Track iodine and perchlorate levels' },
  { id: 'gbs', label: 'Group B Strep (GBS)', icon: '🦠', desc: 'Food safety guidance for GBS' },
  { id: 'morning-sickness', label: 'Severe Morning Sickness (HG)', icon: '🤢', desc: 'Gentle food recommendations' },
  { id: 'cholestasis', label: 'Intrahepatic Cholestasis', icon: '🫀', desc: 'Dietary fat monitoring' },
  { id: 'none', label: 'None of the above', icon: '✅', desc: 'Low-risk pregnancy' },
]

export default function StepPreNatal({ data, update, onNext, onBack }: Props) {
  const toggle = (id: string) => {
    const current = data.prenatalConditions
    if (id === 'none') {
      update({ prenatalConditions: ['none'] })
      return
    }
    const withoutNone = current.filter(c => c !== 'none')
    if (withoutNone.includes(id)) {
      update({ prenatalConditions: withoutNone.filter(c => c !== id) })
    } else {
      update({ prenatalConditions: [...withoutNone, id] })
    }
  }

  const isSelected = (id: string) => data.prenatalConditions.includes(id)

  return (
    <div>
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-full px-3 py-1.5 mb-3">
          <span className="text-pink-600 text-sm font-semibold">🤰 Prenatal Health Profile</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Any pregnancy health conditions?
        </h2>
        <p className="text-gray-500 text-sm">
          We'll customize safety alerts based on your specific health needs. Select all that apply.
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {PRENATAL_CONDITIONS.map(cond => (
          <button
            key={cond.id}
            onClick={() => toggle(cond.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              isSelected(cond.id)
                ? 'border-pink-400 bg-pink-50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <span className="text-2xl">{cond.icon}</span>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${isSelected(cond.id) ? 'text-pink-700' : 'text-gray-800'}`}>
                {cond.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{cond.desc}</p>
            </div>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              isSelected(cond.id) ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
            }`}>
              {isSelected(cond.id) && <span className="text-white text-xs">✓</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Key nutrients to monitor */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-purple-800 mb-3">📊 Nutrients We'll Track for You</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Folate/Folic Acid', importance: 'Neural tube development' },
            { name: 'Iron', importance: 'Prevent anemia' },
            { name: 'DHA Omega-3', importance: 'Brain development' },
            { name: 'Calcium & Vit D', importance: 'Bone health' },
            { name: 'Iodine', importance: 'Thyroid & brain' },
            { name: 'Choline', importance: 'Brain & memory' },
          ].map(n => (
            <div key={n.name} className="bg-white/70 rounded-lg p-2">
              <p className="text-xs font-bold text-purple-700">{n.name}</p>
              <p className="text-xs text-gray-500">{n.importance}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Foods to avoid during pregnancy */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-red-700 mb-2">⚠️ We'll Alert You About</h3>
        <div className="flex flex-wrap gap-2">
          {['High-mercury fish', 'Raw/undercooked meats', 'Unpasteurized cheese', 'Deli meats', 'Excess caffeine', 'Alcohol traces', 'High-retinol supplements', 'Herbal supplements'].map(item => (
            <span key={item} className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">{item}</span>
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
