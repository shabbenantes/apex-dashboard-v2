import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api.onrender.com'
const N8N_SETTINGS_URL = process.env.N8N_SETTINGS_WEBHOOK_URL || 'https://getapexautomation.app.n8n.cloud/webhook/apex-dashboard-settings'

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

    // Fetch current settings from GHL via n8n
    const response = await fetch(N8N_SETTINGS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get',
        locationId: session.locationId,
        apiKey: session.apiKey,
      }),
    })

    if (!response.ok) {
      // Return defaults if we can't fetch
      return NextResponse.json({
        businessName: session.businessName,
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
        escalationEmail: session.email,
      })
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionData()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const settings = await request.json()

    // Update settings in GHL via n8n
    const response = await fetch(N8N_SETTINGS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        locationId: session.locationId,
        apiKey: session.apiKey,
        settings,
      }),
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
