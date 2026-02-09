import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

// Logout is handled client-side (clearing localStorage)
// This endpoint can optionally invalidate the session on the server

export async function POST(request: Request) {
  // Optionally get session ID from Authorization header to invalidate on server
  const authHeader = request.headers.get('Authorization')
  const sessionId = authHeader?.replace('Bearer ', '')
  
  if (sessionId) {
    try {
      await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
      })
    } catch (e) {
      // Ignore errors
    }
  }
  
  return NextResponse.json({ success: true })
}

export async function GET() {
  // Redirect to login for GET requests (backwards compatibility)
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://apex-dashboard-lt3v.onrender.com'
  return NextResponse.redirect(new URL('/login', dashboardUrl))
}
