'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  email: string
  businessName: string
  locationId?: string
}

interface ConnectionStatus {
  facebook: boolean
  instagram: boolean
  pageName?: string
  igUsername?: string
}

// Decode JWT payload without verification (API validates on use)
function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

// Setup/Onboarding Screen - Modern design matching website
function SetupScreen({ user, onRefresh }: { user: User; onRefresh: () => void }) {
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const ghlLoginUrl = 'https://app.getapexautomation.com/login'
  const ghlConnectUrl = user.locationId 
    ? `https://app.getapexautomation.com/v2/location/${user.locationId}/integration/facebook-instagram`
    : null

  const copyPassword = () => {
    navigator.clipboard.writeText('ApexStart2026!')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9IiNlMGU3ZmYiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-40 pointer-events-none" />
      
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-xl">⚡</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Apex</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-700">AI Ready</span>
          </div>
        </div>
      </header>

      <main className="relative max-w-lg mx-auto px-4 py-12">
        {/* Welcome Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 border border-indigo-200 rounded-full text-indigo-700 text-sm font-medium mb-6">
            <span>🎉</span> Almost there!
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Welcome, {user.businessName?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-lg text-gray-500">
            Quick setup — your AI starts working in minutes
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-indigo-600 scale-100' : 'bg-gray-300 scale-75'}`} />
          <div className={`w-12 h-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-indigo-600 scale-100' : 'bg-gray-300 scale-75'}`} />
        </div>

        {/* Step 1 Card */}
        <div className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 mb-4 ${
          step === 1 
            ? 'shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20' 
            : step > 1 
              ? 'shadow-md opacity-60' 
              : 'shadow-md'
        }`}>
          {/* Step header */}
          <div className={`px-6 py-4 border-b transition-colors duration-300 ${
            step === 1 ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100' : 'bg-gray-50 border-gray-100'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                step > 1 
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                  : step === 1 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Log into your dashboard</h3>
                <p className="text-sm text-gray-500">Takes 30 seconds</p>
              </div>
            </div>
          </div>
          
          {step === 1 && (
            <div className="p-6">
              <p className="text-gray-600 mb-5">
                Use these credentials to access your AI dashboard:
              </p>
              
              {/* Credentials card */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-5 mb-5 border border-gray-200/50">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">{user.email}</code>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono font-medium text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">ApexStart2026!</code>
                      <button 
                        onClick={copyPassword}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          copied 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {copied ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <a
                href={ghlLoginUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setStep(2)}
                className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-semibold rounded-xl transition-all duration-500 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                <span>Open Login Page</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              
              <p className="text-center text-sm text-gray-400 mt-4">
                Opens in a new tab — come back here after logging in
              </p>
            </div>
          )}
          
          {step > 1 && (
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Logged in
              </span>
              <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-600">
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Step 2 Card */}
        <div className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
          step === 2 
            ? 'shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/20' 
            : 'shadow-md opacity-60'
        }`}>
          <div className={`px-6 py-4 border-b transition-colors duration-300 ${
            step === 2 ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100' : 'bg-gray-50 border-gray-100'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                step === 2 
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connect Facebook & Instagram</h3>
                <p className="text-sm text-gray-500">One-click authorization</p>
              </div>
            </div>
          </div>
          
          {step === 2 && ghlConnectUrl ? (
            <div className="p-6">
              <p className="text-gray-600 mb-5">
                Perfect! Now let's give your AI access to respond to DMs:
              </p>
              
              {/* Social icons preview */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="text-2xl text-gray-300">+</div>
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </div>
              
              <a
                href={ghlConnectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5"
              >
                <span>Connect Your Accounts</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              
              <p className="text-center text-sm text-gray-400 mt-4">
                You'll authorize through Facebook — quick and secure
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-center gap-3 py-4 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium">Complete step 1 to unlock</span>
              </div>
            </div>
          )}
        </div>

        {/* What happens next */}
        <div className="mt-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-lg">🚀</span> After you connect
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">AI responds to DMs instantly — 24/7</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Never miss a lead again</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Automatic booking link delivery</span>
            </div>
          </div>
        </div>

        {/* Already connected? */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Already connected your accounts?</p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1 text-indigo-600 font-medium text-sm hover:text-indigo-700 transition-colors"
          >
            Check connection status
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Questions?{' '}
            <a href="mailto:support@getapexautomation.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
              We're here to help →
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

// Main Dashboard for connected users
function MainDashboard({ user, connection, onLogout }: { user: User; connection: ConnectionStatus; onLogout: () => void }) {
  const [aiActive, setAiActive] = useState(true)
  const firstName = user.businessName?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <span className="font-bold text-gray-900">Apex</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-700">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Hey, {firstName}! 👋</h1>
          <p className="text-gray-500">Here's how your AI assistant is performing.</p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Connected Accounts</h3>
            {user.locationId && (
              <a
                href={`https://app.getapexautomation.com/v2/location/${user.locationId}/integration/facebook-instagram`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Manage →
              </a>
            )}
          </div>
          <div className="flex gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${connection.facebook ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium">
                {connection.facebook ? (connection.pageName || 'Connected') : 'Not connected'}
              </span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${connection.instagram ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-sm font-medium">
                {connection.instagram ? (connection.igUsername ? `@${connection.igUsername}` : 'Connected') : 'Not connected'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Status */}
        <div className={`rounded-2xl p-6 mb-6 ${
          aiActive 
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200' 
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                aiActive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                {aiActive ? '⚡' : '⏸️'}
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900">
                  {aiActive ? 'AI is Active' : 'AI is Paused'}
                </h2>
                <p className="text-sm text-gray-600">
                  {aiActive ? 'Responding to messages 24/7' : 'Messages won\'t get automatic replies'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAiActive(!aiActive)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                aiActive 
                  ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
              }`}
            >
              {aiActive ? 'Pause AI' : 'Resume AI'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">--</p>
            <p className="text-xs text-gray-500 font-medium">Messages this week</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-emerald-600 mb-1">&lt; 1 min</p>
            <p className="text-xs text-gray-500 font-medium">Avg response</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">--</p>
            <p className="text-xs text-gray-500 font-medium">Conversations</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/dashboard/conversations"
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                💬
              </div>
              <div>
                <p className="font-semibold text-gray-900">Conversations</p>
                <p className="text-sm text-gray-500">View all chats</p>
              </div>
            </div>
          </Link>
          <Link
            href="/dashboard/settings"
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-gray-500/20 group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <div>
                <p className="font-semibold text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">Configure your AI</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [connection, setConnection] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const checkConnection = async (locationId: string, token: string) => {
    try {
      const res = await fetch(
        `https://apex-dashboard-api-5r3u.onrender.com/ghl/connection-status/${locationId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        setConnection(data)
      } else {
        // Default to not connected if we can't check
        setConnection({ facebook: false, instagram: false })
      }
    } catch {
      setConnection({ facebook: false, instagram: false })
    }
  }

  useEffect(() => {
    const init = async () => {
      // Check for SSO token in URL (from GHL custom menu link)
      // Read directly from window.location to avoid Next.js hydration issues
      const urlParams = new URLSearchParams(window.location.search)
      const ssoToken = urlParams.get('token')
      
      if (ssoToken) {
        const payload = decodeJWT(ssoToken)
        if (payload && payload.email) {
          const userData = {
            email: payload.email,
            businessName: payload.businessName || '',
            locationId: payload.locationId || ''
          }
          
          localStorage.setItem('apex_token', ssoToken)
          localStorage.setItem('apex_user', JSON.stringify(userData))
          
          // Remove token from URL
          const url = new URL(window.location.href)
          url.searchParams.delete('token')
          window.history.replaceState({}, '', url.toString())
          
          setUser(userData)
          if (userData.locationId) {
            await checkConnection(userData.locationId, ssoToken)
          }
          setLoading(false)
          return
        }
      }
      
      // Normal session check
      const token = localStorage.getItem('apex_token')
      const userDataStr = localStorage.getItem('apex_user')
      
      if (!token || !userDataStr) {
        router.push('/')
        return
      }

      const userData = JSON.parse(userDataStr)
      
      // Try to get locationId from token if not in userData
      if (!userData.locationId && token) {
        const payload = decodeJWT(token)
        if (payload?.locationId) {
          userData.locationId = payload.locationId
          localStorage.setItem('apex_user', JSON.stringify(userData))
        }
      }
      
      setUser(userData)
      if (userData.locationId) {
        await checkConnection(userData.locationId, token)
      } else {
        setConnection({ facebook: false, instagram: false })
      }
      setLoading(false)
    }
    
    init()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('apex_token')
    localStorage.removeItem('apex_user')
    router.push('/')
  }

  const handleRefresh = async () => {
    if (user?.locationId) {
      const token = localStorage.getItem('apex_token')
      if (token) {
        setLoading(true)
        await checkConnection(user.locationId, token)
        setLoading(false)
      }
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Show setup screen if not connected
  if (connection && !connection.facebook && !connection.instagram) {
    return <SetupScreen user={user} onRefresh={handleRefresh} />
  }

  // Show main dashboard
  return <MainDashboard user={user} connection={connection || { facebook: false, instagram: false }} onLogout={handleLogout} />
}
