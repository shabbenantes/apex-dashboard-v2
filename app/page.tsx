'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) setStep('code')
      else setError(data.error || 'Something went wrong')
    } catch {
      setError('Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('apex_token', data.token)
        localStorage.setItem('apex_user', JSON.stringify({ email: data.email, businessName: data.businessName, locationId: data.locationId || '' }))
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-xl mb-4">
            <span className="text-white text-xl">⚡</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Apex Automation</h1>
          <p className="text-sm text-gray-500 mt-1">Client Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {step === 'email' ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">Welcome back</h2>
                <p className="text-sm text-gray-500 mt-1">Enter your email to receive a login code</p>
              </div>

              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Sending...' : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-gray-900">Check your email</h2>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a code to <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              <form onSubmit={handleCodeSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Verification code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    className="w-full px-3 py-3 border border-gray-200 rounded-lg text-center text-xl font-mono tracking-widest text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Verifying...' : 'Sign in'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setCode(''); }}
                  className="w-full py-2 mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Use different email
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Need help? <a href="mailto:support@getapexautomation.com" className="text-emerald-600 hover:text-emerald-700">Contact support</a>
        </p>
      </div>
    </div>
  )
}
