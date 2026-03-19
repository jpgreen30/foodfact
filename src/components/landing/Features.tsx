import {
  Scan, Database, Bell, LineChart, ShoppingBag,
  Baby, Heart, FileText, Zap, Globe, Lock, RefreshCw
} from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: Scan,
      title: 'Instant AI Scanning',
      description: 'Scan barcodes, photograph labels, or type product names. Get results in under 3 seconds.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Database,
      title: '2,400+ Chemical Database',
      description: 'Cross-referenced against heavy metals, pesticides, artificial additives, endocrine disruptors, and more.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Bell,
      title: 'Recall Alerts',
      description: 'Get instant push notifications when products you\'ve scanned or saved are recalled by the FDA.',
      color: 'bg-red-50 text-red-600',
    },
    {
      icon: LineChart,
      title: 'Exposure Tracking',
      description: 'Track cumulative chemical exposure over time. See trends and get alerts when thresholds are approached.',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: ShoppingBag,
      title: 'Safe Alternatives',
      description: 'Every scan recommends safer alternatives, ranked by safety score and reviewed by pediatric nutritionists.',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: Baby,
      title: 'Age-Specific Analysis',
      description: 'Safety thresholds automatically adjust based on your baby\'s age. Different limits for 0-6, 6-12, and 12+ months.',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      icon: Heart,
      title: 'Pre & Post-Natal Support',
      description: 'Track pregnancy nutrition, prenatal vitamin safety, postnatal recovery, and breastfeeding diet analysis.',
      color: 'bg-rose-50 text-rose-600',
    },
    {
      icon: FileText,
      title: 'Scan History & Reports',
      description: 'Keep a complete history of every scan. Generate weekly safety reports to share with your pediatrician.',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      icon: Globe,
      title: 'International Products',
      description: 'Database covers US, European, and Canadian products. Includes imported brands from 40+ countries.',
      color: 'bg-teal-50 text-teal-600',
    },
    {
      icon: Zap,
      title: 'Instant Label OCR',
      description: 'Our camera reads tiny ingredient labels instantly. No more squinting at fine print.',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      icon: Lock,
      title: 'Private & Secure',
      description: 'Your data is encrypted and never sold. HIPAA-compliant data handling for your health information.',
      color: 'bg-gray-50 text-gray-600',
    },
    {
      icon: RefreshCw,
      title: 'Always Updated',
      description: 'Database updated weekly with new research, FDA findings, and emerging chemical risks.',
      color: 'bg-cyan-50 text-cyan-600',
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-2 mb-4">
            <span className="text-brand-600 text-sm font-semibold">Everything You Need to Keep Baby Safe</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Powerful Features for{' '}
            <span className="text-brand-600">Peace of Mind</span>
          </h2>
          <p className="text-lg text-gray-600">
            More than just a scanner — FoodFactScanner is your complete baby food safety companion from pre-natal through toddler years.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className={`w-11 h-11 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <div className="mt-16 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 text-center">How We Compare</h3>
            <p className="text-gray-500 text-center mt-2">See why 24,000+ parents choose FoodFactScanner</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 text-left text-gray-500 font-medium">Feature</th>
                  <th className="p-4 text-center bg-brand-50 text-brand-700 font-bold">FoodFactScanner</th>
                  <th className="p-4 text-center text-gray-500 font-medium">Checking Label Yourself</th>
                  <th className="p-4 text-center text-gray-500 font-medium">Generic Food Apps</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Toxic Chemical Detection', true, false, false],
                  ['Heavy Metal Analysis', true, false, false],
                  ['2,400+ Chemical Database', true, false, false],
                  ['AI-Powered Results', true, false, false],
                  ['Age-Specific Thresholds', true, false, false],
                  ['Recall Alerts', true, false, 'partial'],
                  ['Safer Alternatives', true, false, false],
                  ['Pre/Post-Natal Tracking', true, false, false],
                  ['Pediatrician-Reviewed', true, false, false],
                ].map(([feature, ffs, manual, generic]) => (
                  <tr key={String(feature)} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 text-gray-700 font-medium text-sm">{feature}</td>
                    <td className="p-4 text-center bg-brand-50/50">
                      {ffs === true ? <span className="text-brand-600 text-lg font-bold">✓</span> : <span className="text-gray-300 text-lg">✗</span>}
                    </td>
                    <td className="p-4 text-center">
                      {manual === true ? <span className="text-green-500 text-lg font-bold">✓</span> : <span className="text-gray-300 text-lg">✗</span>}
                    </td>
                    <td className="p-4 text-center">
                      {generic === true ? <span className="text-green-500 text-lg font-bold">✓</span> :
                       generic === 'partial' ? <span className="text-yellow-500 text-lg">~</span> :
                       <span className="text-gray-300 text-lg">✗</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
