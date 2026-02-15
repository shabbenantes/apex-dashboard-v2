'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'

// Industry configurations with specific fields
const industryConfigs: Record<string, {
  emoji: string
  title: string
  description: string
  sections: {
    title: string
    emoji: string
    fields: {
      key: string
      label: string
      type: 'text' | 'textarea' | 'select' | 'list'
      placeholder?: string
      hint?: string
      options?: string[]
      listFields?: { key: string; label: string; placeholder: string }[]
    }[]
  }[]
}> = {
  realestate: {
    emoji: '🏡',
    title: 'Real Estate',
    description: 'Help buyers and sellers find their perfect match',
    sections: [
      {
        title: 'Your Specialty',
        emoji: '🎯',
        fields: [
          { key: 'specialty', label: 'What do you specialize in?', type: 'textarea', placeholder: 'Residential homes, luxury properties, first-time buyers, investment properties, waterfront homes...' },
          { key: 'areas', label: 'Areas you serve', type: 'text', placeholder: 'Brevard County, Melbourne, Palm Bay, Viera...' },
          { key: 'experience', label: 'Experience & credentials', type: 'textarea', placeholder: '15 years experience, 200+ homes sold, Top producer 2024, Certified Luxury Home Specialist...' },
        ]
      },
      {
        title: 'Active Listings',
        emoji: '🏠',
        fields: [
          { 
            key: 'listings', 
            label: 'Your current listings', 
            type: 'list',
            hint: 'Add each active listing. AI will share these with interested buyers.',
            listFields: [
              { key: 'address', label: 'Address', placeholder: '123 Palm Beach Dr, Melbourne' },
              { key: 'price', label: 'Price', placeholder: '$450,000' },
              { key: 'beds', label: 'Beds/Baths', placeholder: '3 bed / 2 bath' },
              { key: 'sqft', label: 'Sq Ft', placeholder: '1,850' },
              { key: 'highlights', label: 'Key features', placeholder: 'Pool, updated kitchen, corner lot' },
              { key: 'link', label: 'Listing URL', placeholder: 'https://zillow.com/...' },
            ]
          },
        ]
      },
      {
        title: 'Buyer Process',
        emoji: '🔑',
        fields: [
          { key: 'buyerProcess', label: 'How does working with a buyer start?', type: 'textarea', placeholder: 'Free consultation to understand needs, get pre-approved with my preferred lender, start touring homes...' },
          { key: 'preApproval', label: 'Pre-approval requirements?', type: 'select', options: ['Required before touring', 'Recommended but not required', 'Not required'] },
          { key: 'showingAvailability', label: 'Showing availability', type: 'text', placeholder: 'Available 7 days a week, evening showings no problem' },
        ]
      },
      {
        title: 'Seller Process', 
        emoji: '📋',
        fields: [
          { key: 'sellerProcess', label: 'How does listing a home work?', type: 'textarea', placeholder: 'Free home valuation, professional photos included, average 30 days on market in this area...' },
          { key: 'listingPackage', label: 'What\'s included in your listing service?', type: 'textarea', placeholder: 'Professional photography, drone shots, virtual tour, staging consultation, open houses...' },
        ]
      },
    ]
  },
  medspa: {
    emoji: '💉',
    title: 'Med Spa',
    description: 'Book treatments and answer aesthetic questions',
    sections: [
      {
        title: 'Treatment Menu',
        emoji: '💎',
        fields: [
          { key: 'treatments', label: 'What treatments do you offer?', type: 'textarea', placeholder: 'Botox, Dysport, lip fillers, cheek fillers, laser hair removal, chemical peels, microneedling, facials, body contouring...' },
          { key: 'popularTreatments', label: 'Most popular treatments', type: 'text', placeholder: 'Botox, lip filler, hydrafacial' },
          { key: 'pricing', label: 'Pricing info', type: 'textarea', placeholder: 'Botox: $10-14/unit, Lip filler: $500-800, Facial: $150-250...', hint: 'AI will share ranges when asked' },
        ]
      },
      {
        title: 'Booking & Consultations',
        emoji: '📅',
        fields: [
          { key: 'consultationRequired', label: 'Consultation requirements', type: 'select', options: ['Required for all treatments', 'Required for injectables only', 'Recommended but not required', 'Not required'] },
          { key: 'consultationInfo', label: 'About your consultations', type: 'textarea', placeholder: 'Free 15-minute consultation, can be done same day as treatment if schedule allows...' },
          { key: 'depositPolicy', label: 'Deposit/cancellation policy', type: 'textarea', placeholder: '$50 deposit for appointments over $200, 24hr cancellation notice, deposit applied to treatment...' },
        ]
      },
      {
        title: 'Safety & Expectations',
        emoji: '⚠️',
        fields: [
          { key: 'contraindications', label: 'Who should NOT book certain treatments?', type: 'textarea', placeholder: 'No Botox if pregnant/breastfeeding, avoid retinol 3 days before peels, no laser on tanned skin...', hint: 'AI will screen for these' },
          { key: 'expectations', label: 'What should clients expect?', type: 'textarea', placeholder: 'Botox results in 3-7 days, filler swelling for 24-48hrs, no makeup for 4hrs after facial...' },
        ]
      },
      {
        title: 'Specials & Financing',
        emoji: '💰',
        fields: [
          { key: 'newClientSpecial', label: 'New client special?', type: 'text', placeholder: '20% off first treatment, free consultation...' },
          { key: 'memberships', label: 'Membership or packages?', type: 'textarea', placeholder: 'VIP membership $199/mo includes monthly facial + 20% off injectables...' },
          { key: 'financing', label: 'Financing available?', type: 'select', options: ['Yes - Cherry, CareCredit accepted', 'Yes - payment plans available', 'No financing options'] },
        ]
      },
    ]
  },
  salon: {
    emoji: '💇',
    title: 'Salon',
    description: 'Book appointments and match clients with stylists',
    sections: [
      {
        title: 'Services',
        emoji: '✂️',
        fields: [
          { key: 'services', label: 'Services offered', type: 'textarea', placeholder: 'Haircuts, color, balayage, highlights, extensions, keratin, blowouts, updos, beard trims...' },
          { key: 'pricing', label: 'Pricing', type: 'textarea', placeholder: "Women's cut: $45-85, Men's cut: $25-40, Full color: $120-200, Balayage: $200-350..." },
          { key: 'durations', label: 'Service durations', type: 'textarea', placeholder: 'Haircut: 45min, Color: 2hrs, Balayage: 3-4hrs, Extensions: 2-3hrs...' },
        ]
      },
      {
        title: 'Stylists',
        emoji: '👩‍🎨',
        fields: [
          { key: 'stylistRequests', label: 'Can clients request specific stylists?', type: 'select', options: ['Yes', 'Yes, but new clients see anyone available', 'No, we assign stylists'] },
          { key: 'stylists', label: 'Stylist info (optional)', type: 'textarea', placeholder: 'Sarah - color specialist, 10 yrs exp. Mike - men\'s cuts & fades. Jessica - extensions & balayage...', hint: 'AI can recommend stylists based on service' },
        ]
      },
      {
        title: 'Appointments',
        emoji: '📅',
        fields: [
          { key: 'walkIns', label: 'Walk-ins accepted?', type: 'select', options: ['Yes, always welcome', 'Yes, if stylists available', 'Appointments preferred', 'Appointments only'] },
          { key: 'depositPolicy', label: 'Deposit/cancellation policy', type: 'textarea', placeholder: '$25 deposit for color services, 24hr cancellation notice required...' },
          { key: 'prepInstructions', label: 'Prep instructions', type: 'textarea', placeholder: 'Come with clean, dry hair for color. No product for keratin. Bring photos of styles you like...' },
        ]
      },
    ]
  },
  fitness: {
    emoji: '🏋️',
    title: 'Fitness / Gym',
    description: 'Sign up members and answer class questions',
    sections: [
      {
        title: 'Classes & Training',
        emoji: '🏃',
        fields: [
          { key: 'classTypes', label: 'Classes or training offered', type: 'textarea', placeholder: 'HIIT, yoga, spin, strength training, boxing, Pilates, CrossFit, Zumba...' },
          { key: 'schedule', label: 'Schedule highlights', type: 'textarea', placeholder: 'Classes 6am-8pm weekdays, 8am-2pm weekends. Most popular: 6am HIIT, 12pm yoga, 5:30pm spin...' },
          { key: 'personalTraining', label: 'Personal training?', type: 'select', options: ['Yes, included in membership', 'Yes, additional cost', 'Not offered'] },
        ]
      },
      {
        title: 'Memberships',
        emoji: '💳',
        fields: [
          { key: 'membershipOptions', label: 'Membership options', type: 'textarea', placeholder: 'Drop-in: $25, 10-class pack: $200, Unlimited monthly: $150, Annual: $1,200...' },
          { key: 'commitment', label: 'Contract requirements?', type: 'select', options: ['No contract - cancel anytime', 'Month-to-month after 3 months', '6-month minimum', '12-month minimum'] },
        ]
      },
      {
        title: 'First Visit',
        emoji: '👋',
        fields: [
          { key: 'firstVisit', label: 'First-time visitor offer', type: 'textarea', placeholder: 'First class FREE! Just show up 10min early to sign waiver and get a tour...', hint: 'This is key for converting leads' },
          { key: 'whatToBring', label: 'What to bring', type: 'textarea', placeholder: 'Workout clothes, water bottle, towel. We have showers, lockers, and towels available...' },
          { key: 'ageRequirements', label: 'Age/waiver requirements', type: 'text', placeholder: 'Must be 16+, under 18 needs parent signature' },
        ]
      },
    ]
  },
  restaurant: {
    emoji: '🍽️',
    title: 'Restaurant',
    description: 'Handle reservations and answer menu questions',
    sections: [
      {
        title: 'Reservations',
        emoji: '📅',
        fields: [
          { key: 'reservationPolicy', label: 'Reservation policy', type: 'select', options: ['Reservations required', 'Reservations recommended', 'Walk-in only', 'Both welcome'] },
          { key: 'reservationSystem', label: 'How to book', type: 'text', placeholder: 'OpenTable, Resy, call us, or DM to reserve...' },
          { key: 'partySize', label: 'Party size limits', type: 'text', placeholder: 'Up to 8 online, call for larger groups. Private dining for 20+...' },
          { key: 'waitTimes', label: 'Typical wait times', type: 'textarea', placeholder: 'Weeknights usually no wait, Fri/Sat 30-45min without reservation...' },
        ]
      },
      {
        title: 'Menu & Specials',
        emoji: '🍕',
        fields: [
          { key: 'menuHighlights', label: 'Menu highlights', type: 'textarea', placeholder: 'Famous for wood-fired pizza, fresh pasta made daily, extensive wine list, craft cocktails...' },
          { key: 'dietaryOptions', label: 'Dietary accommodations', type: 'textarea', placeholder: 'Vegetarian options, gluten-free menu, vegan dishes available, can accommodate allergies with notice...' },
          { key: 'happyHour', label: 'Happy hour/specials', type: 'textarea', placeholder: 'Happy hour 4-6pm weekdays: $5 apps, $8 cocktails. Taco Tuesday, Wine Wednesday half-price bottles...' },
        ]
      },
      {
        title: 'Events & Info',
        emoji: '🎉',
        fields: [
          { key: 'privateEvents', label: 'Private events?', type: 'select', options: ['Private room available', 'Full buyout available', 'Both options', 'Not available'] },
          { key: 'dressCode', label: 'Dress code', type: 'select', options: ['Casual', 'Smart casual', 'Business casual', 'Formal', 'No dress code'] },
        ]
      },
    ]
  },
  massage: {
    emoji: '💆',
    title: 'Massage / Spa',
    description: 'Book treatments and explain services',
    sections: [
      {
        title: 'Services',
        emoji: '🧘',
        fields: [
          { key: 'modalities', label: 'Massage/treatment types', type: 'textarea', placeholder: 'Swedish, deep tissue, hot stone, sports massage, prenatal, Thai, reflexology, aromatherapy...' },
          { key: 'pricing', label: 'Session lengths and pricing', type: 'textarea', placeholder: '60min: $90, 90min: $130, 2hr: $170. Couples add $50. Hot stone add $20...' },
          { key: 'addOns', label: 'Add-on services', type: 'textarea', placeholder: 'Aromatherapy +$10, CBD oil +$15, hot stones +$20, scalp massage +$10...' },
        ]
      },
      {
        title: 'Booking',
        emoji: '📅',
        fields: [
          { key: 'couplesAvailable', label: 'Couples massages?', type: 'select', options: ['Yes, always available', 'Limited availability - book ahead', 'Not offered'] },
          { key: 'firstTimeProcess', label: 'First-time client process', type: 'textarea', placeholder: 'Arrive 10min early to fill out health intake form. We provide robes and linens. Undress to your comfort level...' },
          { key: 'packages', label: 'Packages or memberships', type: 'textarea', placeholder: 'Monthly membership: 1 massage/mo for $75 (save $15), 10% off add-ons. 5-pack: $400 (save $50)...' },
        ]
      },
      {
        title: 'Health & Safety',
        emoji: '⚠️',
        fields: [
          { key: 'contraindications', label: 'When should someone NOT book?', type: 'textarea', placeholder: 'Fever, contagious illness, recent surgery, blood clots, first trimester (for some treatments)...', hint: 'AI will screen for these' },
          { key: 'whatToWear', label: 'What to wear/bring', type: 'textarea', placeholder: 'Wear comfortable clothes. Undress to your comfort level - we provide sheets. No jewelry...' },
        ]
      },
    ]
  },
  professional: {
    emoji: '👔',
    title: 'Professional Services',
    description: 'Book consultations and explain your services',
    sections: [
      {
        title: 'Your Practice',
        emoji: '📋',
        fields: [
          { key: 'specialties', label: 'Areas of specialty', type: 'textarea', placeholder: 'Family law, estate planning, business formation... OR Tax prep, bookkeeping, CFO services...' },
          { key: 'credentials', label: 'Credentials/experience', type: 'textarea', placeholder: '15 years experience, licensed CPA, member of State Bar, Harvard Law...' },
        ]
      },
      {
        title: 'Consultations',
        emoji: '🤝',
        fields: [
          { key: 'consultationType', label: 'Initial consultation', type: 'select', options: ['Free consultation', 'Free 15-minute call', 'Paid consultation', 'Varies by service'] },
          { key: 'consultationLength', label: 'Consultation length', type: 'text', placeholder: '30 minutes, 1 hour, etc.' },
          { key: 'whatToPrepare', label: 'What clients should prepare', type: 'textarea', placeholder: 'Bring relevant documents, list of questions, prior tax returns, ID...' },
        ]
      },
      {
        title: 'Fees & Timeline',
        emoji: '💰',
        fields: [
          { key: 'feeStructure', label: 'Fee structure', type: 'select', options: ['Hourly', 'Flat fee', 'Retainer', 'Varies by service', 'Prefer not to share'] },
          { key: 'priceRanges', label: 'Price ranges (optional)', type: 'textarea', placeholder: 'Simple will: $500-800, Tax prep starts at $200, Hourly rate $150-300...', hint: 'Leave blank to not discuss pricing' },
          { key: 'timeline', label: 'Typical timelines', type: 'textarea', placeholder: 'Simple will: 2 weeks, Tax return: 1-2 weeks, Ongoing retainer: monthly meetings...' },
        ]
      },
    ]
  },
  homeservices: {
    emoji: '🏠',
    title: 'Home Services',
    description: 'Schedule service calls and answer questions',
    sections: [
      {
        title: 'Services',
        emoji: '🔧',
        fields: [
          { key: 'services', label: 'Services offered', type: 'textarea', placeholder: 'Plumbing repair, water heater install, drain cleaning, leak detection... OR HVAC repair, AC install, maintenance...' },
          { key: 'serviceArea', label: 'Service area', type: 'text', placeholder: 'All of Brevard County, within 30 miles of Melbourne...' },
          { key: 'licensing', label: 'Licensing & insurance', type: 'text', placeholder: 'Licensed & insured, FL License #CFC12345...', hint: 'Builds trust with leads' },
        ]
      },
      {
        title: 'Scheduling',
        emoji: '📅',
        fields: [
          { key: 'emergency', label: 'Emergency/after-hours?', type: 'select', options: ['Yes, 24/7 emergency service', 'Yes, for existing customers', 'Weekdays only', 'No emergency service'] },
          { key: 'leadTime', label: 'Typical scheduling', type: 'text', placeholder: 'Same-day for emergencies, usually within 2-3 days for regular work...' },
          { key: 'quoteProcess', label: 'Quote process', type: 'textarea', placeholder: 'Free estimates, $49 service call fee (waived if you hire us), quotes valid for 30 days...' },
        ]
      },
      {
        title: 'Guarantees',
        emoji: '✅',
        fields: [
          { key: 'warranties', label: 'Warranties/guarantees', type: 'textarea', placeholder: '1-year labor warranty, manufacturer warranties on parts, satisfaction guaranteed...' },
          { key: 'paymentOptions', label: 'Payment options', type: 'textarea', placeholder: 'Cash, check, all major cards. Financing available for jobs over $1,000...' },
        ]
      },
    ]
  },
  coaching: {
    emoji: '🎯',
    title: 'Coaching / Consulting',
    description: 'Book discovery calls and explain your programs',
    sections: [
      {
        title: 'Your Coaching',
        emoji: '🌟',
        fields: [
          { key: 'specialty', label: 'What type of coaching?', type: 'textarea', placeholder: 'Business coaching for entrepreneurs, executive coaching, life coaching, fitness coaching, career transitions...' },
          { key: 'idealClient', label: 'Who is your ideal client?', type: 'textarea', placeholder: 'Entrepreneurs making $100k+ looking to scale, women in career transitions, executives wanting work-life balance...', hint: 'AI can qualify leads based on this' },
          { key: 'results', label: 'What results do clients get?', type: 'textarea', placeholder: 'Clients typically double their revenue in 6 months, lose 20lbs in 90 days, get promoted within 3 months...' },
        ]
      },
      {
        title: 'Programs',
        emoji: '📦',
        fields: [
          { key: 'format', label: 'Coaching format', type: 'select', options: ['1-on-1 only', 'Group programs only', 'Both 1-on-1 and group', 'Online courses + coaching'] },
          { key: 'programs', label: 'Program options and pricing', type: 'textarea', placeholder: '6-week intensive: $997, 3-month coaching: $2,500, VIP day: $1,500, Group program: $497...' },
          { key: 'paymentPlans', label: 'Payment plans?', type: 'select', options: ['Yes, for all programs', 'Yes, for programs over $500', 'No payment plans'] },
        ]
      },
      {
        title: 'Getting Started',
        emoji: '🚀',
        fields: [
          { key: 'discoveryCall', label: 'Discovery/intro call', type: 'textarea', placeholder: 'Free 20-minute discovery call to see if we\'re a good fit. No pressure, just a conversation...' },
          { key: 'meetingPlatform', label: 'How do sessions happen?', type: 'text', placeholder: 'Zoom calls, in-person in Orlando, Voxer access between calls...' },
        ]
      },
    ]
  },
  photography: {
    emoji: '📸',
    title: 'Photography',
    description: 'Book sessions and explain your packages',
    sections: [
      {
        title: 'Your Work',
        emoji: '🎨',
        fields: [
          { key: 'specialty', label: 'Photography specialties', type: 'textarea', placeholder: 'Wedding, engagement, family portraits, newborn, headshots, commercial, real estate...' },
          { key: 'style', label: 'Your style', type: 'textarea', placeholder: 'Light and airy, moody and dramatic, documentary/candid, classic and timeless...' },
        ]
      },
      {
        title: 'Packages',
        emoji: '📦',
        fields: [
          { key: 'packages', label: 'Package options', type: 'textarea', placeholder: 'Mini session (30min, 10 images): $250\nFull session (1hr, 25 images): $450\nWedding starts at $2,500...' },
          { key: 'locations', label: 'Where do you shoot?', type: 'textarea', placeholder: 'Studio in Melbourne, on-location anywhere in Brevard, travel available for additional fee...' },
          { key: 'turnaround', label: 'Delivery turnaround', type: 'text', placeholder: 'Portraits: 2-3 weeks, Weddings: 6-8 weeks' },
        ]
      },
      {
        title: 'Booking',
        emoji: '📅',
        fields: [
          { key: 'deposit', label: 'Booking deposit', type: 'text', placeholder: '50% deposit to book, balance due before session/wedding day...' },
          { key: 'whatToWear', label: 'Client prep advice', type: 'textarea', placeholder: 'Coordinate colors (not match), avoid logos and busy patterns, bring outfit changes, I send a full prep guide...' },
          { key: 'printsIncluded', label: 'What\'s included', type: 'textarea', placeholder: 'Digital files with print release, online gallery for 1 year. Prints and albums available separately...' },
        ]
      },
    ]
  },
  other: {
    emoji: '✨',
    title: 'Other Business',
    description: 'Tell your AI everything it needs to know',
    sections: [
      {
        title: 'Your Business',
        emoji: '🏢',
        fields: [
          { key: 'description', label: 'What does your business do?', type: 'textarea', placeholder: 'Describe your business, products, or services...' },
          { key: 'offerings', label: 'Products/services offered', type: 'textarea', placeholder: 'List what you offer with any relevant details...' },
          { key: 'pricing', label: 'Pricing information', type: 'textarea', placeholder: 'Share price ranges or how pricing works...' },
        ]
      },
      {
        title: 'Common Questions',
        emoji: '❓',
        fields: [
          { key: 'faqs', label: 'Frequently asked questions', type: 'textarea', placeholder: 'Q: How long does it take?\nA: Usually 2-3 days...\n\nQ: Do you offer refunds?\nA: Yes, within 30 days...' },
          { key: 'additionalInfo', label: 'Anything else AI should know', type: 'textarea', placeholder: 'Policies, special notes, things to mention or avoid...' },
        ]
      },
    ]
  },
}

const toneOptions = [
  { 
    value: 'friendly', 
    label: 'Friendly', 
    emoji: '😊', 
    desc: 'Warm & approachable',
    example: "Hey there! 👋 Thanks so much for reaching out! I'd love to help you. Yes, we have availability tomorrow afternoon - would 2pm or 4pm work better for you?"
  },
  { 
    value: 'professional', 
    label: 'Professional', 
    emoji: '👔', 
    desc: 'Polished & courteous',
    example: "Thank you for contacting us. I would be happy to assist you. We do have availability tomorrow afternoon. Would 2:00 PM or 4:00 PM work best for your schedule?"
  },
  { 
    value: 'luxury', 
    label: 'Luxury', 
    emoji: '✨', 
    desc: 'Refined & elegant',
    example: "Good afternoon, and thank you for your inquiry. We would be delighted to accommodate you. I have two exclusive appointment times available tomorrow: 2 PM and 4 PM. Which would you prefer?"
  },
  { 
    value: 'energetic', 
    label: 'Energetic', 
    emoji: '🔥', 
    desc: 'Upbeat & fun',
    example: "Hey!! So excited you messaged us! 🎉 YES we totally have spots tomorrow! I've got 2pm and 4pm open - which one works for you?! Can't wait to see you!"
  },
]

const businessTypes = Object.entries(industryConfigs).map(([value, config]) => ({
  value,
  label: `${config.emoji} ${config.title}`,
}))

interface ListItem {
  id: string
  [key: string]: string
}

export default function AIConfigPage() {
  const [settings, setSettings] = useState<Record<string, any>>({
    businessType: 'salon',
    tone: 'friendly',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
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

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = ApexSession.getToken()
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  // List management for fields like listings
  const addListItem = (key: string, fields: { key: string }[]) => {
    const newItem: ListItem = { id: Date.now().toString() }
    fields.forEach(f => { newItem[f.key] = '' })
    const current = settings[key] || []
    handleChange(key, [...current, newItem])
  }

  const updateListItem = (listKey: string, itemId: string, fieldKey: string, value: string) => {
    const current = settings[listKey] || []
    const updated = current.map((item: ListItem) => 
      item.id === itemId ? { ...item, [fieldKey]: value } : item
    )
    handleChange(listKey, updated)
  }

  const removeListItem = (listKey: string, itemId: string) => {
    const current = settings[listKey] || []
    handleChange(listKey, current.filter((item: ListItem) => item.id !== itemId))
  }

  const currentConfig = industryConfigs[settings.businessType] || industryConfigs.other

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-8 bg-slate-100 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
              <div className="h-6 bg-slate-100 rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-slate-100 rounded mb-3"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">AI Configuration</h1>
        <p className="text-slate-500">Train your AI to handle your specific business perfectly.</p>
      </div>

      {/* Business Type Selector */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-900 mb-3">What type of business?</h2>
        <select
          value={settings.businessType}
          onChange={(e) => handleChange('businessType', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
        >
          {businessTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <p className="text-sm text-slate-500 mt-2">{currentConfig.description}</p>
      </section>

      {/* AI Personality */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span>🎭</span> AI Personality
        </h2>
        <p className="text-sm text-slate-500 mb-4">How should your AI talk to customers?</p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {toneOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleChange('tone', opt.value)}
              className={`p-3 rounded-xl border text-left transition-all ${
                settings.tone === opt.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:border-orange-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span>{opt.emoji}</span>
                <span className="font-medium text-sm text-slate-900">{opt.label}</span>
              </div>
              <p className="text-xs text-slate-500">{opt.desc}</p>
            </button>
          ))}
        </div>

        {/* Example Response Preview */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Example Response</span>
            <span className="text-xs text-slate-400">• "Do you have availability tomorrow?"</span>
          </div>
          <div className="bg-[#0084ff] text-white text-sm p-3 rounded-2xl rounded-br-md max-w-[90%] ml-auto">
            {toneOptions.find(t => t.value === settings.tone)?.example}
          </div>
        </div>
      </section>

      {/* Industry-Specific Sections */}
      {currentConfig.sections.map((section, sIdx) => (
        <section key={sIdx} className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span>{section.emoji}</span> {section.title}
          </h2>
          
          <div className="space-y-4">
            {section.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {field.label}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={settings[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                )}
                
                {field.type === 'textarea' && (
                  <textarea
                    value={settings[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-h-[100px] resize-none"
                  />
                )}
                
                {field.type === 'select' && (
                  <select
                    value={settings[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                
                {field.type === 'list' && field.listFields && (
                  <div className="space-y-3">
                    {(settings[field.key] || []).map((item: ListItem, idx: number) => (
                      <div key={item.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-slate-600">#{idx + 1}</span>
                          <button
                            onClick={() => removeListItem(field.key, item.id)}
                            className="text-red-500 hover:text-red-600 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {field.listFields?.map(lf => (
                            <div key={lf.key} className={lf.key === 'highlights' || lf.key === 'link' ? 'col-span-2' : ''}>
                              <label className="block text-xs text-slate-500 mb-1">{lf.label}</label>
                              <input
                                type="text"
                                value={item[lf.key] || ''}
                                onChange={(e) => updateListItem(field.key, item.id, lf.key, e.target.value)}
                                placeholder={lf.placeholder}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-orange-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addListItem(field.key, field.listFields!)}
                      className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-orange-300 hover:text-orange-500 transition-colors text-sm font-medium"
                    >
                      + Add {field.key === 'listings' ? 'Listing' : 'Item'}
                    </button>
                  </div>
                )}
                
                {field.hint && (
                  <p className="text-xs text-slate-400 mt-1">{field.hint}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Special Instructions */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <span>📝</span> Special Instructions
        </h2>
        <p className="text-sm text-slate-500 mb-3">Custom rules your AI will always follow</p>
        <textarea
          value={settings.specialInstructions || ''}
          onChange={(e) => handleChange('specialInstructions', e.target.value)}
          placeholder="Always mention our new client special. Never discuss competitor pricing. If asked about X, say Y..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 min-h-[100px] resize-none"
        />
        
        {/* Examples */}
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-2">💡 Example instructions:</p>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>• "Always mention our 20% new client discount"</li>
            <li>• "Never quote exact prices - say 'starting at' or ask them to call"</li>
            <li>• "If they ask about [competitor], say we focus on our own quality"</li>
            <li>• "Always ask for their name before booking"</li>
            <li>• "We're booked 2 weeks out for popular services"</li>
          </ul>
        </div>
      </section>

      {/* Save Button */}
      <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:w-auto z-10">
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
