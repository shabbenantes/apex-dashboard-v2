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

    // Fetch more than needed to account for filtering, then slice
    const fetchLimit = Math.min(limit + offset + 50, 200) // GHL max is usually 100-200
    const allConversations = await getConversations(locationId, apiKey, fetchLimit)
    
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
    const formatted = allConversations.map(c => {
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

    return NextResponse.json({ conversations: paginated })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 })
  }
}
