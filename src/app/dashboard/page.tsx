'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/types'
import UserDashboard from '@/components/dashboard/UserDashboard'
import { Loader2 } from 'lucide-react'

function profileToUser(profile: Record<string, unknown>): User {
  return {
    id: profile.id as string,
    email: profile.email as string,
    name: (profile.name as string) || '',
    role: 'user',
    plan: (profile.plan as 'free' | 'starter' | 'pro') || 'free',
    onboardingComplete: (profile.onboarding_complete as boolean) || false,
    createdAt: profile.created_at as string,
    scansUsed: (profile.scans_used as number) || 0,
    scanCredits: (profile.scan_credits as number) || 0,
    totalScans: (profile.total_scans as number) || 0,
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data: { user: authUser }, error }) => {
        if (error || !authUser) {
          router.push('/login')
          return
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        if (!profile) {
          router.push('/login')
          return
        }
        if (!profile.onboarding_complete) {
          router.push('/onboarding')
          return
        }
        setUser(profileToUser(profile))
        setLoading(false)
      })
    })
  }, [router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return <UserDashboard user={user} />
}
