'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Logo from '@/components/Logo'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  // Supabase sets the session from the URL hash on load
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Logo height={44} />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-brand-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password updated!</h2>
              <p className="text-gray-500 text-sm">Redirecting you to login...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Verifying reset link...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Set a new password</h2>
              <p className="text-gray-500 text-sm mb-6">Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    minLength={6}
                    className="input-field"
                  />
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
