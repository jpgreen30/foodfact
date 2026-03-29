import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Step 1: Redirect user to Pinterest OAuth authorization URL
 *
 * Pinterest OAuth parameters:
 * - client_id: 1557136 (App ID from Pinterest developers)
 * - redirect_uri: https://foodfactscanner.com/api/auth/pinterest/callback
 * - scope: read_public,write_public,business_management
 * - response_type: code
 *
 * We also include state for CSRF protection (using a random string stored in session).
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.PINTREST_CLIENT_ID
    const redirectUri = process.env.PINTREST_REDIRECT_URI
    const scopes = 'read_public,write_public,business_management'

    if (!clientId || !redirectUri) {
      throw new Error('Pinterest OAuth environment variables not set')
    }

    // Generate a state token for CSRF protection
    const state = crypto.randomUUID()

    // Store state in a short-lived cookie (30 min) to validate on callback
    const response = NextResponse.redirect(
      `https://www.pinterest.com/oauth/?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`,
      302
    )

    // Set a cookie with the state for verification later
    response.cookies.set('pinterest_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 30, // 30 minutes
      path: '/api/auth/pinterest/callback',
    })

    return response
  } catch (error) {
    console.error('Pinterest OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Pinterest authentication' },
      { status: 500 }
    )
  }
}
