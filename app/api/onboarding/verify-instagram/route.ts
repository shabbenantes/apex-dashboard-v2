import { NextRequest, NextResponse } from 'next/server'
import { getIntegrationStatus } from '@/lib/ghl'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function POST(request: NextRequest) {
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify token and get customer data
    const verifyRes = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { customer } = await verifyRes.json()

    if (!customer.ghlLocationId || !customer.ghlApiKey) {
      return NextResponse.json({ 
        connected: false, 
        error: 'GHL not configured for this account' 
      })
    }

    // Check GHL for Instagram integration
    const integrations = await getIntegrationStatus(
      customer.ghlLocationId,
      customer.ghlApiKey
    )

    if (integrations.instagram.connected) {
      // Update customer onboarding status in our API
      try {
        await fetch(`${API_URL}/customers/${customer.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            onboarding: {
              ...customer.onboarding,
              instagramConnected: true,
              instagramConnectedAt: new Date().toISOString(),
            }
          }),
        })
      } catch (e) {
        // Non-critical, continue
        console.error('Failed to update onboarding status:', e)
      }

      return NextResponse.json({
        connected: true,
        handle: integrations.instagram.handle,
      })
    }

    return NextResponse.json({
      connected: false,
      message: 'Instagram connection not detected yet. Make sure you completed all steps and try again.',
    })
  } catch (error) {
    console.error('Failed to verify Instagram:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
