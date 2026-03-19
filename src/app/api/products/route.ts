import { NextRequest, NextResponse } from 'next/server'
import { ScanResult, ChemicalFound } from '@/lib/types'

// ---------------------------------------------------------------------------
// Chemical risk rules applied against ingredient lists
// ---------------------------------------------------------------------------

interface RiskRule {
  /** substrings to match (case-insensitive) in joined ingredient text */
  keywords: string[]
  chemical: Omit<ChemicalFound, 'name'> & { name: string }
}

const RISK_RULES: RiskRule[] = [
  {
    keywords: ['rice flour', 'brown rice flour', 'whole grain rice flour'],
    chemical: {
      name: 'Inorganic Arsenic',
      level: 'high',
      description: 'Rice flour is a concentrated source of inorganic arsenic — a known carcinogen found in soil.',
      healthRisk: 'Serious neurological and developmental risk for infants; increased long-term cancer risk.',
      safeLimit: '10 ppb',
      detectedAmount: '60–90 ppb (typical for rice-flour products)',
    },
  },
  {
    keywords: ['rice starch', 'rice syrup', 'brown rice syrup', 'whole grain rice'],
    chemical: {
      name: 'Inorganic Arsenic',
      level: 'medium',
      description: 'Rice-derived ingredients can contain elevated inorganic arsenic.',
      healthRisk: 'Developmental delays; increased cancer risk with prolonged exposure.',
      safeLimit: '10 ppb',
      detectedAmount: '20–30 ppb (estimated)',
    },
  },
  {
    keywords: ['rice'],
    chemical: {
      name: 'Inorganic Arsenic',
      level: 'low',
      description: 'Whole rice can contain low levels of naturally occurring inorganic arsenic.',
      healthRisk: 'Minimal risk with occasional consumption; higher risk with daily large servings.',
      safeLimit: '10 ppb',
      detectedAmount: '5–10 ppb (estimated)',
    },
  },
  {
    keywords: ['high fructose corn syrup', 'corn syrup', 'hfcs'],
    chemical: {
      name: 'High-Fructose Corn Syrup',
      level: 'medium',
      description: 'Highly processed sweetener associated with metabolic disruption.',
      healthRisk: 'Obesity, insulin resistance, non-alcoholic fatty liver disease.',
    },
  },
  {
    keywords: ['carrageenan'],
    chemical: {
      name: 'Carrageenan',
      level: 'medium',
      description: 'Seaweed-derived thickener linked to gut inflammation in animal studies.',
      healthRisk: 'Intestinal inflammation, digestive disturbances; classified as possibly carcinogenic.',
    },
  },
  {
    keywords: ['red 40', 'red40', 'allura red'],
    chemical: {
      name: 'Red 40 (Allura Red)',
      level: 'medium',
      description: 'Synthetic petroleum-derived food dye linked to hyperactivity.',
      healthRisk: 'ADHD, hyperactivity, and behavioral issues in children.',
    },
  },
  {
    keywords: ['yellow 5', 'yellow5', 'tartrazine'],
    chemical: {
      name: 'Yellow 5 (Tartrazine)',
      level: 'medium',
      description: 'Synthetic food dye; required to carry a warning label in the EU.',
      healthRisk: 'Hyperactivity in children; potential allergen.',
    },
  },
  {
    keywords: ['yellow 6', 'yellow6', 'sunset yellow'],
    chemical: {
      name: 'Yellow 6 (Sunset Yellow)',
      level: 'medium',
      description: 'Synthetic food dye associated with hyperactivity in children.',
      healthRisk: 'Hyperactivity; may cause allergic reactions.',
    },
  },
  {
    keywords: ['blue 1', 'blue1', 'brilliant blue'],
    chemical: {
      name: 'Blue 1 (Brilliant Blue)',
      level: 'low',
      description: 'Synthetic food dye; potential neurological effects in high doses.',
      healthRisk: 'Possible hyperactivity; rare allergic reactions.',
    },
  },
  {
    keywords: ['sodium nitrate', 'sodium nitrite', 'potassium nitrate', 'potassium nitrite'],
    chemical: {
      name: 'Nitrates / Nitrites',
      level: 'medium',
      description: 'Preservatives that can convert to carcinogenic nitrosamines.',
      healthRisk: 'Increased cancer risk; methemoglobinemia risk in infants under 6 months.',
    },
  },
  {
    keywords: ['bisphenol', 'bpa'],
    chemical: {
      name: 'Bisphenol A (BPA)',
      level: 'high',
      description: 'Endocrine-disrupting chemical sometimes found in packaging or linings.',
      healthRisk: 'Hormonal disruption, developmental issues, increased cancer risk.',
    },
  },
  {
    keywords: ['titanium dioxide', 'ci 77891'],
    chemical: {
      name: 'Titanium Dioxide',
      level: 'medium',
      description: 'Nano-form titanium dioxide is classified as possibly carcinogenic (IARC Group 2B).',
      healthRisk: 'Potential DNA damage, inflammatory response; banned in food in the EU.',
    },
  },
  {
    keywords: ['acrylamide'],
    chemical: {
      name: 'Acrylamide',
      level: 'high',
      description: 'Forms in starchy foods during high-heat cooking. Known carcinogen.',
      healthRisk: 'DNA damage, nerve damage, increased cancer risk.',
      safeLimit: 'As low as reasonably achievable',
    },
  },
  {
    keywords: ['partially hydrogenated', 'hydrogenated vegetable oil', 'trans fat'],
    chemical: {
      name: 'Trans Fats',
      level: 'high',
      description: 'Artificial trans fats from partial hydrogenation. Banned in many countries.',
      healthRisk: 'Cardiovascular disease, inflammation, negative fetal development impact.',
    },
  },
  {
    keywords: ['monosodium glutamate', 'msg'],
    chemical: {
      name: 'Monosodium Glutamate (MSG)',
      level: 'low',
      description: 'Flavor enhancer; generally considered safe but not recommended for infants.',
      healthRisk: 'Headaches and flushing in sensitive individuals; not suitable for baby foods.',
    },
  },
  {
    keywords: ['sucralose', 'aspartame', 'saccharin', 'acesulfame', 'ace-k'],
    chemical: {
      name: 'Artificial Sweeteners',
      level: 'low',
      description: 'Non-nutritive synthetic sweeteners with unclear long-term effects on children.',
      healthRisk: 'Gut microbiome disruption; not recommended for infants and toddlers.',
    },
  },
  {
    keywords: ['polysorbate 80', 'polysorbate 60'],
    chemical: {
      name: 'Polysorbates',
      level: 'low',
      description: 'Emulsifiers that may affect gut microbiome and intestinal barrier function.',
      healthRisk: 'Gut inflammation; may promote metabolic syndrome in susceptible individuals.',
    },
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function analyzeIngredients(ingredients: string[]): {
  chemicals: ChemicalFound[]
  score: 'safe' | 'caution' | 'danger'
} {
  const text = ingredients.join(' ').toLowerCase()
  const chemicals: ChemicalFound[] = []
  const seen = new Set<string>()

  for (const rule of RISK_RULES) {
    if (seen.has(rule.chemical.name)) continue
    const matched = rule.keywords.some(k => text.includes(k.toLowerCase()))
    if (matched) {
      chemicals.push(rule.chemical)
      seen.add(rule.chemical.name)
    }
  }

  const hasHigh = chemicals.some(c => c.level === 'high')
  const hasMedium = chemicals.some(c => c.level === 'medium')
  const score: 'safe' | 'caution' | 'danger' = hasHigh ? 'danger' : hasMedium ? 'caution' : 'safe'

  return { chemicals, score }
}

function parseIngredients(product: Record<string, any>): string[] {
  // Prefer structured ingredient list
  if (Array.isArray(product.ingredients) && product.ingredients.length > 0) {
    return product.ingredients
      .map((i: any) => (typeof i === 'string' ? i : i?.text || i?.id || ''))
      .filter(Boolean)
  }
  // Fall back to raw text
  const raw: string = product.ingredients_text || product.ingredients_text_en || ''
  if (raw) {
    return raw
      .split(/[,;]/)
      .map((s: string) => s.trim().replace(/[\[\]_*]/g, ''))
      .filter(s => s.length > 1)
  }
  return []
}

function buildResult(product: Record<string, any>, barcode?: string): ScanResult {
  const ingredients = parseIngredients(product)
  const { chemicals, score } = analyzeIngredients(ingredients)

  return {
    id: `scan-${Date.now()}`,
    userId: '',
    productName:
      product.product_name_en ||
      product.product_name ||
      (barcode ? `Product #${barcode}` : 'Unknown Product'),
    brand: (product.brands || 'Unknown Brand').split(',')[0].trim(),
    scannedAt: new Date().toISOString(),
    overallScore: score,
    chemicals,
    ingredients,
    imageUrl: product.image_front_small_url || product.image_url || undefined,
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

const OFF_HEADERS = {
  'User-Agent': 'FoodFactScanner/1.0 (https://github.com/foodfactscanner; contact@foodfactscanner.com)',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const barcode = searchParams.get('barcode')?.trim()
  const name = searchParams.get('name')?.trim()

  if (!barcode && !name) {
    return NextResponse.json({ error: 'Provide barcode or name query parameter' }, { status: 400 })
  }

  try {
    if (barcode) {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`,
        { headers: OFF_HEADERS, next: { revalidate: 3600 } }
      )
      if (!res.ok) {
        return NextResponse.json({ error: 'product_not_found' }, { status: 404 })
      }
      const data = await res.json()
      if (data.status !== 1 || !data.product) {
        return NextResponse.json({ error: 'product_not_found' }, { status: 404 })
      }
      return NextResponse.json({ product: buildResult(data.product, barcode) })
    }

    // Name search
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name!)}&json=1&page_size=5&action=process`,
      { headers: OFF_HEADERS, next: { revalidate: 3600 } }
    )
    if (!res.ok) {
      return NextResponse.json({ error: 'product_not_found' }, { status: 404 })
    }
    const data = await res.json()
    if (!data.products || data.products.length === 0) {
      return NextResponse.json({ error: 'product_not_found' }, { status: 404 })
    }
    return NextResponse.json({ product: buildResult(data.products[0]) })
  } catch (err) {
    console.error('[/api/products]', err)
    return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 })
  }
}
