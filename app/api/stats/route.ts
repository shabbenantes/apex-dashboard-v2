import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDashboardStats } from '@/lib/ghl'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

async function getSessionData() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('apex_session')?.value
  
  if (!sessionId) return null
  
  const response = await fetch(`${API_URL}/sessions/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })
  
  if (!response.ok) return null
  return response.json()
}

export async function GET() {
  try {
    const session = await getSessionData()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { locationId, apiKey } = session
    
    if (!locationId || !apiKey) {
      return NextResponse.json({
        messagesThisWeek: 0,
        avgResponseTime: '< 1 min',
        leadsThisWeek: 0,
        conversionRate: '--',
        message: 'No GHL connection configured'
      })
    }

    const stats = await getDashboardStats(locationId, apiKey)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
