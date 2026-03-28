import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Disconnect Twitter from user account.
 * Clears all Twitter-related metadata for the current authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id
    const admin = createAdminClient()

    // Get current user metadata
    const { data: { user } } = await admin.auth.admin.getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentMetadata = user.user_metadata || {}

    // Remove Twitter fields
    const {
      twitter_user_id,
      twitter_access_token,
      twitter_access_token_secret,
      twitter_screen_name,
      twitter_name,
      ...remainingMetadata
    } = currentMetadata

    // Update user with cleaned metadata
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: remainingMetadata,
    })

    return NextResponse.json({ success: true, message: 'Twitter disconnected' })
  } catch (error) {
    console.error('Twitter disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Twitter' },
      { status: 500 }
    )
  }
}
