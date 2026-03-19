import { Star, Quote } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Mom of 8-month-old',
      location: 'Austin, TX',
      avatar: '👩',
      rating: 5,
      text: "I was devastated when FoodFactScanner flagged our favorite rice cereal with an arsenic level 8x the safe limit. I had been feeding it to my daughter for months. Now I scan EVERYTHING before buying. This app is non-negotiable for any parent.",
      highlight: 'Found arsenic 8x safe limit',
    },
    {
      name: 'Jennifer L.',
      role: 'Expecting Mom (32 weeks)',
      location: 'Denver, CO',
      avatar: '🤰',
      rating: 5,
      text: "Started using this while pregnant to check snacks and prenatal vitamins. The pre-natal section is amazing — it tracks everything I need to avoid. My OB was actually impressed and recommended it to her other patients!",
      highlight: 'OB-recommended',
    },
    {
      name: 'Maria T.',
      role: 'Mom of twins (10 months)',
      location: 'Miami, FL',
      avatar: '👩‍👧‍👦',
      rating: 5,
      text: "With twins, I was buying SO much baby food. This app helped me narrow down to 4 truly safe brands. I've probably saved hundreds of dollars avoiding premium brands that scored terribly and finding affordable options that scored 90+.",
      highlight: 'Saved money & peace of mind',
    },
    {
      name: 'Dr. Amanda K.',
      role: 'Pediatrician & Mom',
      location: 'New York, NY',
      avatar: '👩‍⚕️',
      rating: 5,
      text: "As a pediatrician, I've been recommending this app for 8 months. The science is solid, the database is comprehensive, and it gives parents accurate, actionable information. Not fearmongering — just facts. We need more tools like this.",
      highlight: 'Pediatrician-approved',
    },
    {
      name: 'Keisha R.',
      role: 'Mom of 14-month-old',
      location: 'Atlanta, GA',
      avatar: '🙎‍♀️',
      rating: 5,
      text: "The recall alert feature alone is worth every penny. Got a notification at 2am that a pouch I had in the pantry was recalled for glass contamination. Checked the fridge immediately. That's the kind of safety net every parent needs.",
      highlight: 'Recall alert saved the day',
    },
    {
      name: 'Emily W.',
      role: 'FTM, baby 6 months',
      location: 'Seattle, WA',
      avatar: '👶',
      rating: 5,
      text: "As a first-time mom, the amount of information out there is overwhelming. FoodFactScanner cuts through all the noise. Just scan it, get a score, and know if it's safe. The recommendations section introduced me to brands I never would have found.",
      highlight: 'Cuts through the noise',
    },
  ]

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2 mb-4">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-yellow-700 text-sm font-semibold">4.9/5 from 8,400+ Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
            Parents Love{' '}
            <span className="text-brand-600">FoodFactScanner</span>
          </h2>
          <p className="text-lg text-gray-600">
            Real stories from real parents who are protecting their babies every day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow relative">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-100" />

              {/* Rating */}
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Highlight badge */}
              <div className="inline-flex items-center gap-1 bg-brand-50 border border-brand-100 rounded-full px-2.5 py-1 mb-3">
                <span className="text-brand-600 text-xs font-semibold">"{t.highlight}"</span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4 text-sm">"{t.text}"</p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="text-3xl">{t.avatar}</div>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role} · {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Press Logos */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm font-medium mb-6 uppercase tracking-wider">As Featured In</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-40">
            {['CNN', 'The Washington Post', 'NPR', 'Consumer Reports', 'Today', 'Good Housekeeping'].map(press => (
              <span key={press} className="text-gray-700 font-bold text-lg">{press}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
