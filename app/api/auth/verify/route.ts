import { NextResponse } from 'next/server'

const API_URL = 'https://apex-dashboard-api-5r3u.onrender.com'

// For testing: allow a bypass code
const TEST_CODE = '123456'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    // Check if customer exists
    const customerRes = await fetch(`${API_URL}/customers/${encodeURIComponent(email)}`)
    
    if (!customerRes.ok) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    const customer = await customerRes.json()

    // For testing: accept the test code
    // In production: verify against stored/emailed code
    if (code !== TEST_CODE) {
      // Try to verify with the API
      try {
        const verifyRes = await fetch(`${API_URL}/codes/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        })
        
        if (!verifyRes.ok) {
          return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
        }
      } catch {
        // If API verify fails and not test code, reject
        return NextResponse.json({ error: 'Invalid code. For testing, use 123456' }, { status: 401 })
      }
    }

    // Create session token
    const tokenRes = await fetch(`${API_URL}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customer.email,
        locationId: customer.ghlLocationId || customer.locationId || 'demo',
        apiKey: customer.ghlApiKey || customer.apiKey || '',
        businessName: customer.businessName || 'Your Business',
      })
    })

    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    const { token: sessionToken } = await tokenRes.json()

    return NextResponse.json({
      success: true,
      token: sessionToken,
      email: customer.email,
      businessName: customer.businessName || 'Your Business'
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
