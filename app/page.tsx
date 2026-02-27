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
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <a href="https://getapexautomation.com" className="inline-block mb-4">
          <span className="text-white text-2xl font-extrabold">
            ⚡ Apex<span style={{ color: 'rgba(255,255,255,0.9)' }}>Automation</span>
          </span>
        </a>
        <p className="text-white/80">Client Dashboard</p>
      </div>

      {/* Card - matches website style */}
      <div 
        className="w-full max-w-md bg-white rounded-2xl p-8"
        style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}
      >
        {step === 'email' ? (
          <>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
              Welcome back
            </h2>
            <p className="mb-6" style={{ color: '#64748b' }}>
              Enter your email and we'll send you a login code.
            </p>

            <form onSubmit={handleEmailSubmit}>
              <div className="mb-5">
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#0f172a' }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all"
                  style={{ 
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1'
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  placeholder="you@business.com"
                  required
                />
              </div>

              {error && (
                <div 
                  className="mb-5 p-4 rounded-xl text-sm"
                  style={{ 
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626'
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-4 rounded-xl text-white font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: '#6366f1',
                }}
                onMouseOver={(e) => {
                  if (!loading && email) {
                    e.currentTarget.style.background = '#4f46e5'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#6366f1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {loading ? 'Sending...' : 'Send Login Code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                style={{ background: '#e0e7ff' }}
              >
                <svg className="w-8 h-8" style={{ color: '#6366f1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#0f172a' }}>
                Check your email
              </h2>
              <p style={{ color: '#64748b' }}>
                We sent a 6-digit code to<br />
                <span className="font-semibold" style={{ color: '#0f172a' }}>{email}</span>
              </p>
            </div>

            <form onSubmit={handleCodeSubmit}>
              <div className="mb-5">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 rounded-xl text-center text-2xl font-mono outline-none transition-all"
                  style={{ 
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    letterSpacing: '0.3em'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1'
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div 
                  className="mb-5 p-4 rounded-xl text-sm"
                  style={{ 
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626'
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-4 rounded-xl text-white font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                style={{ background: '#6366f1' }}
                onMouseOver={(e) => {
                  if (!loading && code.length === 6) {
                    e.currentTarget.style.background = '#4f46e5'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#6366f1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); setCode(''); }}
                className="w-full font-medium text-sm py-2 transition-colors"
                style={{ color: '#6366f1' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#4f46e5'}
                onMouseOut={(e) => e.currentTarget.style.color = '#6366f1'}
              >
                ← Use a different email
              </button>
            </form>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-sm mt-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
        Need help?{' '}
        <a 
          href="mailto:shane@getapexautomation.com" 
          className="underline transition-colors"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          Contact support
        </a>
      </p>
    </div>
  )
}
