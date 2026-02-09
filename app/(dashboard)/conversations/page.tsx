import { cookies } from 'next/headers'

async function getConversations(locationId: string, apiKey: string) {
  // In production, this would call GHL API
  // For now, return mock data
  return [
    { id: '1', name: 'Sarah Johnson', lastMessage: 'Thanks! I just booked my appointment.', time: '2 hours ago', unread: false, messageCount: 8 },
    { id: '2', name: 'Mike Chen', lastMessage: 'Do you have availability on Saturday?', time: '4 hours ago', unread: true, messageCount: 3 },
    { id: '3', name: 'Emily Davis', lastMessage: 'What are your prices for a full detail?', time: '6 hours ago', unread: false, messageCount: 12 },
    { id: '4', name: 'James Wilson', lastMessage: 'Perfect, see you then!', time: '1 day ago', unread: false, messageCount: 6 },
    { id: '5', name: 'Lisa Brown', lastMessage: 'Hi! I saw your page and wanted to ask...', time: '1 day ago', unread: false, messageCount: 4 },
    { id: '6', name: 'David Martinez', lastMessage: 'That sounds great, I\'ll book now.', time: '2 days ago', unread: false, messageCount: 7 },
    { id: '7', name: 'Jennifer Taylor', lastMessage: 'Do you offer gift cards?', time: '2 days ago', unread: false, messageCount: 5 },
    { id: '8', name: 'Robert Anderson', lastMessage: 'Thanks for the quick response!', time: '3 days ago', unread: false, messageCount: 9 },
  ]
}

export default async function ConversationsPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get('apex_session')
  
  let locationId = ''
  let apiKey = ''
  
  try {
    const sessionData = JSON.parse(session?.value || '{}')
    locationId = sessionData.locationId || ''
    apiKey = sessionData.apiKey || ''
  } catch {
    // Use defaults
  }

  const conversations = await getConversations(locationId, apiKey)

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold mb-2">Conversations</h1>
        <p className="text-gray-400">
          All messages handled by your AI assistant.
        </p>
      </div>

      {/* Filters (placeholder) */}
      <div className="flex items-center gap-4 mb-6 animate-fade-in delay-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Filter:</span>
          <button className="px-3 py-1.5 bg-apex-purple/20 text-apex-purple rounded-lg font-medium">All</button>
          <button className="px-3 py-1.5 hover:bg-white/5 text-gray-400 rounded-lg">Unread</button>
          <button className="px-3 py-1.5 hover:bg-white/5 text-gray-400 rounded-lg">This Week</button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="card animate-fade-in delay-2">
        <div className="divide-y divide-apex-border">
          {conversations.map((convo) => (
            <a
              key={convo.id}
              href={`/conversations/${convo.id}`}
              className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group -mx-6 px-6 first:rounded-t-2xl last:rounded-b-2xl"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-apex-purple/30 to-apex-purple-light/30 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-medium text-apex-purple">
                  {convo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${convo.unread ? 'text-white' : 'text-gray-300'}`}>
                    {convo.name}
                  </span>
                  <span className="text-xs text-gray-500">{convo.time}</span>
                </div>
                <p className={`text-sm truncate ${convo.unread ? 'text-gray-300' : 'text-gray-500'}`}>
                  {convo.lastMessage}
                </p>
              </div>

              {/* Message count */}
              <div className="text-xs text-gray-500 flex-shrink-0">
                {convo.messageCount} messages
              </div>

              {/* Unread indicator */}
              {convo.unread && (
                <div className="w-2.5 h-2.5 bg-apex-purple rounded-full flex-shrink-0" />
              )}

              {/* Arrow */}
              <svg 
                className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </div>

      {/* Info */}
      <p className="text-center text-gray-600 text-sm mt-6">
        Showing {conversations.length} conversations
      </p>
    </div>
  )
}
