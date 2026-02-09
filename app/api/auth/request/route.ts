import { NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = process.env.N8N_AUTH_WEBHOOK_URL || 'https://getapexautomation.app.n8n.cloud/webhook/apex-dashboard-auth'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Call n8n webhook to handle the magic link flow
    // n8n will:
    // 1. Look up customer by email in the API
    // 2. Create a token via the API
    // 3. Send magic link email via Zoho
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email,
        dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://apex-dashboard.onrender.com'
      }),
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      return NextResponse.json({ 
        error: data.error || 'Email not found. Are you an Apex customer?' 
      }, { status: response.ok ? 400 : response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth request error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
