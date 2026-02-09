import { getSession } from '@/lib/auth'
import StatsCard from '@/components/StatsCard'
import RecentConversations from '@/components/RecentConversations'

async function getStats(locationId: string, apiKey: string) {
  // TODO: Call GHL API to get real stats
  // For now, return placeholder data
  return {
    messagesThisWeek: 0,
    avgResponseTime: '< 1 min',
    leadsCapture: 0,
    conversionRate: '--',
  }
}

async function getRecentConversations(locationId: string, apiKey: string) {
  // TODO: Call GHL API to get real conversations
  // For now, return empty
  return []
}

export default async function DashboardPage() {
  const session = await getSession()
  
  if (!session) {
    return null // Layout will redirect
  }

  const stats = await getStats(session.locationId, session.apiKey)
  const conversations = await getRecentConversations(session.locationId, session.apiKey)

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
          value={stats.leadsCapture}
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
          <RecentConversations conversations={conversations} />
        </div>
      )}
    </div>
  )
}
