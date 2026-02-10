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
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )

    if (!response.ok) {
      console.error('GHL API error:', response.status)
      return []
    }

    const data = await response.json()
    
    // Filter to only Facebook and Instagram conversations
    const socialTypes = ['TYPE_FACEBOOK', 'TYPE_INSTAGRAM', 'FB', 'IG', 'FACEBOOK', 'INSTAGRAM']
    const socialConversations = (data.conversations || []).filter((c: any) => {
      const messageType = String(c.lastMessageType || '').toUpperCase()
      return socialTypes.some(t => messageType.includes(t))
    })
    
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
}

export async function getIntegrationStatus(locationId: string, apiKey: string): Promise<IntegrationStatus> {
  try {
    // Check for Facebook/Instagram by looking at conversation types
    // If there are FB/IG conversations, the integration is connected
    const response = await fetch(
      `${GHL_API_BASE}/conversations/search?locationId=${locationId}&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': GHL_API_VERSION,
        },
      }
    )

    if (!response.ok) {
      return {
        facebook: { connected: false },
        instagram: { connected: false },
      }
    }

    const data = await response.json()
    const conversations = data.conversations || []
    
    // Check for Facebook conversations
    const fbConvo = conversations.find((c: any) => 
      c.type === 'TYPE_FACEBOOK' || c.type === 'FB'
    )
    
    // Check for Instagram conversations
    const igConvo = conversations.find((c: any) => 
      c.type === 'TYPE_INSTAGRAM' || c.type === 'IG'
    )

    // Also try to get location info which might have FB page details
    let fbPageName = 'Connected'
    let igHandle = 'Connected'
    
    try {
      const locationRes = await fetch(
        `${GHL_API_BASE}/locations/${locationId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': GHL_API_VERSION,
          },
        }
      )
      if (locationRes.ok) {
        const locData = await locationRes.json()
        // Try to extract social info from location data
        if (locData.location?.social?.facebookUrl) {
          const fbUrl = locData.location.social.facebookUrl
          fbPageName = fbUrl.split('/').pop() || 'Connected'
        }
      }
    } catch (e) {
      // Ignore - we'll use defaults
    }

    return {
      facebook: {
        connected: !!fbConvo,
        pageName: fbConvo ? fbPageName : undefined,
      },
      instagram: {
        connected: !!igConvo,
        handle: igConvo ? igHandle : undefined,
      },
    }
  } catch (error) {
    console.error('Failed to get integration status:', error)
    return {
      facebook: { connected: false },
      instagram: { connected: false },
    }
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
