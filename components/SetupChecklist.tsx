'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

interface OnboardingStatus {
  completedAt: string | null
  steps: {
    facebookConnected: boolean
    instagramConnected: boolean
    businessHoursSet: boolean
    phoneVerified: boolean
    settingsReviewed: boolean
  }
  ghlPortalUrl?: string
  ghlCredentials?: {
    email: string
    password: string
  }
}

interface SetupChecklistProps {
  onComplete?: () => void
}

export default function SetupChecklist({ onComplete }: SetupChecklistProps) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConnectModal, setShowConnectModal] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    const token = ApexSession.getToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/onboarding/status', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch onboarding status:', err)
    } finally {
      setLoading(false)
    }
  }

  const markSettingsReviewed = async () => {
    const token = ApexSession.getToken()
    try {
      await fetch('/api/onboarding/mark-complete', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ step: 'settingsReviewed' }),
      })
      await fetchStatus()
    } catch (err) {
      console.error('Failed to mark settings reviewed:', err)
    }
  }

  const openGHLPortal = () => {
    if (status?.ghlPortalUrl) {
      window.open(status.ghlPortalUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="card animate-pulse mb-6">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!status) return null

  // Check if accounts are connected (FB or IG counts as "connected")
  const accountsConnected = status.steps.facebookConnected || status.steps.instagramConnected

  // Check if all steps complete
  const allComplete = accountsConnected && status.steps.settingsReviewed

  if (status.completedAt || allComplete) {
    return null // Hide checklist when complete
  }

  const steps = [
    {
      id: 'accounts',
      label: 'Connect Your Accounts',
      description: 'Connect Facebook, Instagram, and TikTok',
      completed: accountsConnected,
      action: () => setShowConnectModal(true),
      icon: '🔗',
    },
    {
      id: 'settings',
      label: 'Configure AI',
      description: 'Review and customize your AI assistant',
      completed: status.steps.settingsReviewed,
      action: () => window.location.href = '/settings',
      actionAfter: markSettingsReviewed,
      icon: '⚙️',
    },
  ]

  const completedCount = steps.filter(s => s.completed).length
  const progressPercent = (completedCount / steps.length) * 100

  return (
    <>
      <div className="card mb-6 animate-fade-in border-apex-purple/30 bg-gradient-to-br from-apex-purple/5 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🚀</span>
          <div>
            <h2 className="font-display text-xl font-semibold">Complete Your Setup</h2>
            <p className="text-gray-400 text-sm">{completedCount} of {steps.length} steps complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-apex-purple to-apex-purple-light h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                step.completed 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-white/5 border border-apex-border hover:border-apex-purple/50 cursor-pointer'
              }`}
              onClick={!step.completed ? step.action : undefined}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                step.completed ? 'bg-green-500/20' : 'bg-apex-purple/20'
              }`}>
                {step.completed ? (
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${step.completed ? 'text-green-400' : 'text-white'}`}>
                  {step.label}
                </h3>
                <p className="text-gray-500 text-sm">{step.description}</p>
              </div>
              {!step.completed && (
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Help link */}
        <div className="mt-6 pt-4 border-t border-apex-border">
          <p className="text-gray-500 text-sm">
            Having trouble?{' '}
            <a href="mailto:support@getapexautomation.com" className="text-apex-purple hover:text-apex-purple-light">
              Contact support
            </a>
          </p>
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-apex-card border border-apex-border rounded-2xl p-6 max-w-md w-full animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-apex-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔗</span>
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Connect Your Accounts</h2>
              <p className="text-gray-400">
                You'll be taken to your account portal where you can connect your Facebook, Instagram, and TikTok accounts.
              </p>
            </div>

            {status?.ghlCredentials && (
              <div className="bg-apex-purple/10 border border-apex-purple/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-300 mb-3">Your portal login:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Email:</span>
                    <span className="text-white font-mono text-sm">{status.ghlCredentials.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Password:</span>
                    <span className="text-white font-mono text-sm">{status.ghlCredentials.password}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => {
                  openGHLPortal()
                  setShowConnectModal(false)
                }}
                className="btn-primary w-full py-3"
              >
                Open Account Portal →
              </button>
              <button
                onClick={() => setShowConnectModal(false)}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-center text-gray-500 text-xs mt-4">
              After connecting, refresh the dashboard to see your status
            </p>
          </div>
        </div>
      )}
    </>
  )
}
