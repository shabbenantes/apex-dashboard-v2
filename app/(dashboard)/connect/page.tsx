'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

interface IntegrationStatus {
  facebook: {
    connected: boolean
    pageName?: string
  }
  instagram: {
    connected: boolean
    handle?: string
  }
  ghlConnectUrl?: string
}

export default function ConnectPage() {
  const [status, setStatus] = useState<IntegrationStatus>({
    facebook: { connected: false },
    instagram: { connected: false },
  })
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  async function fetchStatus() {
    try {
      const token = ApexSession.getToken()
      const res = await fetch('/api/integrations', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch integration status:', err)
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleConnect = () => {
    if (status.ghlConnectUrl) {
      window.open(status.ghlConnectUrl, '_blank')
    }
  }

  const handleCheckStatus = () => {
    setChecking(true)
    fetchStatus()
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Connections</h1>
          <p className="text-gray-400">Loading connection status...</p>
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
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold mb-2">Connections</h1>
        <p className="text-gray-400">
          Connect your Facebook and Instagram to enable AI responses.
        </p>
      </div>

      {/* Facebook Connection */}
      <div className="card mb-6 animate-fade-in delay-1">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Facebook Messenger</h3>
              {status.facebook.connected ? (
                <span className="flex items-center gap-1.5 text-green-400 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Not connected
                </span>
              )}
            </div>
            {status.facebook.connected ? (
              <p className="text-gray-300">
                {status.facebook.pageName || 'Facebook Page connected'}
              </p>
            ) : (
              <p className="text-gray-500">
                Connect your Facebook Page to enable AI responses to messages.
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-apex-border flex justify-end gap-3">
          {!status.facebook.connected && (
            <button 
              onClick={handleConnect}
              className="btn-primary text-sm py-2 px-4"
            >
              Connect Facebook
            </button>
          )}
        </div>
      </div>

      {/* Instagram Connection */}
      <div className="card mb-6 animate-fade-in delay-2">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Instagram DMs</h3>
              {status.instagram.connected ? (
                <span className="flex items-center gap-1.5 text-green-400 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-yellow-400 text-sm">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  Not connected
                </span>
              )}
            </div>
            {status.instagram.connected ? (
              <p className="text-gray-300">
                {status.instagram.handle || 'Instagram account connected'}
              </p>
            ) : (
              <p className="text-gray-500">
                Connect your Instagram to enable AI responses to DMs.
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-apex-border flex justify-end gap-3">
          {!status.instagram.connected && (
            <button 
              onClick={handleConnect}
              className="btn-primary text-sm py-2 px-4"
            >
              Connect Instagram
            </button>
          )}
        </div>
      </div>

      {/* Check Status Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleCheckStatus}
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
              Refresh connection status
            </>
          )}
        </button>
      </div>

      {/* Help Section */}
      <div className="card bg-apex-purple/5 border-apex-purple/20 animate-fade-in delay-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold mb-1">How to connect</h3>
            <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside mb-3">
              <li>Click "Connect Facebook" or "Connect Instagram" above</li>
              <li>Log in with your credentials in the new window</li>
              <li>Select your Facebook Page and/or Instagram account</li>
              <li>Authorize the connection</li>
              <li>Come back here and click "Refresh connection status"</li>
            </ol>
            <p className="text-gray-500 text-sm mb-3">
              Need help? We can walk you through it.
            </p>
            <a href="mailto:support@getapexautomation.com" className="text-apex-purple hover:text-apex-purple-light text-sm font-medium">
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
