import { NextResponse } from 'next/server'
import { verifyCode } from '@/lib/login-codes'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function POST(request: Request) {
  try {
    const { email, code, referralCode } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    // Verify the code and get the magic link token
    const token = verifyCode(email, code)
    
    if (!token) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    // Exchange the token for a session (same as /api/auth/verify)
    const apiResponse = await fetch(`${API_URL}/tokens/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok || data.error) {
      return NextResponse.json({ 
        error: data.error || 'Invalid or expired code' 
      }, { status: 401 })
    }

    // Apply referral code if provided (best effort - don't fail login if this fails)
    if (referralCode) {
      try {
        await fetch(`${API_URL}/referrals/use`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: referralCode,
            newCustomerEmail: data.email,
            newCustomerName: data.businessName
          }),
        })
        console.log(`Applied referral code ${referralCode} for ${data.email}`)
      } catch (refErr) {
        // Don't fail login if referral application fails
        console.error('Failed to apply referral code:', refErr)
      }
    }

    // Return session data
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    return NextResponse.json({ 
      success: true,
      sessionId: data.sessionId,
      email: data.email,
      locationId: data.locationId,
      businessName: data.businessName,
      apiKey: data.apiKey,
      expiresAt
    })
  } catch (error) {
    console.error('Code verification error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
