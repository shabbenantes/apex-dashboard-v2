'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApexSession } from '@/lib/session'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Always request a code
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sendCode: true }),
      })

      const data = await res.json()

      if (res.ok) {
        setSent(true)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Failed to send login code')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await res.json()

      if (res.ok && data.sessionId) {
        // Save session
        ApexSession.save({
          token: data.sessionId,
          email: data.email,
          locationId: data.locationId,
          businessName: data.businessName,
          apiKey: data.apiKey,
          expiresAt: data.expiresAt
        })
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid code')
      }
    } catch {
      setError('Failed to verify code')
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
            Apex<span className="text-apex-orange">Automation</span>
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
                  'Send Login Code'
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              We'll send you a 6-digit code to sign in — no password needed.
            </p>
          </div>
        ) : (
          <div className="card animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-apex-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-apex-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Check your email</h2>
              <p className="text-gray-400">
                We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="mb-6">
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                Enter your login code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
                required
              />
              
              {error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="btn-primary w-full mt-4"
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => { setSent(false); setError(''); setCode(''); }}
              className="text-apex-orange hover:text-apex-orange-hover text-sm w-full text-center"
            >
              Use a different email
            </button>
          </div>
        )}

        <p className="text-center text-gray-600 text-sm mt-8">
          Need help? <a href="mailto:support@getapexautomation.com" className="text-apex-orange hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  )
}
