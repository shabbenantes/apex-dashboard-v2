import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.APEX_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

// Register a social account to start/validate trial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, accountId, accountName, email, locationId } = body
    
    if (!platform || !accountId) {
      return NextResponse.json({ error: 'platform and accountId required' }, { status: 400 })
    }

    const res = await fetch(`${API_BASE}/trial/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, accountId, accountName, email, locationId }),
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to register trial:', error)
    return NextResponse.json({ error: 'Failed to register trial' }, { status: 500 })
  }
}
