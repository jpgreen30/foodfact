'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/types'
import ProfileSettings from '@/components/dashboard/ProfileSettings'
import { getCurrentUser } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
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
            // Fetch profile from Supabase
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
              const userWithProfile: User = {
                id: profile.id,
                email: profile.email,
                name: profile.name || '',
                role: 'user',
                plan: (profile.plan as 'free' | 'starter' | 'pro') || 'free',
                onboardingComplete: profile.onboarding_complete,
                createdAt: profile.created_at,
                scansUsed: profile.scans_used || 0,
                scanCredits: profile.scan_credits || 0,
                totalScans: profile.total_scans || 0,
                profile: {
                  momStatus: profile.mom_status,
                  dueDate: profile.due_date,
                  babyBirthDate: profile.baby_birth_date,
                  babyName: profile.baby_name,
                  babyAgeMonths: profile.baby_age_months,
                  diet: profile.diet || [],
                  concerns: profile.concerns || [],
                  allergies: profile.allergies || [],
                  prenatalConditions: profile.prenatal_conditions || [],
                  postnatalConditions: profile.postnatal_conditions || [],
                  breastfeeding: profile.breastfeeding || false,
                  organicPreference: profile.organic_preference || false,
                  notificationsEnabled: profile.notifications_enabled || false,
                  weeklyReportEnabled: profile.weekly_report_enabled || false,
                },
              }
              setUser(userWithProfile)
              setLoading(false)
            }).catch(() => {
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
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  return <ProfileSettings user={user} />
}
