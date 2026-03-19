export type UserRole = 'user' | 'admin'
export type MomStatus = 'expecting' | 'newborn' | 'toddler' | 'planning' | 'other'
export type DietType = 'omnivore' | 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'organic-only'
export type Concern = 'heavy-metals' | 'pesticides' | 'artificial-additives' | 'allergens' | 'bpa' | 'nitrates' | 'sugar' | 'sodium'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  plan: 'free' | 'starter' | 'pro'
  onboardingComplete: boolean
  profile?: UserProfile
  createdAt: string
  scansUsed: number        // lifetime scans used (free: capped at 3)
  scanCredits: number      // remaining credits (starter: starts at 50)
  totalScans: number
  /** @deprecated use scansUsed */
  scansThisMonth?: number
}

export interface UserProfile {
  momStatus: MomStatus
  dueDate?: string
  babyBirthDate?: string
  babyName?: string
  babyAgeMonths?: number
  diet: DietType[]
  concerns: Concern[]
  allergies: string[]
  prenatalConditions: string[]
  postnatalConditions: string[]
  breastfeeding: boolean
  organicPreference: boolean
  notificationsEnabled: boolean
  weeklyReportEnabled: boolean
}

export interface ScanResult {
  id: string
  userId: string
  productName: string
  brand: string
  scannedAt: string
  overallScore: 'safe' | 'caution' | 'danger'
  chemicals: ChemicalFound[]
  ingredients: string[]
  imageUrl?: string
}

export interface ChemicalFound {
  name: string
  level: 'low' | 'medium' | 'high'
  description: string
  healthRisk: string
  safeLimit?: string
  detectedAmount?: string
}

export interface AffiliateProduct {
  id: string
  title: string
  description: string
  price: string
  rating: number
  reviewCount: number
  imageUrl: string
  affiliateUrl: string
  category: ProductCategory
  tags: string[]
  badge?: string
}

export type ProductCategory =
  | 'organic-food'
  | 'prenatal-vitamins'
  | 'postnatal-vitamins'
  | 'baby-formula'
  | 'feeding-gear'
  | 'food-makers'
  | 'storage'
  | 'testing-kits'

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  proUsers: number
  familyUsers: number
  totalScans: number
  scansToday: number
  revenue: number
  affiliateClicks: number
  affiliateRevenue: number
  newUsersThisWeek: number
  conversionRate: number
}
