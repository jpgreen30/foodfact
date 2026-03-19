import { AffiliateProduct } from './types'

// Amazon affiliate tag: foodfacts01-20
const TAG = 'foodfacts01-20'

function amazonLink(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${TAG}`
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  // Organic Baby Food
  {
    id: 'p1',
    title: 'Happy Baby Organics Clearly Crafted Stage 1 Baby Food',
    description: 'USDA Organic, non-GMO verified. No heavy metals detected. Perfect for 0-6 months.',
    price: '$24.99',
    rating: 4.8,
    reviewCount: 12847,
    imageUrl: 'https://m.media-amazon.com/images/I/71kOQh6RZ0L._SL1500_.jpg',
    affiliateUrl: amazonLink('B07BWJSG9Q'),
    category: 'organic-food',
    tags: ['organic', 'stage-1', 'no-heavy-metals', 'top-pick'],
    badge: '#1 Safest Pick',
  },
  {
    id: 'p2',
    title: 'Plum Organics Stage 1 Baby Food Variety Pack',
    description: 'USDA Certified Organic. Single-ingredient purees. Lab-tested for pesticides.',
    price: '$19.99',
    rating: 4.7,
    reviewCount: 8923,
    imageUrl: 'https://m.media-amazon.com/images/I/81LmUJ8ycGL._SL1500_.jpg',
    affiliateUrl: amazonLink('B001FA1LOI'),
    category: 'organic-food',
    tags: ['organic', 'stage-1', 'pesticide-free', 'variety-pack'],
    badge: 'Best Value',
  },
  {
    id: 'p3',
    title: "Gerber Organic 1st Foods Baby Food Pouches",
    description: 'USDA Organic. Non-GMO Project verified. Gentle on tiny tummies.',
    price: '$16.98',
    rating: 4.6,
    reviewCount: 6541,
    imageUrl: 'https://m.media-amazon.com/images/I/71o6LJpbLfL._SL1500_.jpg',
    affiliateUrl: amazonLink('B07H81BNYJ'),
    category: 'organic-food',
    tags: ['organic', 'stage-1', 'pouches', 'non-gmo'],
  },

  // Prenatal Vitamins
  {
    id: 'p4',
    title: 'Garden of Life Vitamin Code Raw Prenatal',
    description: 'Whole food prenatal multivitamin. Folate (not folic acid), iron, D3. Raw, vegan certified.',
    price: '$44.99',
    rating: 4.7,
    reviewCount: 15632,
    imageUrl: 'https://m.media-amazon.com/images/I/71tV0Ru4F0L._SL1500_.jpg',
    affiliateUrl: amazonLink('B00280EQLK'),
    category: 'prenatal-vitamins',
    tags: ['prenatal', 'organic', 'vegan', 'whole-food', 'top-pick'],
    badge: 'OB-Recommended',
  },
  {
    id: 'p5',
    title: 'Ritual Essential Prenatal Multivitamin',
    description: 'Clinically-studied prenatal. Omega-3 DHA, iron, folate. No nausea formula.',
    price: '$39.00',
    rating: 4.5,
    reviewCount: 9871,
    imageUrl: 'https://m.media-amazon.com/images/I/51P12pR7XGL._SL1200_.jpg',
    affiliateUrl: amazonLink('B07M8NSJXC'),
    category: 'prenatal-vitamins',
    tags: ['prenatal', 'dha', 'folate', 'no-nausea'],
    badge: 'Trending',
  },

  // Postnatal Vitamins
  {
    id: 'p6',
    title: 'MegaFood Baby & Me 2 Postnatal Multi',
    description: 'Postnatal support for nursing moms. Supports breast milk quality. Farm-fresh ingredients.',
    price: '$49.99',
    rating: 4.6,
    reviewCount: 5214,
    imageUrl: 'https://m.media-amazon.com/images/I/71DgM1hYDUL._SL1500_.jpg',
    affiliateUrl: amazonLink('B01N0XR40R'),
    category: 'postnatal-vitamins',
    tags: ['postnatal', 'breastfeeding', 'nursing', 'whole-food'],
    badge: 'Breastfeeding Moms',
  },
  {
    id: 'p7',
    title: "Pink Stork Postnatal Support Tea",
    description: 'Organic lactation tea. Fenugreek, blessed thistle, fennel. Supports milk supply.',
    price: '$15.99',
    rating: 4.4,
    reviewCount: 7832,
    imageUrl: 'https://m.media-amazon.com/images/I/71+0M2X7taL._SL1500_.jpg',
    affiliateUrl: amazonLink('B075MYVZ6Q'),
    category: 'postnatal-vitamins',
    tags: ['postnatal', 'lactation', 'organic', 'tea'],
  },

  // Food Makers
  {
    id: 'p8',
    title: 'BEABA Babycook Neo Baby Food Maker',
    description: 'Steam cook & blend in 15 minutes. BPA-free. Makes up to 5.5 cups. Award-winning design.',
    price: '$179.95',
    rating: 4.8,
    reviewCount: 4521,
    imageUrl: 'https://m.media-amazon.com/images/I/71VFcHDq97L._SL1500_.jpg',
    affiliateUrl: amazonLink('B07VQYG8BX'),
    category: 'food-makers',
    tags: ['bpa-free', 'steam-cook', 'blend', 'award-winning'],
    badge: 'Editor\'s Choice',
  },
  {
    id: 'p9',
    title: 'NutriBullet Baby Complete Food-Making System',
    description: 'Powerful blending for smooth purees. Batch processing. Freezer-safe storage cups included.',
    price: '$79.99',
    rating: 4.6,
    reviewCount: 11243,
    imageUrl: 'https://m.media-amazon.com/images/I/81YHJqUf2DL._SL1500_.jpg',
    affiliateUrl: amazonLink('B074DZWLQQ'),
    category: 'food-makers',
    tags: ['blender', 'batch-cooking', 'storage-cups', 'bpa-free'],
  },

  // Storage
  {
    id: 'p10',
    title: 'WeeSprout Glass Baby Food Storage Jars',
    description: '4 oz glass jars with lids. BPA-free, no plastic leaching. Oven, microwave & freezer safe.',
    price: '$22.99',
    rating: 4.7,
    reviewCount: 8901,
    imageUrl: 'https://m.media-amazon.com/images/I/81YXk2qWYQL._SL1500_.jpg',
    affiliateUrl: amazonLink('B07FKWKWXH'),
    category: 'storage',
    tags: ['glass', 'bpa-free', 'freezer-safe', 'no-plastic'],
    badge: 'Chemical-Free',
  },
  {
    id: 'p11',
    title: 'Infantino Squeeze Station Baby Food Pouches',
    description: 'Fill reusable pouches with your own healthy purees. Dishwasher safe. Zero waste.',
    price: '$29.99',
    rating: 4.5,
    reviewCount: 6754,
    imageUrl: 'https://m.media-amazon.com/images/I/71IkM7JlT9L._SL1500_.jpg',
    affiliateUrl: amazonLink('B00N3GBGZA'),
    category: 'storage',
    tags: ['reusable', 'pouches', 'zero-waste', 'dishwasher-safe'],
  },

  // Testing Kits
  {
    id: 'p12',
    title: 'Tamper-Proof Heavy Metals Test Kit for Baby Food',
    description: 'At-home test for lead, arsenic, cadmium, mercury. Lab-certified results in 5 days.',
    price: '$89.00',
    rating: 4.4,
    reviewCount: 1234,
    imageUrl: 'https://m.media-amazon.com/images/I/71uPlnHOUmL._SL1500_.jpg',
    affiliateUrl: amazonLink('B08KGBWTYV'),
    category: 'testing-kits',
    tags: ['heavy-metals', 'lead', 'arsenic', 'lab-certified'],
    badge: 'Peace of Mind',
  },

  // Feeding Gear
  {
    id: 'p13',
    title: 'Boon PULP Silicone Feeder',
    description: 'BPA, BPS, PVC & phthalate free. Introduce fresh fruits & veggies safely. Easy clean.',
    price: '$12.99',
    rating: 4.6,
    reviewCount: 9876,
    imageUrl: 'https://m.media-amazon.com/images/I/71OEMhMlY4L._SL1500_.jpg',
    affiliateUrl: amazonLink('B07XK5FDXH'),
    category: 'feeding-gear',
    tags: ['silicone', 'bpa-free', 'phthalate-free', 'feeder'],
  },
  {
    id: 'p14',
    title: 'NumNum Pre-Spoon GOOtensils (2 Stage Pack)',
    description: 'No toxins, no BPA. Designed for self-feeding 6+ months. Dishwasher safe silicone.',
    price: '$11.99',
    rating: 4.7,
    reviewCount: 14523,
    imageUrl: 'https://m.media-amazon.com/images/I/71Zw8RNHE2L._SL1500_.jpg',
    affiliateUrl: amazonLink('B00M9GVTXG'),
    category: 'feeding-gear',
    tags: ['silicone', 'bpa-free', 'self-feeding', 'dishwasher-safe'],
    badge: 'Parent Favorite',
  },

  // Baby Formula
  {
    id: 'p15',
    title: "Holle Organic Infant Formula Stage 1",
    description: 'European organic standard (Demeter biodynamic). No GMOs, no corn syrup. DHA & ARA.',
    price: '$44.95',
    rating: 4.8,
    reviewCount: 3421,
    imageUrl: 'https://m.media-amazon.com/images/I/61xH+5NJMmL._SL1200_.jpg',
    affiliateUrl: amazonLink('B07V6Y9Y3M'),
    category: 'baby-formula',
    tags: ['european', 'biodynamic', 'no-corn-syrup', 'dha'],
    badge: 'Cleanest Formula',
  },

  // NEW: More Prenatal Vitamins
  {
    id: 'p16',
    title: 'New Chapter Perfect Prenatal Multivitamin',
    description: 'Fermented whole-food prenatal. Gentle on empty stomach. 24 nutrients including DHA, D3, iron.',
    price: '$46.95',
    rating: 4.7,
    reviewCount: 18204,
    imageUrl: 'https://m.media-amazon.com/images/I/71vJcWqmhQL._SL1500_.jpg',
    affiliateUrl: amazonLink('B01M4MFBZ4'),
    category: 'prenatal-vitamins',
    tags: ['prenatal', 'fermented', 'whole-food', 'gentle-stomach', 'dha'],
    badge: 'Midwife Approved',
  },
  {
    id: 'p17',
    title: "Nature Made Prenatal Multi + DHA",
    description: 'USP verified. 200mg DHA from fish oil. Essential nutrients for mom and baby. Easy swallow softgel.',
    price: '$19.99',
    rating: 4.6,
    reviewCount: 31567,
    imageUrl: 'https://m.media-amazon.com/images/I/71vFQ3i6-tL._SL1500_.jpg',
    affiliateUrl: amazonLink('B001F0R8OE'),
    category: 'prenatal-vitamins',
    tags: ['prenatal', 'dha', 'usp-verified', 'budget-friendly'],
    badge: 'Best Budget',
  },

  // NEW: Water Filter (Heavy Metals)
  {
    id: 'p18',
    title: 'Clearly Filtered Water Pitcher — Removes 365+ Contaminants',
    description: 'Removes 99.9% of lead, arsenic, fluoride, and chloramine. NSF certified. Perfect for baby formula.',
    price: '$89.99',
    rating: 4.8,
    reviewCount: 7823,
    imageUrl: 'https://m.media-amazon.com/images/I/71HqMzeIoGL._SL1500_.jpg',
    affiliateUrl: amazonLink('B01N4N7GMC'),
    category: 'testing-kits',
    tags: ['water-filter', 'heavy-metals', 'lead-removal', 'arsenic', 'nsf-certified', 'no-heavy-metals'],
    badge: 'Heavy Metals Protection',
  },

  // NEW: Organic Toddler Snacks
  {
    id: 'p19',
    title: "Serenity Kids Organic Toddler Puffs — Veggie & Grain",
    description: 'No rice (low arsenic). Organic veggies, no added sugar. Allergen-friendly. 12+ months.',
    price: '$21.99',
    rating: 4.7,
    reviewCount: 4312,
    imageUrl: 'https://m.media-amazon.com/images/I/71Q9lO8pGYL._SL1500_.jpg',
    affiliateUrl: amazonLink('B09B3QPPQB'),
    category: 'organic-food',
    tags: ['toddler', 'no-rice', 'low-arsenic', 'organic', 'no-sugar', 'snacks'],
    badge: 'Low Arsenic',
  },
  {
    id: 'p20',
    title: "Once Upon a Farm Organic Toddler Pouches — Variety Pack",
    description: 'Cold-pressed, never heated. No preservatives. Real whole food ingredients. 3rd party tested.',
    price: '$29.99',
    rating: 4.6,
    reviewCount: 9871,
    imageUrl: 'https://m.media-amazon.com/images/I/81sJk25gYGL._SL1500_.jpg',
    affiliateUrl: amazonLink('B07MKB83GS'),
    category: 'organic-food',
    tags: ['toddler', 'cold-pressed', 'organic', 'no-preservatives', 'pouches'],
  },
  {
    id: 'p21',
    title: "Sprout Organic Toddler Meals — Power Pack Variety",
    description: 'USDA organic complete toddler meals. Balanced macros. No artificial anything. BPA-free packaging.',
    price: '$34.99',
    rating: 4.5,
    reviewCount: 3201,
    imageUrl: 'https://m.media-amazon.com/images/I/71lGiNH3vRL._SL1500_.jpg',
    affiliateUrl: amazonLink('B07GVQKMS4'),
    category: 'organic-food',
    tags: ['toddler', 'organic', 'complete-meal', 'bpa-free'],
  },

  // NEW: BPA-Free Storage Set
  {
    id: 'p22',
    title: 'OXO Tot Glass Baby Food Storage Containers (20-piece)',
    description: 'Borosilicate glass, no BPA/BPS/phthalates. Stackable design. Oven, microwave & freezer safe.',
    price: '$39.99',
    rating: 4.8,
    reviewCount: 6543,
    imageUrl: 'https://m.media-amazon.com/images/I/71kn8-LKbQL._SL1500_.jpg',
    affiliateUrl: amazonLink('B07PQHKR3M'),
    category: 'storage',
    tags: ['glass', 'bpa-free', 'bps-free', 'phthalate-free', 'freezer-safe', 'stackable'],
    badge: 'Zero Chemical Leaching',
  },

  // NEW: Organic Meal Pouches
  {
    id: 'p23',
    title: "Amara Organic Baby Food — Breastmilk Mixing Powder",
    description: 'Mix with breast milk or formula. No water — preserves nutrients. Single-ingredient organic.',
    price: '$27.99',
    rating: 4.7,
    reviewCount: 2847,
    imageUrl: 'https://m.media-amazon.com/images/I/71zF4v0e1kL._SL1500_.jpg',
    affiliateUrl: amazonLink('B07KPQDQDP'),
    category: 'organic-food',
    tags: ['organic', 'breastmilk-compatible', 'no-water', 'single-ingredient', 'stage-1'],
    badge: 'Breastmilk Mixing',
  },

  // NEW: Lactation Supplement
  {
    id: 'p24',
    title: 'Legendairy Milk Organic Lactation Supplement',
    description: 'Fenugreek-free formula. Organic herbs: goat\'s rue, moringa, shatavari. 3rd-party tested.',
    price: '$32.99',
    rating: 4.6,
    reviewCount: 14203,
    imageUrl: 'https://m.media-amazon.com/images/I/71Mv9F4qrML._SL1500_.jpg',
    affiliateUrl: amazonLink('B07C3VQ6D4'),
    category: 'postnatal-vitamins',
    tags: ['lactation', 'breastfeeding', 'fenugreek-free', 'organic', 'milk-supply'],
    badge: 'Top Lactation Pick',
  },

  // NEW: Postnatal Vitamin
  {
    id: 'p25',
    title: 'Perelel Postpartum Pack — Trimester-Specific Vitamins',
    description: 'OB-formulated postpartum support. Omega-3, iron, choline, vitamin D. Individual daily packs.',
    price: '$55.00',
    rating: 4.7,
    reviewCount: 3891,
    imageUrl: 'https://m.media-amazon.com/images/I/71oS3JkOjzL._SL1500_.jpg',
    affiliateUrl: amazonLink('B08T1GGQ8T'),
    category: 'postnatal-vitamins',
    tags: ['postnatal', 'ob-formulated', 'omega-3', 'choline', 'daily-packs'],
    badge: 'OB Formulated',
  },
]

export function getProductsByCategory(category: string): AffiliateProduct[] {
  return AFFILIATE_PRODUCTS.filter(p => p.category === category)
}

export function getRecommendedProducts(
  concerns: string[],
  momStatus: string,
  options?: { pregnancyWeek?: number; babyAgeMonths?: number }
): AffiliateProduct[] {
  const recommended: AffiliateProduct[] = []
  const { pregnancyWeek, babyAgeMonths } = options ?? {}

  if (momStatus === 'expecting') {
    if (pregnancyWeek !== undefined) {
      // Trimester-specific prenatal vitamin picks
      if (pregnancyWeek <= 12) {
        // 1st trimester: folate / whole-food focus
        recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
          p.category === 'prenatal-vitamins' &&
          (p.tags.includes('whole-food') || p.tags.includes('folate') || p.id === 'p4' || p.id === 'p16')
        ))
      } else if (pregnancyWeek <= 26) {
        // 2nd trimester: iron + DHA focus
        recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
          p.category === 'prenatal-vitamins' &&
          (p.tags.includes('dha') || p.tags.includes('iron') || p.id === 'p5' || p.id === 'p17')
        ))
      } else {
        // 3rd trimester: calcium + prep for baby gear
        recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
          p.category === 'prenatal-vitamins' || p.id === 'p10'
        ))
      }
    } else {
      recommended.push(...AFFILIATE_PRODUCTS.filter(p => p.category === 'prenatal-vitamins'))
    }
  }

  if (momStatus === 'newborn' || momStatus === 'toddler') {
    if (babyAgeMonths !== undefined) {
      if (babyAgeMonths < 6) {
        // 0–5 months: breastfeeding/lactation support + breastmilk-compatible food
        recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
          p.tags.includes('breastfeeding') ||
          p.tags.includes('lactation') ||
          p.tags.includes('breastmilk-compatible') ||
          p.category === 'postnatal-vitamins'
        ))
      } else if (babyAgeMonths < 12) {
        // 6–11 months: introducing solids — stage-1 foods + feeding gear
        recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
          p.tags.includes('stage-1') ||
          p.category === 'feeding-gear' ||
          p.category === 'food-makers'
        ))
      } else {
        // 12+ months: toddler foods
        recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
          p.tags.includes('toddler') ||
          p.category === 'food-makers'
        ))
      }
    } else {
      recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
        p.category === 'postnatal-vitamins' ||
        p.category === 'organic-food' ||
        p.category === 'food-makers'
      ))
    }
  }

  if (concerns.includes('heavy-metals') || concerns.includes('pesticides')) {
    recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
      p.category === 'testing-kits' ||
      p.tags.includes('no-heavy-metals') ||
      p.tags.includes('water-filter') ||
      p.tags.includes('low-arsenic')
    ))
  }

  if (concerns.includes('bpa')) {
    recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
      p.tags.includes('bpa-free') && !recommended.find(r => r.id === p.id)
    ))
  }

  // Deduplicate
  const seen = new Set<string>()
  const unique = recommended.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })

  return unique.length > 0 ? unique : AFFILIATE_PRODUCTS.slice(0, 6)
}
