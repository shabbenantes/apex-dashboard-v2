import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getConversations, formatRelativeTime } from '@/lib/ghl'

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
        conversations: [],
        message: 'No GHL connection configured'
      })
    }

    const conversations = await getConversations(locationId, apiKey, 50)
    
    // Format for the frontend
    const formatted = conversations.map(c => ({
      id: c.id,
      name: c.contactName || c.fullName,
      lastMessage: c.lastMessageBody?.substring(0, 100) || 'No messages yet',
      time: formatRelativeTime(c.lastMessageDate),
      unread: c.unreadCount > 0,
      messageCount: c.unreadCount || 1,
      type: c.type,
      direction: c.lastMessageDirection,
    }))

    return NextResponse.json({ conversations: formatted })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 })
  }
}
