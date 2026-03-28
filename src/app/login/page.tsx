'use client'

import { useState, Suspense, useEffect } from 'react'
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Check authentication status to conditionally show Pinterest button
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

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

          {/* Pinterest OAuth button - show only when not authenticated */}
          {isAuthenticated === false && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              <div className="space-y-3">
                <a
                  href="/api/auth/twitter"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#1DA1F2] rounded-xl hover:bg-[#1DA1F2]/5 transition-colors"
                >
                  <svg className="w-5 h-5 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="font-semibold text-gray-700">Continue with Twitter</span>
                </a>
                <a
                  href="/api/auth/pinterest"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-semibold text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.169 1.775 2.169 2.133 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.161-1.499-.69-2.436-2.878-2.436-4.632 0-3.78 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.92 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 12-5.373 12-12S18.607 0 12 0z"/>
                  </svg>
                  <span className="font-semibold text-gray-700">Connect Pinterest</span>
                </a>
              </div>
            </>
          )}
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
