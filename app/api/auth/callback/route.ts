import { NextResponse } from 'next/server'

// This route handles the magic link callback
// It verifies the token, sets cookies, and redirects to dashboard

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

    // Create redirect response
    const response = NextResponse.redirect(`${DASHBOARD_URL}/dashboard`)

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
