import Link from 'next/link'
import { Shield, Scan, ChevronRight } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-20 h-20 bg-brand-500/20 border border-brand-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-brand-400" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
          Your Baby Deserves{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-green-300">
            The Safest Food.
          </span>
        </h2>

        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Join 24,000+ parents who use FoodFactScanner to protect their babies from hidden toxins in food.
          Start for free. No credit card required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            href="/login?signup=true"
            className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200 shadow-2xl shadow-brand-500/40 hover:shadow-brand-400/50 hover:-translate-y-1"
          >
            <Scan className="w-5 h-5" />
            Start Free — No Card Needed
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
          {[
            '✓ Free plan always available',
            '✓ 7-day Pro trial',
            '✓ Cancel anytime',
            '✓ 30-day money back',
          ].map(item => (
            <span key={item} className="font-medium">{item}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
