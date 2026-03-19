'use client'

import { useState } from 'react'
import { User, Bell, Shield, CreditCard, Settings, Check, AlertTriangle } from 'lucide-react'
import { User as UserType } from '@/lib/types'

interface Props {
  user: UserType
}

export default function ProfileSettings({ user }: Props) {
  const profile = user.profile

  const [name, setName] = useState(user.name)
  const [momStatus, setMomStatus] = useState(profile?.momStatus ?? 'other')
  const [dueDate, setDueDate] = useState(profile?.dueDate ?? '')
  const [babyBirthDate, setBabyBirthDate] = useState(profile?.babyBirthDate ?? '')
  const [babyName, setBabyName] = useState(profile?.babyName ?? '')

  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const needsBabyDate = momStatus === 'newborn' || momStatus === 'toddler'

  async function handleSave() {
    setSaving(true)
    setSaveState('idle')
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const babyAgeMonths = babyBirthDate
        ? Math.max(0, Math.floor((Date.now() - new Date(babyBirthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
        : profile?.babyAgeMonths ?? 0

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name,
          userProfile: {
            momStatus,
            dueDate: dueDate || null,
            babyBirthDate: babyBirthDate || null,
            babyAgeMonths,
            babyName: babyName || null,
            diet: profile?.diet ?? [],
            concerns: profile?.concerns ?? [],
            allergies: profile?.allergies ?? [],
            prenatalConditions: profile?.prenatalConditions ?? [],
            postnatalConditions: profile?.postnatalConditions ?? [],
            breastfeeding: profile?.breastfeeding ?? false,
            organicPreference: profile?.organicPreference ?? false,
            notificationsEnabled: profile?.notificationsEnabled ?? true,
            weeklyReportEnabled: profile?.weeklyReportEnabled ?? true,
          },
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Save failed')
      }

      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not save. Please try again.')
      setSaveState('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">Profile & Settings</h1>

      <div className="space-y-5">
        {/* Account Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-gray-900">Account Information</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input defaultValue={user.email} className="input-field bg-gray-50 cursor-not-allowed" type="email" disabled />
            </div>
          </div>
        </div>

        {/* Baby / Pregnancy Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👶</span>
            <h2 className="font-bold text-gray-900">Baby & Pregnancy Profile</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Journey Status</label>
              <select
                value={momStatus}
                onChange={e => setMomStatus(e.target.value as any)}
                className="input-field"
              >
                <option value="planning">Planning to Conceive</option>
                <option value="expecting">Currently Expecting</option>
                <option value="newborn">New Baby (0–12 months)</option>
                <option value="toddler">Toddler (1–3 years)</option>
                <option value="other">Other</option>
              </select>
            </div>

            {momStatus === 'expecting' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className={`input-field ${!dueDate ? 'border-red-300' : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {!dueDate && (
                  <p className="text-red-500 text-xs mt-1">Required for trimester-specific recommendations.</p>
                )}
              </div>
            )}

            {needsBabyDate && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Baby&apos;s Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={babyBirthDate}
                    onChange={e => setBabyBirthDate(e.target.value)}
                    className={`input-field ${!babyBirthDate ? 'border-red-300' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {!babyBirthDate && (
                    <p className="text-red-500 text-xs mt-1">Required for age-specific safety tips.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Baby&apos;s Name <span className="text-xs text-gray-400">(optional)</span></label>
                  <input
                    type="text"
                    value={babyName}
                    onChange={e => setBabyName(e.target.value)}
                    placeholder="e.g. Lily"
                    className="input-field"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Safety Concerns */}
        {profile && profile.concerns.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-gray-900">Active Safety Monitoring</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.concerns.map(concern => (
                <span key={concern} className="bg-red-50 border border-red-100 text-red-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  ⚠️ {concern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-gray-900">Notification Preferences</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Push Notifications', desc: 'Recalls, danger scans, safety alerts', enabled: profile?.notificationsEnabled ?? true },
              { label: 'Weekly Safety Report', desc: 'Scan summary sent every Sunday', enabled: profile?.weeklyReportEnabled ?? true },
              { label: 'Email Newsletters', desc: 'Baby food safety tips and news', enabled: true },
              { label: 'Critical Alerts', desc: 'Life-critical safety alerts — cannot be disabled', enabled: true, locked: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  item.enabled ? 'bg-brand-500' : 'bg-gray-300'
                } ${item.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    item.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-gray-900">Subscription</h2>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl ${
            user.plan === 'pro' ? 'bg-brand-50 border border-brand-200' :
            user.plan === 'starter' ? 'bg-blue-50 border border-blue-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div>
              <p className={`font-bold text-lg ${
                user.plan === 'pro' ? 'text-brand-700' :
                user.plan === 'starter' ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {user.plan === 'pro' ? '⭐ Pro Plan' :
                 user.plan === 'starter' ? '📦 Starter Plan' : '🆓 Free Plan'}
              </p>
              <p className="text-sm text-gray-500">
                {user.plan === 'free'
                  ? `${user.scansUsed ?? 0}/3 free scans used`
                  : user.plan === 'starter'
                  ? `${user.scanCredits ?? 0} scan credits remaining`
                  : 'Unlimited scans · All features'}
              </p>
            </div>
            {user.plan === 'free' && (
              <div className="flex flex-col gap-2 ml-4">
                <a href="/checkout?plan=starter" className="text-sm text-gray-700 border border-gray-300 px-3 py-1.5 rounded-xl hover:bg-gray-50 text-center font-semibold">50 Scans — $4.99</a>
                <a href="/checkout?plan=pro" className="btn-primary text-sm px-3 py-1.5 rounded-xl text-center">Unlimited — $14.99/mo</a>
              </div>
            )}
            {user.plan === 'starter' && (
              <div className="flex flex-col gap-2 ml-4">
                <a href="/checkout?plan=starter" className="text-sm text-gray-700 border border-gray-300 px-3 py-1.5 rounded-xl hover:bg-gray-50 text-center font-semibold">+50 Credits — $4.99</a>
                <a href="/checkout?plan=pro" className="btn-primary text-sm px-3 py-1.5 rounded-xl text-center">Go Unlimited</a>
              </div>
            )}
            {user.plan === 'pro' && (
              <button className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-xl">Manage</button>
            )}
          </div>
        </div>

        {/* Error */}
        {saveState === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
            saveState === 'saved' ? 'bg-green-500 text-white' : 'btn-primary'
          }`}
        >
          {saveState === 'saved' ? (
            <><Check className="w-5 h-5" /> Saved!</>
          ) : saving ? (
            <><Settings className="w-4 h-4 animate-spin" /> Saving…</>
          ) : (
            <><Settings className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  )
}
