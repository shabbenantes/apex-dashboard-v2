import { NextResponse } from 'next/server'
import { sendTrialReminderEmail } from '@/lib/email'

// This endpoint should be called daily by a cron job
// It checks all trial users and sends reminders at appropriate times

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

export async function POST(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'apex-cron-secret-2024'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all trial users from the API
    const res = await fetch(`${API_URL}/trial/all-active`, {
      headers: { 'Authorization': `Bearer ${cronSecret}` }
    })

    if (!res.ok) {
      console.error('Failed to fetch trial users')
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    const { users } = await res.json()
    
    const remindersSent: string[] = []
    const errors: string[] = []

    for (const user of users) {
      const { email, businessName, daysLeft, lastReminderSent } = user
      
      // Determine if we should send a reminder today
      // Send at: 7 days, 3 days, 1 day, 0 days (expired)
      const reminderDays = [7, 3, 1, 0]
      
      if (!reminderDays.includes(daysLeft)) continue
      
      // Check if we already sent a reminder for this milestone
      const reminderKey = `${daysLeft}-days`
      if (lastReminderSent === reminderKey) continue
      
      try {
        await sendTrialReminderEmail(email, businessName || 'your business', daysLeft)
        
        // Update last reminder sent
        await fetch(`${API_URL}/trial/mark-reminder`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cronSecret}`
          },
          body: JSON.stringify({ email, reminderKey })
        })
        
        remindersSent.push(`${email} (${daysLeft} days)`)
      } catch (err) {
        console.error(`Failed to send reminder to ${email}:`, err)
        errors.push(email)
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent,
      errors,
      totalProcessed: users.length
    })

  } catch (error) {
    console.error('Trial reminder cron error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Also allow GET for manual testing
export async function GET(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  
  if (secret !== (process.env.CRON_SECRET || 'apex-cron-secret-2024')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Redirect to POST handler
  return POST(request)
}
