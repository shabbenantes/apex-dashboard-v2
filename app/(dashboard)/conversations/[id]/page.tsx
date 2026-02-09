'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ApexSession } from '@/lib/session'
import Link from 'next/link'

interface Message {
  id: string
  body: string
  direction: 'inbound' | 'outbound'
  dateAdded: number
  type: string
}

interface ConversationDetail {
  id: string
  contactName: string
  contactEmail?: string
  contactPhone?: string
  type: string
  messages: Message[]
}

export default function ConversationDetailPage() {
  const params = useParams()
  const id = params.id as string
  
  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConversation() {
      try {
        const token = ApexSession.getToken()
        const res = await fetch(`/api/conversations/${id}`, { 
          cache: 'no-store',
          headers: { 
            'Cache-Control': 'no-cache',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
        })
        if (res.ok) {
          const data = await res.json()
          setConversation(data)
          setError(null)
        } else if (res.status === 404) {
          setError('Conversation not found')
        } else {
          setError('Failed to load conversation')
        }
      } catch (err) {
        console.error('Failed to fetch conversation:', err)
        setError('Failed to load conversation')
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchConversation()
    }
  }, [id])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <Link href="/conversations" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Conversations
          </Link>
        </div>
        <div className="card animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <Link href="/conversations" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Conversations
          </Link>
        </div>
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">{error || 'Something went wrong'}</h3>
          <p className="text-gray-400 text-sm">
            This conversation may have been deleted or you don't have access.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Back Link */}
      <div className="mb-6 animate-fade-in">
        <Link href="/conversations" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Conversations
        </Link>
      </div>

      {/* Contact Header */}
      <div className="card mb-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-apex-purple/30 to-apex-purple-light/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-medium text-apex-purple">
              {conversation.contactName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{conversation.contactName}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
              {conversation.contactPhone && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {conversation.contactPhone}
                </span>
              )}
              {conversation.contactEmail && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {conversation.contactEmail}
                </span>
              )}
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                {conversation.type.replace('TYPE_', '')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="card animate-fade-in delay-1">
        <h2 className="font-display text-lg font-semibold mb-4">Messages</h2>
        
        {conversation.messages.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No messages in this conversation yet.</p>
        ) : (
          <div className="space-y-4">
            {conversation.messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.direction === 'outbound' 
                    ? 'bg-apex-purple text-white rounded-br-md' 
                    : 'bg-white/10 text-gray-200 rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p className={`text-xs mt-1 ${
                    message.direction === 'outbound' ? 'text-white/60' : 'text-gray-500'
                  }`}>
                    {formatTime(message.dateAdded)}
                    {message.direction === 'outbound' && ' • AI'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note about read-only */}
      <p className="text-center text-gray-600 text-sm mt-6">
        💡 Messages shown are handled by your AI assistant. Replies are sent automatically.
      </p>
    </div>
  )
}
