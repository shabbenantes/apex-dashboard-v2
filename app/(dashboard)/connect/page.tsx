export default function ConnectPage() {
  // Mock data - in production, this would check actual connection status
  const connections = {
    facebook: { connected: true, pageName: 'Melbourne Med Spa', lastSync: '2 minutes ago' },
    instagram: { connected: true, handle: '@melbournemedpa', lastSync: '2 minutes ago' },
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold mb-2">Connections</h1>
        <p className="text-gray-400">
          Manage your Facebook and Instagram connections.
        </p>
      </div>

      {/* Facebook Connection */}
      <div className="card mb-6 animate-fade-in delay-1">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Facebook Messenger</h3>
              {connections.facebook.connected ? (
                <span className="flex items-center gap-1.5 text-green-400 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  Not connected
                </span>
              )}
            </div>
            {connections.facebook.connected ? (
              <>
                <p className="text-gray-300 mb-1">{connections.facebook.pageName}</p>
                <p className="text-gray-500 text-sm">Last sync: {connections.facebook.lastSync}</p>
              </>
            ) : (
              <p className="text-gray-500 mb-3">Connect your Facebook Page to enable AI responses.</p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-apex-border flex justify-end">
          {connections.facebook.connected ? (
            <button className="text-gray-400 hover:text-red-400 text-sm">
              Disconnect
            </button>
          ) : (
            <button className="btn-primary text-sm py-2 px-4">
              Connect Facebook
            </button>
          )}
        </div>
      </div>

      {/* Instagram Connection */}
      <div className="card mb-6 animate-fade-in delay-2">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Instagram DMs</h3>
              {connections.instagram.connected ? (
                <span className="flex items-center gap-1.5 text-green-400 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  Not connected
                </span>
              )}
            </div>
            {connections.instagram.connected ? (
              <>
                <p className="text-gray-300 mb-1">{connections.instagram.handle}</p>
                <p className="text-gray-500 text-sm">Last sync: {connections.instagram.lastSync}</p>
              </>
            ) : (
              <p className="text-gray-500 mb-3">Connect your Instagram to enable AI responses to DMs.</p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-apex-border flex justify-end">
          {connections.instagram.connected ? (
            <button className="text-gray-400 hover:text-red-400 text-sm">
              Disconnect
            </button>
          ) : (
            <button className="btn-primary text-sm py-2 px-4">
              Connect Instagram
            </button>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="card bg-apex-purple/5 border-apex-purple/20 animate-fade-in delay-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold mb-1">Need help connecting?</h3>
            <p className="text-gray-400 text-sm mb-3">
              If you're having trouble connecting your Facebook or Instagram, we can help you through the process.
            </p>
            <a href="mailto:support@getapexautomation.com" className="text-apex-purple hover:text-apex-purple-light text-sm font-medium">
              Contact Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
