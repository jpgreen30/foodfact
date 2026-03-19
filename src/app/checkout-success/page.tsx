'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getCurrentUser, saveCurrentUser } from '@/lib/auth'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const plan = searchParams.get('plan') as 'starter' | 'pro' | null
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!plan) return

    const user = getCurrentUser()
    if (user) {
      const updated = { ...user, plan }
      if (plan === 'starter') {
        updated.scanCredits = (user.scanCredits ?? 0) + 50
      }
      saveCurrentUser(updated)
    }

    const t = setTimeout(() => setReady(true), 1200)
    return () => clearTimeout(t)
  }, [plan])

  const handleContinue = () => {
    const user = getCurrentUser()
    if (user?.onboardingComplete) {
      router.push('/dashboard')
    } else {
      router.push('/onboarding')
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Activating your plan…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-brand-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {plan === 'pro' ? 'Welcome to Pro!' : '50 Scans Unlocked!'}
        </h1>
        <p className="text-gray-500 mb-2">
          {plan === 'pro'
            ? 'You now have unlimited scans and access to all Pro features.'
            : 'Your 50 scan credits have been added to your account — they never expire.'}
        </p>
        <p className="text-gray-400 text-sm mb-8">
          {plan === 'pro'
            ? 'Your subscription is active. Cancel anytime.'
            : 'Need more later? Top up anytime from your profile.'}
        </p>
        <button
          onClick={handleContinue}
          className="w-full btn-primary py-3 rounded-xl font-bold text-sm"
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  )
}
