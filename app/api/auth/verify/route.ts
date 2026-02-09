import { NextResponse } from 'next/server'

// Force dynamic - never cache auth
export const dynamic = 'force-dynamic'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify token with the API and get session
    const apiResponse = await fetch(`${API_URL}/tokens/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok || data.error) {
      return NextResponse.json({ 
        error: data.error || 'Invalid or expired link' 
      }, { status: 401 })
    }

    // Create response with cookies set via NextResponse
    const response = NextResponse.json({ 
      success: true,
      businessName: data.businessName 
    })

    // Set session cookie - always secure on production (Render uses HTTPS)
    response.cookies.set('apex_session', data.sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Also set a non-httpOnly cookie with business info for client-side
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
    console.error('Auth verify error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
