import { Camera, Cpu, ShieldCheck, TrendingUp } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Camera,
      title: 'Scan or Enter Ingredients',
      description:
        'Take a photo of the ingredient label or type in the product name. Our OCR technology reads labels instantly — even tiny print.',
      highlight: 'Camera & barcode scanning supported',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600 bg-blue-100',
    },
    {
      number: '02',
      icon: Cpu,
      title: 'AI Analyzes Every Ingredient',
      description:
        'Our proprietary AI cross-references each ingredient against 2,400+ known toxic chemicals, heavy metals, pesticide residues, and harmful additives.',
      highlight: 'Results in under 3 seconds',
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600 bg-purple-100',
    },
    {
      number: '03',
      icon: ShieldCheck,
      title: 'Get Your Safety Score',
      description:
        'Receive a 1-100 safety score with a clear Safe / Caution / Danger rating. See exactly which chemicals were found, at what levels, and the health risks.',
      highlight: 'Color-coded for at-a-glance safety',
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600 bg-green-100',
    },
    {
      number: '04',
      icon: TrendingUp,
      title: 'Get Safer Recommendations',
      description:
        'Instantly see expert-curated safer alternatives ranked by safety score. Track your baby\'s exposure over time and get personalized safety reports.',
      highlight: 'Pediatrician-reviewed alternatives',
      color: 'bg-orange-50 border-orange-200',
      iconColor: 'text-orange-600 bg-orange-100',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-2 mb-4">
            <span className="text-brand-600 text-sm font-semibold">Simple 4-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            How FoodFactScanner{' '}
            <span className="text-brand-600">Protects Your Baby</span>
          </h2>
          <p className="text-lg text-gray-600">
            In less time than it takes to read the label, you'll know exactly what's in your baby's food and whether it's truly safe.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, i) => (
            <div key={step.title} className={`border-2 ${step.color} rounded-2xl p-6 relative`}>
              {/* Step Number */}
              <div className="absolute -top-3 left-6 bg-white border border-gray-200 rounded-lg px-2 py-0.5">
                <span className="text-xs font-black text-gray-400">{step.number}</span>
              </div>

              {/* Arrow connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 z-10 text-gray-300 text-xl font-bold">→</div>
              )}

              <div className={`w-12 h-12 ${step.iconColor} rounded-xl flex items-center justify-center mb-4 mt-2`}>
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{step.description}</p>
              <div className="bg-white/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 inline-block">
                ✓ {step.highlight}
              </div>
            </div>
          ))}
        </div>

        {/* Demo Visual */}
        <div className="bg-gradient-to-br from-slate-900 to-gray-900 rounded-3xl p-8 text-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">See It In Action</h3>
              <p className="text-gray-400 mb-6">
                Watch how FoodFactScanner analyzed a popular rice cereal and detected dangerous levels of arsenic in under 2 seconds.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Inorganic Arsenic', level: 87, max: 100, color: 'bg-red-500', unit: 'ppb' },
                  { label: 'Cadmium', level: 45, max: 100, color: 'bg-orange-500', unit: 'ppb' },
                  { label: 'Lead', level: 21, max: 100, color: 'bg-yellow-500', unit: 'ppb' },
                  { label: 'Mercury', level: 5, max: 100, color: 'bg-green-500', unit: 'ppb' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{item.label}</span>
                      <span className={item.level > 50 ? 'text-red-400 font-bold' : item.level > 20 ? 'text-yellow-400' : 'text-green-400'}>
                        {item.level} {item.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Overall Safety Score</span>
                <span className="text-xs text-gray-400">Beech-Nut Rice Cereal</span>
              </div>
              <div className="text-center py-6">
                <div className="text-8xl font-black text-red-400 mb-2">23</div>
                <div className="text-2xl font-bold text-red-400 mb-4">⚠️ DANGER</div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left">
                  <p className="text-red-300 text-sm font-semibold mb-1">Action Required:</p>
                  <p className="text-gray-400 text-sm">Arsenic levels detected are 8.7× above the safe limit for infants. Do not feed to babies under 12 months.</p>
                </div>
              </div>
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 mt-4">
                <p className="text-brand-300 text-sm font-semibold mb-2">3 Safer Alternatives Found:</p>
                {['Happy Baby Organics (Score: 96)', "Plum Organics (Score: 91)", 'Sprout Organic (Score: 89)'].map(alt => (
                  <div key={alt} className="flex items-center gap-2 text-sm text-gray-300 py-1">
                    <span className="text-brand-400">✓</span>
                    {alt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
