import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

/**
 * Pinterest OAuth callback handler
 *
 * Steps:
 * 1. Verify state parameter matches the cookie (CSRF protection)
 * 2. Exchange authorization code for access token
 * 3. Fetch Pinterest user profile to get user_id and username
 * 4. Use Supabase admin client to find an existing user by pinterest_user_id in raw_user_meta_data
 *    - If found: update their metadata with new tokens (refresh token, expiry)
 *    - If not found: create a new Supabase user with a random password and store Pinterest tokens in metadata
 * 5. For new users: sign them in immediately using the generated credentials
 * 6. Return an HTML page that stores the Supabase session in localStorage and redirects to /onboarding
 *
 * Note: This implementation assumes new user sign-up. For existing users, automatic sign-in is not supported
 * due to lack of password. In production, you may want to handle that case by prompting login.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Check for OAuth error from Pinterest
    if (error) {
      return NextResponse.redirect(
        `/login?error=pinterest_auth_failed&message=${encodeURIComponent(errorDescription || error)}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect('/login?error=pinterest_missing_params')
    }

    // Verify state
    const stateCookie = req.cookies.get('pinterest_oauth_state')
    if (!stateCookie || stateCookie.value !== state) {
      return NextResponse.redirect('/login?error=pinterest_invalid_state')
    }

    // Get environment variables
    const clientId = process.env.PINTREST_CLIENT_ID
    const clientSecret = process.env.PINTREST_CLIENT_SECRET
    const redirectUri = process.env.PINTREST_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Pinterest OAuth environment variables not set')
      return NextResponse.redirect('/login?error=pinterest_config')
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const tokenErr = await tokenRes.json().catch(() => ({}))
      console.error('Pinterest token exchange failed:', tokenErr)
      return NextResponse.redirect('/login?error=pinterest_token_failed')
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    const expiresIn = tokenData.expires_in // seconds
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn

    // Fetch Pinterest user profile
    const profileRes = await fetch('https://api.pinterest.com/v5/user_account', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!profileRes.ok) {
      console.error('Failed to fetch Pinterest user profile')
      return NextResponse.redirect('/login?error=pinterest_profile_failed')
    }

    const pinterestProfile = await profileRes.json()
    const pinterestUserId = pinterestProfile.user_id
    const pinterestUsername = pinterestProfile.username
    const pinterestName = pinterestProfile.name

    // Supabase admin client
    const admin = createAdminClient()

    // Try to find existing user by pinterest_user_id in raw_user_meta_data
    // @ts-ignore - listUsers pagination type mismatch
    const { data: { users } } = await admin.auth.admin.listUsers({ limit: 100 })
    const existingUser = users.find(u => u.raw_user_metadata?.pinterest_user_id === pinterestUserId)

    if (existingUser) {
      // Update metadata with new tokens
      await admin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...existingUser.raw_user_metadata,
          pinterest_access_token: accessToken,
          pinterest_refresh_token: refreshToken,
          pinterest_token_expires_at: expiresAt,
          pinterest_user_id: pinterestUserId,
          pinterest_username: pinterestUsername,
          pinterest_name: pinterestName,
        },
      })

      // For existing users, we cannot sign them in without knowing their password.
      // In a production system, you might send them a magic link or prompt to log in normally.
      // Here we redirect to login with a message that they should log in.
      return NextResponse.redirect('/login?message=pinterest_linked_exists')
    }

    // Create a new user
    const email = `pinterest_${pinterestUserId}@pinterest.foodfactscanner.invalid`
    const password = randomUUID() // Random secure password

    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: pinterestName || pinterestUsername || 'Pinterest User',
        pinterest_user_id: pinterestUserId,
        pinterest_access_token: accessToken,
        pinterest_refresh_token: refreshToken,
        pinterest_token_expires_at: expiresAt,
        pinterest_username: pinterestUsername,
      },
    })

    if (createError) {
      console.error('Failed to create user:', createError)
      return NextResponse.redirect('/login?error=pinterest_user_creation_failed')
    }

    // Sign in the new user using password grant
    const supabaseAnon = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError || !loginData.session) {
      console.error('Failed to sign in new Pinterest user:', loginError)
      return NextResponse.redirect('/login?error=pinterest_signin_failed')
    }

    // Build the session object that the client expects in localStorage
    const sessionData = {
      access_token: loginData.session.access_token,
      refresh_token: loginData.session.refresh_token,
      expires_in: loginData.session.expires_in,
      expires_at: loginData.session.expires_at,
      token_type: loginData.session.token_type,
      user: loginData.session.user,
    }

    // Return an HTML page that stores the session in localStorage and redirects to onboarding
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Completing Pinterest sign-in...</title>
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
        window.location.href = '/onboarding?success=pinterest';
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
    response.cookies.delete('pinterest_oauth_state', { path: '/api/auth/pinterest/callback' })
    return response

  } catch (err) {
    console.error('Pinterest callback error:', err)
    return NextResponse.redirect('/login?error=pinterest_unknown')
  }
}
