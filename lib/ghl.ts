// GHL API Integration

const GHL_API_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'

export interface Conversation {
  id: string
  contactId: string
  contactName: string
  fullName: string
  email?: string
  phone?: string
  lastMessageBody: string
  lastMessageDate: number
  lastMessageDirection: string
  unreadCount: number
  type: string
}

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateAdded: string
  tags?: string[]
}

export interface DashboardStats {
  messagesThisWeek: number
  avgResponseTime: string
  totalConversations: number
}

export async function getConversations(locationId: string, apiKey: string, limit = 20): Promise<Conversation[]> {
  try {
    const response = await fetch(
      `${GHL_API_BASE}/conversations/search?locationId=${locationId}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': GHL_API_VERSION,
        },
        cache: 'no-store', // Don't cache - always fetch fresh
      }
    )

    if (!response.ok) {
      console.error('GHL API error:', response.status)
      return []
    }

    const data = await response.json()
    
    // Filter to only Facebook and Instagram conversations
    const socialTypes = ['TYPE_FACEBOOK', 'TYPE_INSTAGRAM', 'FB', 'IG', 'FACEBOOK', 'INSTAGRAM']
    const allConvos = data.conversations || []
    console.log(`[getConversations] Total from GHL: ${allConvos.length}`)
    
    const socialConversations = allConvos.filter((c: any) => {
      const messageType = String(c.lastMessageType || '').toUpperCase()
      const isSocial = socialTypes.some(t => messageType.includes(t))
      console.log(`[getConversations] ${c.contactName}: ${c.lastMessageType} -> ${isSocial ? 'KEEP' : 'SKIP'}`)
      return isSocial
    })
    
    console.log(`[getConversations] After filter: ${socialConversations.length}`)
    
    return socialConversations.map((c: any) => ({
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
      type: formatChannelType(c.lastMessageType || c.type),
    }))
  } catch (error) {
    console.error('Failed to fetch conversations:', error)
    return []
  }
}

// Map GHL type strings to clean display names
function formatChannelType(type: number | string): string {
  if (typeof type === 'number') {
    const numMap: Record<number, string> = {
      1: 'FACEBOOK',
      2: 'INSTAGRAM', 
      3: 'SMS',
      4: 'EMAIL',
      5: 'CALL',
      6: 'LIVE_CHAT',
      7: 'GOOGLE',
      11: 'FACEBOOK',
      12: 'INSTAGRAM',
    }
    return numMap[type] || 'SMS'
  }
  
  // Clean up GHL's TYPE_ prefix for display
  const typeStr = String(type).toUpperCase()
  const cleanMap: Record<string, string> = {
    'TYPE_FACEBOOK': 'FACEBOOK',
    'TYPE_INSTAGRAM': 'INSTAGRAM',
    'TYPE_SMS': 'SMS',
    'TYPE_EMAIL': 'EMAIL',
    'TYPE_CALL': 'CALL',
    'TYPE_PHONE': 'PHONE',
    'TYPE_LIVE_CHAT': 'LIVE_CHAT',
    'TYPE_GOOGLE': 'GOOGLE',
    'FB': 'FACEBOOK',
    'IG': 'INSTAGRAM',
  }
  
  return cleanMap[typeStr] || typeStr.replace('TYPE_', '')
}

export async function getContacts(locationId: string, apiKey: string, limit = 20): Promise<Contact[]> {
  try {
    const response = await fetch(
      `${GHL_API_BASE}/contacts/?locationId=${locationId}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': GHL_API_VERSION,
        },
        next: { revalidate: 60 },
      }
    )

    if (!response.ok) {
      console.error('GHL API error:', response.status)
      return []
    }

    const data = await response.json()
    return (data.contacts || []).map((c: any) => ({
      id: c.id,
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      email: c.email,
      phone: c.phone,
      dateAdded: c.dateAdded,
      tags: c.tags || [],
    }))
  } catch (error) {
    console.error('Failed to fetch contacts:', error)
    return []
  }
}

// Calculate actual average response time from message timestamps
async function calculateAvgResponseTime(
  locationId: string, 
  apiKey: string, 
  conversationIds: string[]
): Promise<string> {
  const responseTimes: number[] = []
  
  // Sample up to 10 recent conversations to avoid too many API calls
  const sampled = conversationIds.slice(0, 10)
  
  for (const convId of sampled) {
    try {
      const response = await fetch(
        `${GHL_API_BASE}/conversations/${convId}/messages?locationId=${locationId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': GHL_API_VERSION,
          },
        }
      )
      
      if (!response.ok) continue
      
      const data = await response.json()
      const messages = data.messages?.messages || []
      
      // Sort by date ascending
      const sorted = [...messages].sort((a: any, b: any) => 
        new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
      )
      
      // Find inbound → outbound pairs and calculate response times
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].direction === 'inbound' && sorted[i + 1].direction === 'outbound') {
          const inboundTime = new Date(sorted[i].dateAdded).getTime()
          const outboundTime = new Date(sorted[i + 1].dateAdded).getTime()
          const responseTime = outboundTime - inboundTime
          
          // Only count reasonable response times (< 1 hour, to filter out manual responses)
          if (responseTime > 0 && responseTime < 3600000) {
            responseTimes.push(responseTime)
          }
        }
      }
    } catch (e) {
      // Skip this conversation if there's an error
      continue
    }
  }
  
  if (responseTimes.length === 0) {
    return '< 1 min'
  }
  
  const avgMs = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  const avgSeconds = Math.round(avgMs / 1000)
  
  if (avgSeconds < 60) {
    return `${avgSeconds} sec`
  } else {
    const avgMinutes = Math.round(avgSeconds / 60)
    return `${avgMinutes} min`
  }
}

export async function getDashboardStats(locationId: string, apiKey: string): Promise<DashboardStats> {
  try {
    // Get FB/IG conversations (already filtered in getConversations)
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    
    // Only count social media conversations - these ARE your leads
    const conversations = await getConversations(locationId, apiKey, 100)

    // Recent conversations from this week
    const recentConvos = conversations.filter(c => c.lastMessageDate > oneWeekAgo)
    
    // Messages this week - count actual conversations, not estimated
    const messagesThisWeek = recentConvos.length

    // Total conversations all time
    const totalConversations = conversations.length
    
    // Calculate actual average response time
    const avgResponseTime = await calculateAvgResponseTime(
      locationId, 
      apiKey, 
      conversations.map(c => c.id)
    )

    return {
      messagesThisWeek,
      avgResponseTime,
      totalConversations,
    }
  } catch (error) {
    console.error('Failed to get dashboard stats:', error)
    return {
      messagesThisWeek: 0,
      avgResponseTime: '< 1 min',
      totalConversations: 0,
    }
  }
}

// Get integration/connection status
export interface IntegrationStatus {
  facebook: {
    connected: boolean
    pageName?: string
    pageId?: string
  }
  instagram: {
    connected: boolean
    handle?: string
    accountId?: string
  }
  tiktok: {
    connected: boolean
    handle?: string
    accountId?: string
  }
}

const DASHBOARD_API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function getIntegrationStatus(locationId: string, apiKey: string): Promise<IntegrationStatus> {
  let fbConnected = false
  let igConnected = false
  let tiktokConnected = false
  let fbPageName: string | undefined
  let igHandle: string | undefined
  let newConnectionsDetected = false

  // Step 1: Check our stored connection state first
  // Once detected, connections stay "connected" permanently
  try {
    const storedRes = await fetch(`${DASHBOARD_API_URL}/connections/${locationId}`, {
      cache: 'no-store',
    })
    if (storedRes.ok) {
      const stored = await storedRes.json()
      if (stored.facebook?.connected) {
        fbConnected = true
        fbPageName = stored.facebook.pageName || 'Connected'
      }
      if (stored.instagram?.connected) {
        igConnected = true
        igHandle = stored.instagram.handle || 'Connected'
      }
      if (stored.tiktok?.connected) {
        tiktokConnected = true
      }
    }
  } catch (e) {
    console.log('Could not fetch stored connection state')
  }

  // Step 2: If not all connected, check GHL for new conversations
  if (!fbConnected || !igConnected || !tiktokConnected) {
    try {
      const response = await fetch(
        `${GHL_API_BASE}/conversations/search?locationId=${locationId}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': GHL_API_VERSION,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const conversations = data.conversations || []
        
        // Check for Facebook conversations - check BOTH type and lastMessageType
        if (!fbConnected) {
          const fbConvo = conversations.find((c: any) => {
            const typeField = (c.type || '').toUpperCase()
            const msgTypeField = (c.lastMessageType || '').toUpperCase()
            const isFB = (t: string) => t.includes('FACEBOOK') || t === 'FB' || t === 'TYPE_FACEBOOK'
            return isFB(typeField) || isFB(msgTypeField)
          })
          if (fbConvo) {
            fbConnected = true
            fbPageName = 'Connected'
            newConnectionsDetected = true
          }
        }
        
        // Check for Instagram conversations - check BOTH type and lastMessageType
        if (!igConnected) {
          const igConvo = conversations.find((c: any) => {
            const typeField = (c.type || '').toUpperCase()
            const msgTypeField = (c.lastMessageType || '').toUpperCase()
            const isIG = (t: string) => t.includes('INSTAGRAM') || t === 'IG' || t === 'TYPE_INSTAGRAM'
            return isIG(typeField) || isIG(msgTypeField)
          })
          if (igConvo) {
            igConnected = true
            igHandle = 'Connected'
            newConnectionsDetected = true
          }
        }

        // Check for TikTok conversations
        if (!tiktokConnected) {
          const tiktokConvo = conversations.find((c: any) => {
            const typeField = (c.type || '').toUpperCase()
            const msgTypeField = (c.lastMessageType || '').toUpperCase()
            const isTT = (t: string) => t.includes('TIKTOK')
            return isTT(typeField) || isTT(msgTypeField)
          })
          if (tiktokConvo) {
            tiktokConnected = true
            newConnectionsDetected = true
          }
        }
      }
    } catch (e) {
      console.error('Failed to check conversations:', e)
    }
  }

  // Step 3: If we detected new connections, save them permanently
  if (newConnectionsDetected) {
    try {
      await fetch(`${DASHBOARD_API_URL}/connections/${locationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebook: { connected: fbConnected, pageName: fbPageName },
          instagram: { connected: igConnected, handle: igHandle },
          tiktok: { connected: tiktokConnected },
        }),
      })
      console.log('Saved new connection state')
    } catch (e) {
      console.error('Failed to save connection state:', e)
    }
  }

  return {
    facebook: {
      connected: fbConnected,
      pageName: fbConnected ? fbPageName : undefined,
    },
    instagram: {
      connected: igConnected,
      handle: igConnected ? igHandle : undefined,
    },
    tiktok: {
      connected: tiktokConnected,
    },
  }
}

// Helper to format relative time
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}
