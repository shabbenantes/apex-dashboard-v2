import { NextRequest, NextResponse } from 'next/server'

const GHL_API_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
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
    const locationId = customer.ghlLocationId || customer.locationId
    const apiKey = customer.ghlApiKey || customer.apiKey

    if (!locationId || !apiKey) {
      return NextResponse.json({ error: 'GHL not configured' }, { status: 400 })
    }

    // Fetch conversation details from GHL
    const convoRes = await fetch(
      `${GHL_API_BASE}/conversations/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': GHL_API_VERSION,
        },
      }
    )

    if (!convoRes.ok) {
      if (convoRes.status === 404) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
      console.error('GHL conversation error:', convoRes.status)
      return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
    }

    const convoData = await convoRes.json()
    const convo = convoData.conversation || convoData

    // Fetch messages for this conversation
    const messagesRes = await fetch(
      `${GHL_API_BASE}/conversations/${id}/messages?limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': GHL_API_VERSION,
        },
      }
    )

    let messages: any[] = []
    if (messagesRes.ok) {
      const messagesData = await messagesRes.json()
      messages = (messagesData.messages || []).map((m: any) => ({
        id: m.id,
        body: m.body || m.message || '',
        direction: m.direction,
        dateAdded: m.dateAdded,
        type: m.type || m.messageType,
      }))
      // Sort by date, oldest first
      messages.sort((a, b) => a.dateAdded - b.dateAdded)
    }

    return NextResponse.json({
      id: convo.id,
      contactName: convo.contactName || convo.fullName || 'Unknown',
      contactEmail: convo.email,
      contactPhone: convo.phone,
      type: convo.type || 'PHONE',
      messages,
    })
  } catch (error) {
    console.error('Failed to fetch conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
