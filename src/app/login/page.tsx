'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shield, Eye, EyeOff, Scan, CheckCircle } from 'lucide-react'
import { getUser, saveCurrentUser } from '@/lib/auth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSignup = searchParams.get('signup') === 'true'
  const plan = searchParams.get('plan') || 'free'

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

    await new Promise(r => setTimeout(r, 800)) // Simulate API call

    const user = getUser(email, mode === 'signup' ? 'demo' : password)
    if (user) {
      if (mode === 'signup') {
        user.name = name || email.split('@')[0]
        user.plan = plan as 'free' | 'starter' | 'pro'
      }
      saveCurrentUser(user)
      if (!user.onboardingComplete) {
        router.push('/onboarding')
      } else if (user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      setError('Invalid email or password. Try: sarah@example.com / user123 or admin@foodfactscanner.com / admin123')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">
              FoodFact<span className="text-brand-400">Scanner</span>
            </span>
          </Link>
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

          {/* Demo credentials hint */}
          {mode === 'login' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-sm">
              <p className="font-semibold text-blue-800 mb-1">Demo Credentials:</p>
              <p className="text-blue-700">User: sarah@example.com / user123</p>
              <p className="text-blue-700">Admin: admin@foodfactscanner.com / admin123</p>
            </div>
          )}

          {mode === 'signup' && plan !== 'free' && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 mb-4 text-sm">
              <p className="text-brand-700 font-semibold">
                ✓ Starting your 7-day free {plan.charAt(0).toUpperCase() + plan.slice(1)} trial
              </p>
            </div>
          )}

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
                {mode === 'signup' ? 'Create Password' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                  required
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
              {mode === 'signup' && (
                <p className="text-xs text-gray-400 mt-1">For demo: use any password</p>
              )}
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
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Scan className="w-5 h-5" />
              )}
              {mode === 'signup' ? 'Create Free Account' : 'Log In'}
            </button>
          </form>

          {mode === 'signup' && (
            <div className="mt-6 space-y-2">
              {[
                'Free account — no credit card required',
                '5 free scans to start',
                '7-day Pro trial included',
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
              <a href="#" className="text-brand-600 hover:underline">Forgot password?</a>
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
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>}>
      <LoginForm />
    </Suspense>
  )
}
