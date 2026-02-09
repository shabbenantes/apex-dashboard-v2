import { NextResponse } from 'next/server'

// This route handles the magic link callback
// It verifies the token, sets cookies, and returns an HTML page that redirects
// This approach is more reliable for cookie handling across different browsers

export const dynamic = 'force-dynamic'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://apex-dashboard-lt3v.onrender.com'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${DASHBOARD_URL}/login?error=no_token`)
  }

  try {
    // Verify token with the API
    const apiResponse = await fetch(`${API_URL}/tokens/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok || data.error) {
      console.error('Token verify failed:', data.error)
      return NextResponse.redirect(`${DASHBOARD_URL}/login?error=invalid_token`)
    }

    // Return HTML page that will redirect after cookies are set
    // This gives the browser time to process the Set-Cookie headers
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Signing in...</title>
  <style>
    body {
      background: #0a0a0f;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #333;
      border-top-color: #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Signing you in...</p>
  </div>
  <script>
    // Redirect after a short delay to ensure cookies are saved
    setTimeout(function() {
      window.location.href = '${DASHBOARD_URL}/dashboard';
    }, 500);
  </script>
</body>
</html>
`

    // Create response with HTML and cookies
    const response = new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    })

    // Set session cookie
    response.cookies.set('apex_session', data.sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Set business info cookie (for client-side use)
    response.cookies.set('apex_business', JSON.stringify({
      businessName: data.businessName,
      email: data.email,
    }), {
      httpOnly: false,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${DASHBOARD_URL}/login?error=server_error`)
  }
}
