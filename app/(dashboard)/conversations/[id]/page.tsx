'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchConversation(showLoading = true) {
    try {
      if (showLoading) setLoading(true)
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

  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchConversation(true)
    }
  }, [id])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!id || error) return
    
    const interval = setInterval(() => {
      fetchConversation(false) // silent refresh
    }, 5000)
    
    return () => clearInterval(interval)
  }, [id, error])

  async function handleSend() {
    if (!newMessage.trim() || sending) return
    
    setSending(true)
    setSendError(null)
    
    try {
      const token = ApexSession.getToken()
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: newMessage.trim() })
      })
      
      if (res.ok) {
        const data = await res.json()
        // Add message to local state immediately for instant feedback
        if (data.message && conversation) {
          setConversation({
            ...conversation,
            messages: [...conversation.messages, data.message]
          })
        }
        setNewMessage('')
        inputRef.current?.focus()
      } else {
        const errorData = await res.json().catch(() => ({}))
        setSendError(errorData.error || 'Failed to send message')
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      setSendError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

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
    <div className="max-w-4xl h-[calc(100vh-120px)] flex flex-col">
      {/* Back Link */}
      <div className="mb-4 animate-fade-in flex-shrink-0">
        <Link href="/conversations" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Conversations
        </Link>
      </div>

      {/* Contact Header */}
      <div className="card mb-4 animate-fade-in flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-apex-purple/30 to-apex-purple-light/30 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-medium text-apex-purple">
              {conversation.contactName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-bold truncate">{conversation.contactName}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-400 mt-0.5">
              {conversation.contactPhone && (
                <span className="truncate">{conversation.contactPhone}</span>
              )}
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs flex-shrink-0">
                {conversation.type.replace('TYPE_', '')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="card flex-1 flex flex-col min-h-0 animate-fade-in delay-1">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          {conversation.messages.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No messages in this conversation yet.</p>
          ) : (
            <div className="space-y-3 py-2">
              {conversation.messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.direction === 'outbound' 
                      ? 'bg-apex-purple text-white rounded-br-md' 
                      : 'bg-white/10 text-gray-200 rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap break-words text-[15px]">{message.body}</p>
                    <p className={`text-xs mt-1 ${
                      message.direction === 'outbound' ? 'text-white/60' : 'text-gray-500'
                    }`}>
                      {formatTime(message.dateAdded)}
                      {message.direction === 'outbound' && message.type !== 'Custom' && ' • 🤖 AI'}
                      {message.direction === 'outbound' && message.type === 'Custom' && ' • You'}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Composer */}
        <div className="border-t border-apex-border pt-4 mt-4 flex-shrink-0">
          {sendError && (
            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {sendError}
            </div>
          )}
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={sending}
              rows={1}
              className="flex-1 bg-white/5 border border-apex-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-apex-purple/50 focus:border-apex-purple resize-none disabled:opacity-50"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="px-5 py-3 bg-apex-purple hover:bg-apex-purple-light text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
