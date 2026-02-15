'use client'

import Link from 'next/link'

const actions = [
  {
    label: 'View Conversations',
    description: 'See all your AI conversations',
    href: '/conversations',
    icon: '💬',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    label: 'AI Settings',
    description: 'Customize AI responses',
    href: '/settings',
    icon: '⚙️',
    color: 'bg-slate-50 text-slate-600 border-slate-200',
  },
  {
    label: 'Manage Connections',
    description: 'Facebook & Instagram',
    href: '/connect',
    icon: '🔗',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
]

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-sm ${action.color}`}
          >
            <span className="text-2xl">{action.icon}</span>
            <div>
              <div className="font-medium text-sm">{action.label}</div>
              <div className="text-xs opacity-70">{action.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
