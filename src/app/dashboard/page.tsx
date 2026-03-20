'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/types'
import UserDashboard from '@/components/dashboard/UserDashboard'
import { Loader2 } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'

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
    let unsubscribe: (() => void) | null = null

    async function init() {
      try {
        // Fast path: check localStorage before touching Supabase
        const sbSession = localStorage.getItem('sb-session')

        if (!sbSession) {
          // No Supabase session — use localStorage mock user
          const localUser = getCurrentUser()
          if (!localUser) {
            router.push('/login')
            return
          }
          if (!localUser.onboardingComplete) {
            router.push('/onboarding')
            return
          }
          setUser(localUser)
          setLoading(false)
          return
        }

        // Real Supabase session exists — use onAuthStateChange
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (!session) {
              const localUser = getCurrentUser()
              if (localUser?.onboardingComplete) {
                setUser(localUser)
                setLoading(false)
              } else {
                router.push(localUser ? '/onboarding' : '/login')
              }
              return
            }
            // Fetch profile from Supabase (non-auth call, no lock conflict)
            Promise.resolve(
              supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()
            ).then(({ data: profile }) => {
              if (!profile || !profile.onboarding_complete) {
                router.push('/onboarding')
                return
              }
              setUser(profileToUser(profile))
              setLoading(false)
            }).catch(() => {
              // Supabase unreachable — fall back to localStorage
              const localUser = getCurrentUser()
              if (localUser?.onboardingComplete) {
                setUser(localUser)
                setLoading(false)
              } else {
                router.push('/login')
              }
            })
          } else if (event === 'SIGNED_OUT') {
            router.push('/login')
          }
        })

        unsubscribe = () => subscription.unsubscribe()
      } catch {
        // Last resort: try localStorage
        const localUser = getCurrentUser()
        if (localUser?.onboardingComplete) {
          setUser(localUser)
          setLoading(false)
        } else {
          router.push('/login')
        }
      }
    }

    init()
    return () => unsubscribe?.()
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
