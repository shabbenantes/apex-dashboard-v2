import { NextResponse } from 'next/server'
import { sendMagicLinkEmail, sendLoginCodeEmail } from '@/lib/email'
import { generateCode, storeCode } from '@/lib/login-codes'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function POST(request: Request) {
  try {
    const { email, sendCode } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Step 1: Look up customer in API
    const customerRes = await fetch(`${API_URL}/customers/${encodeURIComponent(email)}`, {
      cache: 'no-store',
    })
    
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
        locationId: customer.ghlLocationId || customer.locationId,
        apiKey: customer.ghlApiKey || customer.apiKey || '',
        businessName: customer.businessName || 'Your Business',
      }),
      cache: 'no-store',
    })

    if (!tokenRes.ok) {
      return NextResponse.json({ error: 'Failed to create login link' }, { status: 500 })
    }

    const { token } = await tokenRes.json()

    // Step 3: Send email (magic link or code)
    try {
      if (sendCode) {
        // Generate and store a 6-digit code
        const code = generateCode()
        storeCode(code, customer.email, token)
        await sendLoginCodeEmail(customer.email, code, customer.businessName || 'Your Business')
      } else {
        // Build magic link
        const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://apex-dashboard-lt3v.onrender.com'
        const magicLink = `${dashboardUrl}/api/auth/callback?token=${token}`
        await sendMagicLinkEmail(customer.email, magicLink, customer.businessName || 'Your Business')
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, method: sendCode ? 'code' : 'link' })
  } catch (error) {
    console.error('Auth request error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
