'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ApexSession, SessionData } from '@/lib/session'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for valid session
    const currentSession = ApexSession.get()
    
    if (!currentSession || !ApexSession.isValid()) {
      // No valid session, redirect to login
      router.push('/login')
      return
    }
    
    setSession(currentSession)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apex-dark">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-apex-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar businessName={session.businessName} />
      </div>
      
      {/* Mobile navigation - shown only on mobile */}
      <MobileNav businessName={session.businessName} />
      
      {/* Main content - full width on mobile, offset on desktop */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
