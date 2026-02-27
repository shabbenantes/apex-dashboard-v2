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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .login-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #ffffff;
          -webkit-font-smoothing: antialiased;
        }
        
        .login-left {
          flex: 1;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .login-left::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        
        .login-left-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 400px;
        }
        
        .login-logo {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .login-left h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        
        .login-left p {
          font-size: 1.1rem;
          opacity: 0.9;
          line-height: 1.6;
        }
        
        .login-features {
          margin-top: 3rem;
          text-align: left;
        }
        
        .login-feature {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        
        .login-feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        
        .login-feature-text h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .login-feature-text p {
          font-size: 0.875rem;
          opacity: 0.8;
        }
        
        .login-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem;
          background: #f8fafc;
        }
        
        .login-form-container {
          width: 100%;
          max-width: 400px;
        }
        
        .login-form-header {
          margin-bottom: 2rem;
        }
        
        .login-form-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        
        .login-form-header p {
          color: #64748b;
          font-size: 1rem;
        }
        
        .login-form {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        
        .form-group input {
          width: 100%;
          padding: 0.875rem 1rem;
          font-size: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .form-group input:focus {
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        
        .form-group input::placeholder {
          color: #94a3b8;
        }
        
        .form-group input.code-input {
          text-align: center;
          font-size: 1.5rem;
          letter-spacing: 0.5em;
          font-family: monospace;
          padding: 1rem;
        }
        
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.875rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        
        .submit-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          background: #6366f1;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #4f46e5;
          transform: translateY(-1px);
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .back-link {
          display: block;
          text-align: center;
          margin-top: 1rem;
          color: #6366f1;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
        }
        
        .back-link:hover {
          color: #4f46e5;
        }
        
        .email-sent-icon {
          width: 64px;
          height: 64px;
          background: #e0e7ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        
        .email-sent-icon svg {
          width: 32px;
          height: 32px;
          color: #6366f1;
        }
        
        .login-footer {
          margin-top: 2rem;
          text-align: center;
          color: #64748b;
          font-size: 0.875rem;
        }
        
        .login-footer a {
          color: #6366f1;
          text-decoration: none;
        }
        
        .login-footer a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 900px) {
          .login-page {
            flex-direction: column;
          }
          .login-left {
            padding: 2rem;
            min-height: auto;
          }
          .login-left h1 {
            font-size: 1.75rem;
          }
          .login-features {
            display: none;
          }
          .login-right {
            padding: 2rem;
          }
        }
      `}</style>

      <div className="login-page">
        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-logo">
              ⚡ Apex Automation
            </div>
            <h1>Your AI messaging dashboard</h1>
            <p>Monitor your AI assistant, view conversations, and manage your settings all in one place.</p>
            
            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">💬</div>
                <div className="login-feature-text">
                  <h3>View Conversations</h3>
                  <p>See every message your AI handles</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">📊</div>
                <div className="login-feature-text">
                  <h3>Track Performance</h3>
                  <p>Response times and message stats</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">⚙️</div>
                <div className="login-feature-text">
                  <h3>Customize Your AI</h3>
                  <p>Adjust tone, responses, and more</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-right">
          <div className="login-form-container">
            {step === 'email' ? (
              <>
                <div className="login-form-header">
                  <h2>Sign in to your dashboard</h2>
                  <p>Enter your email to receive a login code</p>
                </div>

                <div className="login-form">
                  <form onSubmit={handleEmailSubmit}>
                    <div className="form-group">
                      <label>Email address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@business.com"
                        required
                      />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="submit-btn" disabled={loading || !email}>
                      {loading ? 'Sending...' : 'Send Login Code'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <div className="login-form-header" style={{ textAlign: 'center' }}>
                  <div className="email-sent-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2>Check your email</h2>
                  <p>We sent a 6-digit code to <strong>{email}</strong></p>
                </div>

                <div className="login-form">
                  <form onSubmit={handleCodeSubmit}>
                    <div className="form-group">
                      <label>Enter code</label>
                      <input
                        type="text"
                        className="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        autoFocus
                        required
                      />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="submit-btn" disabled={loading || code.length !== 6}>
                      {loading ? 'Verifying...' : 'Sign In'}
                    </button>

                    <button
                      type="button"
                      className="back-link"
                      onClick={() => { setStep('email'); setError(''); setCode(''); }}
                    >
                      ← Use a different email
                    </button>
                  </form>
                </div>
              </>
            )}

            <div className="login-footer">
              Need help? <a href="mailto:shane@getapexautomation.com">Contact support</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
