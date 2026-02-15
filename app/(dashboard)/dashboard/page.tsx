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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-8 bg-slate-100 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="h-8 bg-slate-100 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {session?.businessName ? `Hey, ${session.businessName.split(' ')[0]}! 👋` : 'Welcome back! 👋'}
        </h1>
        <p className="text-slate-500">Here's how your AI is performing.</p>
      </div>

      {/* AI Status Toggle */}
      <div className={`rounded-2xl p-4 mb-6 flex items-center justify-between ${
        aiActive ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${aiActive ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
          <div>
            <p className="font-semibold text-slate-900">{aiActive ? 'AI is Active' : 'AI is Paused'}</p>
            <p className="text-sm text-slate-500">
              {aiActive ? 'Responding to messages automatically' : 'Messages won\'t get automatic replies'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleAI}
          disabled={togglingAI}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
            aiActive 
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' 
              : 'bg-green-500 text-white hover:bg-green-600'
          } disabled:opacity-50`}
        >
          {togglingAI ? '...' : aiActive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{stats.messagesThisWeek}</p>
          <p className="text-sm text-slate-500">Messages this week</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-green-600">{stats.avgResponseTime}</p>
          <p className="text-sm text-slate-500">Avg response</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{stats.totalConversations}</p>
          <p className="text-sm text-slate-500">Conversations</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          href="/ai-config"
          className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
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
          className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
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
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent Conversations</h2>
          <Link href="/conversations" className="text-orange-500 text-sm font-medium hover:text-orange-600">
            View all →
          </Link>
        </div>
        
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-medium text-slate-900 mb-1">No conversations yet</p>
            <p className="text-sm text-slate-500 mb-4">
              Connect your social accounts to start receiving messages.
            </p>
            <Link 
              href="/connect"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Connect accounts
            </Link>
          </div>
        ) : (
          <div>
            {conversations.slice(0, 5).map((convo, i) => (
              <Link
                key={convo.id}
                href={`/conversations/${convo.id}`}
                className={`flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors ${
                  i !== Math.min(conversations.length - 1, 4) ? 'border-b border-slate-100' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  convo.needsAttention ? 'bg-orange-100' : 'bg-slate-100'
                }`}>
                  <span className={`text-sm font-semibold ${
                    convo.needsAttention ? 'text-orange-600' : 'text-slate-600'
                  }`}>
                    {(convo.name || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-slate-900 truncate">{convo.name || 'Unknown'}</span>
                    {convo.needsAttention && (
                      <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                        Needs reply
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{convo.lastMessage}</p>
                </div>
                <div className="text-xs text-slate-400 flex-shrink-0">{convo.time}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
