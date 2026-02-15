'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

interface TrialStatus {
  trialStarted: boolean
  trialStartedAt?: number
  trialEndsAt?: number
  daysLeft?: number
  expired?: boolean
  hasPaid?: boolean
}

export default function TrialBanner() {
  const [trial, setTrial] = useState<TrialStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    async function fetchTrialStatus() {
      const session = ApexSession.get()
      if (!session?.email) return

      try {
        const res = await fetch(`/api/trial/status?email=${encodeURIComponent(session.email)}`)
        if (res.ok) {
          const data = await res.json()
          setTrial(data)
          
          // Show modal for urgent cases (3 days or less, or expired)
          if (data.trialStarted && !data.hasPaid) {
            if (data.expired || (data.daysLeft !== undefined && data.daysLeft <= 3)) {
              const lastModalShown = localStorage.getItem('apex_trial_modal_shown')
              const today = new Date().toDateString()
              if (lastModalShown !== today) {
                setShowModal(true)
                localStorage.setItem('apex_trial_modal_shown', today)
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch trial status:', err)
      }
    }

    fetchTrialStatus()
  }, [])

  if (!trial || !trial.trialStarted || trial.hasPaid || dismissed) return null

  const { daysLeft, expired } = trial

  // Determine banner style based on urgency
  let bannerStyle = 'bg-green-50 border-green-200 text-green-800' // Healthy
  let icon = '✨'
  let message = `Free trial: ${daysLeft} days left`
  let showUpgradeButton = false

  if (expired) {
    bannerStyle = 'bg-red-50 border-red-200 text-red-800'
    icon = '⏰'
    message = 'Your free trial has ended'
    showUpgradeButton = true
  } else if (daysLeft !== undefined && daysLeft <= 1) {
    bannerStyle = 'bg-red-50 border-red-200 text-red-800'
    icon = '🚨'
    message = 'Trial ends tomorrow!'
    showUpgradeButton = true
  } else if (daysLeft !== undefined && daysLeft <= 3) {
    bannerStyle = 'bg-orange-50 border-orange-200 text-orange-800'
    icon = '⚠️'
    message = `Only ${daysLeft} days left in your trial`
    showUpgradeButton = true
  } else if (daysLeft !== undefined && daysLeft <= 7) {
    bannerStyle = 'bg-yellow-50 border-yellow-200 text-yellow-800'
    icon = '📅'
    message = `${daysLeft} days left in your free trial`
    showUpgradeButton = true
  }

  const handleUpgrade = () => {
    window.location.href = 'https://buy.stripe.com/5kQ7sN1JI75Ieeyf7Gf7i0m'
  }

  return (
    <>
      {/* Banner */}
      <div className={`mb-6 p-4 rounded-xl border ${bannerStyle} flex items-center justify-between flex-wrap gap-3`}>
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-medium">{message}</span>
        </div>
        <div className="flex items-center gap-3">
          {showUpgradeButton && (
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Add Payment Method →
            </button>
          )}
          {!expired && (
            <button
              onClick={() => setDismissed(true)}
              className="text-current opacity-50 hover:opacity-100 text-lg"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Urgent Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="text-5xl mb-4">
                {expired ? '⏰' : '⚡'}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {expired ? 'Your Trial Has Ended' : 'Your Trial is Ending Soon'}
              </h2>
              <p className="text-slate-600 mb-6">
                {expired 
                  ? 'Add a payment method to continue using Apex and keep your AI responding to customers.'
                  : `You have ${daysLeft} day${daysLeft === 1 ? '' : 's'} left. Add a payment method now to avoid any interruption.`
                }
              </p>

              {/* Value reminder */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-slate-900 mb-2">With Apex, you get:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>✓ 24/7 instant AI responses</li>
                  <li>✓ Never miss a lead again</li>
                  <li>✓ More bookings while you sleep</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleUpgrade}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all"
                >
                  Continue for $97/month →
                </button>
                {!expired && (
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Remind me later
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-4">
                Cancel anytime. No commitment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expired Paywall - blocks entire screen */}
      {expired && (
        <div className="fixed inset-0 bg-white z-40 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Trial Ended</h1>
            <p className="text-slate-600 mb-8">
              Your 30-day free trial has ended. Add a payment method to continue using Apex and keep your AI assistant active.
            </p>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <div className="text-4xl font-bold text-slate-900 mb-1">$97<span className="text-lg font-normal text-slate-500">/month</span></div>
              <p className="text-slate-500 text-sm">Cancel anytime</p>
            </div>

            <button
              onClick={handleUpgrade}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-lg transition-all mb-4"
            >
              Add Payment Method →
            </button>

            <a 
              href="mailto:support@getapexautomation.com"
              className="text-slate-500 hover:text-slate-700 text-sm"
            >
              Need help? Contact support
            </a>
          </div>
        </div>
      )}
    </>
  )
}
