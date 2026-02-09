interface Conversation {
  id: string
  name: string
  message: string
  time: string
  unread: boolean
}

interface RecentConversationsProps {
  conversations: Conversation[]
}

export default function RecentConversations({ conversations }: RecentConversationsProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No conversations yet.</p>
        <p className="text-sm mt-1">When customers message you, they'll appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {conversations.map((convo) => (
        <a
          key={convo.id}
          href={`/conversations/${convo.id}`}
          className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
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
              {convo.message}
            </p>
          </div>

          {/* Unread indicator */}
          {convo.unread && (
            <div className="w-2.5 h-2.5 bg-apex-purple rounded-full flex-shrink-0" />
          )}

          {/* Arrow on hover */}
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
  )
}
