import { ChevronRight, Shield, Scan, Heart } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface Props {
  data: OnboardingData
  update: (p: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepWelcome({ onNext }: Props) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/30">
        <Shield className="w-10 h-10 text-white" />
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-3">
        Welcome to FoodFactScanner! 🎉
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
        Let's personalize your experience so we can give you the most relevant safety insights for you and your baby.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 text-left max-w-md mx-auto space-y-4">
        {[
          { icon: Scan, title: 'Personalized Scanning', desc: "We'll tune alerts to your baby's specific age and needs." },
          { icon: Heart, title: 'Pre & Post-Natal Support', desc: "Track your pregnancy journey and recovery with tailored recommendations." },
          { icon: Shield, title: 'Your Concern Profile', desc: "Tell us what matters most and we'll prioritize those in every scan." },
        ].map(item => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Takes about 2 minutes · Your data is private and encrypted
      </p>

      <button
        onClick={onNext}
        className="btn-primary flex items-center gap-2 mx-auto"
      >
        Let's Get Started
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
