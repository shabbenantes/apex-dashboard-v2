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

    // Return all session data - client will store in localStorage
    // Calculate expiry (30 days from now)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    return NextResponse.json({ 
      success: true,
      sessionId: data.sessionId,
      email: data.email,
      locationId: data.locationId,
      businessName: data.businessName,
      apiKey: data.apiKey,
      expiresAt
    })
  } catch (error) {
    console.error('Auth verify error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
