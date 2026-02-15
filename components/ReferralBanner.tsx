'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

interface ReferralData {
  code: string
  link: string
  referred: { email: string; name: string; date: number }[]
  referredCount: number
  creditsEarned: number
  creditsAvailable: number
}

export default function ReferralBanner() {
  const [copied, setCopied] = useState(false)
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  
  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    const token = ApexSession.getToken()
    const session = ApexSession.get()
    if (!token || !session?.email) {
      setLoading(false)
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
      const res = await fetch(`${API_URL}/referrals/${encodeURIComponent(session.email)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
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

  // Fallback data if API not available
  const session = ApexSession.get()
  const referralCode = data?.code || (session?.email 
    ? btoa(session.email).slice(0, 8).toUpperCase()
    : 'APEX25')
  const referralLink = data?.link || `https://getapexautomation.com?ref=${referralCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Get $25 off Apex Automation',
          text: 'I use Apex to automatically respond to my Facebook and Instagram DMs. Use my link to get $25 off your first month!',
          url: referralLink
        })
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
      {/* Main Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎁</span>
            <h3 className="text-lg font-semibold">Give $25, Get $25</h3>
          </div>
          <p className="text-white/80 text-sm">
            Refer a friend to Apex. When they subscribe, you both get $25 off.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 w-full sm:w-auto min-w-0"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-white/90 transition-all text-sm whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span>Code: <span className="font-mono font-medium text-white/80">{referralCode}</span></span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row (if they have referrals) */}
      {!loading && data && (data.referredCount > 0 || data.creditsAvailable > 0) && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <div>
                <div className="text-2xl font-bold">{data.referredCount}</div>
                <div className="text-xs text-white/60">Friends referred</div>
              </div>
              <div>
                <div className="text-2xl font-bold">${data.creditsEarned}</div>
                <div className="text-xs text-white/60">Credits earned</div>
              </div>
              {data.creditsAvailable > 0 && (
                <div>
                  <div className="text-2xl font-bold text-green-200">${data.creditsAvailable}</div>
                  <div className="text-xs text-white/60">Available</div>
                </div>
              )}
            </div>
            {data.referredCount > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1"
              >
                {expanded ? 'Hide' : 'View'} details
                <svg 
                  className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Expanded referral list */}
          {expanded && data.referred && data.referred.length > 0 && (
            <div className="mt-4 space-y-2">
              {data.referred.map((ref, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 text-sm"
                >
                  <span>{ref.name || ref.email}</span>
                  <span className="text-white/60">
                    {new Date(ref.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How it works (collapsed by default) */}
      <details className="mt-4 pt-4 border-t border-white/20">
        <summary className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors">
          How it works
        </summary>
        <div className="mt-3 grid gap-3 text-sm text-white/80">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
            <p>Share your unique link with business owners who could use AI for their DMs</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
            <p>They sign up and get $25 off their first month</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
            <p>You get $25 credit toward your next bill (stackable!)</p>
          </div>
        </div>
      </details>
    </div>
  )
}
