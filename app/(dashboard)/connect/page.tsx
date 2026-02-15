'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

interface Connection {
  connected: boolean
  pageName?: string
  pageId?: string
  handle?: string
  accountId?: string
  connectedAt?: number
}

interface Connections {
  facebook: Connection
  instagram: Connection
}

export default function ConnectPage() {
  const [connections, setConnections] = useState<Connections>({
    facebook: { connected: false },
    instagram: { connected: false },
  })
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    fetchConnections()
    
    // Check for success/error in URL params
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')
    
    if (success || error) {
      // Clear URL params
      window.history.replaceState({}, '', '/connect')
      if (success) {
        fetchConnections()
      }
    }
  }, [])

  const fetchConnections = async () => {
    const session = ApexSession.get()
    if (!session?.email) {
      setLoading(false)
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
      const res = await fetch(`${API_URL}/social-connections/${encodeURIComponent(session.email)}`)
      if (res.ok) {
        const data = await res.json()
        setConnections(data)
      }
    } catch (err) {
      console.error('Failed to fetch connections:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (platform: 'facebook' | 'instagram') => {
    const session = ApexSession.get()
    if (!session?.email) return

    setConnecting(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
    window.location.href = `${API_URL}/auth/meta?platform=${platform}&customerId=${encodeURIComponent(session.email)}`
  }

  const handleDisconnect = async (platform: 'facebook' | 'instagram') => {
    const session = ApexSession.get()
    if (!session?.email) return

    if (!confirm(`Disconnect ${platform}? Your AI will stop responding to ${platform} messages.`)) {
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
      const res = await fetch(`${API_URL}/social-connections/${encodeURIComponent(session.email)}/${platform}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchConnections()
      }
    } catch (err) {
      console.error('Failed to disconnect:', err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-8 bg-slate-100 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-5 bg-slate-100 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Connections</h1>
        <p className="text-slate-500">Connect your social accounts so AI can respond to messages.</p>
      </div>

      {/* Facebook */}
      <div className={`rounded-2xl border p-5 mb-4 transition-all ${
        connections.facebook.connected 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            connections.facebook.connected ? 'bg-green-100' : 'bg-blue-100'
          }`}>
            <svg className={`w-8 h-8 ${connections.facebook.connected ? 'text-green-600' : 'text-blue-600'}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Facebook Messenger</h3>
            {connections.facebook.connected ? (
              <p className="text-sm text-green-600">
                ✓ Connected to {connections.facebook.pageName || 'your page'}
              </p>
            ) : (
              <p className="text-sm text-slate-500">Respond to Facebook page messages</p>
            )}
          </div>
          {connections.facebook.connected ? (
            <button
              onClick={() => handleDisconnect('facebook')}
              className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => handleConnect('facebook')}
              disabled={connecting}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Instagram */}
      <div className={`rounded-2xl border p-5 mb-6 transition-all ${
        connections.instagram.connected 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            connections.instagram.connected ? 'bg-green-100' : 'bg-gradient-to-br from-purple-100 to-pink-100'
          }`}>
            {connections.instagram.connected ? (
              <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            ) : (
              <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Instagram DMs</h3>
            {connections.instagram.connected ? (
              <p className="text-sm text-green-600">
                ✓ Connected to @{connections.instagram.handle || 'your account'}
              </p>
            ) : (
              <p className="text-sm text-slate-500">Respond to Instagram direct messages</p>
            )}
          </div>
          {connections.instagram.connected ? (
            <button
              onClick={() => handleDisconnect('instagram')}
              className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => handleConnect('instagram')}
              disabled={connecting}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
            >
              Connect
            </button>
          )}
        </div>
        {!connections.instagram.connected && connections.facebook.connected && (
          <p className="text-xs text-slate-500 mt-3 pl-18">
            💡 Instagram connects through your Facebook Page. Make sure your Instagram Business account is linked to your Facebook Page.
          </p>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-slate-50 rounded-2xl p-5">
        <h3 className="font-semibold text-slate-900 mb-2">Need help connecting?</h3>
        <ul className="text-sm text-slate-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-orange-500">1.</span>
            <span>You'll be redirected to Facebook to grant permissions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">2.</span>
            <span>Select which Facebook Page you want to connect</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">3.</span>
            <span>For Instagram, your IG Business account must be linked to your FB Page</span>
          </li>
        </ul>
        <a 
          href="mailto:support@getapexautomation.com"
          className="inline-flex items-center gap-2 mt-4 text-sm text-orange-500 font-medium hover:text-orange-600"
        >
          Contact support →
        </a>
      </div>
    </div>
  )
}
