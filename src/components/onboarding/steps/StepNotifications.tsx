'use client'

import { ChevronRight, ChevronLeft, Bell, Mail, Shield, BarChart3, AlertTriangle } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface Props {
  data: OnboardingData
  update: (p: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepNotifications({ data, update, onNext, onBack }: Props) {
  return (
    <div>
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 mb-3">
          <span className="text-blue-600 text-sm font-semibold">🔔 Notifications & Alerts</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Stay in the know — without overwhelm
        </h2>
        <p className="text-gray-500 text-sm">
          Choose how and when you want to hear from us. You can change these anytime in settings.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Push Notifications */}
        <div className={`border-2 rounded-2xl p-5 transition-all ${
          data.notificationsEnabled ? 'border-brand-300 bg-brand-50' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Push Notifications</p>
                <p className="text-sm text-gray-500 mt-0.5">Instant alerts for product recalls, dangerous scan results, and safety news</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['FDA Recalls', 'Danger Scans', 'Safety Alerts'].map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => update({ notificationsEnabled: !data.notificationsEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                data.notificationsEnabled ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                data.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Weekly Report */}
        <div className={`border-2 rounded-2xl p-5 transition-all ${
          data.weeklyReportEnabled ? 'border-brand-300 bg-brand-50' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Weekly Safety Report</p>
                <p className="text-sm text-gray-500 mt-0.5">A summary of your scans, exposure tracking, and top safe picks of the week — sent every Sunday</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Every Sunday', 'Scan Summary', 'Safe Picks'].map(tag => (
                    <span key={tag} className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => update({ weeklyReportEnabled: !data.weeklyReportEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                data.weeklyReportEnabled ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                data.weeklyReportEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Always-on alerts (cannot be disabled) */}
        <div className="border-2 border-gray-100 bg-gray-50 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-800">Critical Safety Alerts</p>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">Always On</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Life-critical alerts like recalls, contamination notices, and FDA warnings can never be disabled — for your baby's safety.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy note */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-gray-500" />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Privacy Promise</p>
        </div>
        <p className="text-sm text-gray-500">
          We never sell your data or use it for advertising. Notifications are only used for baby safety and your account. Unsubscribe anytime.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2 flex-1 justify-center">
          Finish Setup
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
