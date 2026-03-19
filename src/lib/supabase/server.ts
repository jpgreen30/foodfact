import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

/** Admin client — bypasses RLS. Use only for trusted server operations. */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * Verifies the Bearer token from the request's Authorization header.
 * Returns { user, admin } where admin is the service-role client for DB queries.
 * Returns null if the token is missing or invalid.
 */
export async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return null

  const admin = createAdminClient()
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) return null

  return { user, admin }
}
