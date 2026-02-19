'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ApexSession, SessionData } from '@/lib/session'

interface Stats {
  messagesThisWeek: number
  avgResponseTime: string
  totalConversations: number
}

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  platform: string
  needsAttention?: boolean
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    messagesThisWeek: 0,
    avgResponseTime: '< 1 min',
    totalConversations: 0
  })
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<SessionData | null>(null)
  const [aiActive, setAiActive] = useState(true)
  const [togglingAI, setTogglingAI] = useState(false)
  
  useEffect(() => {
    const currentSession = ApexSession.get()
    if (currentSession) {
      setSession(currentSession)
    }
  }, [])

  useEffect(() => {
    async function fetchData() {
      const token = ApexSession.getToken()
      if (!token) {
        setLoading(false)
        return
      }

      const headers = { 'Authorization': `Bearer ${token}` }

      try {
        const [statsRes, convosRes, settingsRes] = await Promise.all([
          fetch('/api/stats', { headers }),
          fetch('/api/conversations', { headers }),
          fetch('/api/settings', { headers })
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        }

        if (convosRes.ok) {
          const data = await convosRes.json()
          setConversations(data.conversations || [])
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json()
          setAiActive(data.aiActive !== false)
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const toggleAI = async () => {
    const token = ApexSession.getToken()
    if (!token) return
    
    setTogglingAI(true)
    try {
      const newStatus = !aiActive
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aiActive: newStatus })
      })
      
      if (res.ok) {
        setAiActive(newStatus)
      }
    } catch (err) {
      console.error('Failed to toggle AI:', err)
    } finally {
      setTogglingAI(false)
    }
  }

  const firstName = session?.businessName?.split(' ')[0] || 'there'

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="h-8 bg-slate-200 rounded-lg w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-64 mb-8 animate-pulse"></div>
        <div className="bg-slate-100 rounded-2xl h-24 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-100 rounded-2xl h-24 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Hey, {firstName}! 👋
        </h1>
        <p className="text-slate-500">Here's how your AI is performing.</p>
      </div>

      {/* AI Status Card */}
      <div className={`rounded-2xl p-5 mb-6 transition-all ${
        aiActive 
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200' 
          : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              aiActive ? 'bg-emerald-500' : 'bg-orange-400'
            }`}>
              <span className="text-2xl">{aiActive ? '⚡' : '⏸️'}</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-lg">
                {aiActive ? 'AI is Active' : 'AI is Paused'}
              </p>
              <p className="text-sm text-slate-600">
                {aiActive ? 'Responding to messages 24/7' : 'Messages won\'t get automatic replies'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleAI}
            disabled={togglingAI}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              aiActive 
                ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
            } disabled:opacity-50`}
          >
            {togglingAI ? '...' : aiActive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center hover:border-slate-300 transition-all">
          <p className="text-3xl font-bold text-slate-900 mb-1">{stats.messagesThisWeek}</p>
          <p className="text-xs text-slate-500 font-medium">Messages this week</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center hover:border-slate-300 transition-all">
          <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.avgResponseTime}</p>
          <p className="text-xs text-slate-500 font-medium">Avg response</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center hover:border-slate-300 transition-all">
          <p className="text-3xl font-bold text-slate-900 mb-1">{stats.totalConversations}</p>
          <p className="text-xs text-slate-500 font-medium">Conversations</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          href="/ai-config"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
              ✨
            </div>
            <div>
              <p className="font-semibold text-slate-900">Train AI</p>
              <p className="text-sm text-slate-500">Customize responses</p>
            </div>
          </div>
        </Link>
        <Link
          href="/connect"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              🔗
            </div>
            <div>
              <p className="font-semibold text-slate-900">Connect</p>
              <p className="text-sm text-slate-500">Add social accounts</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Conversations */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Conversations</h2>
          <Link href="/conversations" className="text-orange-500 text-sm font-semibold hover:text-orange-600 transition-colors">
            View all →
          </Link>
        </div>
        
        {conversations.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-900 mb-1">No conversations yet</p>
            <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto">
              Connect your social accounts to start receiving messages.
            </p>
            <Link 
              href="/connect"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/25"
            >
              Connect accounts →
            </Link>
          </div>
        ) : (
          <div>
            {conversations.slice(0, 5).map((convo, i) => (
              <Link
                key={convo.id}
                href={`/conversations/${convo.id}`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${
                  i !== Math.min(conversations.length - 1, 4) ? 'border-b border-slate-100' : ''
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                  convo.needsAttention 
                    ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <span className="text-sm font-bold">
                    {(convo.name || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-slate-900 truncate">{convo.name || 'Unknown'}</span>
                    {convo.needsAttention && (
                      <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{convo.lastMessage}</p>
                </div>
                <div className="text-xs text-slate-400 flex-shrink-0 font-medium">{convo.time}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
