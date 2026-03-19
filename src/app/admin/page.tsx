'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    if (user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <AdminDashboard />
}
