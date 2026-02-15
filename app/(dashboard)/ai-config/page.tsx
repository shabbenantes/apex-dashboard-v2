'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

// Industry-specific question configurations
const industryQuestions: Record<string, { emoji: string; title: string; questions: { key: string; label: string; placeholder: string; type: 'text' | 'textarea' | 'select'; options?: string[]; hint?: string }[] }> = {
  medspa: {
    emoji: '💉',
    title: 'Med Spa Details',
    questions: [
      { key: 'treatments', label: 'What treatments do you offer?', placeholder: 'Botox, fillers, laser hair removal, facials...', type: 'textarea' },
      { key: 'priceRanges', label: 'Price ranges for popular treatments', placeholder: 'Botox: $10-14/unit, Lip filler: $500-800...', type: 'textarea', hint: 'Helps AI give ballpark quotes' },
      { key: 'consultationRequired', label: 'Do you require consultations?', type: 'select', options: ['Yes, always', 'For some treatments', 'No, book directly'], placeholder: '' },
      { key: 'contraindications', label: 'What should clients know before booking?', placeholder: 'No Botox if pregnant, avoid retinol before peels...', type: 'textarea' },
      { key: 'financing', label: 'Financing available?', type: 'select', options: ['Yes (Cherry, CareCredit, etc.)', 'Payment plans available', 'No'], placeholder: '' },
    ]
  },
  salon: {
    emoji: '💇',
    title: 'Salon Details',
    questions: [
      { key: 'services', label: 'What services do you offer?', placeholder: 'Haircuts, color, balayage, extensions...', type: 'textarea' },
      { key: 'priceRanges', label: 'Price ranges by service', placeholder: "Women's cut: $45-85, Color: $120-200...", type: 'textarea' },
      { key: 'stylistRequests', label: 'Can clients request specific stylists?', type: 'select', options: ['Yes', 'New clients see anyone available', 'No'], placeholder: '' },
      { key: 'walkIns', label: 'Walk-ins accepted?', type: 'select', options: ['Yes, always', 'If available', 'Appointments only'], placeholder: '' },
      { key: 'prepInstructions', label: 'Prep instructions for clients?', placeholder: 'Come with clean, dry hair for color...', type: 'textarea' },
    ]
  },
  fitness: {
    emoji: '🏋️',
    title: 'Fitness Studio Details',
    questions: [
      { key: 'classTypes', label: 'What classes/training do you offer?', placeholder: 'HIIT, yoga, spin, strength training...', type: 'textarea' },
      { key: 'membershipOptions', label: 'Membership options and pricing', placeholder: 'Drop-in: $25, Monthly unlimited: $150...', type: 'textarea' },
      { key: 'firstVisit', label: 'First-time visitor policy', placeholder: 'First class free! Arrive 10min early...', type: 'textarea', hint: 'Key for converting leads' },
      { key: 'whatToBring', label: 'What to bring to first visit?', placeholder: 'Workout clothes, water bottle, towel...', type: 'textarea' },
    ]
  },
  restaurant: {
    emoji: '🍽️',
    title: 'Restaurant Details',
    questions: [
      { key: 'reservationPolicy', label: 'Reservations or walk-in?', type: 'select', options: ['Reservations recommended', 'Reservations required', 'Walk-in only', 'Both welcome'], placeholder: '' },
      { key: 'dietaryOptions', label: 'Dietary accommodations?', placeholder: 'Vegetarian options, gluten-free menu...', type: 'textarea' },
      { key: 'menuHighlights', label: 'Menu highlights or specialties', placeholder: 'Famous for wood-fired pizza, fresh pasta...', type: 'textarea' },
      { key: 'happyHour', label: 'Happy hour or specials?', placeholder: 'Happy hour 4-6pm, Taco Tuesday...', type: 'textarea' },
    ]
  },
  massage: {
    emoji: '💆',
    title: 'Massage & Wellness Details',
    questions: [
      { key: 'modalities', label: 'What massage types do you offer?', placeholder: 'Swedish, deep tissue, hot stone...', type: 'textarea' },
      { key: 'sessionLengths', label: 'Session lengths and pricing', placeholder: '60min: $90, 90min: $130...', type: 'textarea' },
      { key: 'contraindications', label: 'When should someone NOT book?', placeholder: 'Fever, recent surgery, first trimester...', type: 'textarea' },
      { key: 'addOns', label: 'Add-on services?', placeholder: 'Aromatherapy +$10, CBD oil +$15...', type: 'textarea' },
    ]
  },
  professional: {
    emoji: '👔',
    title: 'Professional Services Details',
    questions: [
      { key: 'specialties', label: 'Areas of specialty?', placeholder: 'Family law, estate planning, tax prep...', type: 'textarea' },
      { key: 'consultationType', label: 'Initial consultation format', type: 'select', options: ['Free consultation', 'Paid consultation', 'Free 15min call'], placeholder: '' },
      { key: 'whatToPrepare', label: 'What should clients prepare?', placeholder: 'Bring relevant documents, list of questions...', type: 'textarea' },
      { key: 'feeStructure', label: 'Fee structure', type: 'select', options: ['Hourly', 'Flat fee', 'Retainer', 'Varies by service'], placeholder: '' },
    ]
  },
  homeservices: {
    emoji: '🏠',
    title: 'Home Services Details',
    questions: [
      { key: 'services', label: 'What services do you offer?', placeholder: 'Plumbing, HVAC, electrical...', type: 'textarea' },
      { key: 'serviceArea', label: 'Service area?', placeholder: 'All of Brevard County, 30 mile radius...', type: 'text' },
      { key: 'emergency', label: 'Emergency service available?', type: 'select', options: ['Yes, 24/7', 'For existing customers', 'Weekdays only'], placeholder: '' },
      { key: 'quoteProcess', label: 'How do quotes work?', placeholder: 'Free estimates, $49 service call fee...', type: 'textarea' },
    ]
  },
  coaching: {
    emoji: '🎯',
    title: 'Coaching Details',
    questions: [
      { key: 'specialty', label: 'What type of coaching?', placeholder: 'Business, life, fitness, career...', type: 'textarea' },
      { key: 'format', label: 'Session format', type: 'select', options: ['1-on-1 only', 'Group programs', 'Both', 'Online courses'], placeholder: '' },
      { key: 'programLength', label: 'Program lengths and pricing', placeholder: '6-week program: $997, 3-month: $2500...', type: 'textarea' },
      { key: 'idealClient', label: 'Who is your ideal client?', placeholder: 'Entrepreneurs looking to scale...', type: 'textarea' },
    ]
  },
  realestate: {
    emoji: '🏡',
    title: 'Real Estate Details',
    questions: [
      { key: 'specialty', label: 'What do you specialize in?', placeholder: 'Residential, luxury, first-time buyers...', type: 'textarea' },
      { key: 'areas', label: 'Areas you serve?', placeholder: 'Brevard County, Space Coast...', type: 'text' },
      { key: 'buyerProcess', label: 'Buyer process?', placeholder: 'Free consultation, get pre-approved...', type: 'textarea' },
      { key: 'whyYou', label: 'What makes you different?', placeholder: '15 years experience, 200+ homes sold...', type: 'textarea' },
    ]
  },
  photography: {
    emoji: '📸',
    title: 'Photography Details',
    questions: [
      { key: 'specialty', label: 'What type of photography?', placeholder: 'Wedding, portrait, family, headshots...', type: 'textarea' },
      { key: 'packages', label: 'Package options and pricing', placeholder: 'Mini session: $200, Full session: $400...', type: 'textarea' },
      { key: 'turnaround', label: 'Delivery turnaround time?', placeholder: '2-3 weeks for portraits...', type: 'text' },
      { key: 'whatToWear', label: 'Client prep advice?', placeholder: 'Coordinate colors, avoid logos...', type: 'textarea' },
    ]
  },
}

const businessTypes = [
  { value: 'medspa', label: '💉 Med Spa' },
  { value: 'salon', label: '💇 Salon / Barbershop' },
  { value: 'fitness', label: '🏋️ Fitness / Gym' },
  { value: 'massage', label: '💆 Massage / Spa' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'professional', label: '👔 Professional Services' },
  { value: 'homeservices', label: '🏠 Home Services' },
  { value: 'coaching', label: '🎯 Coaching' },
  { value: 'realestate', label: '🏡 Real Estate' },
  { value: 'photography', label: '📸 Photography' },
  { value: 'other', label: '✨ Other' },
]

const toneOptions = [
  { value: 'friendly', label: 'Friendly & Warm', emoji: '😊', description: 'Casual, approachable' },
  { value: 'professional', label: 'Professional', emoji: '👔', description: 'Polished, courteous' },
  { value: 'luxury', label: 'Luxury', emoji: '✨', description: 'Refined, elegant' },
  { value: 'energetic', label: 'Energetic', emoji: '🔥', description: 'Upbeat, enthusiastic' },
]

export default function AIConfigPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
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
          setSettings(data)
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
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(settings),
      })
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

  const currentIndustry = industryQuestions[settings.businessType || 'salon']

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-8 bg-slate-100 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-8 animate-pulse"></div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
          <div className="h-6 bg-slate-100 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-slate-100 rounded"></div>
            <div className="h-12 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Configuration</h1>
        <p className="text-slate-500">Train your AI assistant to help your customers perfectly.</p>
      </div>

      {/* Business Type */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🏢</span> Business Type
        </h2>
        <select
          value={settings.businessType || 'salon'}
          onChange={(e) => handleChange('businessType', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        >
          {businessTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </section>

      {/* AI Personality */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-xl">🎭</span> AI Personality
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {toneOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange('tone', option.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                settings.tone === option.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:border-orange-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span>{option.emoji}</span>
                <span className="font-medium text-sm text-slate-900">{option.label}</span>
              </div>
              <p className="text-xs text-slate-500">{option.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Industry-Specific Questions */}
      {currentIndustry && (
        <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <span className="text-xl">{currentIndustry.emoji}</span> {currentIndustry.title}
          </h2>
          <p className="text-slate-500 text-sm mb-4">Help your AI give accurate answers.</p>
          
          <div className="space-y-4">
            {currentIndustry.questions.map((q) => (
              <div key={q.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{q.label}</label>
                {q.type === 'textarea' ? (
                  <textarea
                    value={settings[q.key] || ''}
                    onChange={(e) => handleChange(q.key, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-h-[80px] resize-none"
                    placeholder={q.placeholder}
                  />
                ) : q.type === 'select' ? (
                  <select
                    value={settings[q.key] || ''}
                    onChange={(e) => handleChange(q.key, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select...</option>
                    {q.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={settings[q.key] || ''}
                    onChange={(e) => handleChange(q.key, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    placeholder={q.placeholder}
                  />
                )}
                {q.hint && <p className="text-slate-400 text-xs mt-1">{q.hint}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Special Instructions */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span className="text-xl">📝</span> Special Instructions
        </h2>
        <p className="text-slate-500 text-sm mb-4">Rules your AI should always follow.</p>
        <textarea
          value={settings.specialInstructions || ''}
          onChange={(e) => handleChange('specialInstructions', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-h-[100px] resize-none"
          placeholder="Always mention our new client special. Never discuss competitor pricing. Use their first name..."
        />
      </section>

      {/* Extra Knowledge */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span className="text-xl">💡</span> Extra Knowledge
        </h2>
        <p className="text-slate-500 text-sm mb-4">Anything else your AI should know.</p>
        <textarea
          value={settings.additionalInfo || ''}
          onChange={(e) => handleChange('additionalInfo', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-h-[100px] resize-none"
          placeholder="Current promotions, seasonal info, policies..."
        />
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
