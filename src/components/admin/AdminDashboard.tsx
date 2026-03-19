'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield, Users, BarChart3, ShoppingBag, Settings, LogOut,
  TrendingUp, DollarSign, Scan, AlertTriangle, UserCheck,
  Menu, X, Home, Bell, Database, Star, Scale, Copy, CheckCheck,
  ExternalLink, RefreshCw
} from 'lucide-react'
import { logout } from '@/lib/auth'
import { ADMIN_STATS, MOCK_USER_LIST } from '@/lib/mock-data'
import { AFFILIATE_PRODUCTS } from '@/lib/affiliate-products'

type AdminTab = 'overview' | 'users' | 'affiliate' | 'products' | 'alerts' | 'leads' | 'settings'

// Mock lead data
const MOCK_LEADS = [
  { id: 'l1', name: 'Sarah M.', email: 's***@gmail.com', productName: 'Gerber 2nd Foods Peas', source: 'scan', status: 'sent', createdAt: '2026-03-19', chemicals: [{ name: 'Inorganic Arsenic', level: 'high' }] },
  { id: 'l2', name: 'Jennifer K.', email: 'j***@yahoo.com', productName: 'Organic Baby Oatmeal Cereal', source: 'recall', status: 'sent', createdAt: '2026-03-18', chemicals: [] },
  { id: 'l3', name: 'Maria R.', email: 'm***@outlook.com', productName: 'Stage 2 Sweet Potato Puree', source: 'recall', status: 'pending', createdAt: '2026-03-17', chemicals: [] },
  { id: 'l4', name: 'Ashley T.', email: 'a***@gmail.com', productName: 'Gerber 2nd Foods Carrots', source: 'scan', status: 'failed', createdAt: '2026-03-16', chemicals: [{ name: 'Lead', level: 'high' }] },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSaved, setWebhookSaved] = useState(false)
  const [webhookCopied, setWebhookCopied] = useState(false)
  const WEBHOOK_SECRET = 'ffs_whsec_a8f3d2e1b5c4...' // mock

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const stats = ADMIN_STATS

  const navItems: { id: AdminTab; label: string; icon: typeof Home }[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'affiliate', label: 'Affiliate Revenue', icon: DollarSign },
    { id: 'products', label: 'Product Database', icon: Database },
    { id: 'alerts', label: 'Recall Alerts', icon: Bell },
    { id: 'leads', label: 'Legal Leads', icon: Scale },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 fixed top-0 left-0 h-full z-40">
        <div className="p-5 border-b border-slate-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">FoodFactScanner</span>
              <span className="text-xs text-slate-400">Admin Console</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === item.id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
            <div>
              <p className="text-white text-sm font-medium">Admin</p>
              <p className="text-slate-400 text-xs">admin@foodfactscanner.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Admin Console</span>
            </div>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-slate-400 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-slate-700 bg-slate-900 p-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  tab === item.id ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">

          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-900">Admin Overview</h1>
                <p className="text-gray-500 text-sm mt-1">FoodFactScanner platform metrics — updated daily</p>
              </div>

              {/* Primary Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Users', value: stats.totalUsers.toLocaleString(), sub: `+${stats.newUsersThisWeek} this week`, icon: Users, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
                  { label: 'Total Scans', value: stats.totalScans.toLocaleString(), sub: `${stats.scansToday} today`, icon: Scan, color: 'bg-purple-50 text-purple-600', trend: '+8%' },
                  { label: 'Monthly Revenue', value: `$${stats.revenue.toLocaleString()}`, sub: 'subscriptions', icon: DollarSign, color: 'bg-green-50 text-green-600', trend: '+23%' },
                  { label: 'Affiliate Revenue', value: `$${stats.affiliateRevenue.toLocaleString()}`, sub: `${stats.affiliateClicks.toLocaleString()} clicks`, icon: ShoppingBag, color: 'bg-orange-50 text-orange-600', trend: '+31%' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{stat.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{stat.sub}</span>
                      <span className="text-xs text-green-600 font-semibold">{stat.trend} ↑</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Plan Distribution & Conversion */}
              <div className="grid lg:grid-cols-2 gap-5 mb-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-gray-900 mb-4">Plan Distribution</h2>
                  <div className="space-y-3">
                    {[
                      { plan: 'Free', count: stats.totalUsers - stats.proUsers - stats.familyUsers, color: 'bg-gray-400', pct: Math.round(((stats.totalUsers - stats.proUsers - stats.familyUsers) / stats.totalUsers) * 100) },
                      { plan: 'Pro', count: stats.proUsers, color: 'bg-brand-500', pct: Math.round((stats.proUsers / stats.totalUsers) * 100) },
                      { plan: 'Family', count: stats.familyUsers, color: 'bg-purple-500', pct: Math.round((stats.familyUsers / stats.totalUsers) * 100) },
                    ].map(item => (
                      <div key={item.plan}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{item.plan} Plan</span>
                          <span className="text-gray-500">{item.count.toLocaleString()} users ({item.pct}%)</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-brand-50 rounded-xl">
                    <p className="text-brand-700 text-sm font-semibold">
                      💡 Conversion rate: {stats.conversionRate}% free → paid
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-gray-900 mb-4">Revenue Breakdown</h2>
                  <div className="space-y-3">
                    {[
                      { source: 'Pro Subscriptions', amount: stats.proUsers * 6.99, color: 'bg-brand-500' },
                      { source: 'Family Subscriptions', amount: stats.familyUsers * 10.99, color: 'bg-purple-500' },
                      { source: 'Amazon Affiliate', amount: stats.affiliateRevenue, color: 'bg-orange-500' },
                    ].map(item => {
                      const total = (stats.proUsers * 6.99) + (stats.familyUsers * 10.99) + stats.affiliateRevenue
                      const pct = Math.round((item.amount / total) * 100)
                      return (
                        <div key={item.source}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{item.source}</span>
                            <span className="text-gray-900 font-bold">${Math.round(item.amount).toLocaleString()}/mo</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xl font-black text-gray-900">${stats.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Monthly Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-green-600">+23%</p>
                      <p className="text-xs text-gray-400">vs. Last Month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4">Recent User Signups</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-2 pr-4">User</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-2 pr-4">Plan</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-2 pr-4">Scans</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-2 pr-4">Joined</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_USER_LIST.slice(0, 5).map(u => (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                                <p className="text-xs text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              u.plan === 'pro' ? 'bg-brand-100 text-brand-700' :
                              u.plan === 'family' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {u.plan.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-700">{u.scans}</td>
                          <td className="py-3 pr-4 text-sm text-gray-500">{u.joined}</td>
                          <td className="py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">User Management</h1>
                  <p className="text-gray-500 text-sm">{stats.totalUsers.toLocaleString()} total users</p>
                </div>
                <button className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Users', value: stats.totalUsers.toLocaleString(), color: 'text-gray-900' },
                  { label: 'Active (30d)', value: stats.activeUsers.toLocaleString(), color: 'text-green-600' },
                  { label: 'Pro Users', value: stats.proUsers.toLocaleString(), color: 'text-brand-600' },
                  { label: 'Family Users', value: stats.familyUsers.toLocaleString(), color: 'text-purple-600' },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <input
                    type="search"
                    placeholder="Search users by name or email..."
                    className="input-field"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {['User', 'Plan', 'Scans', 'Joined', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_USER_LIST.map(u => (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                                <p className="text-xs text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              u.plan === 'pro' ? 'bg-brand-100 text-brand-700' :
                              u.plan === 'family' ? 'bg-purple-100 text-purple-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {u.plan.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{u.scans}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{u.joined}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button className="text-xs text-brand-600 hover:underline font-medium">View</button>
                              <button className="text-xs text-gray-400 hover:text-red-500 font-medium">Suspend</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Affiliate Revenue */}
          {tab === 'affiliate' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-900">Affiliate Revenue</h1>
                <p className="text-gray-500 text-sm">Amazon Associates performance & product management</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Clicks', value: stats.affiliateClicks.toLocaleString(), icon: '🖱️', trend: '+31%' },
                  { label: 'Affiliate Revenue', value: `$${stats.affiliateRevenue.toLocaleString()}`, icon: '💰', trend: '+28%' },
                  { label: 'Avg. Order Value', value: '$47.23', icon: '🛒', trend: '+5%' },
                  { label: 'Conversion Rate', value: '4.7%', icon: '📊', trend: '+0.8%' },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="text-2xl font-black text-gray-900">{item.value}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{item.label}</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">{item.trend} ↑ vs last month</p>
                  </div>
                ))}
              </div>

              {/* Top performing products */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
                <h2 className="font-bold text-gray-900 mb-4">Top Performing Products</h2>
                <div className="space-y-3">
                  {AFFILIATE_PRODUCTS.filter(p => p.badge).map((product, i) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <span className="text-2xl font-black text-gray-400 w-6">#{i + 1}</span>
                      <div className="text-2xl">
                        {product.category === 'organic-food' ? '🥣' :
                         product.category === 'prenatal-vitamins' ? '💊' :
                         product.category === 'food-makers' ? '🫕' :
                         product.category === 'storage' ? '🫙' :
                         product.category === 'testing-kits' ? '🔬' :
                         product.category === 'baby-formula' ? '🍼' : '📦'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{product.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{product.price}</span>
                          <span className="text-gray-300">·</span>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-500">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-green-600 text-sm">${Math.round(Math.random() * 300 + 50)}</p>
                        <p className="text-xs text-gray-400">{Math.round(Math.random() * 200 + 50)} clicks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affiliate settings */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4">Amazon Associates Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Affiliate Tag ID</label>
                    <input defaultValue="foodfactscanner-20" className="input-field font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Default Tracking ID</label>
                    <input defaultValue="ffs-dashboard-20" className="input-field font-mono" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full bg-brand-500 cursor-pointer`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow translate-x-6`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Auto-apply affiliate tags to all product links</span>
                  </div>
                  <button className="btn-primary text-sm px-4 py-2">Save Settings</button>
                </div>
              </div>
            </div>
          )}

          {/* Product Database */}
          {tab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Product Database</h1>
                  <p className="text-gray-500 text-sm">2,400+ chemicals · {AFFILIATE_PRODUCTS.length} affiliate products</p>
                </div>
                <button className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Add Product
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-3">
                  <input type="search" placeholder="Search products..." className="input-field flex-1" />
                  <select className="input-field w-48">
                    <option>All Categories</option>
                    <option>Organic Food</option>
                    <option>Vitamins</option>
                    <option>Equipment</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        {['Product', 'Category', 'Price', 'Rating', 'Badge', 'Actions'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AFFILIATE_PRODUCTS.map(product => (
                        <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-800 text-sm max-w-xs truncate">{product.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">{product.id}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900 text-sm">{product.price}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-700">{product.rating}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {product.badge ? (
                              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                                {product.badge}
                              </span>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button className="text-xs text-brand-600 hover:underline font-medium">Edit</button>
                              <button className="text-xs text-red-500 hover:underline font-medium">Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {tab === 'alerts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Recall Alerts Management</h1>
                  <p className="text-gray-500 text-sm">Monitor FDA recalls and send alerts to affected users</p>
                </div>
                <button className="btn-danger text-sm px-4 py-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Send Alert
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 'recall-1',
                    product: 'Plum Organics Pouch - Sweet Potato & Banana',
                    reason: 'Elevated arsenic levels detected — 4.2x safe limit',
                    date: '2024-11-15',
                    severity: 'Critical',
                    affected: 1243,
                    notified: 1243,
                  },
                  {
                    id: 'recall-2',
                    product: "Gerber 1st Foods - Pea Puree (Lot #GBR-2024-089)",
                    reason: 'Glass particle contamination detected in manufacturing',
                    date: '2024-10-28',
                    severity: 'Critical',
                    affected: 3871,
                    notified: 3871,
                  },
                  {
                    id: 'recall-3',
                    product: "Earth's Best Organic Rice Cereal",
                    reason: 'Inorganic arsenic levels above FDA action level',
                    date: '2024-10-12',
                    severity: 'High',
                    affected: 876,
                    notified: 856,
                  },
                ].map(recall => (
                  <div key={recall.id} className={`border-2 rounded-2xl p-5 ${
                    recall.severity === 'Critical' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'
                  }`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                          recall.severity === 'Critical' ? 'text-red-500' : 'text-orange-500'
                        }`} />
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          recall.severity === 'Critical' ? 'bg-red-200 text-red-700' : 'bg-orange-200 text-orange-700'
                        }`}>
                          {recall.severity}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{recall.date}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{recall.product}</h3>
                    <p className="text-sm text-gray-600 mb-3">{recall.reason}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">{recall.affected.toLocaleString()} users affected</span>
                      <span className={`font-semibold ${recall.notified === recall.affected ? 'text-green-600' : 'text-orange-600'}`}>
                        {recall.notified.toLocaleString()}/{recall.affected.toLocaleString()} notified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Leads */}
          {tab === 'leads' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Legal Leads</h1>
                  <p className="text-sm text-gray-500 mt-1">Mass-tort leads from dangerous scan results and recall alerts</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">{MOCK_LEADS.length}</p>
                    <p className="text-xs text-gray-500">Total Leads</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-600">{MOCK_LEADS.filter(l => l.status === 'sent').length}</p>
                    <p className="text-xs text-gray-500">Forwarded</p>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'From Scans', value: MOCK_LEADS.filter(l => l.source === 'scan').length, color: 'text-blue-600 bg-blue-50' },
                  { label: 'From Recalls', value: MOCK_LEADS.filter(l => l.source === 'recall').length, color: 'text-red-600 bg-red-50' },
                  { label: 'Pending Retry', value: MOCK_LEADS.filter(l => l.status !== 'sent').length, color: 'text-amber-600 bg-amber-50' },
                ].map(stat => (
                  <div key={stat.label} className={`rounded-2xl ${stat.color} p-4 text-center`}>
                    <p className="text-3xl font-black">{stat.value}</p>
                    <p className="text-sm font-semibold">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Leads Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">Lead Log</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Date', 'Name', 'Email', 'Product / Chemical', 'Source', 'Status', 'Action'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {MOCK_LEADS.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">{lead.createdAt}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{lead.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{lead.email}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-800">{lead.productName}</p>
                            {lead.chemicals.map(c => (
                              <span key={c.name} className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold mr-1">{c.name}</span>
                            ))}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${lead.source === 'scan' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                              {lead.source === 'scan' ? '📷 Scan' : '🚨 Recall'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              lead.status === 'sent' ? 'bg-green-100 text-green-700' :
                              lead.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {lead.status === 'sent' ? '✓ Sent' : lead.status === 'failed' ? '✗ Failed' : '⏳ Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {lead.status !== 'sent' && (
                              <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold">
                                <RefreshCw className="w-3 h-3" /> Retry
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {tab === 'settings' && (
            <div>
              <h1 className="text-2xl font-black text-gray-900 mb-6">Platform Settings</h1>
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-gray-900 mb-4">General Settings</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Platform Name', value: 'FoodFactScanner' },
                      { label: 'Support Email', value: 'hello@foodfactscanner.com' },
                      { label: 'Amazon Affiliate Tag', value: 'foodfacts01-20' },
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                        <input defaultValue={field.value} className="input-field" />
                      </div>
                    ))}
                    <button className="btn-primary text-sm px-4 py-2">Save Changes</button>
                  </div>
                </div>

                {/* Legal Leads Webhook */}
                <div className="bg-white rounded-2xl border-2 border-purple-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="w-5 h-5 text-purple-600" />
                    <h2 className="font-bold text-gray-900">⚖️ Legal Leads Webhook</h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Configure where mass-tort leads are forwarded. Leads are generated when users scan a high-risk product or click &ldquo;Free Legal Review&rdquo; on a recall alert.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Law Firm Webhook URL</label>
                      <div className="flex gap-2">
                        <input
                          value={webhookUrl}
                          onChange={e => { setWebhookUrl(e.target.value); setWebhookSaved(false) }}
                          placeholder="https://lawfirm.com/webhook/leads"
                          className="input-field flex-1"
                        />
                        <button
                          onClick={() => setWebhookSaved(true)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
                        >
                          {webhookSaved ? '✓ Saved' : 'Save'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Set via <code className="bg-gray-100 px-1 rounded">LEGAL_LEADS_WEBHOOK_URL</code> env var on Vercel</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Webhook Signing Secret</label>
                      <div className="flex gap-2 items-center">
                        <code className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-mono truncate">
                          {WEBHOOK_SECRET}
                        </code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(WEBHOOK_SECRET); setWebhookCopied(true); setTimeout(() => setWebhookCopied(false), 2000) }}
                          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors flex-shrink-0"
                        >
                          {webhookCopied ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          {webhookCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Verify inbound requests with <code className="bg-gray-100 px-1 rounded">X-FFS-Signature</code> header (HMAC-SHA256)</p>
                    </div>

                    {/* Recent Leads Mini Table */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">Recent Leads</label>
                        <button onClick={() => setTab('leads')} className="text-xs text-purple-600 font-semibold hover:underline flex items-center gap-1">
                          View All <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="rounded-xl border border-gray-100 overflow-hidden">
                        {MOCK_LEADS.slice(0, 5).map((lead, i) => (
                          <div key={lead.id} className={`flex items-center justify-between px-3 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-gray-400 text-xs">{lead.createdAt}</span>
                              <span className="font-semibold text-gray-800 truncate">{lead.name}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${lead.source === 'scan' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                {lead.source}
                              </span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              lead.status === 'sent' ? 'bg-green-100 text-green-700' :
                              lead.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {lead.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h2 className="font-bold text-gray-900 mb-4">Scan Limits by Plan</h2>
                  <div className="space-y-3">
                    {[
                      { plan: 'Free', limit: '5 scans/month', color: 'bg-gray-100' },
                      { plan: 'Pro', limit: 'Unlimited', color: 'bg-brand-50' },
                      { plan: 'Family', limit: 'Unlimited (5 profiles)', color: 'bg-purple-50' },
                    ].map(item => (
                      <div key={item.plan} className={`flex items-center justify-between p-3 rounded-xl ${item.color}`}>
                        <span className="font-medium text-gray-700">{item.plan}</span>
                        <span className="text-sm text-gray-600">{item.limit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
