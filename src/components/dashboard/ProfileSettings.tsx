'use client'

import { useState } from 'react'
import { User, Bell, Shield, CreditCard, Settings, Check } from 'lucide-react'
import { User as UserType } from '@/lib/types'

interface Props {
  user: UserType
}

export default function ProfileSettings({ user }: Props) {
  const [saved, setSaved] = useState(false)
  const profile = user.profile

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
              <input defaultValue={user.name} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input defaultValue={user.email} className="input-field" type="email" />
            </div>
          </div>
        </div>

        {/* Baby Profile */}
        {profile && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">👶</span>
              <h2 className="font-bold text-gray-900">Baby Profile</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {profile.babyName && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Baby's Name</label>
                  <input defaultValue={profile.babyName} className="input-field" />
                </div>
              )}
              {profile.babyBirthDate && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                  <input defaultValue={profile.babyBirthDate} className="input-field" type="date" />
                </div>
              )}
              {profile.dueDate && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date</label>
                  <input defaultValue={profile.dueDate} className="input-field" type="date" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Journey Status</label>
                <select defaultValue={profile.momStatus} className="input-field">
                  <option value="planning">Planning to Conceive</option>
                  <option value="expecting">Currently Expecting</option>
                  <option value="newborn">New Baby (0-12 months)</option>
                  <option value="toddler">Toddler (1-3 years)</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

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
            <button className="text-brand-600 text-sm font-semibold mt-3 hover:underline">
              Edit concerns →
            </button>
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
                <a href="/checkout?plan=starter" className="text-sm text-gray-700 border border-gray-300 px-3 py-1.5 rounded-xl hover:bg-gray-50 text-center font-semibold">
                  50 Scans — $4.99
                </a>
                <a href="/checkout?plan=pro" className="btn-primary text-sm px-3 py-1.5 rounded-xl text-center">
                  Unlimited — $14.99/mo
                </a>
              </div>
            )}
            {user.plan === 'starter' && (
              <div className="flex flex-col gap-2 ml-4">
                <a href="/checkout?plan=starter" className="text-sm text-gray-700 border border-gray-300 px-3 py-1.5 rounded-xl hover:bg-gray-50 text-center font-semibold">
                  +50 Credits — $4.99
                </a>
                <a href="/checkout?plan=pro" className="btn-primary text-sm px-3 py-1.5 rounded-xl text-center">
                  Go Unlimited
                </a>
              </div>
            )}
            {user.plan === 'pro' && (
              <button className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-4 py-2 rounded-xl">
                Manage
              </button>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            saved
              ? 'bg-green-500 text-white'
              : 'btn-primary'
          }`}
        >
          {saved ? (
            <><Check className="w-5 h-5" /> Saved!</>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}
