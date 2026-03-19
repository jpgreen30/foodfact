'use client'

import { UserProfile } from '@/lib/types'
import { getRecommendedProducts } from '@/lib/affiliate-products'
import { getPregnancyWeek, getBabyAgeLabel } from '@/lib/brevo'
import { ExternalLink, Star } from 'lucide-react'

interface StageWidgetProps {
  userProfile: UserProfile
}

function getTrimesterLabel(week: number): string {
  if (week <= 12) return 'First Trimester'
  if (week <= 26) return 'Second Trimester'
  return 'Third Trimester'
}

function getTrimesterTips(week: number): string[] {
  if (week <= 12) {
    return [
      `Week ${week}: Neural tube development is critical — ensure you're getting 400–800mcg of folate daily.`,
      'Avoid deli meats, raw fish, and unpasteurized products. When in doubt, scan it first!',
    ]
  } else if (week <= 26) {
    return [
      `Week ${week}: Baby can now hear you! Focus on DHA-rich foods for brain and eye development.`,
      'Increase iron intake — lean meats, lentils, and fortified cereals help prevent anemia.',
    ]
  } else {
    return [
      `Week ${week}: Third trimester growth surge! Keep up calcium and vitamin D for bone formation.`,
      'Limit high-mercury fish. Wild-caught salmon is safe and packed with omega-3s.',
    ]
  }
}

function getMonthTips(months: number): string[] {
  if (months <= 3) {
    return [
      `Month ${months}: Tummy time every day strengthens neck and shoulder muscles.`,
      'Breast milk or formula only — no water or solids needed yet.',
    ]
  } else if (months <= 6) {
    return [
      `Month ${months}: Watch for solid-food readiness: sitting with support and showing interest in your food.`,
      'Start with single-ingredient purees. Wait 3–5 days between new foods to catch allergies.',
    ]
  } else if (months <= 12) {
    return [
      `Month ${months}: Offer a variety of textures and flavors now to reduce picky eating later.`,
      'Avoid honey, cow\'s milk as main drink, and added sugar. Scan all packaged baby foods!',
    ]
  } else {
    return [
      `Month ${months}: Toddlers can share most family meals — just watch sodium and added sugar.`,
      'Many toddler snacks hide heavy metals and artificial dyes. Keep scanning everything!',
    ]
  }
}

export default function StageWidget({ userProfile }: StageWidgetProps) {
  const { momStatus, dueDate, babyAgeMonths, babyName, concerns } = userProfile

  let headerEmoji = '🌿'
  let stageTitle = 'Your Food Safety Guide'
  let stageSubtitle = 'Personalized recommendations for your family'
  let tips: string[] = [
    'Always scan food labels before feeding your little one.',
    'Choose organic produce from the Environmental Working Group\'s Dirty Dozen list.',
  ]
  let gradientClass = 'from-green-50 to-emerald-50'
  let accentColor = '#16a34a'

  if (momStatus === 'expecting' && dueDate) {
    const week = getPregnancyWeek(dueDate)
    const trimester = getTrimesterLabel(week)
    headerEmoji = '🤰'
    stageTitle = `Week ${week} of Pregnancy`
    stageSubtitle = trimester
    tips = getTrimesterTips(week)
    gradientClass = 'from-purple-50 to-pink-50'
    accentColor = '#9333ea'
  } else if (momStatus === 'expecting') {
    headerEmoji = '🤰'
    stageTitle = 'Pregnancy Food Safety'
    stageSubtitle = 'Protecting you and your baby'
    tips = [
      'Scan all packaged foods — many contain hidden heavy metals and additives to avoid during pregnancy.',
      'Focus on folate, iron, calcium, and DHA from safe, tested sources.',
    ]
    gradientClass = 'from-purple-50 to-pink-50'
    accentColor = '#9333ea'
  } else if ((momStatus === 'newborn' || momStatus === 'toddler') && babyAgeMonths !== undefined) {
    const ageLabel = getBabyAgeLabel(babyAgeMonths)
    headerEmoji = '👶'
    stageTitle = babyName ? `${babyName} is ${ageLabel}` : ageLabel
    stageSubtitle = 'Stage-based nutrition guide'
    tips = getMonthTips(babyAgeMonths)
    gradientClass = 'from-blue-50 to-cyan-50'
    accentColor = '#0284c7'
  } else if (momStatus === 'planning') {
    headerEmoji = '💚'
    stageTitle = 'Preconception Nutrition'
    stageSubtitle = 'Getting your body ready'
    tips = [
      'Start prenatal vitamins with folate 3 months before trying to conceive.',
      'Reduce exposure to pesticides and heavy metals now — they can affect fertility.',
    ]
    gradientClass = 'from-teal-50 to-green-50'
    accentColor = '#0d9488'
  }

  const recommendedProducts = getRecommendedProducts(concerns ?? [], momStatus).slice(0, 2)

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradientClass} border border-white p-5 mb-4`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{headerEmoji}</span>
            <h3 className="font-bold text-gray-900 text-base">{stageTitle}</h3>
          </div>
          <p className="text-xs text-gray-500 ml-9">{stageSubtitle}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="mt-0.5 shrink-0" style={{ color: accentColor }}>•</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>

      {recommendedProducts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Recommended for your stage
          </p>
          <div className="grid grid-cols-2 gap-2">
            {recommendedProducts.map(product => (
              <a
                key={product.id}
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-3 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-2">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">
                      {product.title}
                    </p>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-gray-500">{product.rating}</span>
                    </div>
                    <p className="text-xs font-bold text-green-600">{product.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-amber-600">
                  <span>Buy on Amazon</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
