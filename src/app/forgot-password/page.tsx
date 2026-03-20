'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
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
          <Link href="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-brand-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm">
                We sent a password reset link to <span className="font-medium text-gray-700">{email}</span>.
                Check your inbox and spam folder.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Reset your password</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we&apos;ll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input-field pl-10"
                    />
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
