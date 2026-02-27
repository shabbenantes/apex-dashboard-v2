'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ConversationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('apex_token')
    if (!token) {
      router.push('/')
      return
    }
    setLoading(false)
  }, [router])

  const conversations = [
    { id: 1, name: 'Sarah M.', message: 'Thanks for the quick response! I\'ll see you Saturday.', time: '2 min ago', platform: 'instagram', unread: true },
    { id: 2, name: 'Mike R.', message: 'Can I book for Saturday at 2pm?', time: '15 min ago', platform: 'facebook', unread: true },
    { id: 3, name: 'Jessica L.', message: 'What are your prices for a haircut?', time: '1 hr ago', platform: 'instagram', unread: false },
    { id: 4, name: 'David K.', message: 'Perfect, thank you!', time: '3 hrs ago', platform: 'facebook', unread: false },
    { id: 5, name: 'Amanda W.', message: 'Do you take walk-ins?', time: '5 hrs ago', platform: 'instagram', unread: false },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="font-semibold text-gray-900">Conversations</h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {conversations.map((convo, i) => (
            <div 
              key={convo.id} 
              className={`px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                i !== conversations.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${
                  convo.unread 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
                    : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'
                }`}>
                  {convo.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-gray-900">{convo.name}</span>
                    {convo.unread && (
                      <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                    )}
                    <span className="text-xs text-gray-400 capitalize">• {convo.platform}</span>
                  </div>
                  <p className={`text-sm truncate ${convo.unread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {convo.message}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{convo.time}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
