import { AffiliateProduct } from './types'

// Amazon affiliate tag: foodfactscanner-20
const TAG = 'foodfactscanner-20'

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
    imageUrl: 'https://m.media-amazon.com/images/I/71VFcHDq97L._SL1500_.jpg',
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
]

export function getProductsByCategory(category: string): AffiliateProduct[] {
  return AFFILIATE_PRODUCTS.filter(p => p.category === category)
}

export function getRecommendedProducts(concerns: string[], momStatus: string): AffiliateProduct[] {
  const recommended: AffiliateProduct[] = []

  if (momStatus === 'expecting') {
    recommended.push(...AFFILIATE_PRODUCTS.filter(p => p.category === 'prenatal-vitamins'))
  }
  if (momStatus === 'newborn' || momStatus === 'toddler') {
    recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
      p.category === 'postnatal-vitamins' ||
      p.category === 'organic-food' ||
      p.category === 'food-makers'
    ))
  }
  if (concerns.includes('heavy-metals') || concerns.includes('pesticides')) {
    recommended.push(...AFFILIATE_PRODUCTS.filter(p =>
      p.category === 'testing-kits' || p.tags.includes('no-heavy-metals')
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
