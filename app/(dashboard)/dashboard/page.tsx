import { getSession } from '@/lib/auth'
import { getDashboardStats, getConversations, formatRelativeTime } from '@/lib/ghl'
import StatsCard from '@/components/StatsCard'

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    return null // Layout will redirect
  }

  // Fetch real data from GHL
  const [stats, conversations] = await Promise.all([
    getDashboardStats(session.locationId, session.apiKey),
    getConversations(session.locationId, session.apiKey, 5),
  ])

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-400">
          Here's how your AI assistant is performing.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Messages This Week"
          value={stats.messagesThisWeek}
          icon="message"
          className="animate-fade-in delay-1"
        />
        <StatsCard
          title="Avg Response Time"
          value={stats.avgResponseTime}
          icon="clock"
          subtitle="AI-powered speed"
          className="animate-fade-in delay-2"
        />
        <StatsCard
          title="Leads Captured"
          value={stats.leadsThisWeek}
          icon="users"
          className="animate-fade-in delay-3"
        />
        <StatsCard
          title="Conversion Rate"
          value={stats.conversionRate}
          icon="chart"
          className="animate-fade-in"
        />
      </div>

      {/* Getting Started Card (show when no activity) */}
      {conversations.length === 0 && (
        <div className="card animate-fade-in bg-gradient-to-br from-apex-purple/10 to-transparent border-apex-purple/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-apex-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
              <p className="text-gray-400 mb-4">
                Your AI assistant is set up and ready! Once customers start messaging your Facebook or Instagram page, their conversations will appear here.
              </p>
              <div className="flex gap-4">
                <a href="/settings" className="text-apex-purple hover:text-apex-purple-light font-medium text-sm">
                  Configure your AI →
                </a>
                <a href="/connect" className="text-gray-400 hover:text-white font-medium text-sm">
                  Check connections →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Conversations */}
      {conversations.length > 0 && (
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold">Recent Conversations</h2>
            <a href="/conversations" className="text-apex-purple hover:text-apex-purple-light text-sm font-medium">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            {conversations.slice(0, 5).map((convo) => (
              <a
                key={convo.id}
                href={`/conversations/${convo.id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-apex-purple/30 to-apex-purple-light/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-apex-purple">
                    {(convo.contactName || 'UN').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-sm">{convo.contactName || 'Unknown'}</span>
                    <span className="text-xs text-gray-500">{formatRelativeTime(convo.lastMessageDate)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {convo.lastMessageDirection === 'outbound' ? '↗️ ' : '↙️ '}
                    {convo.lastMessageBody?.substring(0, 60) || 'No message'}
                  </p>
                </div>
                {convo.unreadCount > 0 && (
                  <div className="w-2 h-2 bg-apex-purple rounded-full flex-shrink-0" />
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
