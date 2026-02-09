import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar businessName={session.businessName} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
