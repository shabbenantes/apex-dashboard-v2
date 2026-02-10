'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

interface Conversation {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: boolean
  messageCount: number
  type: string
  direction: string
  needsAttention?: boolean
  isToday?: boolean
}

const PAGE_SIZE = 20

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  async function fetchConversations(pageNum: number = 1, append: boolean = false) {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      const token = ApexSession.getToken()
      const res = await fetch(`/api/conversations?limit=${PAGE_SIZE}&offset=${(pageNum - 1) * PAGE_SIZE}`, { 
        cache: 'no-store',
        headers: { 
          'Cache-Control': 'no-cache',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      })
      if (res.ok) {
        const data = await res.json()
        const newConversations = data.conversations || []
        
        if (append) {
          setConversations(prev => [...prev, ...newConversations])
        } else {
          setConversations(newConversations)
        }
        
        // If we got fewer than PAGE_SIZE, there's no more data
        setHasMore(newConversations.length >= PAGE_SIZE)
        setError(null)
      } else {
        setError('Failed to load conversations')
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
      setError('Failed to load conversations')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchConversations(1, false)
  }, [])

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchConversations(nextPage, true)
  }

  const filteredConversations = filter === 'unread' 
    ? conversations.filter(c => c.unread)
    : conversations

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold mb-2">Conversations</h1>
          <p className="text-gray-400">Loading conversations...</p>
        </div>
        <div className="card animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-apex-border last:border-0">
              <div className="w-12 h-12 rounded-full bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold mb-2">Conversations</h1>
        <p className="text-gray-400">
          All messages handled by your AI assistant.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 animate-fade-in delay-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Filter:</span>
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              filter === 'all' 
                ? 'bg-apex-purple/20 text-apex-purple' 
                : 'hover:bg-white/5 text-gray-400'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              filter === 'unread' 
                ? 'bg-apex-purple/20 text-apex-purple' 
                : 'hover:bg-white/5 text-gray-400'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="card text-center py-12 animate-fade-in delay-2">
          <div className="w-16 h-16 bg-apex-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-apex-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
          <p className="text-gray-400 text-sm">
            When customers message your Facebook or Instagram page, their conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in delay-2">
          {filteredConversations.map((convo) => (
            <a
              key={convo.id}
              href={`/conversations/${convo.id}`}
              className="card block hover:bg-white/5 transition-colors group"
            >
              {/* Top row: Avatar, Name, Badges */}
              <div className="flex items-center gap-3 mb-3">
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                  convo.needsAttention 
                    ? 'bg-gradient-to-br from-orange-500/30 to-orange-400/30' 
                    : 'bg-gradient-to-br from-apex-purple/30 to-apex-purple-light/30'
                }`}>
                  <span className={`text-base font-medium ${convo.needsAttention ? 'text-orange-400' : 'text-apex-purple'}`}>
                    {convo.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold ${convo.unread ? 'text-white' : 'text-gray-200'}`}>
                    {convo.name}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Needs Attention badge */}
                  {convo.needsAttention && (
                    <div className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full">
                      Needs Attention
                    </div>
                  )}
                  
                  {/* Today badge */}
                  {convo.isToday && !convo.needsAttention && (
                    <div className="text-xs font-medium text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                      Today
                    </div>
                  )}
                  
                  {/* Channel badge */}
                  <div className="text-xs font-medium text-apex-purple bg-apex-purple/10 px-2.5 py-1 rounded-full">
                    {convo.type.replace('TYPE_', '')}
                  </div>
                </div>

                {/* Unread indicator */}
                {convo.unread && (
                  <div className="w-2.5 h-2.5 bg-apex-purple rounded-full flex-shrink-0" />
                )}
              </div>

              {/* Message preview */}
              <p className={`text-sm leading-relaxed mb-3 ${convo.unread ? 'text-gray-300' : 'text-gray-400'}`}>
                {convo.direction === 'outbound' ? '↗️ ' : '↙️ '}
                {convo.lastMessage}
              </p>

              {/* Bottom row: Time + Arrow */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{convo.time}</span>
                <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-apex-purple transition-colors">
                  <span>View conversation</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && filteredConversations.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-apex-purple/20 hover:bg-apex-purple/30 text-apex-purple font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              'Load More Conversations'
            )}
          </button>
        </div>
      )}

      {/* Info */}
      <p className="text-center text-gray-600 text-sm mt-6">
        Showing {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
        {!hasMore && filteredConversations.length > 0 && ' • All loaded'}
      </p>
    </div>
  )
}
