import { NextRequest, NextResponse } from 'next/server'

const GHL_API_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'
const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

// Helper to verify token and get customer data
async function getCustomerFromToken(token: string) {
  const verifyRes = await fetch(`${API_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })

  if (!verifyRes.ok) {
    return null
  }

  const verifyData = await verifyRes.json()
  return verifyData.customer
}

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
      const errorData = await verifyRes.json().catch(() => ({}))
      console.error('Auth verify failed:', verifyRes.status, errorData)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const verifyData = await verifyRes.json()
    const customer = verifyData.customer
    
    if (!customer) {
      console.error('No customer in verify response:', verifyData)
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
    
    const locationId = customer.ghlLocationId || customer.locationId
    const apiKey = customer.ghlApiKey || customer.apiKey

    if (!locationId || !apiKey) {
      console.error('Missing GHL credentials:', { locationId, apiKey: !!apiKey })
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
    let contactName = 'Unknown'
    
    if (messagesRes.ok) {
      const messagesData = await messagesRes.json()
      // GHL returns { messages: { messages: [...] } }
      const messagesList = messagesData.messages?.messages || messagesData.messages || []
      
      messages = messagesList.map((m: any) => ({
        id: m.id,
        body: m.body || m.message || '',
        direction: m.direction,
        dateAdded: new Date(m.dateAdded).getTime(),
        type: m.type || m.messageType,
      }))
      
      // Sort by date, oldest first
      messages.sort((a, b) => a.dateAdded - b.dateAdded)
      
      // Get contact name from inbound messages
      const inboundMsg = messagesList.find((m: any) => m.direction === 'inbound')
      if (inboundMsg?.from) {
        contactName = inboundMsg.from
      } else if (messagesList[0]?.to) {
        contactName = messagesList[0].to
      }
    }

    return NextResponse.json({
      id: convo.id,
      contactName: convo.contactName || convo.fullName || contactName,
      contactEmail: convo.email,
      contactPhone: convo.phone,
      type: convo.type === 1 ? 'TYPE_FACEBOOK' : (convo.type || 'PHONE'),
      messages,
    })
  } catch (error) {
    console.error('Failed to fetch conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper to determine message type from conversation data
function getMessageTypeFromConvo(convo: any): string {
  const lastMsgType = convo.lastMessageType || ''
  if (lastMsgType.includes('FACEBOOK') || lastMsgType === 'TYPE_FACEBOOK') return 'FB'
  if (lastMsgType.includes('INSTAGRAM')) return 'IG'
  if (lastMsgType.includes('TIKTOK')) return 'TikTok'
  
  // Fallback to conversation type
  const convoType = String(convo.type || '').toUpperCase()
  if (convoType.includes('FACEBOOK') || convoType === '11') return 'FB'
  if (convoType.includes('INSTAGRAM')) return 'IG'
  
  return 'SMS' // Default fallback
}

// POST - Send a message in this conversation
export async function POST(
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
    // Parse request body
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Verify token and get customer data
    const customer = await getCustomerFromToken(token)
    
    if (!customer) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const locationId = customer.ghlLocationId || customer.locationId
    const apiKey = customer.ghlApiKey || customer.apiKey

    if (!apiKey || !locationId) {
      return NextResponse.json({ error: 'GHL not configured' }, { status: 400 })
    }

    // First fetch conversation to get contactId and channel type
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
      const errBody = await convoRes.text().catch(() => '')
      console.error('Convo fetch failed:', convoRes.status, errBody)
      return NextResponse.json({ error: `Conversation not found: ${convoRes.status}` }, { status: 404 })
    }

    const convoData = await convoRes.json()
    const convo = convoData.conversation || convoData
    const contactId = convo.contactId

    console.log('Convo data:', { id, contactId, type: convo.type, lastMessageType: convo.lastMessageType })

    if (!contactId) {
      return NextResponse.json({ error: 'No contact found for conversation', convoKeys: Object.keys(convo) }, { status: 400 })
    }

    // Determine the channel type
    const messageType = getMessageTypeFromConvo(convo)
    console.log('Sending as type:', messageType)

    // Send message via GHL Conversations API with proper params
    const sendRes = await fetch(
      `${GHL_API_BASE}/conversations/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': GHL_API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: messageType,
          contactId: contactId,
          locationId: locationId,
          message: message.trim(),
        }),
      }
    )

    if (!sendRes.ok) {
      const errorData = await sendRes.json().catch(() => ({}))
      console.error('GHL send message error:', sendRes.status, errorData)
      return NextResponse.json({ 
        error: errorData.message || 'Failed to send message',
        details: errorData 
      }, { status: sendRes.status })
    }

    const sendData = await sendRes.json()

    return NextResponse.json({
      success: true,
      messageId: sendData.messageId || sendData.id,
      message: {
        id: sendData.messageId || sendData.id,
        body: message.trim(),
        direction: 'outbound',
        dateAdded: Date.now(),
        type: 'Manual',
      }
    })
  } catch (error: any) {
    console.error('Failed to send message:', error)
    return NextResponse.json({ 
      error: error?.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
}
