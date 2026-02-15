'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

interface ReferralData {
  code: string
  link: string
  referred: { email: string; name: string; date: number; creditAmount: number }[]
  referredCount: number
  creditsEarned: number
  creditsAvailable: number
  referredBy?: { email: string; date: number }
}

interface LeaderboardEntry {
  name: string
  referralCount: number
  creditsEarned: number
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = ApexSession.getToken()
    const session = ApexSession.get()
    if (!token || !session?.email) {
      setLoading(false)
      return
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'

    try {
      const [referralRes, leaderboardRes] = await Promise.all([
        fetch(`${API_URL}/referrals/${encodeURIComponent(session.email)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/referrals/leaderboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (referralRes.ok) {
        const result = await referralRes.json()
        setData(result)
      }

      if (leaderboardRes.ok) {
        const result = await leaderboardRes.json()
        setLeaderboard(result.leaderboard || [])
      }
    } catch (err) {
      console.error('Failed to fetch referral data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!data?.link) return
    try {
      await navigator.clipboard.writeText(data.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    if (!data?.link) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Get $25 off Apex Automation',
          text: 'I use Apex to automatically respond to my Facebook and Instagram DMs. Use my link to get $25 off your first month!',
          url: data.link
        })
      } catch (err) {
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-8"></div>
        <div className="h-48 bg-slate-100 rounded-2xl mb-6"></div>
        <div className="h-64 bg-slate-100 rounded-2xl"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Referral Program 🎁</h1>
        <p className="text-slate-500">
          Share Apex with friends and earn credits toward your subscription.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="text-3xl font-bold text-slate-900 mb-1">{data?.referredCount || 0}</div>
          <div className="text-sm text-slate-500">Friends referred</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="text-3xl font-bold text-green-600 mb-1">${data?.creditsEarned || 0}</div>
          <div className="text-sm text-slate-500">Total earned</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="text-3xl font-bold text-orange-500 mb-1">${data?.creditsAvailable || 0}</div>
          <div className="text-sm text-slate-500">Available credits</div>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-6 text-white">
        <h2 className="text-xl font-semibold mb-1">Give $25, Get $25</h2>
        <p className="text-white/80 text-sm mb-4">
          When a friend signs up with your link and subscribes, you both get $25 off.
        </p>
        
        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
          <label className="text-xs text-white/60 block mb-2">Your referral link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={data?.link || ''}
              readOnly
              className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2.5 text-white text-sm"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-white text-orange-600 font-semibold rounded-lg hover:bg-white/90 transition-all text-sm"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2.5 bg-white/20 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/30 transition-all text-sm"
            >
              Share
            </button>
          </div>
          <p className="text-xs text-white/60 mt-2">
            Referral code: <span className="font-mono font-medium">{data?.code}</span>
          </p>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📤</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">1. Share your link</h3>
            <p className="text-sm text-slate-500">Send it to business owners who could use AI for their DMs</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🎉</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">2. They sign up</h3>
            <p className="text-sm text-slate-500">Your friend gets $25 off their first month</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">💰</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">3. You earn credit</h3>
            <p className="text-sm text-slate-500">Get $25 toward your next bill — stackable!</p>
          </div>
        </div>
      </div>

      {/* Your Referrals */}
      {data?.referred && data.referred.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your referrals</h2>
          <div className="space-y-3">
            {data.referred.map((ref, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">
                      {(ref.name || ref.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{ref.name || ref.email}</div>
                    <div className="text-xs text-slate-500">
                      Joined {new Date(ref.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-green-600 font-semibold">
                  +${ref.creditAmount || 25}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Referrers 🏆</h2>
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <div 
                key={i}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  i === 0 ? 'bg-yellow-50' : i === 1 ? 'bg-slate-100' : i === 2 ? 'bg-orange-50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-yellow-400 text-white' : 
                    i === 1 ? 'bg-slate-400 text-white' : 
                    i === 2 ? 'bg-orange-400 text-white' : 
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="font-medium text-slate-900">{entry.name}</span>
                </div>
                <div className="text-sm text-slate-500">
                  {entry.referralCount} referral{entry.referralCount !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!data?.referred || data.referred.length === 0) && (
        <div className="bg-slate-50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No referrals yet</h3>
          <p className="text-slate-500 text-sm mb-4">
            Share your link with other business owners and start earning credits!
          </p>
          <button
            onClick={handleShare}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all"
          >
            Share your link
          </button>
        </div>
      )}
    </div>
  )
}
