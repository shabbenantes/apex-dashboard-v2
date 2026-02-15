'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ApexSession } from '@/lib/session'

const menuItems = [
  {
    href: '/business',
    icon: '🏢',
    title: 'Business Details',
    description: 'Name, phone, hours, location',
  },
  {
    href: '/ai-config',
    icon: '✨',
    title: 'AI Configuration',
    description: 'Personality, knowledge, instructions',
  },
  {
    href: '/connect',
    icon: '🔗',
    title: 'Social Connections',
    description: 'Facebook, Instagram accounts',
  },
  {
    href: '/referrals',
    icon: '🎁',
    title: 'Referral Program',
    description: 'Earn credits by referring friends',
  },
]

const supportItems = [
  {
    href: 'mailto:support@getapexautomation.com',
    icon: '💬',
    title: 'Contact Support',
    description: 'Get help with your account',
    external: true,
  },
  {
    href: 'https://getapexautomation.com/#faq',
    icon: '❓',
    title: 'FAQ',
    description: 'Common questions answered',
    external: true,
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const session = ApexSession.get()

  const handleLogout = () => {
    ApexSession.clear()
    router.push('/login')
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account and preferences.</p>
      </div>

      {/* Account Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">
              {(session?.businessName || session?.email || 'A')[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-900 truncate">
              {session?.businessName || 'Your Business'}
            </h2>
            <p className="text-sm text-slate-500 truncate">{session?.email}</p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        {menuItems.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${
              i !== menuItems.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.description}</p>
            </div>
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Support */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Support</span>
        </div>
        {supportItems.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${
              i !== supportItems.length - 1 ? 'border-b border-slate-100' : ''
            }`}
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.description}</p>
            </div>
            {item.external ? (
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </a>
        ))}
      </div>

      {/* Subscription Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-900">Subscription</h3>
            <p className="text-sm text-slate-500">Free trial active</p>
          </div>
          <a
            href="https://buy.stripe.com/5kQ7sN1JI75Ieeyf7Gf7i0m"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Upgrade
          </a>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="w-full p-4 bg-white rounded-2xl border border-slate-200 text-red-500 font-medium hover:bg-red-50 hover:border-red-200 transition-colors"
      >
        Sign Out
      </button>

      {/* Version */}
      <p className="text-center text-slate-400 text-xs mt-6">
        Apex Automation v2.0
      </p>
    </div>
  )
}
