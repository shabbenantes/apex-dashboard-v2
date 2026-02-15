'use client'

import { useState } from 'react'
import { ApexSession } from '@/lib/session'

export default function ReferralBanner() {
  const [copied, setCopied] = useState(false)
  const session = ApexSession.get()
  
  // Generate referral link based on email
  const referralCode = session?.email 
    ? btoa(session.email).slice(0, 8).toUpperCase()
    : 'APEX25'
  const referralLink = `https://getapexautomation.com?ref=${referralCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-6 text-white">
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
              className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 w-full sm:w-auto"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-white/90 transition-all text-sm whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-white/60 text-xs">Your code: {referralCode}</p>
        </div>
      </div>
    </div>
  )
}
