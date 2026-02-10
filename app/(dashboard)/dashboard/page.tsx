'use client'

import { useState, useEffect } from 'react'
import { ApexSession, SessionData } from '@/lib/session'
import StatsCard from '@/components/StatsCard'
import AddToHomeScreen from '@/components/AddToHomeScreen'
import SetupChecklist from '@/components/SetupChecklist'

interface Stats {
  messagesThisWeek: number
  avgResponseTime: string
  leadsThisWeek: number
  totalConversations: number
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
    leadsThisWeek: 0,
    totalConversations: 0
  })
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddToHome, setShowAddToHome] = useState(false)
  const [session, setSession] = useState<SessionData | null>(null)
  
  // Get session for business name
  useEffect(() => {
    const currentSession = ApexSession.get()
    if (currentSession) {
      setSession(currentSession)
    }
  }, [])

  // Check if we should show "Add to Home Screen" prompt
  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('apex_seen_add_to_home')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    // Show prompt if: hasn't seen it, not already installed, and on mobile
    if (!hasSeenPrompt && !isStandalone) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile) {
        // Delay showing the prompt a bit so they see the dashboard first
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
        // Fetch stats and conversations in parallel
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
          <h1 className="font-display text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      {/* Add to Home Screen Prompt */}
      {showAddToHome && <AddToHomeScreen onDismiss={handleDismissAddToHome} />}

      {/* Setup Checklist - shows only when setup incomplete */}
      <SetupChecklist />

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold mb-2">
          {session?.businessName ? `Welcome back, ${session.businessName}! 👋` : 'Welcome back! 👋'}
        </h1>
        <p className="text-gray-400">
          Here's how your AI assistant is performing.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          title="Leads Captured"
          value={stats.leadsThisWeek}
          icon="users"
          className="animate-fade-in delay-3"
        />
        <StatsCard
          title="Total Conversations"
          value={stats.totalConversations}
          icon="chart"
          subtitle="All time"
          className="animate-fade-in"
        />
      </div>

      {/* Getting Started Card (show when no activity) */}
      {conversations.length === 0 && (
        <div className="card animate-fade-in bg-gradient-to-br from-apex-purple/10 to-transparent border-apex-purple/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-apex-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
              <p className="text-gray-400 mb-4">
                Your AI assistant is set up and ready! Once customers start messaging your Facebook or Instagram page, their conversations will appear here.
              </p>
              <div className="flex gap-4">
                <a href="/settings" className="text-apex-purple hover:text-apex-purple-light font-medium text-sm">
                  Configure your AI →
                </a>
                <a href="/connect" className="text-gray-400 hover:text-white font-medium text-sm">
                  Check connections →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Conversations */}
      {conversations.length > 0 && (
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold">Recent Conversations</h2>
            <a href="/conversations" className="text-apex-purple hover:text-apex-purple-light text-sm font-medium">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            {conversations.slice(0, 5).map((convo) => (
              <a
                key={convo.id}
                href={`/conversations/${convo.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  convo.needsAttention 
                    ? 'bg-gradient-to-br from-orange-500/30 to-orange-400/30' 
                    : 'bg-gradient-to-br from-apex-purple/30 to-apex-purple-light/30'
                }`}>
                  <span className={`text-sm font-medium ${convo.needsAttention ? 'text-orange-400' : 'text-apex-purple'}`}>
                    {(convo.name || 'UN').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">{convo.name || 'Unknown'}</span>
                    {convo.needsAttention && (
                      <span className="text-[10px] font-medium text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                        Needs Attention
                      </span>
                    )}
                    {convo.isToday && !convo.needsAttention && (
                      <span className="text-[10px] font-medium text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">{convo.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {convo.direction === 'outbound' ? '↗️ ' : '↙️ '}
                    {convo.lastMessage?.substring(0, 60) || 'No message'}
                  </p>
                </div>
                {convo.unread && (
                  <div className="w-2 h-2 bg-apex-purple rounded-full flex-shrink-0" />
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
