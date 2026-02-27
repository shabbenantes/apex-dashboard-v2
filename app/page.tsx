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

      if (res.ok) {
        setStep('code')
      } else {
        setError(data.error || 'Something went wrong')
      }
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
        localStorage.setItem('apex_user', JSON.stringify({
          email: data.email,
          businessName: data.businessName
        }))
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
            <span className="text-3xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Apex <span className="text-indigo-600">Automation</span>
          </h1>
          <p className="text-gray-500 mt-2">Your AI messaging dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          {step === 'email' ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a login code.</p>

              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="you@yourbusiness.com"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
                >
                  {loading ? 'Sending...' : 'Send Login Code'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-full mb-4">
                  <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Check your email</h2>
                <p className="text-gray-500 text-sm">
                  We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              <form onSubmit={handleCodeSubmit}>
                <div className="mb-4">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-center text-2xl tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 mb-4"
                >
                  {loading ? 'Verifying...' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setCode(''); }}
                  className="w-full text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Use a different email
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Need help? <a href="mailto:shane@getapexautomation.com" className="text-indigo-600 hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  )
}
