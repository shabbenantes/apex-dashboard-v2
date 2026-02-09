import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const API_URL = process.env.DASHBOARD_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyPage({ searchParams }: Props) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
          <p className="text-gray-400 mb-4">No token provided</p>
          <a href="/login" className="btn-primary inline-block">Try again</a>
        </div>
      </div>
    )
  }

  // Verify token with the API
  let verifyError = ''
  try {
    const response = await fetch(`${API_URL}/tokens/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      verifyError = data.error || 'Invalid or expired link'
    } else {
      // Set cookies on the server side
      const cookieStore = await cookies()
      
      cookieStore.set('apex_session', data.sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })

      cookieStore.set('apex_business', JSON.stringify({
        businessName: data.businessName,
        email: data.email,
      }), {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      // Redirect to dashboard
      redirect('/dashboard')
    }
  } catch (error) {
    console.error('Verify error:', error)
    verifyError = 'Something went wrong'
  }

  // Show error if verification failed
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-4">{verifyError}</p>
        <a href="/login" className="btn-primary inline-block">Try again</a>
      </div>
    </div>
  )
}
