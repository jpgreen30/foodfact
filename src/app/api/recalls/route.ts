import { NextResponse } from 'next/server'

export interface RecallAlert {
  id: string
  product: string
  brand: string
  reason: string
  date: string
  severity: 'urgent' | 'warning'
  affectedLots: string
  categories: string[]
}

const MOCK_RECALLS: RecallAlert[] = [
  {
    id: 'r1',
    product: "Organic Baby Oatmeal Cereal",
    brand: "Happy Baby Organics",
    reason: "Elevated inorganic arsenic levels exceeding FDA guidance of 100 ppb",
    date: "2026-03-10",
    severity: "urgent",
    affectedLots: "Lots 2024A, 2024B (best by Mar–Jun 2026)",
    categories: ['organic-food', 'cereal'],
  },
  {
    id: 'r2',
    product: "Stage 2 Sweet Potato Puree Pouches",
    brand: "Plum Organics",
    reason: "Potential lead contamination from processing equipment",
    date: "2026-03-05",
    severity: "urgent",
    affectedLots: "Lot 20240115 (best by Jan 2027)",
    categories: ['organic-food', 'pouches'],
  },
  {
    id: 'r3',
    product: "Infant Formula Stage 1 (Powder)",
    brand: "Similac",
    reason: "Possible presence of Cronobacter sakazakii bacteria",
    date: "2026-02-28",
    severity: "urgent",
    affectedLots: "Lots 43416LF, 27032K80 (use-by Dec 2026)",
    categories: ['baby-formula'],
  },
  {
    id: 'r4',
    product: "Apple & Blueberry Baby Food Jar",
    brand: "Beech-Nut",
    reason: "Cadmium levels slightly above voluntary action level",
    date: "2026-02-20",
    severity: "warning",
    affectedLots: "Lots B4021–B4025 (best by Feb 2027)",
    categories: ['organic-food', 'jars'],
  },
  {
    id: 'r5',
    product: "Organic Carrot Snack Puffs",
    brand: "Little Ducks Organics",
    reason: "Undeclared milk allergen — labeling error",
    date: "2026-02-15",
    severity: "warning",
    affectedLots: "All lots with best by before Sep 2026",
    categories: ['organic-food', 'snacks'],
  },
  {
    id: 'r6',
    product: "Prenatal DHA Softgels",
    brand: "Nordic Naturals",
    reason: "Oxidation levels above acceptable limits; may be rancid",
    date: "2026-02-10",
    severity: "warning",
    affectedLots: "Lot 230814 (exp. Aug 2026)",
    categories: ['prenatal-vitamins'],
  },
]

export async function GET() {
  return NextResponse.json(
    { recalls: MOCK_RECALLS },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    }
  )
}
