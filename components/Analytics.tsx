'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

interface DailyStats {
  date: string
  messages: number
  conversations: number
}

interface AnalyticsData {
  totalMessages: number
  totalConversations: number
  avgResponseTime: string
  dailyStats: DailyStats[]
  topHours: { hour: number; count: number }[]
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    const token = ApexSession.getToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/analytics?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/4 mb-6"></div>
        <div className="h-40 bg-slate-100 rounded"></div>
      </div>
    )
  }

  // Generate mock data if none exists (for demo/new accounts)
  const stats = data || {
    totalMessages: 0,
    totalConversations: 0,
    avgResponseTime: '< 1 min',
    dailyStats: generateEmptyDays(period === '7d' ? 7 : 30),
    topHours: []
  }

  const maxMessages = Math.max(...stats.dailyStats.map(d => d.messages), 1)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">AI Activity</h2>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setPeriod('7d')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              period === '7d' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
              period === '30d' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            30 days
          </button>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <div className="text-2xl font-bold text-slate-900">{stats.totalMessages}</div>
          <div className="text-xs text-slate-500">Messages</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <div className="text-2xl font-bold text-slate-900">{stats.totalConversations}</div>
          <div className="text-xs text-slate-500">Conversations</div>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-xl">
          <div className="text-2xl font-bold text-green-600">{stats.avgResponseTime}</div>
          <div className="text-xs text-slate-500">Avg Response</div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="h-32 flex items-end gap-1">
        {stats.dailyStats.slice(-14).map((day, i) => {
          const height = day.messages > 0 ? (day.messages / maxMessages) * 100 : 4
          const isToday = i === stats.dailyStats.slice(-14).length - 1
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className={`w-full rounded-t transition-all ${
                  isToday ? 'bg-orange-500' : day.messages > 0 ? 'bg-orange-200' : 'bg-slate-100'
                }`}
                style={{ height: `${height}%`, minHeight: '4px' }}
                title={`${day.date}: ${day.messages} messages`}
              />
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-400">
        <span>{stats.dailyStats.slice(-14)[0]?.date.split('-').slice(1).join('/')}</span>
        <span>Today</span>
      </div>

      {/* Empty State */}
      {stats.totalMessages === 0 && (
        <div className="text-center py-4 mt-4 bg-slate-50 rounded-xl">
          <p className="text-slate-500 text-sm">
            No messages yet. Connect your accounts to start receiving data.
          </p>
        </div>
      )}

      {/* Peak Hours */}
      {stats.topHours && stats.topHours.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-sm text-slate-500 mb-2">🕐 Busiest hours:</p>
          <div className="flex gap-2">
            {stats.topHours.slice(0, 3).map((h) => (
              <span key={h.hour} className="px-3 py-1 bg-orange-50 text-orange-600 text-sm font-medium rounded-full">
                {formatHour(h.hour)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function generateEmptyDays(count: number): DailyStats[] {
  const days: DailyStats[] = []
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    days.push({
      date: date.toISOString().split('T')[0],
      messages: 0,
      conversations: 0
    })
  }
  return days
}

function formatHour(hour: number): string {
  if (hour === 0) return '12am'
  if (hour === 12) return '12pm'
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`
}
