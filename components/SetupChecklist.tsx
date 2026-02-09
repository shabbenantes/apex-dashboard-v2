'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'
import ConnectFacebookModal from './ConnectFacebookModal'

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
}

interface SetupChecklistProps {
  onComplete?: () => void
}

export default function SetupChecklist({ onComplete }: SetupChecklistProps) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFacebookModal, setShowFacebookModal] = useState(false)
  const [showInstagramModal, setShowInstagramModal] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)

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

  const verifyConnection = async (type: 'facebook' | 'instagram') => {
    setVerifying(type)
    const token = ApexSession.getToken()
    
    try {
      const res = await fetch(`/api/onboarding/verify-${type}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      
      if (res.ok) {
        await fetchStatus()
      }
    } catch (err) {
      console.error(`Failed to verify ${type}:`, err)
    } finally {
      setVerifying(null)
      setShowFacebookModal(false)
      setShowInstagramModal(false)
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

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!status) return null

  // Check if all steps complete
  const allComplete = status.steps.facebookConnected && 
                      status.steps.instagramConnected && 
                      status.steps.settingsReviewed

  if (status.completedAt || allComplete) {
    return null // Hide checklist when complete
  }

  const steps = [
    {
      id: 'facebook',
      label: 'Connect Facebook Messenger',
      description: 'Receive and respond to Facebook messages',
      completed: status.steps.facebookConnected,
      action: () => setShowFacebookModal(true),
      icon: '📘',
    },
    {
      id: 'instagram',
      label: 'Connect Instagram DMs',
      description: 'Receive and respond to Instagram messages',
      completed: status.steps.instagramConnected,
      action: () => setShowInstagramModal(true),
      icon: '📸',
    },
    {
      id: 'settings',
      label: 'Review AI Settings',
      description: 'Configure your AI assistant\'s behavior',
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

      {/* Facebook Modal */}
      {showFacebookModal && (
        <ConnectFacebookModal
          platform="facebook"
          portalUrl={status.ghlPortalUrl}
          onClose={() => setShowFacebookModal(false)}
          onVerify={() => verifyConnection('facebook')}
          verifying={verifying === 'facebook'}
        />
      )}

      {/* Instagram Modal */}
      {showInstagramModal && (
        <ConnectFacebookModal
          platform="instagram"
          portalUrl={status.ghlPortalUrl}
          onClose={() => setShowInstagramModal(false)}
          onVerify={() => verifyConnection('instagram')}
          verifying={verifying === 'instagram'}
        />
      )}
    </>
  )
}
