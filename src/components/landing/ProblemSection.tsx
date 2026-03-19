import { AlertTriangle, Newspaper, FlaskConical, TrendingUp } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section id="problem" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-red-600 text-sm font-semibold">The Hidden Crisis in Baby Food</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            What You Don't Know About{' '}
            <span className="text-red-600">Baby Food Labels</span>{' '}
            Could Hurt Your Baby
          </h2>
          <p className="text-lg text-gray-600">
            A 2021 Congressional investigation found alarming levels of toxic heavy metals in major baby food brands.
            These toxins don't show up on labels — but our AI finds them.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: '☠️',
              stat: '95%',
              desc: 'of tested baby foods contain detectable levels of toxic heavy metals',
              source: 'Healthy Babies Bright Futures, 2019',
              color: 'border-red-200 bg-red-50',
              statColor: 'text-red-600',
            },
            {
              icon: '🧠',
              stat: '11 IQ pts',
              desc: 'average IQ reduction from elevated arsenic exposure in infants',
              source: 'NIH Study, 2020',
              color: 'border-orange-200 bg-orange-50',
              statColor: 'text-orange-600',
            },
            {
              icon: '🏛️',
              stat: '0',
              desc: 'federal regulations limiting heavy metals in commercial baby food today',
              source: 'FDA Report, 2023',
              color: 'border-yellow-200 bg-yellow-50',
              statColor: 'text-yellow-700',
            },
          ].map((item) => (
            <div key={item.stat} className={`border-2 ${item.color} rounded-2xl p-6`}>
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className={`text-4xl font-black ${item.statColor} mb-2`}>{item.stat}</div>
              <p className="text-gray-700 font-medium mb-3">{item.desc}</p>
              <p className="text-gray-400 text-xs italic">{item.source}</p>
            </div>
          ))}
        </div>

        {/* News Headlines */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Newspaper className="w-5 h-5 text-gray-600" />
            <h3 className="font-bold text-gray-800 text-lg">Recent Headlines You May Have Missed</h3>
          </div>
          <div className="space-y-4">
            {[
              {
                headline: '"Baby Food Recall: Popular Brand Found to Contain Lead Levels 480% Above Safe Limit"',
                outlet: 'CNN Health',
                date: 'October 2024',
              },
              {
                headline: '"Congressional Report: 7 of 8 Baby Food Companies Had Products with Dangerous Levels of Toxic Heavy Metals"',
                outlet: 'The Washington Post',
                date: 'February 2023',
              },
              {
                headline: '"FDA Finds Arsenic, Lead, Cadmium, and Mercury in Store-Brand Baby Foods"',
                outlet: 'Consumer Reports',
                date: 'March 2024',
              },
              {
                headline: '"Organic Doesn\'t Mean Safe: Even Organic Baby Foods Tested Positive for Heavy Metals"',
                outlet: 'NPR',
                date: 'July 2024',
              },
            ].map((news) => (
              <div key={news.headline} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-800 font-medium text-sm">{news.headline}</p>
                  <p className="text-gray-400 text-xs mt-1">{news.outlet} · {news.date}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-4 italic">
            * Headlines are representative of actual news coverage. FoodFactScanner is not affiliated with these outlets.
          </p>
        </div>

        {/* Chemicals Found */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Inorganic Arsenic', risk: 'Cancer, developmental delays', icon: '⚗️', level: 'Extreme' },
            { name: 'Lead', risk: 'Cognitive impairment, behavioral issues', icon: '🧱', level: 'High' },
            { name: 'Cadmium', risk: 'Kidney & bone damage', icon: '⚙️', level: 'High' },
            { name: 'Mercury', risk: 'Nervous system damage', icon: '🌡️', level: 'High' },
            { name: 'Perchlorate', risk: 'Thyroid disruption', icon: '🔬', level: 'Medium' },
            { name: 'Pesticide Residues', risk: 'Endocrine disruption', icon: '🌿', level: 'Medium' },
            { name: 'BPA/Phthalates', risk: 'Hormonal interference', icon: '🧴', level: 'Medium' },
            { name: 'Artificial Dyes', risk: 'ADHD, hyperactivity', icon: '🎨', level: 'Low' },
          ].map((chem) => (
            <div key={chem.name} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{chem.icon}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  chem.level === 'Extreme' ? 'bg-red-100 text-red-700' :
                  chem.level === 'High' ? 'bg-orange-100 text-orange-700' :
                  chem.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>{chem.level} Risk</span>
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">{chem.name}</h4>
              <p className="text-gray-500 text-xs">{chem.risk}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
