import { Shield, WifiOff } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-8 h-8 text-white/60" />
        </div>
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">FoodFact<span className="text-brand-400">Scanner</span></span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">You&apos;re offline</h1>
        <p className="text-gray-400 mb-8">
          No internet connection. Check your network and try again — your scan history is saved.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors"
        >
          Try again
        </Link>
      </div>
    </div>
  )
}
