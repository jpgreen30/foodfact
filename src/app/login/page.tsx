'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Scan, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getUser, saveCurrentUser } from '@/lib/auth'
import Logo from '@/components/Logo'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSignup = searchParams.get('signup') === 'true'

  const [mode, setMode] = useState<'login' | 'signup'>(isSignup ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        // Create the user server-side (admin API, email auto-confirmed)
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name || email.split('@')[0] }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Something went wrong. Please try again.')
          setLoading(false)
          return
        }

        // Mock fallback (dev: Supabase unreachable) — also handle non-mock success the same way
        const userId = data.user?.id ?? ('mock-' + Date.now())
        const userName = data.user?.name ?? name ?? email.split('@')[0]
        saveCurrentUser({
          id: userId,
          email,
          name: userName,
          role: 'user',
          plan: 'free',
          onboardingComplete: false,
          createdAt: new Date().toISOString(),
          scansUsed: 0,
          scanCredits: 3,
          totalScans: 0,
        })

        // Also try to establish a real Supabase browser session (best-effort, non-blocking)
        if (!data.mock) {
          createClient().auth.signInWithPassword({ email, password }).catch(() => {})
        }

        router.push('/onboarding')
      } else {
        const supabase = createClient()
        const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password }).catch(() => ({ data: null, error: new Error('network') }))
        if (error || !signInData?.user) {
          // Try mock auth fallback (dev mode)
          const mockUser = getUser(email, password)
          if (mockUser) {
            saveCurrentUser(mockUser)
            router.push(mockUser.onboardingComplete ? '/dashboard' : '/onboarding')
            return
          }
          setError(error?.message || 'Invalid email or password.')
          setLoading(false)
          return
        }

        // Check onboarding status directly via browser client
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', signInData.user.id)
          .single()
        if (profile?.onboarding_complete) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[signup] uncaught error:', msg, err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Logo height={44} />
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {mode === 'signup' ? 'Create your free account' : 'Welcome back, parent!'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Sign Up Free
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Log In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Sarah Johnson"
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {mode === 'signup' ? 'Create Password (min. 6 characters)' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  required
                  minLength={6}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
              {mode === 'signup' ? 'Create Free Account' : 'Log In'}
            </button>
          </form>

          {mode === 'signup' && (
            <div className="mt-6 space-y-2">
              {[
                'Free account — no credit card required',
                '3 free scans to start',
                'Upgrade anytime from $4.99',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          )}

          {mode === 'login' && (
            <p className="text-center text-sm text-gray-500 mt-4">
              <a href="/forgot-password" className="text-brand-600 hover:underline">Forgot password?</a>
            </p>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="text-brand-600 font-semibold hover:underline"
            >
              {mode === 'signup' ? 'Log in' : 'Sign up free'}
            </button>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          By continuing, you agree to our{' '}
          <a href="#" className="underline">Terms</a> and{' '}
          <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
