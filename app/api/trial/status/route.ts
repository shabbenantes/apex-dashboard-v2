import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.APEX_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${API_BASE}/trial/status/${encodeURIComponent(email)}`, {
      cache: 'no-store',
    })
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch trial status:', error)
    return NextResponse.json({ 
      trialStarted: false,
      message: 'Connect your accounts to start your free trial'
    })
  }
}
