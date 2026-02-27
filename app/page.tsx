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
  const [focused, setFocused] = useState(false)

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
        localStorage.setItem('apex_user', JSON.stringify({ email: data.email, businessName: data.businessName }))
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .page {
          height: 100vh;
          height: 100dvh;
          background: #09090b;
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
        }
        
        html, body {
          overflow: hidden;
          height: 100%;
        }
        
        /* Gradient orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          pointer-events: none;
        }
        .orb-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          top: -200px;
          right: -100px;
          opacity: 0.3;
        }
        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
          bottom: -100px;
          left: -100px;
          opacity: 0.2;
        }
        
        /* Noise texture overlay */
        .noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
        }
        
        /* Grid lines */
        .grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
        }
        
        .container {
          position: relative;
          width: 100%;
          max-width: 420px;
          z-index: 10;
        }
        
        /* Logo */
        .logo {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 16px;
          font-size: 28px;
          margin-bottom: 20px;
          box-shadow: 
            0 0 0 1px rgba(255,255,255,0.1),
            0 20px 40px -10px rgba(99, 102, 241, 0.5);
        }
        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: #fafafa;
          letter-spacing: -0.02em;
        }
        .logo-sub {
          font-size: 14px;
          color: #71717a;
          margin-top: 6px;
        }
        
        /* Card */
        .card {
          background: rgba(24, 24, 27, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 
            0 0 0 1px rgba(255,255,255,0.05) inset,
            0 20px 50px -10px rgba(0,0,0,0.5);
        }
        
        .card-header {
          margin-bottom: 24px;
        }
        .card-header h1 {
          font-size: 22px;
          font-weight: 600;
          color: #fafafa;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .card-header p {
          font-size: 14px;
          color: #71717a;
          line-height: 1.5;
        }
        
        /* Form */
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #a1a1aa;
          margin-bottom: 8px;
        }
        
        .input-wrapper {
          position: relative;
        }
        .input-wrapper.focused::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          opacity: 0.5;
          z-index: -1;
        }
        
        .input {
          width: 100%;
          padding: 14px 16px;
          font-size: 15px;
          font-family: inherit;
          color: #fafafa;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
        }
        .input::placeholder {
          color: #52525b;
        }
        .input:focus {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(0,0,0,0.4);
        }
        
        .input-code {
          text-align: center;
          font-size: 24px;
          font-family: 'SF Mono', 'Fira Code', monospace;
          letter-spacing: 0.5em;
          padding: 16px;
        }
        
        /* Error */
        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        
        /* Button */
        .btn {
          width: 100%;
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          color: white;
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .btn:hover:not(:disabled)::before {
          opacity: 1;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 30px -5px rgba(99, 102, 241, 0.4);
        }
        .btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn span {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-ghost {
          background: transparent;
          color: #71717a;
          padding: 12px;
          margin-top: 12px;
          font-weight: 500;
          font-size: 13px;
        }
        .btn-ghost:hover:not(:disabled) {
          color: #fafafa;
          background: rgba(255,255,255,0.05);
          box-shadow: none;
          transform: none;
        }
        .btn-ghost::before {
          display: none;
        }
        
        /* Success icon */
        .success-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .success-icon svg {
          width: 28px;
          height: 28px;
          color: #4ade80;
        }
        
        /* Footer */
        .footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: #52525b;
        }
        .footer a {
          color: #6366f1;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer a:hover {
          color: #818cf8;
        }
        
        /* Spinner */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
      `}</style>

      <div className="page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="noise" />
        <div className="grid" />
        
        <div className="container">
          <div className="logo">
            <div className="logo-mark">⚡</div>
            <div className="logo-text">Apex Automation</div>
            <div className="logo-sub">Client Dashboard</div>
          </div>

          <div className="card">
            {step === 'email' ? (
              <>
                <div className="card-header">
                  <h1>Welcome back</h1>
                  <p>Enter your email to receive a secure login code</p>
                </div>

                <form onSubmit={handleEmailSubmit}>
                  <div className="form-group">
                    <label>Email address</label>
                    <div className={`input-wrapper ${focused ? 'focused' : ''}`}>
                      <input
                        type="email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                  </div>

                  {error && <div className="error">{error}</div>}

                  <button type="submit" className="btn" disabled={loading || !email}>
                    <span>
                      {loading ? <div className="spinner" /> : 'Continue'}
                    </span>
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="card-header" style={{ textAlign: 'center' }}>
                  <div className="success-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1>Check your email</h1>
                  <p>We sent a 6-digit code to <strong style={{ color: '#fafafa' }}>{email}</strong></p>
                </div>

                <form onSubmit={handleCodeSubmit}>
                  <div className="form-group">
                    <label style={{ textAlign: 'center', display: 'block' }}>Enter verification code</label>
                    <input
                      type="text"
                      className="input input-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="······"
                      maxLength={6}
                      autoFocus
                      required
                    />
                  </div>

                  {error && <div className="error">{error}</div>}

                  <button type="submit" className="btn" disabled={loading || code.length !== 6}>
                    <span>
                      {loading ? <div className="spinner" /> : 'Sign in'}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => { setStep('email'); setError(''); setCode(''); }}
                  >
                    <span>← Use different email</span>
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="footer">
            Need help? <a href="mailto:shane@getapexautomation.com">Contact support</a>
          </div>
        </div>
      </div>
    </>
  )
}
