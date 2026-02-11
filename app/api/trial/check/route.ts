import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.APEX_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

// Check if a social account has already been used for a trial
export async function GET(request: NextRequest) {
  const platform = request.nextUrl.searchParams.get('platform')
  const accountId = request.nextUrl.searchParams.get('accountId')
  
  if (!platform || !accountId) {
    return NextResponse.json({ error: 'platform and accountId required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${API_BASE}/trial/check/${encodeURIComponent(platform)}/${encodeURIComponent(accountId)}`,
      { cache: 'no-store' }
    )
    
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to check trial:', error)
    // Default to available on error (don't block legitimate users)
    return NextResponse.json({ available: true })
  }
}
