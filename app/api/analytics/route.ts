import { NextResponse } from 'next/server'
import { ApexSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '7d'
    const days = period === '30d' ? 30 : 7

    // Get session info
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
    
    // For now, return mock/empty data structure
    // In production, this would query the actual message database
    const dailyStats = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        messages: 0,
        conversations: 0
      })
    }

    // Try to get real stats from the API
    try {
      const token = authHeader.replace('Bearer ', '')
      const statsRes = await fetch(`${API_URL}/analytics?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (statsRes.ok) {
        const realStats = await statsRes.json()
        return NextResponse.json(realStats)
      }
    } catch (err) {
      // Fall back to empty stats
      console.log('Analytics API not available, using defaults')
    }

    return NextResponse.json({
      totalMessages: 0,
      totalConversations: 0,
      avgResponseTime: '< 1 min',
      dailyStats,
      topHours: []
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
