'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

// Industry-specific question configurations
const industryQuestions: Record<string, { emoji: string; title: string; questions: { key: string; label: string; placeholder: string; type: 'text' | 'textarea' | 'select'; options?: string[]; hint?: string }[] }> = {
  medspa: {
    emoji: '💉',
    title: 'Med Spa Details',
    questions: [
      { key: 'treatments', label: 'What treatments do you offer?', placeholder: 'Botox, fillers, laser hair removal, facials, chemical peels, microneedling...', type: 'textarea' },
      { key: 'priceRanges', label: 'Price ranges for popular treatments', placeholder: 'Botox: $10-14/unit, Lip filler: $500-800, Facial: $150-250...', type: 'textarea', hint: 'Helps AI give ballpark quotes' },
      { key: 'consultationRequired', label: 'Do you require consultations before treatment?', type: 'select', options: ['Yes, always', 'For some treatments', 'No, book directly'], placeholder: '' },
      { key: 'depositPolicy', label: 'Deposit or cancellation policy?', placeholder: '$50 deposit required, 24hr cancellation notice...', type: 'textarea' },
      { key: 'contraindications', label: 'What should clients know before booking?', placeholder: 'No Botox if pregnant, avoid retinol 3 days before peels, come with clean skin...', type: 'textarea', hint: 'AI will mention these when relevant' },
      { key: 'packages', label: 'Package deals or memberships?', placeholder: 'VIP membership $199/mo includes monthly facial + 20% off injectables...', type: 'textarea' },
      { key: 'financing', label: 'Financing available?', type: 'select', options: ['Yes (Cherry, CareCredit, etc.)', 'Payment plans available', 'No'], placeholder: '' },
    ]
  },
  salon: {
    emoji: '💇',
    title: 'Salon Details',
    questions: [
      { key: 'services', label: 'What services do you offer?', placeholder: 'Haircuts, color, balayage, extensions, blowouts, keratin treatments...', type: 'textarea' },
      { key: 'stylistRequests', label: 'Can clients request specific stylists?', type: 'select', options: ['Yes', 'Yes, but new clients see anyone available', 'No, we assign stylists'], placeholder: '' },
      { key: 'priceRanges', label: 'Price ranges by service', placeholder: "Women's cut: $45-85, Men's cut: $25-40, Full color: $120-200, Balayage: $200-350...", type: 'textarea' },
      { key: 'serviceDurations', label: 'How long do services typically take?', placeholder: 'Haircut: 45min, Color: 2hrs, Balayage: 3-4hrs, Extensions: 2-3hrs...', type: 'textarea' },
      { key: 'walkIns', label: 'Walk-ins accepted?', type: 'select', options: ['Yes, always welcome', 'Yes, if stylists available', 'Appointments only'], placeholder: '' },
      { key: 'depositPolicy', label: 'Deposit or cancellation policy?', placeholder: '$25 deposit for color services, 24hr notice required...', type: 'textarea' },
      { key: 'prepInstructions', label: 'Any prep instructions for clients?', placeholder: 'Come with clean, dry hair for color. No product for keratin treatments...', type: 'textarea' },
      { key: 'parking', label: 'Parking situation?', placeholder: 'Free parking lot behind building, street parking available...', type: 'text' },
    ]
  },
  fitness: {
    emoji: '🏋️',
    title: 'Fitness Studio Details',
    questions: [
      { key: 'classTypes', label: 'What classes or training do you offer?', placeholder: 'HIIT, yoga, spin, strength training, boxing, Pilates...', type: 'textarea' },
      { key: 'membershipOptions', label: 'Membership options and pricing', placeholder: 'Drop-in: $25, 10-class pack: $200, Unlimited monthly: $150...', type: 'textarea' },
      { key: 'personalTraining', label: 'Personal training available?', type: 'select', options: ['Yes', 'Yes, separate from membership', 'No'], placeholder: '' },
      { key: 'firstVisit', label: 'First-time visitor policy', placeholder: 'First class free! Just arrive 10min early to sign waiver...', type: 'textarea', hint: 'This is key for converting leads' },
      { key: 'whatToBring', label: 'What should someone bring to their first visit?', placeholder: 'Workout clothes, water bottle, towel. We have showers and lockers...', type: 'textarea' },
      { key: 'ageRestrictions', label: 'Age restrictions or waiver requirements?', placeholder: 'Must be 16+, under 18 needs parent signature...', type: 'text' },
      { key: 'schedule', label: 'Class schedule highlights', placeholder: 'Classes 6am-8pm weekdays, 8am-2pm weekends. Full schedule at...', type: 'textarea' },
      { key: 'parking', label: 'Parking situation?', placeholder: 'Free lot, street parking, etc.', type: 'text' },
    ]
  },
  restaurant: {
    emoji: '🍽️',
    title: 'Restaurant Details',
    questions: [
      { key: 'reservationPolicy', label: 'Reservations, walk-in, or both?', type: 'select', options: ['Reservations recommended', 'Reservations required', 'Walk-in only', 'Both welcome'], placeholder: '' },
      { key: 'partySize', label: 'Party size limits?', placeholder: 'Up to 8 online, call for larger groups. Private dining for 20+...', type: 'text' },
      { key: 'waitTimes', label: 'Typical wait times?', placeholder: 'Weeknights usually no wait, Friday/Saturday 30-45min without reservation...', type: 'textarea' },
      { key: 'dietaryOptions', label: 'Dietary accommodations?', placeholder: 'Vegetarian options, gluten-free menu available, can accommodate allergies with notice...', type: 'textarea' },
      { key: 'privateEvents', label: 'Private events or buyouts available?', type: 'select', options: ['Yes, private room available', 'Yes, full buyout available', 'No'], placeholder: '' },
      { key: 'menuHighlights', label: 'Menu highlights or specialties', placeholder: 'Famous for our wood-fired pizza, fresh pasta made daily, extensive wine list...', type: 'textarea' },
      { key: 'dressCode', label: 'Dress code?', type: 'select', options: ['Casual', 'Smart casual', 'Business casual', 'Formal'], placeholder: '' },
      { key: 'happyHour', label: 'Happy hour or specials?', placeholder: 'Happy hour 4-6pm weekdays, $5 apps and $8 cocktails. Taco Tuesday...', type: 'textarea' },
    ]
  },
  massage: {
    emoji: '💆',
    title: 'Massage & Wellness Details',
    questions: [
      { key: 'modalities', label: 'What massage/treatment types do you offer?', placeholder: 'Swedish, deep tissue, hot stone, sports massage, prenatal, Thai...', type: 'textarea' },
      { key: 'sessionLengths', label: 'Session lengths and pricing', placeholder: '60min: $90, 90min: $130, 2hr: $170. Couples add $50...', type: 'textarea' },
      { key: 'firstTimeIntake', label: 'First-time client process?', placeholder: 'Arrive 10min early to fill out health intake form...', type: 'textarea' },
      { key: 'whatToWear', label: 'What should clients wear/bring?', placeholder: 'Undress to comfort level, we provide robes and linens. No jewelry...', type: 'textarea' },
      { key: 'contraindications', label: 'When should someone NOT book?', placeholder: 'Fever, contagious illness, recent surgery, first trimester for some treatments...', type: 'textarea', hint: 'AI will screen for these' },
      { key: 'packages', label: 'Package or membership options?', placeholder: 'Monthly membership: 1 massage/mo for $75, 10% off add-ons...', type: 'textarea' },
      { key: 'couples', label: 'Couples massages available?', type: 'select', options: ['Yes', 'Limited availability', 'No'], placeholder: '' },
      { key: 'addOns', label: 'Add-on services?', placeholder: 'Aromatherapy +$10, CBD oil +$15, hot stones +$20...', type: 'textarea' },
    ]
  },
  professional: {
    emoji: '👔',
    title: 'Professional Services Details',
    questions: [
      { key: 'specialties', label: 'Areas of specialty?', placeholder: 'Family law, estate planning, small business... OR Tax prep, bookkeeping, CFO services...', type: 'textarea' },
      { key: 'consultationType', label: 'Initial consultation format', type: 'select', options: ['Free consultation', 'Paid consultation', 'Free 15min call, then paid'], placeholder: '' },
      { key: 'consultationLength', label: 'How long is an initial consultation?', placeholder: '30 minutes, 1 hour, etc.', type: 'text' },
      { key: 'whatToPrepare', label: 'What should clients bring/prepare?', placeholder: 'Bring relevant documents, list of questions, prior tax returns...', type: 'textarea' },
      { key: 'timeline', label: 'Typical engagement timeline?', placeholder: 'Simple will: 2 weeks, tax return: 1-2 weeks, ongoing monthly...', type: 'textarea' },
      { key: 'feeStructure', label: 'Fee structure', type: 'select', options: ['Hourly', 'Flat fee', 'Retainer', 'Varies by service'], placeholder: '' },
      { key: 'priceRanges', label: 'Price ranges (if shareable)', placeholder: 'Simple will: $500-800, Tax prep starts at $200, Hourly rate $150-300...', type: 'textarea', hint: 'Leave blank if you prefer not to share' },
      { key: 'paymentTerms', label: 'Payment terms?', placeholder: '50% upfront, balance on completion. Credit cards accepted...', type: 'textarea' },
    ]
  },
  homeservices: {
    emoji: '🏠',
    title: 'Home Services Details',
    questions: [
      { key: 'services', label: 'What services do you offer?', placeholder: 'Plumbing repair, water heater install, drain cleaning... OR HVAC repair, AC install, maintenance...', type: 'textarea' },
      { key: 'serviceArea', label: 'Service area (zip codes or radius)?', placeholder: 'All of Brevard County, within 30 miles of Melbourne...', type: 'text' },
      { key: 'emergency', label: 'Emergency/after-hours service?', type: 'select', options: ['Yes, 24/7', 'Yes, for existing customers', 'Weekdays only'], placeholder: '' },
      { key: 'quoteProcess', label: 'How do quotes work?', placeholder: 'Free estimates, $49 service call fee (waived if you hire us)...', type: 'textarea' },
      { key: 'leadTime', label: 'Typical lead time for scheduling?', placeholder: 'Same-day for emergencies, usually within 2-3 days for regular work...', type: 'text' },
      { key: 'licensing', label: 'Licensing and insurance?', placeholder: 'Licensed and insured, FL License #CFC12345...', type: 'text', hint: 'Builds trust with leads' },
      { key: 'warranties', label: 'Warranties or guarantees?', placeholder: '1-year labor warranty, manufacturer warranties on parts...', type: 'textarea' },
      { key: 'paymentOptions', label: 'Payment options?', placeholder: 'Cash, check, all major cards. Financing available for large jobs...', type: 'textarea' },
    ]
  },
  coaching: {
    emoji: '🎯',
    title: 'Coaching & Consulting Details',
    questions: [
      { key: 'specialty', label: 'What type of coaching/consulting?', placeholder: 'Business coaching, life coaching, fitness coaching, career coaching...', type: 'textarea' },
      { key: 'format', label: 'Session format', type: 'select', options: ['1-on-1 only', 'Group programs', 'Both 1-on-1 and group', 'Online courses'], placeholder: '' },
      { key: 'discoveryCall', label: 'Discovery/intro call process?', placeholder: 'Free 20min discovery call to see if we are a good fit...', type: 'textarea' },
      { key: 'programLength', label: 'Program lengths and pricing', placeholder: '6-week program: $997, 3-month coaching: $2500, VIP day: $1500...', type: 'textarea' },
      { key: 'results', label: 'What results can clients expect?', placeholder: 'Clients typically see X within Y weeks, average outcome...', type: 'textarea', hint: 'Helps AI sell the value' },
      { key: 'idealClient', label: 'Who is your ideal client?', placeholder: 'Entrepreneurs making $100k+ looking to scale, women in career transitions...', type: 'textarea' },
      { key: 'meetingPlatform', label: 'How do sessions happen?', placeholder: 'Zoom calls, in-person in Orlando, hybrid...', type: 'text' },
      { key: 'paymentPlans', label: 'Payment plans available?', type: 'select', options: ['Yes', 'For programs over $X', 'No'], placeholder: '' },
    ]
  },
  realestate: {
    emoji: '🏡',
    title: 'Real Estate Details',
    questions: [
      { key: 'specialty', label: 'What do you specialize in?', placeholder: 'Residential, luxury, first-time buyers, investment properties, commercial...', type: 'textarea' },
      { key: 'areas', label: 'Areas you serve?', placeholder: 'Brevard County, Space Coast, Melbourne, Palm Bay...', type: 'text' },
      { key: 'buyerProcess', label: 'How does working with a buyer start?', placeholder: 'Free buyer consultation, get pre-approved, start touring homes...', type: 'textarea' },
      { key: 'sellerProcess', label: 'How does listing a home work?', placeholder: 'Free home valuation, professional photos included, average 30 days to sell...', type: 'textarea' },
      { key: 'commission', label: 'Commission structure?', placeholder: 'Standard commission, negotiable for certain situations...', type: 'text', hint: 'Leave blank to not discuss' },
      { key: 'availability', label: 'Showing availability?', placeholder: 'Available 7 days a week, evening showings no problem...', type: 'text' },
      { key: 'whyYou', label: 'What makes you different?', placeholder: '15 years experience, 200+ homes sold, local expert...', type: 'textarea' },
    ]
  },
  photography: {
    emoji: '📸',
    title: 'Photography Details',
    questions: [
      { key: 'specialty', label: 'What type of photography?', placeholder: 'Wedding, portrait, family, newborn, commercial, headshots...', type: 'textarea' },
      { key: 'packages', label: 'Package options and pricing', placeholder: 'Mini session: $200 (30min, 10 images), Full session: $400 (1hr, 25 images)...', type: 'textarea' },
      { key: 'locations', label: 'Where do you shoot?', placeholder: 'Studio in Melbourne, on-location anywhere in Brevard, travel available...', type: 'textarea' },
      { key: 'turnaround', label: 'Delivery turnaround time?', placeholder: '2-3 weeks for portraits, 6-8 weeks for weddings...', type: 'text' },
      { key: 'deposit', label: 'Booking deposit required?', placeholder: '50% deposit to book, balance due before session...', type: 'text' },
      { key: 'whatToWear', label: 'What should clients wear/bring?', placeholder: 'Coordinate colors (not match), avoid logos, outfit changes welcome...', type: 'textarea' },
      { key: 'prints', label: 'Prints and products?', placeholder: 'Digital files included, prints and albums available separately...', type: 'textarea' },
    ]
  },
}

const businessTypes = [
  { value: 'medspa', label: '💉 Med Spa / Aesthetics' },
  { value: 'salon', label: '💇 Salon / Barbershop' },
  { value: 'fitness', label: '🏋️ Fitness / Gym / Studio' },
  { value: 'massage', label: '💆 Massage / Spa / Wellness' },
  { value: 'restaurant', label: '🍽️ Restaurant / Bar' },
  { value: 'professional', label: '👔 Professional Services (Legal, Accounting)' },
  { value: 'homeservices', label: '🏠 Home Services (Plumbing, HVAC, etc.)' },
  { value: 'coaching', label: '🎯 Coaching / Consulting' },
  { value: 'realestate', label: '🏡 Real Estate' },
  { value: 'photography', label: '📸 Photography / Videography' },
  { value: 'other', label: '✨ Other' },
]

const toneOptions = [
  { value: 'friendly', label: 'Friendly & Warm', emoji: '😊', description: 'Casual, approachable, uses emoji occasionally' },
  { value: 'professional', label: 'Professional', emoji: '👔', description: 'Polished and courteous, no slang' },
  { value: 'luxury', label: 'Luxury & Elevated', emoji: '✨', description: 'Refined, elegant language' },
  { value: 'energetic', label: 'Energetic & Fun', emoji: '🔥', description: 'Upbeat, enthusiastic, exclamation points!' },
]

const defaultSettings: Record<string, string> = {
  businessName: '',
  businessType: 'salon',
  serviceArea: '',
  businessHours: '',
  phone: '',
  bookingLink: '',
  tone: 'friendly',
  specialInstructions: '',
  additionalInfo: '',
  escalationName: '',
  escalationEmail: '',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = ApexSession.getToken()
        const res = await fetch('/api/settings', { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
        })
        if (res.ok) {
          const data = await res.json()
          setSettings({ ...defaultSettings, ...data })
          setError(null)
        } else {
          console.error('Settings fetch failed:', res.status)
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
      const token = ApexSession.getToken()
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(settings),
        cache: 'no-store',
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

  const currentIndustry = industryQuestions[settings.businessType]

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold mb-2">AI Configuration</h1>
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
        <h1 className="font-display text-3xl font-bold mb-2">AI Configuration</h1>
        <p className="text-gray-400">
          Tell your AI everything it needs to know to help your customers.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Business Basics */}
      <section className="card mb-6 animate-fade-in">
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">🏢</span> Business Basics
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
            <label className="block text-sm font-medium text-gray-300 mb-2">What type of business?</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Location / Service Area</label>
              <input
                type="text"
                value={settings.serviceArea}
                onChange={(e) => handleChange('serviceArea', e.target.value)}
                className="input"
                placeholder="Melbourne, FL"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Business Hours</label>
            <textarea
              value={settings.businessHours}
              onChange={(e) => handleChange('businessHours', e.target.value)}
              className="input min-h-[60px]"
              placeholder="Mon-Fri 9am-6pm, Sat 10am-4pm, Closed Sunday"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Booking / Appointment Link</label>
            <input
              type="url"
              value={settings.bookingLink}
              onChange={(e) => handleChange('bookingLink', e.target.value)}
              className="input"
              placeholder="https://calendly.com/yourbusiness or your booking page"
            />
            <p className="text-gray-500 text-xs mt-1">AI will share this when customers want to book</p>
          </div>
        </div>
      </section>

      {/* Industry-Specific Questions */}
      {currentIndustry && (
        <section className="card mb-6 animate-fade-in">
          <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
            <span className="text-2xl">{currentIndustry.emoji}</span> {currentIndustry.title}
          </h2>
          <p className="text-gray-400 text-sm mb-6">These questions help your AI give accurate, helpful responses.</p>
          
          <div className="space-y-5">
            {currentIndustry.questions.map((q) => (
              <div key={q.key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">{q.label}</label>
                {q.type === 'textarea' ? (
                  <textarea
                    value={settings[q.key] || ''}
                    onChange={(e) => handleChange(q.key, e.target.value)}
                    className="input min-h-[80px]"
                    placeholder={q.placeholder}
                  />
                ) : q.type === 'select' ? (
                  <select
                    value={settings[q.key] || ''}
                    onChange={(e) => handleChange(q.key, e.target.value)}
                    className="input"
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
                    className="input"
                    placeholder={q.placeholder}
                  />
                )}
                {q.hint && <p className="text-gray-500 text-xs mt-1">{q.hint}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* "Other" business type - freeform */}
      {settings.businessType === 'other' && (
        <section className="card mb-6 animate-fade-in">
          <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
            <span className="text-2xl">✨</span> Your Business Details
          </h2>
          <p className="text-gray-400 text-sm mb-6">Tell your AI everything it needs to know.</p>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">What services/products do you offer?</label>
              <textarea
                value={settings.services || ''}
                onChange={(e) => handleChange('services', e.target.value)}
                className="input min-h-[100px]"
                placeholder="Describe what you offer..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pricing information</label>
              <textarea
                value={settings.pricing || ''}
                onChange={(e) => handleChange('pricing', e.target.value)}
                className="input min-h-[80px]"
                placeholder="Share price ranges, packages, or how pricing works..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Common customer questions</label>
              <textarea
                value={settings.faqs || ''}
                onChange={(e) => handleChange('faqs', e.target.value)}
                className="input min-h-[100px]"
                placeholder="What do customers usually ask? Add answers too..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Anything else your AI should know?</label>
              <textarea
                value={settings.additionalInfo || ''}
                onChange={(e) => handleChange('additionalInfo', e.target.value)}
                className="input min-h-[100px]"
                placeholder="Policies, special offers, things to avoid saying..."
              />
            </div>
          </div>
        </section>
      )}

      {/* AI Personality */}
      <section className="card mb-6 animate-fade-in">
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">🎭</span> AI Personality
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Communication Style</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{option.emoji}</span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-xs text-gray-400">{option.description}</p>
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
              placeholder="e.g., Always mention our new client special. Never discuss competitor pricing. Use their first name..."
            />
            <p className="text-gray-500 text-xs mt-1">Rules your AI should always follow</p>
          </div>
        </div>
      </section>

      {/* Additional Info (for all types) */}
      <section className="card mb-6 animate-fade-in">
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">💡</span> Extra Knowledge
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Anything else your AI should know?</label>
          <textarea
            value={settings.additionalInfo}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            className="input min-h-[100px]"
            placeholder="Current promotions, seasonal info, things that didn't fit above..."
          />
        </div>
      </section>

      {/* Human Backup */}
      <section className="card mb-8 animate-fade-in">
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <span className="text-2xl">👤</span> Human Backup
        </h2>
        <p className="text-gray-400 text-sm mb-4">When someone asks something the AI can't handle, we'll notify this person.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contact Name</label>
            <input
              type="text"
              value={settings.escalationName}
              onChange={(e) => handleChange('escalationName', e.target.value)}
              className="input"
              placeholder="e.g., Sarah (Front Desk)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email for Notifications</label>
            <input
              type="email"
              value={settings.escalationEmail}
              onChange={(e) => handleChange('escalationEmail', e.target.value)}
              className="input"
              placeholder="sarah@yourbusiness.com"
            />
          </div>
        </div>
      </section>

      {/* Save Button - Sticky */}
      <div className="sticky bottom-4 bg-apex-dark/80 backdrop-blur-sm p-4 -mx-4 rounded-xl border border-apex-border">
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
    </div>
  )
}
