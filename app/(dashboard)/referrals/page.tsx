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
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const session = ApexSession.get()
    if (!session?.email) {
      setLoading(false)
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
      const res = await fetch(`${API_URL}/referrals/${encodeURIComponent(session.email)}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
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
          text: 'I use Apex for AI-powered messaging. Use my link for $25 off!',
          url: data.link
        })
      } catch {
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-8 bg-slate-100 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-6 animate-pulse"></div>
        <div className="bg-slate-100 rounded-2xl h-48 animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Referral Program 🎁</h1>
        <p className="text-slate-500">Earn credits by sharing Apex with friends.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{data?.referredCount || 0}</p>
          <p className="text-xs text-slate-500">Referred</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">${data?.creditsEarned || 0}</p>
          <p className="text-xs text-slate-500">Earned</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">${data?.creditsAvailable || 0}</p>
          <p className="text-xs text-slate-500">Available</p>
        </div>
      </div>

      {/* Share Card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 mb-4 text-white">
        <h2 className="font-semibold text-lg mb-1">Give $25, Get $25</h2>
        <p className="text-white/80 text-sm mb-4">
          When a friend signs up with your link and subscribes, you both get $25.
        </p>
        
        <div className="bg-white/10 backdrop-blur rounded-xl p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={data?.link || ''}
              readOnly
              className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 min-w-0"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white text-orange-600 text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors flex-shrink-0"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-white/60">Code: <span className="font-mono">{data?.code}</span></span>
            <button
              onClick={handleShare}
              className="text-xs text-white/80 hover:text-white flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h3 className="font-semibold text-slate-900 mb-4">How it works</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-orange-600">1</div>
            <p className="text-sm text-slate-600 pt-1">Share your unique link with business owners</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-orange-600">2</div>
            <p className="text-sm text-slate-600 pt-1">They get $25 off their first month</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-orange-600">3</div>
            <p className="text-sm text-slate-600 pt-1">You get $25 credit — stackable!</p>
          </div>
        </div>
      </div>

      {/* Your Referrals */}
      {data?.referred && data.referred.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Your Referrals</h3>
          </div>
          {data.referred.map((ref, i) => (
            <div 
              key={i}
              className={`flex items-center justify-between p-4 ${
                i !== data.referred.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                    {(ref.name || ref.email)[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{ref.name || ref.email}</p>
                  <p className="text-xs text-slate-400">{new Date(ref.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="text-green-600 font-semibold text-sm">+${ref.creditAmount || 25}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {(!data?.referred || data.referred.length === 0) && (
        <div className="bg-slate-50 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🚀</span>
          </div>
          <p className="font-medium text-slate-900 mb-1">No referrals yet</p>
          <p className="text-sm text-slate-500 mb-4">Share your link to start earning credits!</p>
          <button
            onClick={handleShare}
            className="px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Share your link
          </button>
        </div>
      )}
    </div>
  )
}
