'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield, Scan, Bell, BarChart3, ShoppingBag, LogOut, User,
  Settings, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Star, ExternalLink, ChevronRight, Menu, X, Home,
  Heart, FileText, Package
} from 'lucide-react'
import { User as UserType } from '@/lib/types'
import { logout } from '@/lib/auth'
import { MOCK_SCANS } from '@/lib/mock-data'
import { AFFILIATE_PRODUCTS, getRecommendedProducts } from '@/lib/affiliate-products'
import ScanHistory from './ScanHistory'
import AffiliateShop from './AffiliateShop'
import ExposureTracker from './ExposureTracker'
import ProfileSettings from './ProfileSettings'

type Tab = 'home' | 'scan' | 'history' | 'shop' | 'tracker' | 'profile'

interface Props {
  user: UserType
}

export default function UserDashboard({ user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm fixed top-0 left-0 h-full z-40">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">
              FoodFact<span className="text-brand-600">Scanner</span>
            </span>
          </Link>
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
                  user.plan === 'family' ? 'bg-purple-100 text-purple-700' :
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">FoodFactScanner</span>
          </div>
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
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
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
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                          🛒
                        </div>
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

              {/* Upgrade CTA for free users */}
              {user.plan === 'free' && (
                <div className="mt-6 bg-gradient-to-r from-slate-900 to-brand-900 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">You're on the Free Plan</p>
                      <h3 className="text-xl font-bold mb-1">Unlock Unlimited Scans & More</h3>
                      <p className="text-gray-400 text-sm">
                        {user.scansThisMonth}/5 scans used this month. Upgrade to Pro for unlimited access.
                      </p>
                    </div>
                    <Link
                      href="/login?signup=true&plan=pro"
                      className="bg-brand-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-400 transition-colors flex-shrink-0 ml-4"
                    >
                      Upgrade to Pro
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scan' && (
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-6">Scan Baby Food</h1>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-brand-50 border-4 border-dashed border-brand-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Scan className="w-10 h-10 text-brand-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Choose Scan Method</h2>
                <p className="text-gray-500 text-sm mb-6">Scan a barcode, photograph an ingredient label, or type a product name.</p>

                <div className="space-y-3">
                  {[
                    { icon: '📷', label: 'Photograph Ingredient Label', desc: 'AI reads the text automatically (OCR)' },
                    { icon: '📊', label: 'Scan Barcode', desc: 'Instant product lookup from our database' },
                    { icon: '⌨️', label: 'Type Product Name', desc: 'Search by brand, product, or ingredient' },
                  ].map(method => (
                    <button
                      key={method.label}
                      className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-brand-300 hover:bg-brand-50 rounded-xl transition-all text-left"
                    >
                      <span className="text-3xl">{method.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{method.label}</p>
                        <p className="text-sm text-gray-400">{method.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    📝 <strong>Demo mode:</strong> Camera scanning requires mobile app. For this demo, explore your scan history to see how results look!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && <ScanHistory scans={MOCK_SCANS} />}
          {activeTab === 'shop' && <AffiliateShop products={AFFILIATE_PRODUCTS} profile={user.profile} />}
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
