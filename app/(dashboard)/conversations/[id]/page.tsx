'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  platform: 'facebook' | 'instagram'
  type: string
  messages: Message[]
}

export default function ConversationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  
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
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
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

  useEffect(() => {
    if (id) fetchConversation(true)
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  useEffect(() => {
    if (!id || error) return
    const interval = setInterval(() => fetchConversation(false), 5000)
    return () => clearInterval(interval)
  }, [id, error])

  async function handleSend() {
    if (!newMessage.trim() || sending) return
    
    setSending(true)
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
        if (data.message && conversation) {
          setConversation({
            ...conversation,
            messages: [...conversation.messages, data.message]
          })
        }
        setNewMessage('')
        inputRef.current?.focus()
      }
    } catch (err) {
      console.error('Failed to send message:', err)
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
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-6 bg-slate-100 rounded w-24 mb-6 animate-pulse"></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
            <div className="h-5 bg-slate-100 rounded w-1/3"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className="h-12 bg-slate-100 rounded-2xl w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="font-medium text-slate-900 mb-1">{error || 'Something went wrong'}</p>
          <p className="text-sm text-slate-500">This conversation may have been deleted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] flex flex-col pb-20 lg:pb-0">
      {/* Back Button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Contact Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-slate-600">
              {(conversation.contactName || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-slate-900 truncate">{conversation.contactName}</h1>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                conversation.platform === 'instagram' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {conversation.platform === 'instagram' ? 'Instagram' : 'Facebook'}
              </span>
              {conversation.contactPhone && (
                <span className="text-xs text-slate-500">{conversation.contactPhone}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4">
          {conversation.messages.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {conversation.messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.direction === 'outbound' 
                      ? 'bg-[#0084ff] text-white rounded-br-md' 
                      : 'bg-slate-100 text-slate-900 rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap break-words text-[15px]">{message.body}</p>
                    <p className={`text-[10px] mt-1 ${
                      message.direction === 'outbound' ? 'text-white/70' : 'text-slate-400'
                    }`}>
                      {formatTime(message.dateAdded)}
                      {message.direction === 'outbound' && ' • AI'}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-slate-200 p-3 flex-shrink-0">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={sending}
              rows={1}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none disabled:opacity-50"
              style={{ minHeight: '44px', maxHeight: '100px' }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
