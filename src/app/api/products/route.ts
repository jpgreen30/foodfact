import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ScanResult, ChemicalFound } from '@/lib/types'

// ---------------------------------------------------------------------------
// AI-powered analysis via Claude
// ---------------------------------------------------------------------------

const ANALYSIS_TOOL: Anthropic.Tool = {
  name: 'report_food_safety',
  description: 'Report the food safety analysis result for the given product ingredients',
  input_schema: {
    type: 'object' as const,
    properties: {
      chemicals: {
        type: 'array',
        description: 'List of concerning chemicals, additives, or ingredients found',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the chemical or additive' },
            level: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Risk level' },
            description: { type: 'string', description: 'What it is and where it comes from' },
            healthRisk: { type: 'string', description: 'Specific health risk for pregnant women and young children' },
            safeLimit: { type: 'string', description: 'Regulatory safe limit if applicable' },
            detectedAmount: { type: 'string', description: 'Estimated detected amount if applicable' },
          },
          required: ['name', 'level', 'description', 'healthRisk'],
          additionalProperties: false,
        },
      },
      overallScore: {
        type: 'string',
        enum: ['safe', 'caution', 'danger'],
        description: 'Overall safety score: safe (no concerns), caution (medium risks), danger (high risks)',
      },
    },
    required: ['chemicals', 'overallScore'],
    additionalProperties: false,
  },
}

async function analyzeWithAI(
  productName: string,
  brand: string,
  ingredients: string[]
): Promise<{ chemicals: ChemicalFound[]; score: 'safe' | 'caution' | 'danger' } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      tools: [ANALYSIS_TOOL],
      tool_choice: { type: 'tool', name: 'report_food_safety' },
      messages: [
        {
          role: 'user',
          content: `You are a food safety expert specializing in risks for pregnant women, infants, and toddlers.

Analyze the ingredients of this product and identify ALL concerning chemicals, additives, heavy metals, preservatives, and harmful substances:

Product: "${productName}" by ${brand}
Ingredients: ${ingredients.join(', ')}

Check specifically for:
- Heavy metals: arsenic (especially in rice flour/brown rice syrup), lead, cadmium, mercury
- Artificial food dyes: Red 40, Yellow 5, Yellow 6, Blue 1, Blue 2, Green 3
- Preservatives: sodium nitrate, sodium nitrite, BHA, BHT, TBHQ
- Trans fats / partially hydrogenated oils
- High-fructose corn syrup, corn syrup
- BPA / bisphenol compounds
- Carrageenan (gut inflammation risk)
- Artificial sweeteners: aspartame, sucralose, saccharin, acesulfame-K
- MSG / monosodium glutamate
- Titanium dioxide
- Polysorbate 60, Polysorbate 80
- Acrylamide (forms in high-heat starchy foods)
- Any other additives unsafe for babies or pregnant women

Scoring rules:
- "danger": any high-risk ingredient present (heavy metals at high levels, trans fats, acrylamide)
- "caution": medium-risk ingredients (food dyes, HFCS, carrageenan, nitrates)
- "safe": no concerning additives found

If no harmful ingredients are present, return an empty chemicals array and "safe" score.`,
        },
      ],
    })

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    )
    if (!toolUse) return null

    const input = toolUse.input as { chemicals: ChemicalFound[]; overallScore: 'safe' | 'caution' | 'danger' }
    return { chemicals: input.chemicals, score: input.overallScore }
  } catch (err) {
    console.error('[AI analysis failed]', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Rule-based fallback
// ---------------------------------------------------------------------------

interface RiskRule {
  keywords: string[]
  chemical: ChemicalFound
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIngredients(product: Record<string, unknown>): string[] {
  if (Array.isArray(product.ingredients) && product.ingredients.length > 0) {
    return (product.ingredients as unknown[])
      .map((i: unknown) => (typeof i === 'string' ? i : (i as Record<string, string>)?.text || (i as Record<string, string>)?.id || ''))
      .filter(Boolean)
  }
  const raw: string = (product.ingredients_text as string) || (product.ingredients_text_en as string) || ''
  if (raw) {
    return raw
      .split(/[,;]/)
      .map((s: string) => s.trim().replace(/[\[\]_*]/g, ''))
      .filter(s => s.length > 1)
  }
  return []
}

async function buildResult(product: Record<string, unknown>, barcode?: string): Promise<ScanResult> {
  const ingredients = parseIngredients(product)
  const productName =
    (product.product_name_en as string) ||
    (product.product_name as string) ||
    (barcode ? `Product #${barcode}` : 'Unknown Product')
  const brand = ((product.brands as string) || 'Unknown Brand').split(',')[0].trim()

  // Try AI analysis first, fall back to rule-based
  const aiResult = await analyzeWithAI(productName, brand, ingredients)
  const { chemicals, score } = aiResult ?? analyzeIngredients(ingredients)

  return {
    id: `scan-${Date.now()}`,
    userId: '',
    productName,
    brand,
    scannedAt: new Date().toISOString(),
    overallScore: score,
    chemicals,
    ingredients,
    imageUrl: (product.image_front_small_url as string) || (product.image_url as string) || undefined,
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
        { headers: OFF_HEADERS }
      )
      if (!res.ok) {
        return NextResponse.json({ error: 'product_not_found' }, { status: 404 })
      }
      const data = await res.json()
      if (data.status !== 1 || !data.product) {
        return NextResponse.json({ error: 'product_not_found' }, { status: 404 })
      }
      return NextResponse.json({ product: await buildResult(data.product, barcode) })
    }

    // Name search
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name!)}&json=1&page_size=5&action=process`,
      { headers: OFF_HEADERS }
    )
    if (!res.ok) {
      return NextResponse.json({ error: 'product_not_found' }, { status: 404 })
    }
    const data = await res.json()
    if (!data.products || data.products.length === 0) {
      return NextResponse.json({ error: 'product_not_found' }, { status: 404 })
    }
    return NextResponse.json({ product: await buildResult(data.products[0]) })
  } catch (err) {
    console.error('[/api/products]', err)
    return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 })
  }
}
