import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createHmac } from 'crypto'

/**
 * Percent-encode a string according to OAuth/RFC3986.
 * encodeURIComponent is close but we need to also encode '*' and some other characters.
 * OAuth uses a modified version where spaces are %20 not '+' and ~ is unencoded.
 */
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

/**
 * Build the OAuth parameter string for signature base.
 * Parameters: Record<string, string> of key-value pairs.
 * Returns a sorted, encoded string: "k1=v1&k2=v2"
 */
function buildParameterString(params: Record<string, string>): string {
  const encodedPairs = Object.entries(params)
    .map(([k, v]) => `${percentEncode(k)}=${percentEncode(v)}`)
  encodedPairs.sort() // lexicographic sort by encoded key
  return encodedPairs.join('&')
}

/**
 * Step 1: Obtain request token and redirect user to Twitter OAuth authorization URL
 *
 * Twitter OAuth 1.0a flow:
 * 1. POST to https://api.twitter.com/oauth/request_token with oauth_callback
 * 2. Receive oauth_token and oauth_token_secret
 * 3. Redirect user to https://api.twitter.com/oauth/authorize?oauth_token=...
 *
 * We include oauth_callback in the initial request token call, so Twitter will direct
 * the user back to our callback endpoint after authorization.
 *
 * State is stored in a signed cookie for CSRF protection.
 */
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.TWITTER_API_KEY
    const apiSecret = process.env.TWITTER_API_SECRET
    const callbackUri = process.env.TWITTER_CALLBACK_URI

    if (!apiKey || !apiSecret || !callbackUri) {
      console.error('Twitter OAuth environment variables missing')
      return NextResponse.json(
        { error: 'Twitter OAuth not configured' },
        { status: 500 }
      )
    }

    // Generate OAuth 1.0a parameters
    const oauthToken = crypto.randomUUID().replace(/-/g, '').slice(0, 43) // Twitter requires 43-char max
    const oauthNonce = crypto.randomUUID().replace(/-/g, '').slice(0, 32) // Random string
    const oauthTimestamp = Math.floor(Date.now() / 1000).toString()
    const oauthVersion = '1.0'

    // Build the OAuth parameter string for signing
    const oauthParams = {
      oauth_consumer_key: apiKey,
      oauth_nonce: oauthNonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: oauthTimestamp,
      oauth_version: oauthVersion,
      oauth_callback: callbackUri,
    }
    const parameterString = buildParameterString(oauthParams)

    // Create signature base string
    const signatureBaseString = [
      'POST',
      percentEncode('https://api.twitter.com/oauth/request_token'),
      percentEncode(parameterString),
    ].join('&')

    // Create signing key: consumer_secret& (no token secret yet)
    const signingKey = `${encodeURIComponent(apiSecret)}&`

    // Generate HMAC-SHA1 signature
    const signature = createHmac('sha1', signingKey)
      .update(signatureBaseString)
      .digest('base64')

    // Build Authorization header
    const authHeader = `OAuth oauth_consumer_key="${apiKey}", oauth_nonce="${oauthNonce}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${oauthTimestamp}", oauth_version="${oauthVersion}", oauth_callback="${encodeURIComponent(callbackUri)}"`

    // Exchange request token
    const tokenRes = await fetch('https://api.twitter.com/oauth/request_token', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      console.error('Twitter request token error:', tokenRes.status, text)
      return NextResponse.json(
        { error: 'Failed to get request token from Twitter' },
        { status: 500 }
      )
    }

    const tokenText = await tokenRes.text()
    const tokenData = Object.fromEntries(new URLSearchParams(tokenText))

    const requestToken = tokenData.oauth_token
    const requestTokenSecret = tokenData.oauth_token_secret

    if (!requestToken) {
      console.error('No oauth_token in Twitter response:', tokenData)
      return NextResponse.json(
        { error: 'Invalid response from Twitter' },
        { status: 500 }
      )
    }

    // Store request token secret in a short-lived, httpOnly cookie for later verification
    const response = NextResponse.redirect(
      `https://api.twitter.com/oauth/authorize?oauth_token=${encodeURIComponent(requestToken)}`,
      302
    )

    // Set cookies to persist token secret and state
    response.cookies.set('twitter_oauth_token', requestToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/api/auth/twitter/callback',
    })

    response.cookies.set('twitter_oauth_token_secret', requestTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/api/auth/twitter/callback',
    })

    // Optional: generate a state token for CSRF protection (stored separately)
    const state = crypto.randomUUID()
    response.cookies.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/api/auth/twitter/callback',
    })

    // We'll send the state as a query param user can return to our callback with it if needed.
    // For simplicity, we'll just use cookie-based verification.

    return response
  } catch (error) {
    console.error('Twitter OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Twitter authentication' },
      { status: 500 }
    )
  }
}
