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

// Map GHL conversation/message types to the type needed for sending
function getMessageType(convoType: string | number, messageType?: string): string {
  // If we have an explicit message type from conversations, use it
  if (messageType) {
    if (messageType.includes('FACEBOOK') || messageType === 'FB') return 'FB'
    if (messageType.includes('INSTAGRAM') || messageType === 'IG') return 'IG'
    if (messageType.includes('TIKTOK')) return 'TikTok'
    if (messageType.includes('SMS')) return 'SMS'
    if (messageType.includes('WHATSAPP')) return 'WhatsApp'
  }
  
  // Fall back to conversation type
  const typeStr = String(convoType).toUpperCase()
  if (typeStr.includes('FACEBOOK') || typeStr === '11' || typeStr === 'FB') return 'FB'
  if (typeStr.includes('INSTAGRAM') || typeStr === 'IG') return 'IG'
  if (typeStr.includes('TIKTOK')) return 'TikTok'
  if (typeStr.includes('SMS') || typeStr === '1') return 'SMS'
  if (typeStr.includes('WHATSAPP')) return 'WhatsApp'
  
  // Default to SMS if unknown
  return 'SMS'
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
    let lastMessageType = ''
    
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
      
      // Get contact name and last message type from messages
      const inboundMsg = messagesList.find((m: any) => m.direction === 'inbound')
      if (inboundMsg?.from) {
        contactName = inboundMsg.from
      } else if (messagesList[0]?.to) {
        contactName = messagesList[0].to
      }
      
      // Get the message type from the most recent message
      if (messagesList.length > 0) {
        lastMessageType = messagesList[0].messageType || messagesList[0].type || ''
      }
    }

    // Determine the channel type for sending replies
    const channelType = getMessageType(convo.type || convo.lastMessageType, lastMessageType)

    return NextResponse.json({
      id: convo.id,
      contactId: convo.contactId,
      locationId: locationId,
      contactName: convo.contactName || convo.fullName || contactName,
      contactEmail: convo.email,
      contactPhone: convo.phone,
      type: convo.lastMessageType || (convo.type === 11 ? 'TYPE_FACEBOOK' : (convo.type || 'PHONE')),
      channelType, // The type to use when sending messages
      messages,
    })
  } catch (error) {
    console.error('Failed to fetch conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
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

    // First, fetch conversation details to get contactId and channel type
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
      console.error('Failed to fetch conversation for send:', convoRes.status)
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const convoData = await convoRes.json()
    const convo = convoData.conversation || convoData
    const contactId = convo.contactId

    if (!contactId) {
      console.error('No contactId in conversation:', convo)
      return NextResponse.json({ error: 'Invalid conversation - no contact' }, { status: 400 })
    }

    // Determine the message type from conversation
    const messageType = getMessageType(convo.type || convo.lastMessageType, convo.lastMessageType)

    console.log('Sending message:', {
      type: messageType,
      locationId,
      contactId,
      messageLength: message.trim().length,
    })

    // Send message via GHL Conversations API
    // For social channels (FB, IG, TikTok), we need type, contactId, locationId, and message
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
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send message'
      if (errorData.message) {
        errorMessage = errorData.message
      } else if (sendRes.status === 400) {
        errorMessage = 'Invalid request - check channel connection'
      } else if (sendRes.status === 401) {
        errorMessage = 'API key unauthorized'
      } else if (sendRes.status === 422) {
        errorMessage = 'Cannot send to this channel - check Facebook/Instagram connection'
      }
      
      return NextResponse.json({ 
        error: errorMessage,
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
        type: 'Manual', // Mark as manual to distinguish from AI
      }
    })
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
