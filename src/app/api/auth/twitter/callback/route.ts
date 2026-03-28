import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { createHmac } from 'crypto'

/**
 * Percent-encode according to OAuth/RFC3986.
 * encodeURIComponent is close but we need to also encode '!' , '\'' , '(' , ')' , '*'
 * and spaces become %20 not '+'.
 */
function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

/**
 * Build OAuth parameter string: sorted key=value pairs separated by '&'
 */
function buildParameterString(params: Record<string, string>): string {
  const encodedPairs = Object.entries(params)
    .map(([k, v]) => `${percentEncode(k)}=${percentEncode(v)}`)
  encodedPairs.sort()
  return encodedPairs.join('&')
}

/**
 * Twitter OAuth callback handler
 *
 * Steps:
 * 1. Verify oauth_token matches cookie (CSRF)
 * 2. Obtain request token secret from cookie
 * 3. Exchange oauth_verifier for access token (OAuth 1.0a)
 * 4. Fetch Twitter user profile (verify_credentials)
 * 5. Find or create Supabase user; store Twitter credentials in metadata
 * 6. Sign in the user (generate password for new users)
 * 7. Redirect to /onboarding?success=twitter
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const oauthToken = searchParams.get('oauth_token')
    const oauthVerifier = searchParams.get('oauth_verifier')
    const denied = searchParams.get('denied')

    // Check if user denied authorization
    if (denied) {
      return NextResponse.redirect('/login?error=twitter_auth_denied')
    }

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect('/login?error=twitter_missing_params')
    }

    // Verify the oauth_token matches what we issued (CSRF protection)
    const tokenCookie = req.cookies.get('twitter_oauth_token')
    if (!tokenCookie || tokenCookie.value !== oauthToken) {
      console.error('Twitter OAuth token mismatch')
      return NextResponse.redirect('/login?error=twitter_invalid_token')
    }

    // Get stored request token secret
    const tokenSecretCookie = req.cookies.get('twitter_oauth_token_secret')
    const requestTokenSecret = tokenSecretCookie?.value
    if (!requestTokenSecret) {
      console.error('Missing Twitter request token secret')
      return NextResponse.redirect('/login?error=twitter_missing_token_secret')
    }

    // Get credentials
    const apiKey = process.env.TWITTER_API_KEY
    const apiSecret = process.env.TWITTER_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error('Twitter OAuth environment variables not set')
      return NextResponse.redirect('/login?error=twitter_config')
    }

    // ============================================
    // Step 1: Exchange oauth_verifier for access token
    // ============================================
    const oauthNonce = crypto.randomUUID().replace(/-/g, '').slice(0, 32)
    const oauthTimestamp = Math.floor(Date.now() / 1000).toString()
    const oauthVersion = '1.0'

    // Build OAuth parameters for access token request
    const accessTokenOAuthParams = {
      oauth_consumer_key: apiKey,
      oauth_token: oauthToken,
      oauth_nonce: oauthNonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: oauthTimestamp,
      oauth_version: oauthVersion,
      oauth_verifier: oauthVerifier,
    }

    // Create signature base string
    const accessTokenParamString = buildParameterString(accessTokenOAuthParams)
    const accessTokenBaseString = [
      'POST',
      percentEncode('https://api.twitter.com/oauth/access_token'),
      percentEncode(accessTokenParamString),
    ].join('&')

    // Signing key: consumer_secret&request_token_secret
    const accessTokenSigningKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(requestTokenSecret)}`

    const accessTokenSignature = createHmac('sha1', accessTokenSigningKey)
      .update(accessTokenBaseString)
      .digest('base64')

    // Build Authorization header
    const authHeaderParts = [
      `OAuth oauth_consumer_key="${apiKey}"`,
      `oauth_token="${oauthToken}"`,
      `oauth_nonce="${oauthNonce}"`,
      `oauth_signature="${encodeURIComponent(accessTokenSignature)}"`,
      `oauth_signature_method="HMAC-SHA1"`,
      `oauth_timestamp="${oauthTimestamp}"`,
      `oauth_version="${oauthVersion}"`,
      `oauth_verifier="${oauthVerifier}"`,
    ]
    const authHeader = authHeaderParts.join(', ')

    // POST to access_token endpoint
    const tokenRes = await fetch('https://api.twitter.com/oauth/access_token', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      console.error('Twitter access token error:', tokenRes.status, text)
      return NextResponse.redirect('/login?error=twitter_token_failed')
    }

    const tokenText = await tokenRes.text()
    const tokenData = Object.fromEntries(new URLSearchParams(tokenText))

    const accessToken = tokenData.oauth_token
    const accessTokenSecret = tokenData.oauth_token_secret
    const twitterUserId = tokenData.user_id
    const twitterScreenName = tokenData.screen_name

    if (!accessToken || !twitterUserId) {
      console.error('Invalid access token response:', tokenData)
      return NextResponse.redirect('/login?error=twitter_invalid_token_response')
    }

    // ============================================
    // Step 2: Fetch user profile
    // ============================================
    const baseProfileUrl = 'https://api.twitter.com/1.1/account/verify_credentials.json'
    const profileQueryParams = {
      skip_status: 'true',
      include_email: 'false',
    }

    const profileNonce = crypto.randomUUID().replace(/-/g, '').slice(0, 32)
    const profileTimestamp = Math.floor(Date.now() / 1000).toString()

    // OAuth parameters for profile request
    const profileOAuthParams = {
      oauth_consumer_key: apiKey,
      oauth_token: accessToken,
      oauth_nonce: profileNonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: profileTimestamp,
      oauth_version: oauthVersion,
    }

    // Combine OAuth and query parameters for signature base
    const allParams = { ...profileOAuthParams, ...profileQueryParams }
    const profileParamString = buildParameterString(allParams)

    const profileBaseString = [
      'GET',
      percentEncode(baseProfileUrl),
      percentEncode(profileParamString),
    ].join('&')

    const profileSigningKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessTokenSecret)}`
    const profileSignature = createHmac('sha1', profileSigningKey)
      .update(profileBaseString)
      .digest('base64')

    // Build Authorization header (only OAuth params)
    const profileAuthHeaderParts = Object.entries(profileOAuthParams)
      .map(([k, v]) => `${percentEncode(k)}="${percentEncode(v)}"`)
    const profileAuthHeader = `OAuth ${profileAuthHeaderParts.join(', ')}, oauth_signature="${encodeURIComponent(profileSignature)}"`

    // Build query string
    const queryString = buildParameterString(profileQueryParams)

    const profileRes = await fetch(`${baseProfileUrl}?${queryString}`, {
      headers: {
        Authorization: profileAuthHeader,
      },
    })

    if (!profileRes.ok) {
      console.error('Failed to fetch Twitter profile:', profileRes.status)
      return NextResponse.redirect('/login?error=twitter_profile_failed')
    }

    const twitterProfile = await profileRes.json()
    // twitterUserId from token is already reliable
    const profileUserId = String(twitterProfile.id_str || twitterProfile.id || twitterUserId)
    const profileScreenName = twitterProfile.screen_name || twitterScreenName
    const profileName = twitterProfile.name

    // ============================================
    // Step 3: Find or create Supabase user
    // ============================================
    const admin = createAdminClient()

    // Search existing users by twitter_user_id
    // @ts-ignore - listUsers pagination type mismatch
    const { data: { users } } = await admin.auth.admin.listUsers({ limit: 100 })
    const existingUser = users.find(u => u.user_metadata?.twitter_user_id === profileUserId)

    if (existingUser) {
      // Update metadata with fresh tokens
      await admin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...(existingUser.user_metadata || {}),
          twitter_access_token: accessToken,
          twitter_access_token_secret: accessTokenSecret,
          twitter_user_id: profileUserId,
          twitter_screen_name: profileScreenName,
          twitter_name: profileName,
        },
      })

      // Existing user with Twitter already linked. They need to sign in normally (email/password)
      return NextResponse.redirect('/login?message=twitter_linked_exists')
    }

    // Create new user with random password
    const email = `twitter_${profileUserId}@twitter.foodfactscanner.invalid`
    const password = randomUUID()

    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: profileName || profileScreenName || 'Twitter User',
        twitter_user_id: profileUserId,
        twitter_access_token: accessToken,
        twitter_access_token_secret: accessTokenSecret,
        twitter_screen_name: profileScreenName,
      },
    })

    if (createError) {
      console.error('Failed to create user:', createError)
      return NextResponse.redirect('/login?error=twitter_user_creation_failed')
    }

    // Sign in the new user via password grant
    const supabaseAnon = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError || !loginData.session) {
      console.error('Failed to sign in new Twitter user:', loginError)
      return NextResponse.redirect('/login?error=twitter_signin_failed')
    }

    // Build session data for client
    const sessionData = {
      access_token: loginData.session.access_token,
      refresh_token: loginData.session.refresh_token,
      expires_in: loginData.session.expires_in,
      expires_at: loginData.session.expires_at,
      token_type: loginData.session.token_type,
      user: loginData.session.user,
    }

    // Return HTML to store session and redirect to onboarding
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Completing Twitter sign-in...</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8fafc; }
    .container { text-align: center; }
    h2 { color: #1e293b; }
    p { color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Completing sign-in...</h2>
    <p>Please wait while we set up your account.</p>
  </div>
  <script>
    (function() {
      try {
        const session = ${JSON.stringify(sessionData).replace(/</g, '\\u003c')};
        localStorage.setItem('sb-session', JSON.stringify(session));
        window.location.href = '/onboarding?success=twitter';
      } catch (e) {
        document.body.innerHTML = '<div class="container"><h2>Error</h2><p>Could not complete sign-in. Please try again or contact support.</p></div>';
        console.error(e);
      }
    })();
  </script>
</body>
</html>
`

    const response = new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })

    // Clean up cookies
    response.cookies.delete('twitter_oauth_token')
    response.cookies.delete('twitter_oauth_token_secret')
    response.cookies.delete('twitter_oauth_state')

    return response

  } catch (err) {
    console.error('Twitter callback error:', err)
    return NextResponse.redirect('/login?error=twitter_unknown')
  }
}
