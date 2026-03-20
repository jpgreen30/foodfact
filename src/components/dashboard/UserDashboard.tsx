'use client'

import { useState } from 'react'
import Link from 'next/link'
import { proxyImg } from '@/lib/utils'
import {
  Scan, BarChart3, ShoppingBag, LogOut, User,
  AlertTriangle, CheckCircle, Clock,
  Star, ExternalLink, ChevronRight, Menu, X, Home,
  Search, Loader2, ArrowLeft,
} from 'lucide-react'
import Logo from '@/components/Logo'
import { User as UserType, ScanResult } from '@/lib/types'
import { logout } from '@/lib/auth'
import { MOCK_SCANS } from '@/lib/mock-data'
import { AFFILIATE_PRODUCTS, getRecommendedProducts } from '@/lib/affiliate-products'
import ScanHistory from './ScanHistory'
import AffiliateShop from './AffiliateShop'
import ExposureTracker from './ExposureTracker'
import ProfileSettings from './ProfileSettings'
import StageWidget from './StageWidget'
import RecallAlerts from './RecallAlerts'
import BarcodeScanner from './BarcodeScanner'

type Tab = 'home' | 'scan' | 'history' | 'shop' | 'tracker' | 'profile'
type ScanMode = null | 'barcode' | 'name'

interface Props {
  user: UserType
}

function getSaferAlternatives(chemicals: ScanResult['chemicals']) {
  const names = chemicals.map(c => c.name.toLowerCase())
  const hasHeavyMetals = names.some(n =>
    ['arsenic', 'lead', 'cadmium', 'mercury'].some(m => n.includes(m))
  )
  const hasBPA = names.some(n => n.includes('bpa'))
  const concerns: string[] = []
  if (hasHeavyMetals) concerns.push('heavy-metals')
  if (hasBPA) concerns.push('bpa')
  const matches = AFFILIATE_PRODUCTS.filter(p =>
    concerns.some(() =>
      p.tags.includes('no-heavy-metals') ||
      p.tags.includes('low-arsenic') ||
      p.category === 'testing-kits'
    )
  )
  return (matches.length > 0 ? matches : AFFILIATE_PRODUCTS.filter(p => p.category === 'organic-food')).slice(0, 3)
}

export default function UserDashboard({ user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Scan state
  const [scanMode, setScanMode] = useState<ScanMode>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [nameQuery, setNameQuery] = useState('')

  // Local credit tracking — decremented immediately after each scan so the
  // UI reflects the new count without a full page reload
  const [localScansUsed, setLocalScansUsed] = useState(user.scansUsed ?? 0)
  const [localCredits, setLocalCredits] = useState(user.scanCredits ?? 0)

  const isAtScanLimit =
    (user.plan === 'free' && localScansUsed >= 3) ||
    (user.plan === 'starter' && localCredits <= 0)

  async function lookupAndRecord(params: { barcode?: string; name?: string }) {
    setScanLoading(true)
    setScanError(null)

    try {
      const qs = params.barcode
        ? `barcode=${encodeURIComponent(params.barcode)}`
        : `name=${encodeURIComponent(params.name ?? '')}`

      const productRes = await fetch(`/api/products?${qs}`)
      const productData = await productRes.json()

      if (!productRes.ok) {
        setScanError(
          productData.error === 'product_not_found'
            ? "We couldn't find that product in our database. Try another barcode or search by name."
            : 'Something went wrong fetching product data. Please try again.'
        )
        return
      }

      // Record the scan / deduct credit
      const scanRes = await fetch('/api/scan', { method: 'POST' })
      if (!scanRes.ok) {
        const scanData = await scanRes.json()
        if (scanData.error === 'scan_limit_reached') {
          setScanError('limit_reached')
          return
        }
      }

      // Update local credit counters immediately
      setLocalScansUsed(prev => prev + 1)
      if (user.plan === 'starter') setLocalCredits(prev => Math.max(0, prev - 1))

      setScanResult(productData.product)
      // Show upgrade modal for free users who see a danger result
      if (user.plan === 'free' && productData.product?.overallScore === 'danger') {
        setTimeout(() => setShowUpgradeModal(true), 1200)
      }
      setScanMode(null)
    } catch {
      setScanError('Network error. Please check your connection and try again.')
    } finally {
      setScanLoading(false)
    }
  }

  function handleBarcodeDetected(barcode: string) {
    setShowCamera(false)
    lookupAndRecord({ barcode })
  }

  function handleNameSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!nameQuery.trim()) return
    lookupAndRecord({ name: nameQuery })
  }

  function resetScan() {
    setScanResult(null)
    setScanError(null)
    setScanMode(null)
    setNameQuery('')
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const recentScans = MOCK_SCANS.slice(0, 3)
  const dangerCount = MOCK_SCANS.filter(s => s.overallScore === 'danger').length
  const safeCount = MOCK_SCANS.filter(s => s.overallScore === 'safe').length
  const cautionCount = MOCK_SCANS.filter(s => s.overallScore === 'caution').length

  const profile = user.profile
  const recommended = profile
    ? getRecommendedProducts(profile.concerns, profile.momStatus)
    : AFFILIATE_PRODUCTS.slice(0, 6)

  const navItems: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'scan', label: 'Scan Food', icon: Scan },
    { id: 'history', label: 'Scan History', icon: Clock },
    { id: 'shop', label: 'Safe Shop', icon: ShoppingBag },
    { id: 'tracker', label: 'Exposure Tracker', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Danger scan upgrade modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🚨</div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Dangerous Product Found</h2>
              <p className="text-sm text-gray-500">This product contains high-risk chemicals. Protect your baby with unlimited scanning.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-red-700 font-semibold text-center">You have {Math.max(0, 3 - localScansUsed)} free scan{Math.max(0, 3 - localScansUsed) !== 1 ? 's' : ''} left. After that, you won&apos;t be able to check your baby&apos;s food.</p>
            </div>
            <div className="space-y-2">
              <Link
                href="/checkout?plan=pro"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold text-center py-3 rounded-xl transition-colors"
                onClick={() => setShowUpgradeModal(false)}
              >
                Unlock Unlimited Scans — $14.99/mo
              </Link>
              <Link
                href="/checkout?plan=starter"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-center py-2.5 rounded-xl transition-colors text-sm"
                onClick={() => setShowUpgradeModal(false)}
              >
                50 Scans — $4.99 one-time
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="block w-full text-gray-400 text-xs py-2 hover:text-gray-600 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm fixed top-0 left-0 h-full z-40">
        <div className="p-5 border-b border-gray-100">
          <Logo height={32} />
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  user.plan === 'pro' ? 'bg-brand-100 text-brand-700' :
                  user.plan === 'starter' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {user.plan.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-brand-600' : 'text-gray-400'}`} />
              {item.label}
              {item.id === 'shop' && (
                <span className="ml-auto bg-orange-100 text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">NEW</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo height={28} linked={false} />
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileNavOpen && (
          <div className="border-t border-gray-100 bg-white shadow-lg p-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileNavOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {activeTab === 'home' && (
            <div>
              {/* Welcome */}
              <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-900">
                  Hi, {user.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-500 mt-1">
                  {profile?.babyName
                    ? `Here's your safety overview for you and ${profile.babyName}.`
                    : "Here's your baby food safety overview."}
                </p>
              </div>

              {/* Alert Banner */}
              {dangerCount > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-red-700">
                      {dangerCount} product{dangerCount !== 1 ? 's' : ''} with dangerous toxin levels in your history
                    </p>
                    <p className="text-red-600 text-sm">Review and avoid these products immediately.</p>
                  </div>
                  <button onClick={() => setActiveTab('history')} className="ml-auto bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 flex-shrink-0">
                    View
                  </button>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Scans', value: user.totalScans, icon: Scan, color: 'text-blue-600 bg-blue-50', sub: 'all time' },
                  { label: 'Safe Products', value: safeCount, icon: CheckCircle, color: 'text-green-600 bg-green-50', sub: 'score 80+' },
                  { label: 'Caution Products', value: cautionCount, icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50', sub: 'score 40-79' },
                  { label: 'Dangerous', value: dangerCount, icon: AlertTriangle, color: 'text-red-600 bg-red-50', sub: 'score < 40' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                    <p className="text-xs text-gray-400">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Stage Widget */}
              {profile && <StageWidget userProfile={profile} />}

              {/* Recall Alerts */}
              <RecallAlerts userName={user.name} userEmail={user.email} onShopClick={() => setActiveTab('shop')} />

              {/* Quick Scan */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Ready to scan?</h2>
                    <p className="text-brand-100 text-sm">Scan any baby food product in under 3 seconds.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('scan')}
                    className="bg-white text-brand-700 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-brand-50 transition-colors flex-shrink-0"
                  >
                    <Scan className="w-4 h-4" />
                    Scan Now
                  </button>
                </div>
              </div>

              {/* Recent Scans & Recommended Products side by side */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Scans */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Recent Scans</h3>
                    <button onClick={() => setActiveTab('history')} className="text-brand-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentScans.map(scan => (
                      <div key={scan.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
                          scan.overallScore === 'safe' ? 'bg-green-100' :
                          scan.overallScore === 'caution' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          {scan.overallScore === 'safe' ? '✅' : scan.overallScore === 'caution' ? '⚠️' : '🚫'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{scan.productName}</p>
                          <p className="text-xs text-gray-400">{scan.brand}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                          scan.overallScore === 'safe' ? 'badge-safe' :
                          scan.overallScore === 'caution' ? 'badge-caution' : 'badge-danger'
                        }`}>
                          {scan.overallScore.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Products */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Safe Picks For You</h3>
                    <button onClick={() => setActiveTab('shop')} className="text-brand-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                      Shop All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recommended.slice(0, 3).map(product => (
                      <a
                        key={product.id}
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-brand-50 rounded-xl transition-colors group"
                      >
                        <img
                          src={proxyImg(product.imageUrl)}
                          alt={product.title}
                          className="w-10 h-10 object-contain rounded-lg bg-gray-50 flex-shrink-0"
                          onError={(e) => { e.currentTarget.src = '' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-brand-700">
                            {product.title.split(' ').slice(0, 5).join(' ')}...
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-500">{product.rating} · {product.price}</span>
                          </div>
                        </div>
                        {product.badge && (
                          <span className="bg-brand-100 text-brand-700 text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {product.badge.split(' ')[0]}
                          </span>
                        )}
                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-500 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    * Affiliate links — we earn a commission at no extra cost to you. Safety scores are never influenced by partnerships.
                  </p>
                </div>
              </div>

              {/* Upgrade CTA */}
              {user.plan === 'free' && (
                <div className="mt-6 bg-gradient-to-r from-slate-900 to-brand-900 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Free Plan — {localScansUsed}/3 scans used</p>
                      <h3 className="text-xl font-bold mb-1">Need More Scans?</h3>
                      <p className="text-gray-400 text-sm">
                        Get 50 credits for $4.99 (no subscription) or go unlimited with Pro at $14.99/mo.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link href="/checkout?plan=starter" className="bg-white text-gray-900 font-bold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm text-center">
                        50 Scans — $4.99
                      </Link>
                      <Link href="/checkout?plan=pro" className="bg-brand-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-brand-400 transition-colors text-sm text-center">
                        Unlimited — $14.99/mo
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              {user.plan === 'starter' && (
                <div className="mt-6 bg-gradient-to-r from-slate-900 to-brand-900 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Starter Plan — {localCredits} credits remaining</p>
                      <h3 className="text-xl font-bold mb-1">Running Low? Go Unlimited.</h3>
                      <p className="text-gray-400 text-sm">Top up 50 more credits or switch to Pro for unlimited access.</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link href="/checkout?plan=starter" className="bg-white text-gray-900 font-bold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm text-center">
                        +50 Credits — $4.99
                      </Link>
                      <Link href="/checkout?plan=pro" className="bg-brand-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-brand-400 transition-colors text-sm text-center">
                        Unlimited — $14.99/mo
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scan' && (
            <div>
              {/* Camera overlay */}
              {showCamera && (
                <BarcodeScanner
                  onDetected={handleBarcodeDetected}
                  onClose={() => setShowCamera(false)}
                />
              )}

              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-gray-900">Scan Baby Food</h1>
                {user.plan !== 'pro' && (
                  <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    isAtScanLimit ? 'bg-red-100 text-red-700' :
                    (user.plan === 'free' && localScansUsed >= 2) ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {user.plan === 'free'
                      ? `${localScansUsed}/3 free scans used`
                      : `${localCredits} credits left`}
                  </div>
                )}
              </div>

              {/* Scan limit gate */}
              {isAtScanLimit && !scanResult && (
                <div className="bg-white rounded-2xl border-2 border-brand-200 shadow-sm p-8 text-center max-w-lg mx-auto mb-6">
                  <div className="text-5xl mb-4">🔒</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {user.plan === 'free' ? "You've used your 3 free scans" : 'No scan credits remaining'}
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    {user.plan === 'free'
                      ? 'Pick a plan below to keep scanning and protect your baby.'
                      : 'Top up your credits or go unlimited with Pro.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/checkout?plan=starter" className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors text-sm">
                      50 Scans — $4.99
                    </Link>
                    <Link href="/checkout?plan=pro" className="btn-primary px-6 py-3 rounded-xl font-bold text-sm">
                      Unlimited — $14.99/mo
                    </Link>
                  </div>
                </div>
              )}

              {/* Loading */}
              {scanLoading && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-lg mx-auto">
                  <Loader2 className="w-10 h-10 text-brand-500 animate-spin mx-auto mb-4" />
                  <p className="font-semibold text-gray-800">Analyzing product…</p>
                  <p className="text-sm text-gray-400 mt-1">Checking 2,400+ chemicals and additives</p>
                </div>
              )}

              {/* Scan result */}
              {!scanLoading && scanResult && (
                <div className="max-w-lg mx-auto space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <button onClick={resetScan} className="flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:underline">
                      <ArrowLeft className="w-4 h-4" /> Scan Another
                    </button>
                  </div>

                  {/* Score card */}
                  <div className={`rounded-2xl border-2 p-6 ${
                    scanResult.overallScore === 'safe' ? 'bg-green-50 border-green-200' :
                    scanResult.overallScore === 'caution' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-4">
                      {scanResult.imageUrl && (
                        <img src={scanResult.imageUrl} alt={scanResult.productName} className="w-16 h-16 object-contain rounded-xl bg-white border border-gray-100 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-lg leading-tight">{scanResult.productName}</p>
                        <p className="text-gray-500 text-sm">{scanResult.brand}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold ${
                          scanResult.overallScore === 'safe' ? 'bg-green-600 text-white' :
                          scanResult.overallScore === 'caution' ? 'bg-yellow-500 text-white' :
                          'bg-red-600 text-white'
                        }`}>
                          {scanResult.overallScore === 'safe' ? '✅ Safe' :
                           scanResult.overallScore === 'caution' ? '⚠️ Caution' : '🚫 Danger'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chemicals found */}
                  {scanResult.chemicals.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <h3 className="font-bold text-gray-900 mb-3">Chemicals / Additives Found</h3>
                      <div className="space-y-3">
                        {scanResult.chemicals.map((c, i) => (
                          <div key={i} className={`p-4 rounded-xl border-l-4 ${
                            c.level === 'high' ? 'bg-red-50 border-red-400' :
                            c.level === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                            'bg-blue-50 border-blue-400'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                c.level === 'high' ? 'bg-red-600 text-white' :
                                c.level === 'medium' ? 'bg-yellow-600 text-white' :
                                'bg-blue-600 text-white'
                              }`}>{c.level.toUpperCase()}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{c.description}</p>
                            <p className="text-xs text-gray-700 font-medium">Risk: {c.healthRisk}</p>
                            {c.safeLimit && (
                              <div className="flex gap-3 mt-1.5 text-xs">
                                <span className="text-green-700">Safe limit: {c.safeLimit}</span>
                                {c.detectedAmount && <span className="text-red-700">Detected: {c.detectedAmount}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-bold text-green-800">No harmful chemicals detected</p>
                      <p className="text-green-700 text-sm mt-1">This product looks clean based on its ingredients.</p>
                    </div>
                  )}

                  {/* Ingredients — detailed flagged view */}
                  {scanResult.ingredients.length > 0 && (() => {
                    const detectedNames = scanResult.chemicals.map(c => c.name.toLowerCase())
                    const warnIngredients = ['high fructose corn syrup', 'corn syrup', 'artificial flavor', 'artificial color', 'red 40', 'yellow 5', 'yellow 6', 'blue 1', 'titanium dioxide', 'sodium nitrate', 'sodium nitrite', 'bha', 'bht', 'tbhq', 'carrageenan', 'msg', 'aspartame', 'sucralose', 'saccharin', 'acesulfame', 'potassium bromate', 'brominated vegetable oil']
                    const flagged = scanResult.ingredients.filter(i =>
                      detectedNames.some(d => i.toLowerCase().includes(d) || d.includes(i.toLowerCase().substring(0, 6)))
                    )
                    const cautionList = scanResult.ingredients.filter(i =>
                      !flagged.includes(i) && warnIngredients.some(w => i.toLowerCase().includes(w))
                    )
                    const cleanCount = scanResult.ingredients.length - flagged.length - cautionList.length
                    return (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-gray-900">Ingredients</h3>
                          <div className="flex gap-2 text-xs">
                            {flagged.length > 0 && <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">{flagged.length} flagged</span>}
                            {cautionList.length > 0 && <span className="bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">{cautionList.length} caution</span>}
                            {cleanCount > 0 && <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">{cleanCount} clean</span>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {scanResult.ingredients.map((ingredient, i) => {
                            const isFlag = flagged.includes(ingredient)
                            const isCaution = cautionList.includes(ingredient)
                            return (
                              <span
                                key={i}
                                className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium border ${
                                  isFlag ? 'bg-red-50 text-red-800 border-red-300 font-bold' :
                                  isCaution ? 'bg-yellow-50 text-yellow-800 border-yellow-300' :
                                  'bg-gray-50 text-gray-600 border-gray-200'
                                }`}
                                title={isFlag ? 'Flagged: detected in scan' : isCaution ? 'Caution: known concern' : 'Clean ingredient'}
                              >
                                {isFlag ? '⚠️ ' : isCaution ? '⚡ ' : ''}{ingredient}
                              </span>
                            )
                          })}
                        </div>
                        {(flagged.length > 0 || cautionList.length > 0) && (
                          <p className="text-xs text-gray-400 mt-3">⚠️ flagged by scan · ⚡ known concern · no icon = clean</p>
                        )}
                      </div>
                    )
                  })()}

                  {/* Safer Alternatives upsell — caution/danger only */}
                  {(scanResult.overallScore === 'caution' || scanResult.overallScore === 'danger') && (() => {
                    const alts = getSaferAlternatives(scanResult.chemicals)
                    if (!alts.length) return null
                    return (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            🛡️ Safer Alternatives
                          </p>
                          <button
                            onClick={() => { setActiveTab('shop'); resetScan() }}
                            className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1"
                          >
                            Browse All <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {alts.map(product => (
                            <a
                              key={product.id}
                              href={product.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="group"
                            >
                              <div className="bg-gray-50 rounded-xl p-2 mb-1.5 h-20 flex items-center justify-center">
                                <img
                                  src={proxyImg(product.imageUrl)}
                                  alt={product.title}
                                  className="max-h-full object-contain"
                                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                              </div>
                              <p className="text-[10px] font-semibold text-gray-700 line-clamp-2 leading-tight mb-1 group-hover:text-brand-700">
                                {product.title}
                              </p>
                              <p className="text-xs font-bold text-green-600">{product.price}</p>
                              <p className="text-[10px] text-amber-600 font-semibold mt-0.5 flex items-center gap-0.5">
                                Amazon <ExternalLink className="w-2.5 h-2.5" />
                              </p>
                            </a>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3 text-center">
                          * Affiliate links — commissions never influence safety scores.
                        </p>
                      </div>
                    )
                  })()}

                  <button
                    onClick={resetScan}
                    className="w-full btn-primary py-3 rounded-xl font-bold text-sm"
                  >
                    Scan Another Product
                  </button>

                  {/* Post-scan upgrade nudge — free users only */}
                  {user.plan === 'free' && !isAtScanLimit && (
                    <div className="bg-gradient-to-r from-brand-50 to-green-50 border border-brand-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className="text-2xl flex-shrink-0">🔓</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">Unlock unlimited scans</p>
                        <p className="text-xs text-gray-500 mt-0.5">{3 - localScansUsed} free scan{3 - localScansUsed !== 1 ? 's' : ''} remaining — upgrade for $14.99/mo</p>
                      </div>
                      <Link href="/checkout?plan=pro" className="flex-shrink-0 bg-brand-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-brand-700 transition-colors whitespace-nowrap">
                        Upgrade
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Error state */}
              {!scanLoading && scanError && !scanResult && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center max-w-lg mx-auto">
                  {scanError === 'limit_reached' ? (
                    <>
                      <div className="text-4xl mb-3">🔒</div>
                      <p className="font-bold text-gray-900 mb-1">Scan limit reached</p>
                      <p className="text-gray-500 text-sm mb-4">Upgrade to keep scanning.</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/checkout?plan=starter" className="bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-800">
                          50 Scans — $4.99
                        </Link>
                        <Link href="/checkout?plan=pro" className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm">
                          Unlimited — $14.99/mo
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                      <p className="font-bold text-gray-900 mb-1">Scan failed</p>
                      <p className="text-gray-500 text-sm mb-4">{scanError}</p>
                      <button onClick={resetScan} className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm">
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Scan options (when idle and no result/error) */}
              {!scanLoading && !scanResult && !scanError && !isAtScanLimit && (
                <div className="max-w-lg mx-auto">
                  {scanMode === null && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                      <div className="w-20 h-20 bg-brand-50 border-4 border-dashed border-brand-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Scan className="w-10 h-10 text-brand-400" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Choose Scan Method</h2>
                      <p className="text-gray-500 text-sm mb-6">Scan a barcode or search by product name.</p>

                      <div className="space-y-3">
                        <button
                          onClick={() => { setScanMode('barcode'); setShowCamera(true) }}
                          className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-brand-300 hover:bg-brand-50 rounded-xl transition-all text-left"
                        >
                          <span className="text-3xl">📷</span>
                          <div>
                            <p className="font-semibold text-gray-800">Scan Barcode</p>
                            <p className="text-sm text-gray-400">Use your camera to scan a product barcode</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 ml-auto flex-shrink-0" />
                        </button>

                        <button
                          onClick={() => setScanMode('name')}
                          className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-brand-300 hover:bg-brand-50 rounded-xl transition-all text-left"
                        >
                          <span className="text-3xl">⌨️</span>
                          <div>
                            <p className="font-semibold text-gray-800">Search by Name</p>
                            <p className="text-sm text-gray-400">Type a product or brand name to look it up</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 ml-auto flex-shrink-0" />
                        </button>
                      </div>

                      {user.plan !== 'pro' && (
                        <p className="mt-5 text-xs text-gray-400">
                          {user.plan === 'free'
                            ? `${Math.max(0, 3 - localScansUsed)} free scan${Math.max(0, 3 - localScansUsed) !== 1 ? 's' : ''} remaining`
                            : `${localCredits} credits remaining`}
                        </p>
                      )}
                    </div>
                  )}

                  {scanMode === 'name' && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                      <button onClick={() => setScanMode(null)} className="flex items-center gap-1.5 text-brand-600 font-semibold text-sm mb-5 hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Search Product</h2>
                      <p className="text-gray-500 text-sm mb-5">Enter a product name, brand, or ingredient.</p>
                      <form onSubmit={handleNameSearch} className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={nameQuery}
                            onChange={e => setNameQuery(e.target.value)}
                            placeholder="e.g. Gerber Peas, Happy Baby, Cheerios…"
                            className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 transition-colors"
                            autoFocus
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!nameQuery.trim()}
                          className="w-full btn-primary py-3 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Analyze Product
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <ScanHistory
              scans={MOCK_SCANS}
              userProfile={user.profile}
              userName={user.name}
              userEmail={user.email}
            />
          )}
          {activeTab === 'shop' && (
            <div>
              {/* Featured Picks Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">🔥 This Week&apos;s Featured Picks</h2>
                    <p className="text-xs text-gray-500">Curated by our safety experts</p>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Amazon Deals</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AFFILIATE_PRODUCTS.filter(p => p.badge).slice(0, 3).map(product => (
                    <a
                      key={product.id}
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="bg-white rounded-xl p-3 border border-amber-100 hover:border-amber-300 hover:shadow-sm transition-all"
                    >
                      <img
                        src={proxyImg(product.imageUrl)}
                        alt={product.title}
                        className="w-full h-28 object-contain rounded-lg mb-2 bg-white"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                      <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full mb-1">{product.badge}</span>
                      <p className="text-xs font-bold text-gray-800 line-clamp-2 mb-1">{product.title}</p>
                      <p className="text-sm font-bold text-green-600">{product.price}</p>
                      <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1">
                        Buy on Amazon <ExternalLink className="w-3 h-3" />
                      </p>
                    </a>
                  ))}
                </div>
              </div>
              <AffiliateShop products={AFFILIATE_PRODUCTS} profile={user.profile} />
            </div>
          )}
          {activeTab === 'tracker' && <ExposureTracker scans={MOCK_SCANS} />}
          {activeTab === 'profile' && <ProfileSettings user={user} />}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40">
        <div className="flex">
          {navItems.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === item.id ? 'text-brand-600' : 'text-gray-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-brand-600' : 'text-gray-400'}`} />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
