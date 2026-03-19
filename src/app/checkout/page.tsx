'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!plan) {
      setError('No plan selected.')
      return
    }

    const user = getCurrentUser()

    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, userId: user?.id ?? null }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          window.location.href = data.url
        } else {
          setError(data.error || 'Something went wrong. Please try again.')
        }
      })
      .catch(() => setError('Network error. Please try again.'))
  }, [plan])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <a href="/#pricing" className="btn-primary px-6 py-2 inline-block rounded-xl text-sm font-bold">
            Back to Pricing
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Redirecting to checkout…</p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading…</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
