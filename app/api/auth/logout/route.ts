import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function GET() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('apex_session')?.value
  
  // Delete session from API
  if (sessionId) {
    try {
      await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
      })
    } catch (e) {
      // Ignore errors, just clear cookies
    }
  }
  
  // Clear cookies
  cookieStore.delete('apex_session')
  cookieStore.delete('apex_business')
  
  // Redirect to login
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://apex-dashboard-lt3v.onrender.com'
  return NextResponse.redirect(new URL('/login', dashboardUrl))
}
