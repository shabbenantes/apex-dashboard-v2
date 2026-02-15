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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚡
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Apex <span className="text-orange-500">Automation</span>
          </h1>
          <p className="text-slate-500 mt-2">Manage your AI messaging assistant</p>
        </div>

        {!sent ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in delay-1">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Sign in to your account</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                  placeholder="you@yourbusiness.com"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

            <p className="text-center text-slate-500 text-sm mt-6">
              We'll send you a 6-digit code to sign in — no password needed.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-500">
                We sent a 6-digit code to <span className="text-slate-900 font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleCodeSubmit} className="mb-6">
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                Enter your login code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
                required
              />
              
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => { setSent(false); setError(''); setCode(''); }}
              className="text-orange-500 hover:text-orange-600 text-sm w-full text-center font-medium"
            >
              Use a different email
            </button>
          </div>
        )}

        <p className="text-center text-slate-400 text-sm mt-8">
          Need help? <a href="mailto:support@getapexautomation.com" className="text-orange-500 hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  )
}
