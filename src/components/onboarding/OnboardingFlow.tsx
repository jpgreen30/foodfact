'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import Logo from '@/components/Logo'
import { getCurrentUser, saveCurrentUser } from '@/lib/auth'
import { MomStatus, DietType, Concern } from '@/lib/types'

import StepWelcome from './steps/StepWelcome'
import StepJourney from './steps/StepJourney'
import StepPreNatal from './steps/StepPreNatal'
import StepPostNatal from './steps/StepPostNatal'
import StepDiet from './steps/StepDiet'
import StepConcerns from './steps/StepConcerns'
import StepAllergies from './steps/StepAllergies'
import StepNotifications from './steps/StepNotifications'
import StepComplete from './steps/StepComplete'

export interface OnboardingData {
  momStatus: MomStatus
  dueDate: string
  babyName: string
  babyBirthDate: string
  babyAgeMonths: number
  prenatalConditions: string[]
  postnatalConditions: string[]
  breastfeeding: boolean
  diet: DietType[]
  concerns: Concern[]
  allergies: string[]
  organicPreference: boolean
  notificationsEnabled: boolean
  weeklyReportEnabled: boolean
}

const INITIAL_DATA: OnboardingData = {
  momStatus: 'expecting',
  dueDate: '',
  babyName: '',
  babyBirthDate: '',
  babyAgeMonths: 0,
  prenatalConditions: [],
  postnatalConditions: [],
  breastfeeding: false,
  diet: [],
  concerns: [],
  allergies: [],
  organicPreference: false,
  notificationsEnabled: true,
  weeklyReportEnabled: true,
}

const STEPS = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'journey', label: 'Your Journey' },
  { id: 'prenatal', label: 'Health' },
  { id: 'diet', label: 'Diet' },
  { id: 'concerns', label: 'Concerns' },
  { id: 'allergies', label: 'Allergies' },
  { id: 'notifications', label: 'Alerts' },
  { id: 'complete', label: 'Done' },
]

export default function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const totalVisibleSteps = STEPS.length - 1 // exclude "complete"

  const update = (partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }))
  }

  const next = () => {
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => setStep(s => Math.max(s - 1, 0))

  const complete = async () => {
    setSaving(true)
    setSaveError(null)

    // Fast path: if no Supabase session token in storage, skip network calls entirely
    const sbSession = typeof window !== 'undefined'
      ? localStorage.getItem('sb-session')
      : null

    if (!sbSession) {
      const localUser = getCurrentUser()
      if (localUser) {
        saveCurrentUser({ ...localUser, onboardingComplete: true })
      }
      router.push('/dashboard')
      return
    }

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    // Wrap getSession in a timeout so a dead Supabase connection doesn't hang forever
    let session = null
    try {
      const result = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000)
        ),
      ])
      session = (result as Awaited<ReturnType<typeof supabase.auth.getSession>>).data.session
    } catch {
      // Supabase unreachable — fall through to mock path
    }

    let saved = false

    if (session?.access_token) {
      const userProfile = {
        momStatus: data.momStatus,
        dueDate: data.dueDate,
        babyName: data.babyName,
        babyBirthDate: data.babyBirthDate,
        babyAgeMonths: data.babyAgeMonths,
        diet: data.diet,
        concerns: data.concerns,
        allergies: data.allergies,
        prenatalConditions: data.prenatalConditions,
        postnatalConditions: data.postnatalConditions,
        breastfeeding: data.breastfeeding,
        organicPreference: data.organicPreference,
        notificationsEnabled: data.notificationsEnabled,
        weeklyReportEnabled: data.weeklyReportEnabled,
      }

      // Try admin API first (bypasses RLS, handles missing profile row)
      try {
        const res = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ onboarding_complete: true, userProfile }),
        })
        if (res.ok) {
          saved = true
        } else {
          const err = await res.text()
          console.warn('API save failed, trying direct DB fallback:', res.status, err)
        }
      } catch (e) {
        console.warn('API request failed, trying direct DB fallback:', e)
      }

      // Fallback: update directly via browser client (works when profile row exists)
      if (!saved && session.user) {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_complete: true })
          .eq('id', session.user.id)
        if (!error) {
          saved = true
        } else {
          console.error('Direct DB update also failed:', error)
          setSaveError(`Could not save your profile (${error.message}). Please try again.`)
          setSaving(false)
          return
        }
      }
    } else {
      // No Supabase session — update localStorage user and proceed (dev/mock mode)
      const localUser = getCurrentUser()
      if (localUser) {
        saveCurrentUser({ ...localUser, onboardingComplete: true })
      }
      router.push('/dashboard')
      return
    }

    if (saved) {
      router.push('/dashboard')
    }
  }

  const currentStep = STEPS[step]

  const stepProps = { data, update, onNext: next, onBack: back }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Logo height={32} />
          {step < STEPS.length - 1 && (
            <button
              onClick={complete}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {step < STEPS.length - 1 && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {step + 1} of {totalVisibleSteps}
              </span>
              <span className="text-sm text-brand-600 font-semibold">
                {currentStep.label}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / totalVisibleSteps) * 100}%` }}
              />
            </div>
            {/* Step dots */}
            <div className="flex justify-between mt-2">
              {STEPS.slice(0, -1).map((s, i) => (
                <div
                  key={s.id}
                  className={`flex flex-col items-center gap-1 ${i > step ? 'opacity-30' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full transition-all ${
                    i < step ? 'bg-brand-600' :
                    i === step ? 'bg-brand-500 scale-125' :
                    'bg-gray-300'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {saveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {saveError}
            </div>
          )}
          {step === 0 && <StepWelcome {...stepProps} />}
          {step === 1 && <StepJourney {...stepProps} />}
          {step === 2 && (
            data.momStatus === 'expecting'
              ? <StepPreNatal {...stepProps} />
              : <StepPostNatal {...stepProps} />
          )}
          {step === 3 && <StepDiet {...stepProps} />}
          {step === 4 && <StepConcerns {...stepProps} />}
          {step === 5 && <StepAllergies {...stepProps} />}
          {step === 6 && <StepNotifications {...stepProps} />}
          {step === 7 && <StepComplete data={data} onComplete={complete} saving={saving} />}
        </div>
      </div>
    </div>
  )
}
