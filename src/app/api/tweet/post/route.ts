import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createHmac, randomUUID } from 'crypto'

/**
 * Build OAuth 1.0a Authorization header for Twitter API
 */
function buildOAuthHeader(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  // OAuth parameters
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_token: accessToken,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: randomUUID(),
    oauth_version: '1.0',
  }

  // Combine all parameters (query + oauth) for signature
  const allParams = { ...params, ...oauthParams }

  // Create parameter string (percent-encoded, sorted)
  const paramString = Object.entries(allParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .sort()
    .join('&')

  // Signature base string
  const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`

  // Signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`

  // HMAC-SHA1 signature
  const signature = createHmac('sha1', signingKey).update(baseString).digest('base64')

  oauthParams.oauth_signature = signature

  // Build Authorization header
  const authHeader = 'OAuth ' + Object.entries(oauthParams)
    .map(([k, v]) => `${k}="${encodeURIComponent(v)}"`)
    .join(', ')

  return authHeader
}

/**
 * POST /api/tweet/post
 * Body: { text: string }
 * Requires user to be logged in (session cookie or bearer token)
 */
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Get user from session (using same auth as other API routes)
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.slice(7)

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Extract Twitter credentials from user metadata
    const metadata = user.user_metadata || {}
    const accessToken = metadata.twitter_access_token
    const accessTokenSecret = metadata.twitter_access_token_secret

    if (!accessToken || !accessTokenSecret) {
      return NextResponse.json(
        { error: 'Twitter not linked. Please connect your Twitter account.' },
        { status: 400 }
      )
    }

    // Get tweet text from request body
    const { text } = await req.json()
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Tweet text is required' }, { status: 400 })
    }

    if (text.length > 280) {
      return NextResponse.json({ error: 'Tweet exceeds 280 characters' }, { status: 400 })
    }

    // Prepare Twitter API v2 request
    const twitterApiUrl = 'https://api.twitter.com/2/tweets'
    const requestBody = { text: text.trim() }

    // Build OAuth 1.0a header
    const oauthHeader = buildOAuthHeader(
      'POST',
      twitterApiUrl,
      {}, // no query params
      process.env.TWITTER_API_KEY!,
      process.env.TWITTER_API_SECRET!,
      accessToken,
      accessTokenSecret
    )

    // Make request to Twitter
    const response = await fetch(twitterApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': oauthHeader,
      },
      body: JSON.stringify(requestBody),
    })

    const responseData = await response.json().catch(() => ({}))

    if (!response.ok) {
      console.error('Twitter post failed:', response.status, responseData)
      return NextResponse.json(
        { error: 'Failed to post tweet', details: responseData },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, tweet: responseData })
  } catch (err) {
    console.error('Tweet post error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
