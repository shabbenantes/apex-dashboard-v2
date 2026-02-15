'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ApexSession } from '@/lib/session'

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  platform: 'facebook' | 'instagram'
  unread: boolean
  needsAttention?: boolean
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'needs_attention'>('all')

  useEffect(() => {
    async function fetchConversations() {
      const token = ApexSession.getToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/conversations', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setConversations(data.conversations || [])
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const filteredConversations = filter === 'needs_attention'
    ? conversations.filter(c => c.needsAttention)
    : conversations

  const needsAttentionCount = conversations.filter(c => c.needsAttention).length

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-8 bg-slate-100 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-2/3"></div>
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Conversations</h1>
        {needsAttentionCount > 0 && (
          <span className="px-2.5 py-1 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full">
            {needsAttentionCount} need reply
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({conversations.length})
        </button>
        <button
          onClick={() => setFilter('needs_attention')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'needs_attention'
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Needs Reply ({needsAttentionCount})
        </button>
      </div>

      {/* Conversation List */}
      {filteredConversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          {filter === 'needs_attention' ? (
            <>
              <p className="font-medium text-slate-900 mb-1">All caught up! 🎉</p>
              <p className="text-sm text-slate-500">No conversations need your attention right now.</p>
            </>
          ) : (
            <>
              <p className="font-medium text-slate-900 mb-1">No conversations yet</p>
              <p className="text-sm text-slate-500 mb-4">
                When customers message your social accounts, they'll appear here.
              </p>
              <Link
                href="/connect"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
              >
                Connect accounts
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {filteredConversations.map((convo, i) => (
            <Link
              key={convo.id}
              href={`/conversations/${convo.id}`}
              className={`flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors ${
                i !== filteredConversations.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                convo.needsAttention ? 'bg-orange-100' : 'bg-slate-100'
              }`}>
                <span className={`text-sm font-semibold ${
                  convo.needsAttention ? 'text-orange-600' : 'text-slate-600'
                }`}>
                  {(convo.name || 'U')[0].toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-slate-900 truncate">{convo.name || 'Unknown'}</span>
                  {/* Platform Badge */}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    convo.platform === 'instagram' 
                      ? 'bg-purple-100 text-purple-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {convo.platform === 'instagram' ? 'IG' : 'FB'}
                  </span>
                  {convo.needsAttention && (
                    <span className="text-[10px] font-semibold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                      Needs reply
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">{convo.lastMessage}</p>
              </div>

              {/* Time */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs text-slate-400">{convo.time}</span>
                {convo.unread && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
