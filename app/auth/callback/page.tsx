'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ApexSession } from '@/lib/session'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setError('No login token found')
      return
    }

    verifyToken(token)
  }, [searchParams])

  async function verifyToken(token: string) {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await res.json()

      if (data.error) {
        setStatus('error')
        setError(data.error)
        return
      }

      // Save session to localStorage
      ApexSession.save({
        token: data.sessionId,
        email: data.email,
        locationId: data.locationId,
        businessName: data.businessName,
        apiKey: data.apiKey,
        expiresAt: data.expiresAt
      })

      setStatus('success')
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (err) {
      setStatus('error')
      setError('Failed to verify login link')
    }
  }

  return (
    <div className="text-center">
      {status === 'verifying' && (
        <>
          <div className="w-10 h-10 border-3 border-apex-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Signing you in...</p>
        </>
      )}
      
      {status === 'success' && (
        <>
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white text-lg">Success! Redirecting...</p>
        </>
      )}
      
      {status === 'error' && (
        <>
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-white text-lg mb-2">Login Failed</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <a 
            href="/login" 
            className="text-apex-orange hover:underline"
          >
            Try again
          </a>
        </>
      )}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="text-center">
      <div className="w-10 h-10 border-3 border-apex-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-apex-dark">
      <Suspense fallback={<LoadingSpinner />}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  )
}
