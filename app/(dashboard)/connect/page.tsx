'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ApexSession } from '@/lib/session'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

interface TrialStatus {
  trialStarted: boolean
  trialStartedAt?: number
  trialEndsAt?: number
  daysLeft?: number
  expired?: boolean
  message?: string
}

interface ChannelConfig {
  name: string
  icon: React.ReactNode
  bgClass: string
  description: string
  connectedText: string
  available: boolean
  comingSoon?: boolean
}

const CHANNELS: Record<string, ChannelConfig> = {
  meta: {
    name: 'Facebook & Instagram',
    icon: (
      <div className="flex -space-x-1">
        <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        <svg className="w-6 h-6 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </div>
    ),
    bgClass: 'bg-gradient-to-br from-blue-500/20 to-pink-500/20',
    description: 'Respond to Facebook Messenger and Instagram DMs automatically',
    connectedText: 'Facebook & Instagram connected',
    available: true,
  },
  tiktok: {
    name: 'TikTok',
    icon: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    bgClass: 'bg-black',
    description: 'Respond to TikTok messages automatically',
    connectedText: 'TikTok connected',
    available: true,
  },
}

type ChannelKey = 'meta' | 'tiktok'

interface IntegrationStatus {
  facebook: { connected: boolean; pageName?: string }
  instagram: { connected: boolean; handle?: string }
  tiktok: { connected: boolean; handle?: string }
  ghlConnectUrl?: string
}

interface OnboardingStatus {
  ghlPortalUrl?: string
  ghlCredentials?: {
    email: string
    password: string
  }
}

export default function ConnectPage() {
  const [status, setStatus] = useState<IntegrationStatus>({
    facebook: { connected: false },
    instagram: { connected: false },
    tiktok: { connected: false },
  })
  const [onboarding, setOnboarding] = useState<OnboardingStatus>({})
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyPlatform, setVerifyPlatform] = useState<'facebook' | 'instagram' | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null)
  const [trialError, setTrialError] = useState<string | null>(null)
  const previousStatus = useRef<IntegrationStatus | null>(null)

  async function fetchTrialStatus() {
    const session = ApexSession.get()
    if (!session?.email) return

    try {
      const res = await fetch(`/api/trial/status?email=${encodeURIComponent(session.email)}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setTrialStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch trial status:', err)
    }
  }

  async function registerTrialAccount(platform: string, accountId: string, accountName: string) {
    const session = ApexSession.get()
    if (!session?.email) return

    try {
      const checkRes = await fetch(`/api/trial/check?platform=${platform}&accountId=${accountId}`)
      const checkData = await checkRes.json()

      if (!checkData.available) {
        setTrialError(checkData.message || 'This account has already been used for a free trial.')
        return false
      }

      const regRes = await fetch('/api/trial/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          accountId,
          accountName,
          email: session.email,
          locationId: session.locationId,
        }),
      })

      if (!regRes.ok) {
        const errData = await regRes.json()
        setTrialError(errData.error || 'Failed to start trial')
        return false
      }

      await fetchTrialStatus()
      return true
    } catch (err) {
      console.error('Failed to register trial:', err)
      return false
    }
  }

  async function verifyConnection(platform: 'facebook' | 'instagram') {
    const session = ApexSession.get()
    if (!session?.locationId || !session?.apiKey) {
      setVerifyResult({ success: false, message: 'Session not found. Please log in again.' })
      return
    }

    setVerifying(true)
    setVerifyResult(null)

    try {
      const res = await fetch(`${API_URL}/verify-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: session.locationId,
          apiKey: session.apiKey,
          platform,
          contactEmail: session.email,
          contactName: session.businessName || 'Apex Customer',
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setVerifyResult({ 
          success: true, 
          message: `🎉 ${platform === 'facebook' ? 'Facebook' : 'Instagram'} is connected! Check your messages.` 
        })
        // Refresh status to show connected
        setTimeout(() => {
          fetchStatus()
        }, 1000)
      } else {
        setVerifyResult({ 
          success: false, 
          message: data.error || 'Verification failed. Make sure you\'ve connected the account in GHL first.' 
        })
      }
    } catch (err) {
      console.error('Verify connection error:', err)
      setVerifyResult({ success: false, message: 'Failed to verify. Please try again.' })
    } finally {
      setVerifying(false)
    }
  }

  async function fetchStatus() {
    try {
      const token = ApexSession.getToken()
      const [intRes, onboardRes] = await Promise.all([
        fetch('/api/integrations', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          cache: 'no-store',
        }),
        fetch('/api/onboarding/status', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          cache: 'no-store',
        })
      ])
      
      if (intRes.ok) {
        const newStatus = await intRes.json()
        
        const prev = previousStatus.current
        if (prev && !trialStatus?.trialStarted) {
          if (!prev.facebook?.connected && newStatus.facebook?.connected && newStatus.facebook?.pageId) {
            await registerTrialAccount('facebook', newStatus.facebook.pageId, newStatus.facebook.pageName || '')
          }
          if (!prev.instagram?.connected && newStatus.instagram?.connected && newStatus.instagram?.accountId) {
            await registerTrialAccount('instagram', newStatus.instagram.accountId, newStatus.instagram.handle || '')
          }
          if (!prev.tiktok?.connected && newStatus.tiktok?.connected && newStatus.tiktok?.accountId) {
            await registerTrialAccount('tiktok', newStatus.tiktok.accountId, newStatus.tiktok.handle || '')
          }
        }
        
        previousStatus.current = newStatus
        setStatus(newStatus)
      }
      if (onboardRes.ok) {
        const data = await onboardRes.json()
        setOnboarding(data)
      }
    } catch (err) {
      console.error('Failed to fetch status:', err)
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchTrialStatus()
  }, [])

  const isMetaConnected = status.facebook?.connected || status.instagram?.connected

  const getChannelStatus = (key: ChannelKey): boolean => {
    if (key === 'meta') return isMetaConnected
    return status[key]?.connected || false
  }

  const getConnectedCount = () => {
    let count = 0
    if (isMetaConnected) count++
    if (status.tiktok?.connected) count++
    return count
  }

  const openGHLPortal = () => {
    if (onboarding.ghlPortalUrl) {
      window.open(onboarding.ghlPortalUrl, '_blank')
    }
  }

  const openVerifyModal = (platform: 'facebook' | 'instagram') => {
    setVerifyPlatform(platform)
    setVerifyResult(null)
    setShowVerifyModal(true)
  }

  const ChannelCard = ({ channelKey }: { channelKey: ChannelKey }) => {
    const channel = CHANNELS[channelKey]
    const isConnected = getChannelStatus(channelKey)

    return (
      <div className={`card mb-4 ${channel.comingSoon ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 ${channel.bgClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
            {channel.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{channel.name}</h3>
                {channel.comingSoon && (
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">
                    Coming Soon
                  </span>
                )}
              </div>
              {!channel.comingSoon && (
                isConnected ? (
                  <span className="flex items-center gap-1.5 text-green-400 text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    Not connected
                  </span>
                )
              )}
            </div>
            <p className="text-gray-400 text-sm mb-3">
              {isConnected ? channel.connectedText : channel.description}
            </p>
            
            {/* Verify buttons for Meta channels */}
            {channelKey === 'meta' && !isConnected && (
              <div className="flex gap-2">
                <button
                  onClick={() => openVerifyModal('facebook')}
                  className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Verify Facebook
                </button>
                <button
                  onClick={() => openVerifyModal('instagram')}
                  className="text-xs bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Verify Instagram
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connections</h1>
          <p className="text-gray-400">Loading...</p>
        </div>
        <div className="card animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-5 bg-white/10 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Connect All Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔗</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Your Accounts</h2>
              <p className="text-gray-400">
                You'll be taken to your account portal where you can connect your Facebook, Instagram, and TikTok accounts.
              </p>
            </div>

            {onboarding.ghlCredentials && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-300 mb-3">Your portal login:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Email:</span>
                    <span className="text-white font-mono text-sm">{onboarding.ghlCredentials.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Password:</span>
                    <span className="text-white font-mono text-sm">{onboarding.ghlCredentials.password}</span>
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
              After connecting, come back and click "Verify" to confirm
            </p>
          </div>
        </div>
      )}

      {/* Verify Connection Modal */}
      {showVerifyModal && verifyPlatform && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-white/[0.08] rounded-2xl p-6 max-w-md w-full animate-fade-in">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${verifyPlatform === 'facebook' ? 'bg-blue-500/20' : 'bg-pink-500/20'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-3xl">{verifyPlatform === 'facebook' ? '📘' : '📸'}</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Verify {verifyPlatform === 'facebook' ? 'Facebook' : 'Instagram'}
              </h2>
              <p className="text-gray-400">
                We'll send a test message to confirm your {verifyPlatform === 'facebook' ? 'Facebook Messenger' : 'Instagram DMs'} connection is working.
              </p>
            </div>

            {verifyResult && (
              <div className={`p-4 rounded-xl mb-6 ${verifyResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <p className={verifyResult.success ? 'text-green-300' : 'text-red-300'}>
                  {verifyResult.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {!verifyResult?.success && (
                <button
                  onClick={() => verifyConnection(verifyPlatform)}
                  disabled={verifying}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    verifyPlatform === 'facebook' 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                  } disabled:opacity-50`}
                >
                  {verifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    `Send Test Message`
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setShowVerifyModal(false)
                  setVerifyResult(null)
                }}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors"
              >
                {verifyResult?.success ? 'Done' : 'Cancel'}
              </button>
            </div>

            {!verifyResult && (
              <p className="text-center text-gray-500 text-xs mt-4">
                Make sure you've connected your account in GHL first
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Connections</h1>
        <p className="text-gray-400">
          Connect your social accounts to enable AI responses.
        </p>
      </div>

      {/* Trial Status Banner */}
      {trialStatus && (
        <div className={`mb-6 p-4 rounded-xl border ${
          trialStatus.expired 
            ? 'bg-red-500/10 border-red-500/30'
            : trialStatus.trialStarted
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-orange-500/10 border-orange-500/30'
        }`}>
          {trialStatus.expired ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-300">
                <span>⏰</span>
                <span>Your free trial has ended</span>
              </div>
              <a href="/billing" className="text-sm text-red-300 underline hover:no-underline">
                Upgrade to continue →
              </a>
            </div>
          ) : trialStatus.trialStarted ? (
            <div className="flex items-center gap-2 text-green-300">
              <span>✨</span>
              <span>Free trial active: <strong>{trialStatus.daysLeft} days left</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-300">
              <span>🎁</span>
              <span>Connect your first account to start your <strong>30-day free trial</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Trial Error */}
      {trialError && (
        <div className="mb-6 p-4 rounded-xl border bg-red-500/10 border-red-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-300">
              <span>⚠️</span>
              <span>{trialError}</span>
            </div>
            <button 
              onClick={() => setTrialError(null)}
              className="text-red-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="card mb-6 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Connected Channels</p>
            <p className="text-2xl font-bold">{getConnectedCount()} / 2</p>
          </div>
          <div className="text-4xl">
            {getConnectedCount() === 0 ? '📴' : getConnectedCount() === 1 ? '📱' : '🚀'}
          </div>
        </div>
      </div>

      {/* Connect All Button */}
      {getConnectedCount() < 2 && (
        <div className="card mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Connect Your Accounts</h3>
              <p className="text-gray-400 text-sm">
                Connect all your social accounts in one place
              </p>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="btn-primary py-2 px-4 text-sm"
            >
              Connect
            </button>
          </div>
        </div>
      )}

      {/* Channel Cards */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Channels</h2>
        <ChannelCard channelKey="meta" />
        <ChannelCard channelKey="tiktok" />
      </div>

      {/* Refresh */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => { setChecking(true); fetchStatus(); }}
          disabled={checking}
          className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center gap-2"
        >
          {checking ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh status
            </>
          )}
        </button>
      </div>

      {/* Help */}
      <div className="card bg-orange-500/5 border-orange-500/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <h3 className="font-semibold mb-1">Need help connecting?</h3>
            <p className="text-gray-400 text-sm">
              We're here to help you get set up on all your channels.
            </p>
            <a href="mailto:support@getapexautomation.com" className="text-orange-500 hover:text-orange-400 text-sm font-medium mt-2 inline-block">
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
