'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  email: string
  businessName: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [aiActive, setAiActive] = useState(true)
  const [stats, setStats] = useState({
    messagesThisWeek: 47,
    avgResponseTime: '< 1 min',
    conversations: 12
  })

  useEffect(() => {
    const token = localStorage.getItem('apex_token')
    const userData = localStorage.getItem('apex_user')
    
    if (!token || !userData) {
      router.push('/')
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('apex_token')
    localStorage.removeItem('apex_user')
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const firstName = user.businessName?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <span className="font-bold text-gray-900">Apex</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Hey, {firstName}! 👋
          </h1>
          <p className="text-gray-500">Here's how your AI assistant is performing.</p>
        </div>

        {/* AI Status */}
        <div className={`rounded-2xl p-6 mb-6 ${
          aiActive 
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200' 
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                aiActive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                {aiActive ? '⚡' : '⏸️'}
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900">
                  {aiActive ? 'AI is Active' : 'AI is Paused'}
                </h2>
                <p className="text-sm text-gray-600">
                  {aiActive ? 'Responding to messages 24/7' : 'Messages won\'t get automatic replies'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAiActive(!aiActive)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                aiActive 
                  ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
              }`}
            >
              {aiActive ? 'Pause AI' : 'Resume AI'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.messagesThisWeek}</p>
            <p className="text-xs text-gray-500 font-medium">Messages this week</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-emerald-600 mb-1">{stats.avgResponseTime}</p>
            <p className="text-xs text-gray-500 font-medium">Avg response</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.conversations}</p>
            <p className="text-xs text-gray-500 font-medium">Conversations</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/dashboard/conversations"
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                💬
              </div>
              <div>
                <p className="font-semibold text-gray-900">Conversations</p>
                <p className="text-sm text-gray-500">View all chats</p>
              </div>
            </div>
          </Link>
          <Link
            href="/dashboard/settings"
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-gray-500/20 group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <div>
                <p className="font-semibold text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">Configure your AI</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Conversations</h3>
            <Link href="/dashboard/conversations" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {[
              { name: 'Sarah M.', message: 'Thanks for the quick response!', time: '2 min ago', platform: 'instagram' },
              { name: 'Mike R.', message: 'Can I book for Saturday?', time: '15 min ago', platform: 'facebook' },
              { name: 'Jessica L.', message: 'What are your prices?', time: '1 hr ago', platform: 'instagram' },
            ].map((convo, i) => (
              <div key={i} className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                    {convo.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{convo.name}</span>
                      <span className="text-xs text-gray-400">via {convo.platform}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{convo.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{convo.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
