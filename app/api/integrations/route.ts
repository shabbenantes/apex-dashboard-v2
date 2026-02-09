import { NextResponse } from 'next/server'
import { getIntegrationStatus } from '@/lib/ghl'

export const dynamic = 'force-dynamic'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

async function getSessionData(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const sessionId = authHeader?.replace('Bearer ', '')
  
  if (!sessionId) return null
  
  const response = await fetch(`${API_URL}/sessions/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
    cache: 'no-store',
  })
  
  if (!response.ok) return null
  return response.json()
}

export async function GET(request: Request) {
  try {
    const session = await getSessionData(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { locationId, apiKey } = session
    
    if (!locationId || !apiKey) {
      return NextResponse.json({
        facebook: { connected: false },
        instagram: { connected: false },
        ghlConnectUrl: null,
        message: 'No GHL connection configured'
      })
    }

    const status = await getIntegrationStatus(locationId, apiKey)
    
    // Include the deep link URL for connecting
    const ghlConnectUrl = `https://app.gohighlevel.com/v2/location/${locationId}/settings/integrations/list`

    return NextResponse.json({
      ...status,
      ghlConnectUrl,
      locationId,
    })
  } catch (error) {
    console.error('Get integrations error:', error)
    return NextResponse.json({ error: 'Failed to load integrations' }, { status: 500 })
  }
}
