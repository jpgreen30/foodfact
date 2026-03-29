'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Shield, CreditCard, Settings, Check, AlertTriangle } from 'lucide-react'
import { User as UserType } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

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

  // Pinterest connection state
  const [pinterestConnected, setPinterestConnected] = useState(false)
  const [pinterestUsername, setPinterestUsername] = useState<string | null>(null)

  // Twitter connection state
  const [twitterConnected, setTwitterConnected] = useState(false)
  const [twitterUsername, setTwitterUsername] = useState<string | null>(null)

  // Fetch current user's metadata to check Pinterest and Twitter connections
  useEffect(() => {
    const supabase = createClient()
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata) {
        // Pinterest
        if (user.user_metadata.pinterest_user_id) {
          setPinterestConnected(true)
          setPinterestUsername(user.user_metadata.pinterest_username || null)
        } else {
          setPinterestConnected(false)
          setPinterestUsername(null)
        }
        // Twitter
        if (user.user_metadata.twitter_user_id) {
          setTwitterConnected(true)
          setTwitterUsername(user.user_metadata.twitter_screen_name || null)
        } else {
          setTwitterConnected(false)
          setTwitterUsername(null)
        }
      }
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.user_metadata) {
        if (session.user.user_metadata.pinterest_user_id) {
          setPinterestConnected(true)
          setPinterestUsername(session.user.user_metadata.pinterest_username || null)
        } else {
          setPinterestConnected(false)
          setPinterestUsername(null)
        }
        if (session.user.user_metadata.twitter_user_id) {
          setTwitterConnected(true)
          setTwitterUsername(session.user.user_metadata.twitter_screen_name || null)
        } else {
          setTwitterConnected(false)
          setTwitterUsername(null)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Tweet composer functionality
  useEffect(() => {
    const textarea = document.getElementById('tweet-text') as HTMLTextAreaElement | null
    const countDisplay = document.getElementById('tweet-count')
    const submitBtn = document.getElementById('tweet-submit')
    const statusDiv = document.getElementById('tweet-status')

    if (!textarea || !countDisplay || !submitBtn || !statusDiv) return

    function updateCount() {
      const len = textarea?.value?.length ?? 0
      countDisplay.textContent = `${len}/280`
      if (len > 280) {
        countDisplay.className = 'text-xs text-red-500'
      } else if (len > 200) {
        countDisplay.className = 'text-xs text-yellow-500'
      } else {
        countDisplay.className = 'text-xs text-gray-500'
      }
    }

    async function postTweet() {
      const text = textarea?.value?.trim()
      if (!text) return
      if (text.length > 280) {
        statusDiv.textContent = 'Tweet exceeds 280 characters'
        statusDiv.className = 'mt-2 text-sm text-red-600'
        return
      }

      submitBtn.disabled = true
      submitBtn.textContent = 'Posting...'
      statusDiv.textContent = ''
      statusDiv.className = 'mt-2 text-sm'

      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) throw new Error('Not authenticated')

        const res = await fetch('/api/tweet/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text }),
        })

        const data = await res.json()
        if (res.ok && data.success) {
          statusDiv.textContent = '✅ Tweet posted successfully!'
          statusDiv.className = 'mt-2 text-sm text-green-600'
          textarea.value = ''
          updateCount()
        } else {
          statusDiv.textContent = `Error: ${data.error || 'Failed to post'}`
          statusDiv.className = 'mt-2 text-sm text-red-600'
        }
      } catch (e) {
        statusDiv.textContent = 'Network error. Please try again.'
        statusDiv.className = 'mt-2 text-sm text-red-600'
      } finally {
        submitBtn.disabled = false
        submitBtn.textContent = 'Post Tweet'
      }
    }

    textarea.addEventListener('input', updateCount)
    submitBtn.addEventListener('click', postTweet)
    updateCount()

    return () => {
      textarea.removeEventListener('input', updateCount)
      submitBtn.removeEventListener('click', postTweet)
    }
  }, [twitterConnected])

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

        {/* Pinterest Connection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.169 1.775 2.169 2.133 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.161-1.499-.69-2.436-2.878-2.436-4.632 0-3.78 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.92 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 12-5.373 12-12S18.607 0 12 0z"/>
            </svg>
            <h2 className="font-bold text-gray-900">Pinterest Connection</h2>
          </div>
          {pinterestConnected ? (
            <div>
              <p className="text-sm text-gray-700">Connected as @{pinterestUsername || 'Pinterest User'}</p>
              <button
                onClick={async () => {
                  // Disconnect: clear Pinterest metadata via API endpoint (to be implemented)
                  // For now, just alert
                  alert('To disconnect your Pinterest account, please contact support.')
                }}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Disconnect Pinterest
              </button>
            </div>
          ) : (
            <a
              href="/api/auth/pinterest"
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-semibold text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.169 1.775 2.169 2.133 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.161-1.499-.69-2.436-2.878-2.436-4.632 0-3.78 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.92 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 12-5.373 12-12S18.607 0 12 0z"/>
              </svg>
              Connect Pinterest
            </a>
          )}
        </div>

        {/* Twitter Connection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <h2 className="font-bold text-gray-900">Twitter Connection</h2>
          </div>
          {twitterConnected ? (
            <div>
              <p className="text-sm text-gray-700">Connected as @{twitterUsername || 'Twitter User'}</p>
              <button
                onClick={async () => {
                  if (!confirm('Are you sure you want to disconnect your Twitter account?')) return
                  try {
                    const res = await fetch('/api/auth/twitter/disconnect', {
                      method: 'POST',
                      credentials: 'include',
                    })
                    if (res.ok) {
                      setTwitterConnected(false)
                      setTwitterUsername(null)
                    } else {
                      alert('Failed to disconnect Twitter. Please try again.')
                    }
                  } catch (e) {
                    alert('Error disconnecting Twitter')
                  }
                }}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Disconnect Twitter
              </button>

              {/* Tweet Composer */}
              <div className="mt-6 p-4 bg-[#1DA1F2]/5 rounded-xl border border-[#1DA1F2]/20">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <h3 className="font-bold text-gray-900">Post to Twitter</h3>
                </div>
                <textarea
                  id="tweet-text"
                  placeholder="What's happening?"
                  maxLength={280}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#1DA1F2] focus:border-transparent text-sm"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500" id="tweet-count">0/280</span>
                  <button
                    id="tweet-submit"
                    className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg font-semibold text-sm hover:bg-[#1da1f2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={true}
                  >
                    Post Tweet
                  </button>
                </div>
                <div id="tweet-status" className="mt-2 text-sm hidden"></div>
              </div>
            </div>
          ) : (
            <a
              href="/api/auth/twitter"
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#1DA1F2] rounded-xl hover:bg-[#1DA1F2]/5 transition-colors font-semibold text-sm"
            >
              <svg className="w-4 h-4 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Connect Twitter
            </a>
          )}
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
