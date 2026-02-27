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
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
      {/* Top section with branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="text-center text-white mb-8">
          <div className="text-5xl mb-4">⚡</div>
          <h1 className="text-3xl font-bold mb-2">Apex Automation</h1>
          <p className="text-white/80 text-lg">Your AI messaging dashboard</p>
        </div>
      </div>

      {/* Bottom card */}
      <div className="bg-white rounded-t-[2.5rem] px-6 pt-10 pb-12 shadow-2xl" style={{ minHeight: '55vh' }}>
        <div className="max-w-sm mx-auto">
          {step === 'email' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-500 mb-8">Enter your email to sign in to your dashboard.</p>

              <form onSubmit={handleEmailSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-lg"
                    placeholder="you@business.com"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-4 px-6 text-white font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
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
                    'Continue with Email'
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-500">
                  We sent a code to<br />
                  <span className="font-semibold text-gray-900">{email}</span>
                </p>
              </div>

              <form onSubmit={handleCodeSubmit}>
                <div className="mb-6">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 text-center text-3xl tracking-[0.4em] font-mono focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    placeholder="••••••"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-4 px-6 text-white font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg mb-4"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setCode(''); }}
                  className="w-full text-indigo-600 font-semibold py-2"
                >
                  ← Use a different email
                </button>
              </form>
            </>
          )}

          <p className="text-center text-gray-400 text-sm mt-8">
            Need help? <a href="mailto:shane@getapexautomation.com" className="text-indigo-600 font-medium">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  )
}
