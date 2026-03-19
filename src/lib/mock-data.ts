import { ScanResult, AdminStats } from './types'

export const MOCK_SCANS: ScanResult[] = [
  {
    id: 'scan-1',
    userId: 'user-1',
    productName: "Gerber 2nd Foods Peas",
    brand: 'Gerber',
    scannedAt: '2024-11-28T14:32:00Z',
    overallScore: 'caution',
    chemicals: [
      {
        name: 'Inorganic Arsenic',
        level: 'medium',
        description: 'Found in rice-based baby foods. A known carcinogen.',
        healthRisk: 'Developmental delays, increased cancer risk with long-term exposure.',
        safeLimit: '10 ppb',
        detectedAmount: '23 ppb',
      },
      {
        name: 'Lead',
        level: 'low',
        description: 'Heavy metal. No safe level for infants.',
        healthRisk: 'Cognitive impairment, behavioral issues.',
        safeLimit: '1 ppb',
        detectedAmount: '2.1 ppb',
      },
    ],
    ingredients: ['Peas', 'Water', 'Vitamin C'],
  },
  {
    id: 'scan-2',
    userId: 'user-1',
    productName: "Happy Baby Organics Sweet Potatoes",
    brand: 'Happy Baby',
    scannedAt: '2024-11-27T10:15:00Z',
    overallScore: 'safe',
    chemicals: [],
    ingredients: ['Organic Sweet Potatoes', 'Water'],
  },
  {
    id: 'scan-3',
    userId: 'user-1',
    productName: "Earth's Best Organic Apples & Bananas",
    brand: "Earth's Best",
    scannedAt: '2024-11-25T16:45:00Z',
    overallScore: 'safe',
    chemicals: [],
    ingredients: ["Organic Apples", "Organic Bananas", "Water", "Citric Acid"],
  },
  {
    id: 'scan-4',
    userId: 'user-1',
    productName: "Beech-Nut Stage 1 Rice Cereal",
    brand: 'Beech-Nut',
    scannedAt: '2024-11-20T09:30:00Z',
    overallScore: 'danger',
    chemicals: [
      {
        name: 'Inorganic Arsenic',
        level: 'high',
        description: 'Rice cereals contain high levels of inorganic arsenic.',
        healthRisk: 'Serious developmental and neurological risk for infants.',
        safeLimit: '10 ppb',
        detectedAmount: '87 ppb',
      },
      {
        name: 'Cadmium',
        level: 'medium',
        description: 'Heavy metal that accumulates in kidneys.',
        healthRisk: 'Kidney damage, bone loss, developmental issues.',
        safeLimit: '5 ppb',
        detectedAmount: '12 ppb',
      },
    ],
    ingredients: ['Rice Flour', 'Calcium Carbonate', 'Vitamin C', 'Iron', 'Vitamin E'],
  },
]

export const ADMIN_STATS: AdminStats = {
  totalUsers: 24871,
  activeUsers: 18432,
  proUsers: 6213,
  familyUsers: 2841,
  totalScans: 487293,
  scansToday: 1847,
  revenue: 52840,
  affiliateClicks: 38291,
  affiliateRevenue: 4721,
  newUsersThisWeek: 847,
  conversionRate: 24.3,
}

export const MOCK_USER_LIST = [
  { id: 'u1', name: 'Sarah Johnson', email: 'sarah@example.com', plan: 'pro', scans: 187, joined: '2024-01-15', status: 'active' },
  { id: 'u2', name: 'Emily Chen', email: 'emily@example.com', plan: 'family', scans: 342, joined: '2024-02-03', status: 'active' },
  { id: 'u3', name: 'Maria Garcia', email: 'maria@example.com', plan: 'free', scans: 12, joined: '2024-03-18', status: 'active' },
  { id: 'u4', name: 'Jessica Williams', email: 'jessica@example.com', plan: 'pro', scans: 98, joined: '2024-01-28', status: 'active' },
  { id: 'u5', name: 'Amanda Taylor', email: 'amanda@example.com', plan: 'free', scans: 5, joined: '2024-04-01', status: 'trial' },
  { id: 'u6', name: 'Rachel Brown', email: 'rachel@example.com', plan: 'pro', scans: 214, joined: '2023-12-10', status: 'active' },
  { id: 'u7', name: 'Nicole Davis', email: 'nicole@example.com', plan: 'family', scans: 521, joined: '2023-11-22', status: 'active' },
  { id: 'u8', name: 'Lauren Miller', email: 'lauren@example.com', plan: 'free', scans: 0, joined: '2024-04-05', status: 'trial' },
]
