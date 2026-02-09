// Client-side session management using localStorage
// Mirrors the pattern from the affiliate portal that works on Safari

const SESSION_KEY = 'apex_dashboard_session'

export interface SessionData {
  token: string
  email: string
  locationId: string
  businessName: string
  apiKey: string
  expiresAt: string
}

export const ApexSession = {
  save(data: SessionData) {
    if (typeof window === 'undefined') return
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      ...data,
      savedAt: new Date().toISOString()
    }))
  },

  get(): SessionData | null {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (!stored) return null
      return JSON.parse(stored)
    } catch {
      return null
    }
  },

  getToken(): string | null {
    const session = this.get()
    return session?.token || null
  },

  isValid(): boolean {
    const session = this.get()
    if (!session || !session.token) return false
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      this.clear()
      return false
    }
    return true
  },

  clear() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(SESSION_KEY)
  },

  // For API calls - returns headers with auth token
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    if (!token) return {}
    return { 'Authorization': `Bearer ${token}` }
  }
}

// Helper for making authenticated API calls
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const session = ApexSession.get()
  const headers = new Headers(options.headers)
  
  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`)
  }
  
  return fetch(url, {
    ...options,
    headers,
    cache: 'no-store'
  })
}
