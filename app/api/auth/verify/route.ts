import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api.onrender.com'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify token with the API and get session
    const response = await fetch(`${API_URL}/tokens/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      return NextResponse.json({ 
        error: data.error || 'Invalid or expired link' 
      }, { status: 401 })
    }

    // Set session cookie with the sessionId from API
    // This cookie is used to authenticate future requests
    const cookieStore = await cookies()
    cookieStore.set('apex_session', data.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Also set a non-httpOnly cookie with business info for client-side
    cookieStore.set('apex_business', JSON.stringify({
      businessName: data.businessName,
      email: data.email,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return NextResponse.json({ 
      success: true,
      businessName: data.businessName 
    })
  } catch (error) {
    console.error('Auth verify error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
