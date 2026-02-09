import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ token?: string }>
}

// This page redirects to the callback API route for proper cookie handling
export default async function VerifyPage({ searchParams }: Props) {
  const params = await searchParams
  const token = params.token

  if (token) {
    // Redirect to API callback which will set cookies properly
    redirect(`/api/auth/callback?token=${token}`)
  }

  // No token - show error
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
