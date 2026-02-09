import { cookies } from 'next/headers'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export interface Session {
  valid: boolean
  email: string
  locationId: string
  apiKey: string
  businessName: string
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('apex_session')?.value

  if (!sessionId) {
    return null
  }

  try {
    const response = await fetch(`${API_URL}/sessions/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
      // Cache for 1 minute to reduce API calls
      next: { revalidate: 60 }
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }
  return session
}
