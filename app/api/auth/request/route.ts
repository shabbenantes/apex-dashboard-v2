import { NextResponse } from 'next/server'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Step 1: Look up customer in API
    const customerRes = await fetch(`${API_URL}/customers/${encodeURIComponent(email)}`)
    
    if (!customerRes.ok) {
      return NextResponse.json({ 
        error: 'Email not found. Are you an Apex customer?' 
      }, { status: 404 })
    }

    const customer = await customerRes.json()

    // Step 2: Create magic link token
    const tokenRes = await fetch(`${API_URL}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customer.email,
        locationId: customer.locationId,
        apiKey: customer.apiKey || '',
        businessName: customer.businessName || 'Your Business',
      }),
    })

    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'Failed to create login link' }, { status: 500 })
    }

    const { token } = await tokenRes.json()

    // Step 3: For now, return the magic link directly (we'll add email later)
    // In production, this would send an email via Zoho/n8n
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://apex-dashboard-lt3v.onrender.com'
    const magicLink = `${dashboardUrl}/auth/verify?token=${token}`

    // TODO: Send email via Zoho
    // For testing, we'll return the link in the response (remove in production)
    console.log('Magic link:', magicLink)

    return NextResponse.json({ 
      success: true,
      // TEMP: Return link for testing (remove in production)
      _debug_link: magicLink
    })
  } catch (error) {
    console.error('Auth request error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
