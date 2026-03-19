'use client'

import { User } from './types'

const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    email: 'sarah@example.com',
    name: 'Sarah Johnson',
    role: 'user',
    plan: 'pro',
    onboardingComplete: true,
    createdAt: '2024-01-15',
    scansUsed: 23,
    scanCredits: 0,
    totalScans: 187,
    profile: {
      momStatus: 'newborn',
      babyName: 'Lily',
      babyBirthDate: '2024-06-01',
      babyAgeMonths: 6,
      diet: ['organic-only'],
      concerns: ['heavy-metals', 'pesticides', 'artificial-additives'],
      allergies: ['dairy', 'soy'],
      prenatalConditions: [],
      postnatalConditions: [],
      breastfeeding: true,
      organicPreference: true,
      notificationsEnabled: true,
      weeklyReportEnabled: true,
    },
  },
  {
    id: 'admin-1',
    email: 'admin@foodfactscanner.com',
    name: 'Admin User',
    role: 'admin',
    plan: 'pro',
    onboardingComplete: true,
    createdAt: '2023-11-01',
    scansUsed: 0,
    scanCredits: 0,
    totalScans: 0,
  },
]

export function getUser(email: string, password: string): User | null {
  // Demo credentials
  if (email === 'admin@foodfactscanner.com' && password === 'admin123') {
    return MOCK_USERS[1]
  }
  if (email === 'sarah@example.com' && password === 'user123') {
    return MOCK_USERS[0]
  }
  // Allow any email with password "demo"
  if (password === 'demo') {
    return {
      id: 'new-user-' + Date.now(),
      email,
      name: email.split('@')[0],
      role: 'user',
      plan: 'free',
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
      scansUsed: 0,
      scanCredits: 0,
      totalScans: 0,
    }
  }
  return null
}

export function saveCurrentUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ffs_user', JSON.stringify(user))
  }
}

export function getCurrentUser(): User | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('ffs_user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
  }
  return null
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ffs_user')
  }
}
