import { NextResponse } from 'next/server'
import { getConversations, formatRelativeTime } from '@/lib/ghl'

// Force dynamic rendering - never cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
        conversations: [],
        message: 'No GHL connection configured'
      })
    }

    // Parse limit and offset from query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch directly from GHL to debug the issue
    console.log(`[conversations route] locationId: ${locationId}, apiKey: ${apiKey?.substring(0, 10)}...`)
    
    // Direct GHL call for debugging
    const ghlResponse = await fetch(
      `https://services.leadconnectorhq.com/conversations/search?locationId=${locationId}&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
        },
        cache: 'no-store',
      }
    )
    
    const ghlData = await ghlResponse.json()
    const rawConversations = ghlData.conversations || []
    console.log(`[conversations route] Raw from GHL: ${rawConversations.length}`)
    
    // Filter to FB/IG only
    const socialTypes = ['TYPE_FACEBOOK', 'TYPE_INSTAGRAM', 'FB', 'IG', 'FACEBOOK', 'INSTAGRAM']
    const allConversations = rawConversations.filter((c: any) => {
      const messageType = String(c.lastMessageType || '').toUpperCase()
      return socialTypes.some(t => messageType.includes(t))
    }).map((c: any) => ({
      id: c.id,
      contactId: c.contactId,
      contactName: c.contactName || c.fullName || 'Unknown',
      fullName: c.fullName || c.contactName || 'Unknown',
      email: c.email,
      phone: c.phone,
      lastMessageBody: c.lastMessageBody || '',
      lastMessageDate: c.lastMessageDate,
      lastMessageDirection: c.lastMessageDirection,
      unreadCount: c.unreadCount || 0,
      type: c.lastMessageType?.replace('TYPE_', '') || 'UNKNOWN',
    }))
    console.log(`[conversations route] After filter: ${allConversations.length}`)
    
    // Escalation keywords to detect
    const escalationKeywords = [
      'speak to someone',
      'talk to a human',
      'real person',
      'get someone to help',
      'have someone call',
      'have someone reach out',
      'connect you with',
      'transfer you to',
      'let me get',
      'someone will be in touch',
      'team will reach out',
      'get back to you',
      'follow up with you'
    ]
    
    // Check if today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()
    
    // Format for the frontend
    const formatted = allConversations.map((c: any) => {
      const messageText = (c.lastMessageBody || '').toLowerCase()
      const needsAttention = escalationKeywords.some(keyword => messageText.includes(keyword))
      const isToday = c.lastMessageDate >= todayTimestamp
      
      return {
        id: c.id,
        name: c.contactName || c.fullName,
        lastMessage: c.lastMessageBody?.substring(0, 150) || 'No messages yet',
        time: formatRelativeTime(c.lastMessageDate),
        unread: c.unreadCount > 0,
        messageCount: c.unreadCount || 1,
        type: c.type,
        direction: c.lastMessageDirection,
        needsAttention,
        isToday,
      }
    })

    // Apply pagination (offset/limit) after filtering
    const paginated = formatted.slice(offset, offset + limit)
    console.log(`[conversations route] Returning ${paginated.length} conversations (offset: ${offset}, limit: ${limit})`)

    return NextResponse.json({ 
      conversations: paginated,
      _debug: {
        locationId,
        apiKeyPrefix: apiKey?.substring(0, 15),
        rawFromGHL: rawConversations?.length || 0,
        afterFilter: allConversations.length,
        formattedCount: formatted.length,
        paginatedCount: paginated.length,
      }
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 })
  }
}
