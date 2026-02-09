'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ApexSession, SessionData } from '@/lib/session'

interface AuthContextType {
  session: SessionData | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  isAuthenticated: false,
  logout: () => {}
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for existing session
    const existingSession = ApexSession.get()
    if (existingSession && ApexSession.isValid()) {
      setSession(existingSession)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirect to login if not authenticated and on protected route
    if (!isLoading && !session && pathname !== '/login' && pathname !== '/auth/callback') {
      router.push('/login')
    }
  }, [isLoading, session, pathname, router])

  const logout = () => {
    ApexSession.clear()
    setSession(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      isLoading, 
      isAuthenticated: !!session,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Wrapper for protected pages
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth()

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

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
