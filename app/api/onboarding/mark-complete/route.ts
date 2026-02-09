import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function POST(request: NextRequest) {
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { step } = await request.json()

    if (!step) {
      return NextResponse.json({ error: 'Step required' }, { status: 400 })
    }

    // Verify token and get customer data
    const verifyRes = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { customer } = await verifyRes.json()

    // Update customer onboarding status
    const onboarding = customer.onboarding || {}
    onboarding[step] = true
    onboarding[`${step}At`] = new Date().toISOString()

    // Check if all steps complete
    const allComplete = 
      onboarding.facebookConnected && 
      onboarding.instagramConnected && 
      onboarding.settingsReviewed

    if (allComplete && !onboarding.completedAt) {
      onboarding.completedAt = new Date().toISOString()
    }

    await fetch(`${API_URL}/customers/${customer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding }),
    })

    return NextResponse.json({ success: true, onboarding })
  } catch (error) {
    console.error('Failed to mark step complete:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
