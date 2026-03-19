'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types'
import UserDashboard from '@/components/dashboard/UserDashboard'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (!currentUser.onboardingComplete) {
      router.push('/onboarding')
      return
    }
    if (currentUser.role === 'admin') {
      router.push('/admin')
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return <UserDashboard user={user} />
}
