'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

export default function BusinessPage() {
  const [settings, setSettings] = useState({
    businessName: '',
    phone: '',
    serviceArea: '',
    businessHours: '',
    bookingLink: '',
    escalationName: '',
    escalationEmail: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = ApexSession.getToken()
        const res = await fetch('/api/settings', { 
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          setSettings(prev => ({ ...prev, ...data }))
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = ApexSession.getToken()
      const session = ApexSession.get()
      
      // Update settings
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(settings),
      })
      
      // Also update the session business name if changed
      if (session && settings.businessName && settings.businessName !== session.businessName) {
        ApexSession.save({
          ...session,
          businessName: settings.businessName
        })
      }
      
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-8 bg-slate-100 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-8 animate-pulse"></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
          <div className="h-12 bg-slate-100 rounded mb-4"></div>
          <div className="h-12 bg-slate-100 rounded mb-4"></div>
          <div className="h-12 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Business Details</h1>
        <p className="text-slate-500">Your business info that appears in AI responses.</p>
      </div>

      {/* Basic Info */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🏢</span> Basic Information
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Name</label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Your Business Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="(321) 555-1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Location / Service Area</label>
            <input
              type="text"
              value={settings.serviceArea}
              onChange={(e) => handleChange('serviceArea', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Melbourne, FL"
            />
          </div>
        </div>
      </section>

      {/* Hours & Booking */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🕐</span> Hours & Booking
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Hours</label>
            <textarea
              value={settings.businessHours}
              onChange={(e) => handleChange('businessHours', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-h-[80px] resize-none"
              placeholder="Mon-Fri 9am-6pm&#10;Sat 10am-4pm&#10;Sunday Closed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Booking Link</label>
            <input
              type="url"
              value={settings.bookingLink}
              onChange={(e) => handleChange('bookingLink', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="https://calendly.com/yourbusiness"
            />
            <p className="text-slate-400 text-xs mt-1">AI will share this when customers want to book</p>
          </div>
        </div>
      </section>

      {/* Human Backup */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span className="text-xl">👤</span> Human Backup
        </h2>
        <p className="text-slate-500 text-sm mb-4">When AI can't help, we'll notify this person.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Name</label>
            <input
              type="text"
              value={settings.escalationName}
              onChange={(e) => handleChange('escalationName', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Sarah (Front Desk)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={settings.escalationEmail}
              onChange={(e) => handleChange('escalationEmail', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="sarah@yourbusiness.com"
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-auto">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full lg:w-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : saved ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  )
}
