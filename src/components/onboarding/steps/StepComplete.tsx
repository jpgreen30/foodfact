'use client'

import { Shield, Scan, CheckCircle, Star } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface Props {
  data: OnboardingData
  onComplete: () => void
}

export default function StepComplete({ data, onComplete }: Props) {
  const summaryItems = [
    { label: 'Journey', value: {
      expecting: '🤰 Expecting Mom',
      newborn: '👶 New Baby Mom',
      toddler: '🧒 Toddler Parent',
      planning: '💭 Planning to Conceive',
      other: '👩‍👧 Parent',
    }[data.momStatus] || data.momStatus },
    ...(data.babyName ? [{ label: 'Baby', value: `👶 ${data.babyName}` }] : []),
    ...(data.dueDate ? [{ label: 'Due Date', value: `📅 ${new Date(data.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` }] : []),
    {
      label: 'Concerns Monitored',
      value: data.concerns.length > 0 ? `⚠️ ${data.concerns.length} chemicals` : '⚠️ All chemicals',
    },
    {
      label: 'Diet Profile',
      value: data.diet.length > 0 ? `🥗 ${data.diet.join(', ')}` : '🍽️ No restrictions',
    },
    {
      label: 'Allergens',
      value: data.allergies.length > 0 ? `🤧 ${data.allergies.length} allergens` : '✅ No known allergies',
    },
    {
      label: 'Notifications',
      value: data.notificationsEnabled ? '🔔 Enabled' : '🔕 Off',
    },
  ]

  return (
    <div className="text-center">
      {/* Celebration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/40">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 text-3xl animate-bounce">🎉</div>
        <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-2">
        You're all set!
      </h1>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {data.babyName
          ? `Your profile is personalized for you and ${data.babyName}. Let's start scanning!`
          : "Your safety profile is ready. Let's start protecting your family!"}
      </p>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-left max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-gray-900">Your Safety Profile</h3>
        </div>
        <div className="space-y-3">
          {summaryItems.map(item => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-medium">{item.label}</span>
              <span className="text-gray-800 font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What's next */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 mb-6 text-left max-w-md mx-auto">
        <p className="font-bold text-brand-800 mb-3">🚀 What's waiting in your dashboard:</p>
        <div className="space-y-2">
          {[
            'Start scanning any baby food product',
            'View your personalized safe product picks',
            'Explore our safe alternatives marketplace',
            'Set up recall alerts for saved products',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-brand-700">
              <span className="text-brand-500">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Rating prompt */}
      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6 max-w-md mx-auto">
        <p className="text-yellow-800 text-sm font-medium mb-2">
          Enjoying FoodFactScanner? We'd love your rating!
        </p>
        <div className="flex justify-center gap-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400 cursor-pointer hover:scale-110 transition-transform" />
          ))}
        </div>
      </div>

      <button
        onClick={onComplete}
        className="btn-primary flex items-center gap-2 mx-auto text-lg px-8 py-4"
      >
        <Scan className="w-5 h-5" />
        Go to My Dashboard
      </button>
    </div>
  )
}
