'use client'

import React, { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'
import ConnectFacebookModal from '@/components/ConnectFacebookModal'

// Channel definitions - easy to add more
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
  facebook: {
    name: 'Facebook Messenger',
    icon: (
      <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    bgClass: 'bg-blue-500/20',
    description: 'Respond to Facebook messages automatically',
    connectedText: 'Your Facebook Page is connected',
    available: true,
  },
  instagram: {
    name: 'Instagram DMs',
    icon: (
      <svg className="w-8 h-8 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    bgClass: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20',
    description: 'Respond to Instagram DMs automatically',
    connectedText: 'Your Instagram is connected',
    available: true,
  },
  tiktok: {
    name: 'TikTok DMs',
    icon: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    bgClass: 'bg-black',
    description: 'Respond to TikTok messages automatically',
    connectedText: 'Your TikTok is connected',
    available: true,
  },
  google: {
    name: 'Google Business',
    icon: (
      <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    bgClass: 'bg-white/10',
    description: 'Respond to Google Business messages',
    connectedText: 'Google Business Messages connected',
    available: true,
  },
  whatsapp: {
    name: 'WhatsApp Business',
    icon: (
      <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    bgClass: 'bg-green-500/20',
    description: 'Respond to WhatsApp messages automatically',
    connectedText: 'WhatsApp Business connected',
    available: true,
  },
  linkedin: {
    name: 'LinkedIn',
    icon: (
      <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    bgClass: 'bg-blue-600/20',
    description: 'Respond to LinkedIn messages',
    connectedText: 'LinkedIn connected',
    available: false, // Coming soon
    comingSoon: true,
  },
}

type ChannelKey = 'facebook' | 'instagram' | 'tiktok' | 'google' | 'whatsapp' | 'linkedin'

interface IntegrationStatus {
  facebook: { connected: boolean; pageName?: string }
  instagram: { connected: boolean; handle?: string }
  tiktok: { connected: boolean; handle?: string }
  google: { connected: boolean; businessName?: string }
  whatsapp: { connected: boolean; phone?: string }
  linkedin: { connected: boolean }
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
    google: { connected: false },
    whatsapp: { connected: false },
    linkedin: { connected: false },
  })
  const [onboarding, setOnboarding] = useState<OnboardingStatus>({})
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [showModal, setShowModal] = useState<ChannelKey | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)

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
        const data = await intRes.json()
        setStatus(prev => ({ ...prev, ...data }))
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
  }, [])

  const verifyConnection = async (type: ChannelKey) => {
    setVerifying(true)
    setVerifyError(null)
    const token = ApexSession.getToken()
    
    try {
      const res = await fetch(`/api/onboarding/verify-${type}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      
      const data = await res.json()
      
      if (data.connected) {
        setShowModal(null)
        setChecking(true)
        fetchStatus()
      } else {
        setVerifyError(data.message || `${CHANNELS[type].name} connection not detected. Please complete all steps and try again.`)
      }
    } catch (err) {
      console.error(`Failed to verify ${type}:`, err)
      setVerifyError('Verification failed. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(null)
    setVerifyError(null)
  }

  const getConnectedCount = () => {
    return Object.entries(status).filter(([key, val]) => 
      key !== 'ghlConnectUrl' && typeof val === 'object' && val.connected
    ).length
  }

  const ChannelCard = ({ channelKey }: { channelKey: ChannelKey }) => {
    const channel = CHANNELS[channelKey]
    const channelStatus = status[channelKey]
    const isConnected = channelStatus?.connected

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
                  <span className="px-2 py-0.5 bg-apex-purple/20 text-apex-purple text-xs rounded-full font-medium">
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
            <p className="text-gray-400 text-sm">
              {isConnected ? channel.connectedText : channel.description}
            </p>
          </div>
        </div>
        {!isConnected && !channel.comingSoon && (
          <div className="mt-4 pt-4 border-t border-apex-border">
            <button 
              onClick={() => setShowModal(channelKey)} 
              className="btn-primary text-sm py-2 px-4"
            >
              Connect {channel.name.split(' ')[0]}
            </button>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Connections</h1>
          <p className="text-gray-400">Loading...</p>
        </div>
        <div className="card animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-700 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Modal */}
      {showModal && (showModal === 'facebook' || showModal === 'instagram') && (
        <ConnectFacebookModal
          platform={showModal}
          portalUrl={onboarding.ghlPortalUrl}
          credentials={onboarding.ghlCredentials}
          onClose={handleCloseModal}
          onVerify={() => verifyConnection(showModal)}
          verifying={verifying}
          error={verifyError}
        />
      )}

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold mb-2">Connections</h1>
        <p className="text-gray-400">
          Connect your social accounts to enable AI responses.
        </p>
      </div>

      {/* Stats */}
      <div className="card mb-6 bg-gradient-to-r from-apex-purple/10 to-pink-500/10 border-apex-purple/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Connected Channels</p>
            <p className="text-2xl font-bold">{getConnectedCount()} / {Object.keys(CHANNELS).filter(k => !CHANNELS[k as ChannelKey].comingSoon).length}</p>
          </div>
          <div className="text-4xl">
            {getConnectedCount() === 0 ? '📴' : getConnectedCount() < 3 ? '📱' : '🚀'}
          </div>
        </div>
      </div>

      {/* Primary Channels (Meta) */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Meta Platforms</h2>
        <ChannelCard channelKey="facebook" />
        <ChannelCard channelKey="instagram" />
      </div>

      {/* Other Channels */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Other Platforms</h2>
        <ChannelCard channelKey="tiktok" />
        <ChannelCard channelKey="google" />
        <ChannelCard channelKey="whatsapp" />
        <ChannelCard channelKey="linkedin" />
      </div>

      {/* Refresh */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => { setChecking(true); fetchStatus(); }}
          disabled={checking}
          className="text-apex-purple hover:text-apex-purple-light text-sm font-medium flex items-center gap-2"
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
      <div className="card bg-apex-purple/5 border-apex-purple/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <h3 className="font-semibold mb-1">Need help connecting?</h3>
            <p className="text-gray-400 text-sm">
              We're here to help you get set up on all your channels.
            </p>
            <a href="mailto:support@getapexautomation.com" className="text-apex-purple hover:text-apex-purple-light text-sm font-medium mt-2 inline-block">
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
