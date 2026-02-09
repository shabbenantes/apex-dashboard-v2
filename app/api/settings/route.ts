import { NextResponse } from 'next/server'

// Force dynamic rendering - never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

async function getSessionData(request: Request) {
  // Get token from Authorization header (Bearer token)
  const authHeader = request.headers.get('Authorization')
  const sessionId = authHeader?.replace('Bearer ', '')
  
  if (!sessionId) {
    console.log('Settings API - No Authorization header')
    return null
  }
  
  const response = await fetch(`${API_URL}/sessions/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
    cache: 'no-store',
  })
  
  if (!response.ok) {
    console.log('Settings API - Session validation failed')
    return null
  }
  return response.json()
}

export async function GET(request: Request) {
  try {
    const session = await getSessionData(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch settings from dashboard API
    const response = await fetch(`${API_URL}/settings/${session.locationId}`, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      // Return defaults if we can't fetch
      return NextResponse.json({
        businessName: session.businessName || 'Your Business',
        businessType: 'service_appointments',
        services: '',
        serviceArea: '',
        businessHours: '',
        phone: '',
        bookingLink: '',
        tone: 'friendly',
        specialInstructions: '',
        businessKnowledge: '',
        escalationName: '',
        escalationEmail: session.email || '',
      })
    }

    const settings = await response.json()
    
    // Merge with session data for fallbacks
    return NextResponse.json({
      ...settings,
      businessName: settings.businessName || session.businessName || 'Your Business',
      escalationEmail: settings.escalationEmail || session.email || '',
    })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionData(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const settings = await request.json()
    
    // Save settings to dashboard API
    const response = await fetch(`${API_URL}/settings/${session.locationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save settings error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
