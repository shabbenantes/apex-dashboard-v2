'use client'

import { useState, useEffect } from 'react'

const defaultSettings = {
  businessName: '',
  businessType: 'service_appointments',
  services: '',
  serviceArea: '',
  businessHours: '',
  phone: '',
  bookingLink: '',
  tone: 'friendly',
  specialInstructions: '',
  businessKnowledge: '',
  escalationName: '',
  escalationEmail: '',
}

const toneOptions = [
  { value: 'friendly', label: 'Friendly & Warm', emoji: '😊' },
  { value: 'professional', label: 'Professional', emoji: '👔' },
  { value: 'luxury', label: 'Luxury & Elevated', emoji: '✨' },
  { value: 'energetic', label: 'Energetic & Fun', emoji: '🔥' },
]

const businessTypes = [
  { value: 'service_appointments', label: 'Services + Appointments' },
  { value: 'service_quotes', label: 'Services + Quotes' },
  { value: 'restaurant', label: 'Restaurant / Food' },
  { value: 'retail', label: 'Retail / Products' },
  { value: 'fitness', label: 'Fitness / Wellness' },
  { value: 'professional', label: 'Professional Services' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { 
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        if (res.ok) {
          const data = await res.json()
          setSettings({ ...defaultSettings, ...data })
          setError(null)
        } else {
          const errorData = await res.json().catch(() => ({}))
          console.error('Settings fetch failed:', res.status, errorData)
          setError('Failed to load settings')
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
        setError('Failed to load settings')
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
    setError(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        credentials: 'same-origin',
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError('Failed to save settings')
      }
    } catch (err) {
      console.error('Failed to save:', err)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Loading your settings...</p>
        </div>
        <div className="card animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">
          Configure your AI assistant's behavior and knowledge.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Business Info Section */}
      <section className="card mb-6 animate-fade-in delay-1">
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">🏢</span> Business Information
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Business Name</label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              className="input"
              placeholder="Your Business Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
            <select
              value={settings.businessType}
              onChange={(e) => handleChange('businessType', e.target.value)}
              className="input"
            >
              {businessTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Services / Products</label>
            <textarea
              value={settings.services}
              onChange={(e) => handleChange('services', e.target.value)}
              className="input min-h-[80px]"
              placeholder="List your main services or products..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Service Area</label>
            <input
              type="text"
              value={settings.serviceArea}
              onChange={(e) => handleChange('serviceArea', e.target.value)}
              className="input"
              placeholder="e.g., Melbourne FL, serving all of Brevard County"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Business Hours</label>
            <textarea
              value={settings.businessHours}
              onChange={(e) => handleChange('businessHours', e.target.value)}
              className="input min-h-[60px]"
              placeholder="e.g., Mon-Fri 9am-6pm, Sat 10am-4pm"
            />
          </div>
        </div>
      </section>

      {/* Contact & Booking Section */}
      <section className="card mb-6 animate-fade-in delay-2">
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">📅</span> Contact & Booking
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Business Phone</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="input"
              placeholder="(321) 555-1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Booking Link</label>
            <input
              type="url"
              value={settings.bookingLink}
              onChange={(e) => handleChange('bookingLink', e.target.value)}
              className="input"
              placeholder="https://calendly.com/yourbusiness"
            />
            <p className="text-gray-500 text-xs mt-1">Calendly, Acuity, or your website booking page</p>
          </div>
        </div>
      </section>

      {/* AI Personality Section */}
      <section className="card mb-6 animate-fade-in delay-3">
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">🎭</span> AI Personality
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Communication Tone</label>
            <div className="grid grid-cols-2 gap-3">
              {toneOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('tone', option.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    settings.tone === option.value
                      ? 'border-apex-purple bg-apex-purple/10'
                      : 'border-apex-border hover:border-apex-purple/50 hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl mr-2">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Special Instructions</label>
            <textarea
              value={settings.specialInstructions}
              onChange={(e) => handleChange('specialInstructions', e.target.value)}
              className="input min-h-[80px]"
              placeholder="e.g., Always mention our new client special. Don't discuss exact pricing."
            />
          </div>
        </div>
      </section>

      {/* Knowledge Base Section */}
      <section className="card mb-6 animate-fade-in">
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">🧠</span> What Your AI Knows
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">FAQ & Business Knowledge</label>
          <textarea
            value={settings.businessKnowledge}
            onChange={(e) => handleChange('businessKnowledge', e.target.value)}
            className="input min-h-[150px]"
            placeholder="Add common questions, pricing info, policies — anything your AI should know to help customers."
          />
          <p className="text-gray-500 text-xs mt-1">One fact per line works best</p>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="card mb-8 animate-fade-in">
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">👤</span> Human Backup
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Escalation Contact Name</label>
            <input
              type="text"
              value={settings.escalationName}
              onChange={(e) => handleChange('escalationName', e.target.value)}
              className="input"
              placeholder="e.g., Sarah (Front Desk)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notification Email</label>
            <input
              type="email"
              value={settings.escalationEmail}
              onChange={(e) => handleChange('escalationEmail', e.target.value)}
              className="input"
              placeholder="sarah@yourbusiness.com"
            />
            <p className="text-gray-500 text-xs mt-1">We'll email here when a conversation needs human attention</p>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {saved && (
            <span className="text-green-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Settings saved!
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
