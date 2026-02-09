import { NextResponse } from 'next/server'

// This route handles the magic link callback
// Sets cookies via HTTP headers (most reliable) with JavaScript backup

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

    // Cookie settings
    const maxAge = 60 * 60 * 24 * 30 // 30 days
    const businessData = JSON.stringify({
      businessName: data.businessName,
      email: data.email,
    })
    
    // Build response with both HTTP headers AND JavaScript cookie setting
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
    .container { text-align: center; }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #333;
      border-top-color: #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Signing you in...</p>
  </div>
  <script>
    // Backup: also set cookies via JavaScript in case HTTP headers didn't work
    (function() {
      var maxAge = ${maxAge};
      var expires = new Date(Date.now() + maxAge * 1000).toUTCString();
      document.cookie = 'apex_session=${data.sessionId}; path=/; expires=' + expires + '; SameSite=Lax';
      document.cookie = 'apex_business=${encodeURIComponent(businessData)}; path=/; expires=' + expires + '; SameSite=Lax';
    })();
    // Redirect after a brief pause to ensure cookies are set
    setTimeout(function() {
      window.location.replace('/dashboard');
    }, 200);
  </script>
</body>
</html>
`

    const response = new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
    
    // Set cookies via HTTP headers (primary method - most reliable)
    response.cookies.set('apex_session', data.sessionId, {
      path: '/',
      maxAge: maxAge,
      httpOnly: false, // Allow JS access for debugging
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    
    response.cookies.set('apex_business', businessData, {
      path: '/',
      maxAge: maxAge,
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${DASHBOARD_URL}/login?error=server_error`)
  }
}
