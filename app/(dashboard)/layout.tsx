'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApexSession, SessionData } from '@/lib/session'
import Sidebar from '@/components/Sidebar'
import BottomNav from '@/components/BottomNav'
import TrialBanner from '@/components/TrialBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentSession = ApexSession.get()
    
    if (!currentSession || !ApexSession.isValid()) {
      router.push('/login')
      return
    }
    
    setSession(currentSession)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar businessName={session.businessName} />
      </div>
      
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="font-bold text-slate-900">Apex</span>
        </div>
      </header>
      
      {/* Mobile bottom navigation */}
      <BottomNav />
      
      {/* Main content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-18 lg:pt-8 pb-20 lg:pb-8">
        <TrialBanner />
        {children}
      </main>
    </div>
  )
}
