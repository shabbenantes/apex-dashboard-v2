'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Decode JWT payload without verification (API validates on use)
function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [tone, setTone] = useState('friendly')
  const [emojis, setEmojis] = useState('yes')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Check for SSO token in URL (from GHL custom menu link)
    const ssoToken = searchParams.get('token')
    
    if (ssoToken) {
      const payload = decodeJWT(ssoToken)
      if (payload && payload.email) {
        // Save the SSO session
        localStorage.setItem('apex_token', ssoToken)
        localStorage.setItem('apex_user', JSON.stringify({
          email: payload.email,
          businessName: payload.businessName || ''
        }))
        
        // Remove token from URL for cleaner look
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url.toString())
        
        setLoading(false)
        return
      }
    }
    
    const token = localStorage.getItem('apex_token')
    if (!token) {
      router.push('/')
      return
    }
    setLoading(false)
  }, [router, searchParams])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-semibold text-gray-900">AI Settings</h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Tone */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-1">Conversation Tone</h2>
          <p className="text-sm text-gray-500 mb-4">How should your AI sound when responding to customers?</p>
          
          <div className="space-y-2">
            {[
              { value: 'friendly', label: 'Friendly & Casual', example: '"Hey! Thanks for reaching out 😊"' },
              { value: 'professional', label: 'Professional & Warm', example: '"Hello! Thank you for contacting us."' },
              { value: 'luxury', label: 'Upscale & Polished', example: '"Good afternoon. We\'d be delighted to assist."' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  tone === option.value 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  value={option.value}
                  checked={tone === option.value}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500 italic">{option.example}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Emojis */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-1">Use Emojis?</h2>
          <p className="text-sm text-gray-500 mb-4">Should your AI use emojis in responses?</p>
          
          <div className="space-y-2">
            {[
              { value: 'yes', label: 'Yes, use emojis 👍' },
              { value: 'minimal', label: 'Minimal (just occasionally)' },
              { value: 'no', label: 'No emojis' },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  emojis === option.value 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="emojis"
                  value={option.value}
                  checked={emojis === option.value}
                  onChange={(e) => setEmojis(e.target.value)}
                />
                <span className="font-medium text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
            saved 
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </main>
    </div>
  )
}
