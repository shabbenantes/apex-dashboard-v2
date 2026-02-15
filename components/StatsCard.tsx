interface StatsCardProps {
  title: string
  value: string | number
  icon: 'message' | 'clock' | 'users' | 'chart'
  trend?: string
  subtitle?: string
  className?: string
}

export default function StatsCard({ title, value, icon, trend, subtitle, className = '' }: StatsCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBg(icon)}`}>
          {getIcon(icon)}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-slate-500 text-sm">{title}</div>
      {subtitle && <div className="text-slate-400 text-xs mt-1">{subtitle}</div>}
    </div>
  )
}

function getIconBg(icon: string) {
  switch (icon) {
    case 'message': return 'bg-orange-50'
    case 'clock': return 'bg-green-50'
    case 'users': return 'bg-blue-50'
    case 'chart': return 'bg-orange-50'
    default: return 'bg-slate-100'
  }
}

function getIcon(icon: string) {
  const className = 'w-6 h-6'
  switch (icon) {
    case 'message':
      return (
        <svg className={`${className} text-orange-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    case 'clock':
      return (
        <svg className={`${className} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'users':
      return (
        <svg className={`${className} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'chart':
      return (
        <svg className={`${className} text-orange-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    default:
      return null
  }
}
