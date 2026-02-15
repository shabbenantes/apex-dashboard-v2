'use client'

import { useState, useEffect } from 'react'
import { ApexSession, SessionData } from '@/lib/session'
import StatsCard from '@/components/StatsCard'
import AddToHomeScreen from '@/components/AddToHomeScreen'
import SetupChecklist from '@/components/SetupChecklist'
import Analytics from '@/components/Analytics'
import QuickActions from '@/components/QuickActions'
import ReferralBanner from '@/components/ReferralBanner'

interface Stats {
  messagesThisWeek: number
  avgResponseTime: string
  totalConversations: number
}

interface AIStatus {
  active: boolean
  loading: boolean
}

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: boolean
  messageCount: number
  direction: string
  needsAttention?: boolean
  isToday?: boolean
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    messagesThisWeek: 0,
    avgResponseTime: '< 1 min',
    totalConversations: 0
  })
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddToHome, setShowAddToHome] = useState(false)
  const [session, setSession] = useState<SessionData | null>(null)
  const [aiStatus, setAiStatus] = useState<AIStatus>({ active: true, loading: true })
  
  useEffect(() => {
    const currentSession = ApexSession.get()
    if (currentSession) {
      setSession(currentSession)
    }
  }, [])

  useEffect(() => {
    async function fetchAIStatus() {
      const token = ApexSession.getToken()
      if (!token) return
      
      try {
        const res = await fetch('/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setAiStatus({ active: data.aiActive !== false, loading: false })
        } else {
          setAiStatus({ active: true, loading: false })
        }
      } catch {
        setAiStatus({ active: true, loading: false })
      }
    }
    fetchAIStatus()
  }, [])

  async function toggleAIStatus() {
    const token = ApexSession.getToken()
    if (!token) return
    
    setAiStatus(prev => ({ ...prev, loading: true }))
    
    try {
      const newStatus = !aiStatus.active
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aiActive: newStatus })
      })
      
      if (res.ok) {
        setAiStatus({ active: newStatus, loading: false })
      } else {
        setAiStatus(prev => ({ ...prev, loading: false }))
      }
    } catch {
      setAiStatus(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('apex_seen_add_to_home')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    if (!hasSeenPrompt && !isStandalone) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile) {
        setTimeout(() => setShowAddToHome(true), 2000)
      }
    }
  }, [])

  const handleDismissAddToHome = () => {
    setShowAddToHome(false)
    localStorage.setItem('apex_seen_add_to_home', 'true')
  }

  useEffect(() => {
    async function fetchData() {
      const token = ApexSession.getToken()
      if (!token) {
        setLoading(false)
        return
      }

      const headers = { 'Authorization': `Bearer ${token}` }

      try {
        const [statsRes, convosRes] = await Promise.all([
          fetch('/api/stats', { headers, cache: 'no-store' }),
          fetch('/api/conversations', { headers, cache: 'no-store' })
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (convosRes.ok) {
          const convosData = await convosRes.json()
          setConversations(convosData.conversations || [])
        }

        setError(null)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back! 👋</h1>
          <p className="text-slate-500">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-100 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      {showAddToHome && <AddToHomeScreen onDismiss={handleDismissAddToHome} />}
      <SetupChecklist />

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {session?.businessName ? `Welcome back, ${session.businessName}! 👋` : 'Welcome back! 👋'}
        </h1>
        <p className="text-slate-500">
          Here's how your AI assistant is performing.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error}
        </div>
      )}

      {/* AI Status Card */}
      <div className={`bg-white rounded-2xl border p-5 mb-6 animate-fade-in ${aiStatus.active ? 'border-green-200' : 'border-orange-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${aiStatus.active ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`} />
            <div>
              <span className="font-semibold text-lg text-slate-900">
                {aiStatus.active ? 'AI is Active' : 'AI is Paused'}
              </span>
              <p className="text-sm text-slate-500 mt-0.5">
                {aiStatus.active 
                  ? 'Responding to messages automatically' 
                  : 'Messages won\'t get automatic replies'}
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleAIStatus}
            disabled={aiStatus.loading}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all ${
              aiStatus.active
                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200'
                : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
            } disabled:opacity-50`}
          >
            {aiStatus.loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : aiStatus.active ? '⏸ Pause AI' : '▶ Resume AI'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Messages This Week"
          value={stats.messagesThisWeek}
          icon="message"
          className="animate-fade-in delay-1"
        />
        <StatsCard
          title="Avg Response Time"
          value={stats.avgResponseTime}
          icon="clock"
          subtitle="AI-powered speed"
          className="animate-fade-in delay-2"
        />
        <StatsCard
          title="Total Conversations"
          value={stats.totalConversations}
          icon="users"
          subtitle="All time"
          className="animate-fade-in delay-3"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Analytics Chart */}
      <Analytics />

      {/* Recent Conversations */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-fade-in mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Recent Conversations</h2>
          <a href="/conversations" className="text-orange-500 hover:text-orange-600 text-sm font-medium">
            View all →
          </a>
        </div>
        
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No conversations yet</h3>
            <p className="text-slate-500 text-sm mb-4">
              When customers message your Facebook or Instagram page, their conversations will appear here.
            </p>
            <div className="flex justify-center gap-4">
              <a href="/settings" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                Configure your AI →
              </a>
              <a href="/connect" className="text-slate-500 hover:text-slate-900 font-medium text-sm">
                Check connections →
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.slice(0, 5).map((convo) => (
              <a
                key={convo.id}
                href={`/conversations/${convo.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  convo.needsAttention 
                    ? 'bg-orange-100' 
                    : 'bg-slate-100'
                }`}>
                  <span className={`text-sm font-medium ${convo.needsAttention ? 'text-orange-600' : 'text-slate-600'}`}>
                    {(convo.name || 'UN').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-slate-900">{convo.name || 'Unknown'}</span>
                    {convo.needsAttention && (
                      <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                        Needs Attention
                      </span>
                    )}
                    {convo.isToday && !convo.needsAttention && (
                      <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                    <span className="text-xs text-slate-400 ml-auto">{convo.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {convo.direction === 'outbound' ? '↗️ ' : '↙️ '}
                    {convo.lastMessage?.substring(0, 60) || 'No message'}
                  </p>
                </div>
                {convo.unread && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Referral Banner */}
      <ReferralBanner />
    </div>
  )
}
