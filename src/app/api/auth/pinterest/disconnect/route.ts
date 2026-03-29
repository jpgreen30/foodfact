import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * POST /api/auth/pinterest/disconnect
 * Removes Pinterest connection from the current user's account
 * Requires user to be logged in (session cookie)
 */
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Get user from session cookie
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Remove Pinterest metadata fields
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        pinterest_user_id: null,
        pinterest_username: null,
        pinterest_name: null,
        pinterest_access_token: null,
        pinterest_refresh_token: null,
        pinterest_token_expires_at: null,
      },
    })

    if (updateError) {
      console.error('Pinterest disconnect error:', updateError)
      return NextResponse.json({ error: 'Failed to disconnect Pinterest' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Pinterest disconnect exception:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
