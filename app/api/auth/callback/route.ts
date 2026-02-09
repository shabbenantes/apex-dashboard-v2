import { NextResponse } from 'next/server'

// This route handles magic link clicks from emails
// Simply redirects to the client-side callback page which handles localStorage auth

export const dynamic = 'force-dynamic'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://apex-dashboard-lt3v.onrender.com'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${DASHBOARD_URL}/login?error=no_token`)
  }

  // Redirect to client-side callback page with token
  // The client page will verify the token and store session in localStorage
  return NextResponse.redirect(`${DASHBOARD_URL}/auth/callback?token=${token}`)
}
