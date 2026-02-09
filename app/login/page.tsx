'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setSent(true)
        // TEMP: For testing, show the magic link if returned
        if (data._debug_link) {
          console.log('Magic link:', data._debug_link)
          // Auto-redirect for testing
          window.location.href = data._debug_link
        }
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold">
            Apex<span className="text-apex-purple">Dashboard</span>
          </h1>
          <p className="text-gray-400 mt-2">Manage your AI messaging assistant</p>
        </div>

        {!sent ? (
          <div className="card animate-fade-in delay-1">
            <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@yourbusiness.com"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Magic Link'
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              We'll send you a link to sign in — no password needed.
            </p>
          </div>
        ) : (
          <div className="card text-center animate-fade-in">
            <div className="w-16 h-16 bg-apex-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-apex-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Check your email</h2>
            <p className="text-gray-400 mb-4">
              We sent a magic link to <span className="text-white font-medium">{email}</span>
            </p>
            <p className="text-gray-500 text-sm">
              Click the link in the email to sign in.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-apex-purple hover:text-apex-purple-light mt-4 text-sm"
            >
              Use a different email
            </button>
          </div>
        )}

        <p className="text-center text-gray-600 text-sm mt-8">
          Need help? <a href="mailto:support@getapexautomation.com" className="text-apex-purple hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  )
}
