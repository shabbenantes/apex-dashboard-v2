import { NextResponse } from 'next/server'

const API_URL = 'https://apex-dashboard-api-5r3u.onrender.com'

// Store codes in memory (in production, use Redis or DB)
const codes: Map<string, { code: string; expires: number }> = new Map()

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if customer exists
    const customerRes = await fetch(`${API_URL}/customers/${encodeURIComponent(email)}`)
    
    if (!customerRes.ok) {
      return NextResponse.json({ 
        error: 'Email not found. Are you an Apex customer?' 
      }, { status: 404 })
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store code (expires in 10 minutes)
    codes.set(email.toLowerCase(), {
      code,
      expires: Date.now() + 10 * 60 * 1000
    })

    // In production, send email here. For testing, we'll log it.
    console.log(`Login code for ${email}: ${code}`)

    // Try to send via n8n webhook (if configured)
    try {
      await fetch('https://getapexautomation.app.n8n.cloud/webhook/send-login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
    } catch {
      // Email sending failed, but code is stored
    }

    return NextResponse.json({ success: true, message: 'Code sent' })
  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// Export codes map for verify route
export { codes }
