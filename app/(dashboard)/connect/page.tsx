'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { ApexSession } from '@/lib/session'

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
  platform: string
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
    platform: 'facebook',
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
    available: false,
    comingSoon: true,
    platform: 'tiktok',
  },
}

type ChannelKey = 'meta' | 'tiktok'

interface SocialConnection {
  connected: boolean
  pageId?: string
  pageName?: string
  accountId?: string
  handle?: string
  profilePicture?: string
  connectedAt?: number
}

interface ConnectionStatus {
  facebook: SocialConnection
  instagram: SocialConnection
  tiktok: SocialConnection
}

export default function ConnectPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<ConnectionStatus>({
    facebook: { connected: false },
    instagram: { connected: false },
    tiktok: { connected: false },
  })
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const previousStatus = useRef<ConnectionStatus | null>(null)

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    
    if (success) {
      setMessage({ type: 'success', text: success })
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard/connect')
    } else if (error) {
      setMessage({ type: 'error', text: error })
      window.history.replaceState({}, '', '/dashboard/connect')
    }
  }, [searchParams])

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
        setMessage({ type: 'error', text: checkData.message || 'This account has already been used for a free trial.' })
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
        setMessage({ type: 'error', text: errData.error || 'Failed to start trial' })
        return false
      }

      await fetchTrialStatus()
      return true
    } catch (err) {
      console.error('Failed to register trial:', err)
      return false
    }
  }

  async function fetchStatus() {
    try {
      const session = ApexSession.get()
      if (!session?.email) return
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
      const res = await fetch(`${API_URL}/social-connections/${encodeURIComponent(session.email)}`, {
        cache: 'no-store',
      })
      
      if (res.ok) {
        const newStatus = await res.json()
        
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

  const handleConnect = (platform: string) => {
    const session = ApexSession.get()
    if (!session?.email) {
      setMessage({ type: 'error', text: 'Please log in first' })
      return
    }
    
    setConnectingPlatform(platform)
    
    // Redirect to OAuth flow
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
    window.location.href = `${API_URL}/auth/meta?platform=${platform}&customerId=${encodeURIComponent(session.email)}`
  }

  const handleDisconnect = async (platform: 'facebook' | 'instagram' | 'tiktok') => {
    const session = ApexSession.get()
    if (!session?.email) return
    
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
      const res = await fetch(`${API_URL}/social-connections/${encodeURIComponent(session.email)}/${platform}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setMessage({ type: 'success', text: `${platform} disconnected` })
        await fetchStatus()
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Failed to disconnect' })
      }
    } catch (err) {
      console.error('Disconnect error:', err)
      setMessage({ type: 'error', text: 'Failed to disconnect' })
    }
  }

  const ChannelCard = ({ channelKey }: { channelKey: ChannelKey }) => {
    const channel = CHANNELS[channelKey]
    const isConnected = getChannelStatus(channelKey)
    const isConnecting = connectingPlatform === channel.platform

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
            
            {/* Connection details */}
            {channelKey === 'meta' && isConnected && (
              <div className="text-sm text-slate-500 mb-3 space-y-1">
                {status.facebook?.connected && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>{status.facebook.pageName || 'Facebook Page'}</span>
                  </div>
                )}
                {status.instagram?.connected && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>@{status.instagram.handle || 'Instagram'}</span>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-slate-500 text-sm mb-3">
              {isConnected ? channel.connectedText : channel.description}
            </p>
            
            {/* Action buttons */}
            {!channel.comingSoon && (
              <div className="flex gap-2">
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect('facebook')}
                    className="text-sm text-red-400 hover:text-red-600 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(channel.platform)}
                    disabled={isConnecting}
                    className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin inline mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}
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
          <p className="text-slate-500">Loading...</p>
        </div>
        <div className="card animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-100 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-5 bg-slate-100 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Connections</h1>
        <p className="text-slate-500">
          Connect your social accounts to enable AI responses.
        </p>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{message.text}</span>
            </div>
            <button 
              onClick={() => setMessage(null)}
              className={message.type === 'success' ? 'text-green-600 hover:text-white' : 'text-red-600 hover:text-white'}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Trial Status Banner */}
      {trialStatus && (
        <div className={`mb-6 p-4 rounded-xl border ${
          trialStatus.expired 
            ? 'bg-red-50 border-red-200'
            : trialStatus.trialStarted
              ? 'bg-green-50 border-green-200'
              : 'bg-orange-50 border-orange-200'
        }`}>
          {trialStatus.expired ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <span>⏰</span>
                <span>Your free trial has ended</span>
              </div>
              <a href="/billing" className="text-sm text-red-600 underline hover:no-underline">
                Upgrade to continue →
              </a>
            </div>
          ) : trialStatus.trialStarted ? (
            <div className="flex items-center gap-2 text-green-600">
              <span>✨</span>
              <span>Free trial active: <strong>{trialStatus.daysLeft} days left</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600">
              <span>🎁</span>
              <span>Connect your first account to start your <strong>30-day free trial</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="card mb-6 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">Connected Channels</p>
            <p className="text-2xl font-bold">{getConnectedCount()} / 2</p>
          </div>
          <div className="text-4xl">
            {getConnectedCount() === 0 ? '📴' : getConnectedCount() === 1 ? '📱' : '🚀'}
          </div>
        </div>
      </div>

      {/* Channel Cards */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Your Channels</h2>
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
      <div className="card bg-orange-500/5 border-orange-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <h3 className="font-semibold mb-1">Need help connecting?</h3>
            <p className="text-slate-500 text-sm">
              Simply click Connect and authorize Apex to respond to your messages. It takes less than 60 seconds!
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
