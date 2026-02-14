import { NextResponse } from 'next/server'

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

// Lightweight poll endpoint for self-test flow
// Just checks the stored connection/verification state - no GHL calls
export async function GET(request: Request) {
  try {
    const session = await getSessionData(request)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { locationId } = session
    
    if (!locationId) {
      return NextResponse.json({
        facebook: { connected: false, verified: false },
        instagram: { connected: false, verified: false },
        tiktok: { connected: false, verified: false },
      })
    }

    // Call the lightweight poll endpoint on the API
    const pollRes = await fetch(`${API_URL}/connections/${locationId}/poll`, {
      cache: 'no-store',
    })
    
    if (!pollRes.ok) {
      console.error('Poll endpoint error:', pollRes.status)
      return NextResponse.json({
        facebook: { connected: false, verified: false },
        instagram: { connected: false, verified: false },
        tiktok: { connected: false, verified: false },
      })
    }
    
    const pollData = await pollRes.json()
    
    return NextResponse.json(pollData)
  } catch (error) {
    console.error('Connection poll error:', error)
    return NextResponse.json({ error: 'Failed to poll connections' }, { status: 500 })
  }
}
