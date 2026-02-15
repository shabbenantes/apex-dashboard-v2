'use client'

import { useState, useEffect } from 'react'
import { ApexSession } from '@/lib/session'
import Link from 'next/link'

interface SetupStep {
  id: string
  label: string
  description: string
  completed: boolean
  href: string
  icon: string
}

export default function SetupChecklist() {
  const [steps, setSteps] = useState<SetupStep[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    const session = ApexSession.get()
    if (!session?.email) {
      setLoading(false)
      return
    }

    try {
      // Check connections
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apex-dashboard-api-5r3u.onrender.com'
      const connRes = await fetch(`${API_URL}/social-connections/${encodeURIComponent(session.email)}`)
      const connections = connRes.ok ? await connRes.json() : {}
      
      // Check settings
      const token = ApexSession.getToken()
      const settingsRes = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const settings = settingsRes.ok ? await settingsRes.json() : {}

      const hasConnections = connections.facebook?.connected || connections.instagram?.connected
      const hasBusinessInfo = settings.businessName && settings.businessDescription
      const hasAIConfig = settings.tone || settings.services

      setSteps([
        {
          id: 'connect',
          label: 'Connect your accounts',
          description: 'Link Facebook or Instagram to enable AI responses',
          completed: hasConnections,
          href: '/connect',
          icon: '🔗',
        },
        {
          id: 'business',
          label: 'Add business info',
          description: 'Help your AI answer questions accurately',
          completed: hasBusinessInfo,
          href: '/settings',
          icon: '🏪',
        },
        {
          id: 'ai',
          label: 'Configure AI personality',
          description: 'Set your AI\'s tone and responses',
          completed: hasAIConfig,
          href: '/settings#ai',
          icon: '🤖',
        },
      ])
    } catch (err) {
      console.error('Failed to check setup status:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 animate-pulse">
        <div className="h-6 bg-slate-100 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-slate-100 rounded"></div>
          <div className="h-16 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  const completedCount = steps.filter(s => s.completed).length
  const allComplete = completedCount === steps.length

  // Don't show if all complete or dismissed
  if (allComplete || dismissed) return null

  const progressPercent = (completedCount / steps.length) * 100

  return (
    <div className="bg-white rounded-2xl border border-orange-200 p-6 mb-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl">
            🚀
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Complete Your Setup</h2>
            <p className="text-slate-500 text-sm">{completedCount} of {steps.length} steps complete</p>
          </div>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600 text-xl"
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-5">
        <div 
          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              step.completed 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-slate-50 border border-slate-200 hover:border-orange-300 hover:bg-orange-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              step.completed ? 'bg-green-100' : 'bg-white border border-slate-200'
            }`}>
              {step.completed ? (
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{step.icon}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium ${step.completed ? 'text-green-700' : 'text-slate-900'}`}>
                {step.label}
              </h3>
              <p className="text-slate-500 text-sm truncate">{step.description}</p>
            </div>
            {!step.completed && (
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
