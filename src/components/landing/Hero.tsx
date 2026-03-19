'use client'

import Link from 'next/link'
import { Shield, Scan, AlertTriangle, CheckCircle, Star, ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 pt-16">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-brand-400" />
              <span className="text-brand-400 text-sm font-semibold">AI-Powered Baby Food Safety</span>
              <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Is Your Baby's{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-green-300">
                Food Safe?
              </span>
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-300 mb-6">
              Scan Any Baby Food in Seconds.{' '}
              <span className="text-red-400">Detect Hidden Toxins</span>{' '}
              Before They Reach Your Baby.
            </h2>

            <p className="text-lg text-gray-400 mb-8 max-w-xl">
              Our AI analyzes every ingredient against a database of{' '}
              <span className="text-white font-semibold">2,400+ toxic chemicals</span>,
              heavy metals, and harmful additives — giving you instant safety scores and
              safer alternatives recommended by pediatric nutritionists.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link
                href="/login?signup=true"
                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200 shadow-2xl shadow-brand-500/40 hover:shadow-brand-400/50 hover:-translate-y-1"
              >
                <Scan className="w-5 h-5" />
                Start Scanning Free
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold text-lg px-8 py-4 rounded-2xl border border-white/20 transition-all duration-200 hover:-translate-y-1"
              >
                See How It Works
              </a>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
              <div className="flex -space-x-2">
                {['bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400'].map((color, i) => (
                  <div key={i} className={`w-9 h-9 ${color} rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold`}>
                    {['S', 'E', 'M', 'J', 'A'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  <span className="text-yellow-400 font-bold ml-1">4.9/5</span>
                </div>
                <p className="text-gray-400 text-sm">Trusted by <span className="text-white font-semibold">24,000+</span> moms & dads</p>
              </div>
            </div>
          </div>

          {/* Right: App Preview Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Main Scanner Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-400" />
                    <span className="text-white font-semibold text-sm">Scan Result</span>
                  </div>
                  <span className="text-gray-400 text-xs">Just now</span>
                </div>

                {/* Product */}
                <div className="bg-white/5 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center text-2xl">
                      🥣
                    </div>
                    <div>
                      <p className="text-white font-semibold">Rice & Banana Cereal</p>
                      <p className="text-gray-400 text-sm">Beech-Nut Stage 1</p>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-bold">DANGER DETECTED</span>
                    </div>
                    <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">Score: 23/100</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Inorganic Arsenic', level: 'HIGH', color: 'text-red-400' },
                      { name: 'Cadmium', level: 'MED', color: 'text-yellow-400' },
                    ].map((c) => (
                      <div key={c.name} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{c.name}</span>
                        <span className={`${c.color} text-xs font-bold`}>{c.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safe Alternative */}
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-brand-400" />
                    <span className="text-brand-400 font-semibold text-sm">Safer Alternative Found</span>
                  </div>
                  <p className="text-white text-sm font-medium">Happy Baby Organics Sweet Potatoes</p>
                  <p className="text-gray-400 text-xs mt-1">Score: 96/100 · No toxins detected</p>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2 animate-bounce">
                <span className="text-2xl">🔬</span>
                <div>
                  <p className="text-xs font-bold text-gray-800">AI Analysis</p>
                  <p className="text-xs text-gray-500">2,400+ chemicals</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-xs font-bold text-gray-800">Instant Results</p>
                  <p className="text-xs text-gray-500">Under 3 seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '24,871+', label: 'Parents Protected', icon: '👪' },
            { value: '487K+', label: 'Products Scanned', icon: '🔍' },
            { value: '2,400+', label: 'Chemicals Monitored', icon: '🧪' },
            { value: '98%', label: 'Detection Accuracy', icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-12">
          <a href="#problem" className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors">
            <span className="text-sm">Scroll to learn more</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  )
}
