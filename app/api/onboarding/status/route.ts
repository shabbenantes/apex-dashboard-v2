import { NextRequest, NextResponse } from 'next/server'
import { getIntegrationStatus } from '@/lib/ghl'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function GET(request: NextRequest) {
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

    // Get GHL integration status
    let facebookConnected = false
    let instagramConnected = false

    if (customer.ghlLocationId && customer.ghlApiKey) {
      const integrations = await getIntegrationStatus(
        customer.ghlLocationId,
        customer.ghlApiKey
      )
      facebookConnected = integrations.facebook.connected
      instagramConnected = integrations.instagram.connected
    }

    // Get settings to check if they've been configured
    const settingsRes = await fetch(`${API_URL}/customers/${customer.id}/settings`)
    let settingsReviewed = false
    if (settingsRes.ok) {
      const settings = await settingsRes.json()
      // Consider settings reviewed if they have a business name set
      settingsReviewed = !!settings.businessName && settings.businessName.trim() !== ''
    }

    // Check if customer has onboarding data stored
    const onboarding = customer.onboarding || {}
    
    // Build portal URL
    const ghlPortalUrl = customer.ghlLocationId 
      ? `https://app.gohighlevel.com/v2/location/${customer.ghlLocationId}`
      : 'https://app.gohighlevel.com'

    // Get GHL credentials from stored customer data
    const ghlCredentials = customer.ghlCredentials || null

    return NextResponse.json({
      completedAt: onboarding.completedAt || null,
      steps: {
        facebookConnected,
        instagramConnected,
        businessHoursSet: !!customer.settings?.businessHours,
        phoneVerified: !!customer.phone,
        settingsReviewed: onboarding.settingsReviewed || settingsReviewed,
      },
      ghlPortalUrl,
      ghlCredentials,
    })
  } catch (error) {
    console.error('Failed to get onboarding status:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
