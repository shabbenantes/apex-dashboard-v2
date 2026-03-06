'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  email: string
  businessName: string
  locationId?: string
}

interface ConnectionStatus {
  facebook: boolean
  instagram: boolean
  pageName?: string
  igUsername?: string
}

// Decode JWT payload without verification (API validates on use)
function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

// Setup/Onboarding Screen - Using inline styles for reliability
function SetupScreen({ user, onRefresh }: { user: User; onRefresh: () => void }) {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const ghlConnectUrl = user.locationId 
    ? `https://app.getapexautomation.com/v2/location/${user.locationId}/integration/facebook-instagram`
    : null

  const copyToClipboard = (text: string, type: 'email' | 'password') => {
    navigator.clipboard.writeText(text)
    if (type === 'email') {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } else {
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  const styles = {
    page: { minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
    header: { backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 16px' },
    headerInner: { maxWidth: '448px', margin: '0 auto', height: '56px', display: 'flex', alignItems: 'center', gap: '8px' },
    logo: { width: '32px', height: '32px', backgroundColor: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px' },
    logoText: { fontWeight: '600', color: '#111827' },
    main: { maxWidth: '448px', margin: '0 auto', padding: '24px 16px' },
    card: { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '16px', overflow: 'hidden' },
    statusCard: { padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' },
    statusIcon: { width: '40px', height: '40px', backgroundColor: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
    statusTitle: { fontWeight: '500', color: '#111827', margin: 0 },
    statusSub: { fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' },
    cardHeader: { padding: '16px', borderBottom: '1px solid #f3f4f6' },
    cardHeaderText: { fontSize: '14px', color: '#4b5563', margin: 0 },
    credSection: { padding: '16px' },
    credRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', marginBottom: '12px' },
    credLabel: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' as const, margin: 0 },
    credValue: { fontSize: '14px', fontWeight: '500', color: '#111827', margin: '4px 0 0 0' },
    copyBtn: { fontSize: '12px', color: '#6b7280', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer' },
    connectBtn: { display: 'block', width: '100%', padding: '14px 16px', backgroundColor: '#10b981', color: 'white', fontWeight: '500', textAlign: 'center' as const, borderRadius: '8px', textDecoration: 'none', fontSize: '15px' },
    afterSection: { padding: '16px' },
    afterLabel: { fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase' as const, marginBottom: '12px' },
    afterItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563', marginBottom: '8px' },
    checkmark: { color: '#10b981' },
    refreshBtn: { background: 'none', border: 'none', fontSize: '14px', color: '#10b981', cursor: 'pointer', marginTop: '24px' },
    support: { fontSize: '12px', color: '#9ca3af', marginTop: '16px', textAlign: 'center' as const },
    supportLink: { color: '#10b981', textDecoration: 'none' }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>⚡</div>
          <span style={styles.logoText}>Apex</span>
        </div>
      </header>

      <main style={styles.main}>
        {/* Status card */}
        <div style={styles.card}>
          <div style={styles.statusCard}>
            <div style={styles.statusIcon}>🔗</div>
            <div>
              <p style={styles.statusTitle}>Connect Your Accounts</p>
              <p style={styles.statusSub}>One-time setup to activate your AI</p>
            </div>
          </div>
        </div>

        {/* Credentials card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <p style={styles.cardHeaderText}>Log in with these credentials, then connect your Facebook & Instagram:</p>
          </div>
          
          <div style={styles.credSection}>
            <div style={styles.credRow}>
              <div>
                <p style={styles.credLabel}>Email</p>
                <p style={styles.credValue}>{user.email}</p>
              </div>
              <button style={styles.copyBtn} onClick={() => copyToClipboard(user.email, 'email')}>
                {copiedEmail ? '✓' : 'Copy'}
              </button>
            </div>
            
            <div style={{...styles.credRow, marginBottom: 0}}>
              <div>
                <p style={styles.credLabel}>Password</p>
                <p style={styles.credValue}>ApexStart2026!</p>
              </div>
              <button style={styles.copyBtn} onClick={() => copyToClipboard('ApexStart2026!', 'password')}>
                {copiedPassword ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
          
          <div style={{ padding: '0 16px 16px' }}>
            {ghlConnectUrl && (
              <a href={ghlConnectUrl} target="_blank" rel="noopener noreferrer" style={styles.connectBtn}>
                Connect Facebook & Instagram →
              </a>
            )}
          </div>
        </div>

        {/* After connecting */}
        <div style={styles.card}>
          <div style={styles.afterSection}>
            <p style={styles.afterLabel}>After connecting</p>
            <div style={styles.afterItem}><span style={styles.checkmark}>✓</span> AI responds to DMs instantly, 24/7</div>
            <div style={styles.afterItem}><span style={styles.checkmark}>✓</span> Sends your booking link automatically</div>
            <div style={{...styles.afterItem, marginBottom: 0}}><span style={styles.checkmark}>✓</span> You&apos;ll never miss a lead again</div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button style={styles.refreshBtn} onClick={onRefresh}>
            Already connected? Check status →
          </button>
          <p style={styles.support}>
            Need help? <a href="mailto:support@getapexautomation.com" style={styles.supportLink}>support@getapexautomation.com</a>
          </p>
        </div>
      </main>
    </div>
  )
}

// Main Dashboard for connected users
function MainDashboard({ user, connection, onLogout }: { user: User; connection: ConnectionStatus; onLogout: () => void }) {
  const [aiActive, setAiActive] = useState(true)
  const firstName = user.businessName?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <span className="font-bold text-gray-900">Apex</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-700">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Hey, {firstName}! 👋</h1>
          <p className="text-gray-500">Here's how your AI assistant is performing.</p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Connected Accounts</h3>
            {user.locationId && (
              <a
                href={`https://app.getapexautomation.com/v2/location/${user.locationId}/integration/facebook-instagram`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Manage →
              </a>
            )}
          </div>
          <div className="flex gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${connection.facebook ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium">
                {connection.facebook ? (connection.pageName || 'Connected') : 'Not connected'}
              </span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${connection.instagram ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-sm font-medium">
                {connection.instagram ? (connection.igUsername ? `@${connection.igUsername}` : 'Connected') : 'Not connected'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Status */}
        <div className={`rounded-2xl p-6 mb-6 ${
          aiActive 
            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200' 
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                aiActive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                {aiActive ? '⚡' : '⏸️'}
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900">
                  {aiActive ? 'AI is Active' : 'AI is Paused'}
                </h2>
                <p className="text-sm text-gray-600">
                  {aiActive ? 'Responding to messages 24/7' : 'Messages won\'t get automatic replies'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAiActive(!aiActive)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                aiActive 
                  ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50' 
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
              }`}
            >
              {aiActive ? 'Pause AI' : 'Resume AI'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">--</p>
            <p className="text-xs text-gray-500 font-medium">Messages this week</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-emerald-600 mb-1">&lt; 1 min</p>
            <p className="text-xs text-gray-500 font-medium">Avg response</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">--</p>
            <p className="text-xs text-gray-500 font-medium">Conversations</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/dashboard/conversations"
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                💬
              </div>
              <div>
                <p className="font-semibold text-gray-900">Conversations</p>
                <p className="text-sm text-gray-500">View all chats</p>
              </div>
            </div>
          </Link>
          <Link
            href="/dashboard/settings"
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-gray-500/20 group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <div>
                <p className="font-semibold text-gray-900">Settings</p>
                <p className="text-sm text-gray-500">Configure your AI</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [connection, setConnection] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const checkConnection = async (locationId: string, token: string) => {
    try {
      const res = await fetch(
        `https://apex-dashboard-api-5r3u.onrender.com/ghl/connection-status/${locationId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        setConnection(data)
      } else {
        // Default to not connected if we can't check
        setConnection({ facebook: false, instagram: false })
      }
    } catch {
      setConnection({ facebook: false, instagram: false })
    }
  }

  useEffect(() => {
    const init = async () => {
      // Check for SSO token in URL (from GHL custom menu link)
      // Read directly from window.location to avoid Next.js hydration issues
      const urlParams = new URLSearchParams(window.location.search)
      const ssoToken = urlParams.get('token')
      
      if (ssoToken) {
        const payload = decodeJWT(ssoToken)
        if (payload && payload.email) {
          const userData = {
            email: payload.email,
            businessName: payload.businessName || '',
            locationId: payload.locationId || ''
          }
          
          localStorage.setItem('apex_token', ssoToken)
          localStorage.setItem('apex_user', JSON.stringify(userData))
          
          // Remove token from URL
          const url = new URL(window.location.href)
          url.searchParams.delete('token')
          window.history.replaceState({}, '', url.toString())
          
          setUser(userData)
          if (userData.locationId) {
            await checkConnection(userData.locationId, ssoToken)
          }
          setLoading(false)
          return
        }
      }
      
      // Normal session check
      const token = localStorage.getItem('apex_token')
      const userDataStr = localStorage.getItem('apex_user')
      
      if (!token || !userDataStr) {
        router.push('/')
        return
      }

      const userData = JSON.parse(userDataStr)
      
      // Try to get locationId from token if not in userData
      if (!userData.locationId && token) {
        const payload = decodeJWT(token)
        if (payload?.locationId) {
          userData.locationId = payload.locationId
          localStorage.setItem('apex_user', JSON.stringify(userData))
        }
      }
      
      setUser(userData)
      if (userData.locationId) {
        await checkConnection(userData.locationId, token)
      } else {
        setConnection({ facebook: false, instagram: false })
      }
      setLoading(false)
    }
    
    init()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('apex_token')
    localStorage.removeItem('apex_user')
    router.push('/')
  }

  const handleRefresh = async () => {
    if (user?.locationId) {
      const token = localStorage.getItem('apex_token')
      if (token) {
        setLoading(true)
        await checkConnection(user.locationId, token)
        setLoading(false)
      }
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Show setup screen if not connected
  if (connection && !connection.facebook && !connection.instagram) {
    return <SetupScreen user={user} onRefresh={handleRefresh} />
  }

  // Show main dashboard
  return <MainDashboard user={user} connection={connection || { facebook: false, instagram: false }} onLogout={handleLogout} />
}
