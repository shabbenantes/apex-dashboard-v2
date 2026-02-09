import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  return NextResponse.json({
    cookies: allCookies.map(c => ({
      name: c.name,
      value: c.name === 'apex_session' ? c.value.substring(0, 10) + '...' : '[hidden]',
    })),
    hasSession: !!cookieStore.get('apex_session')?.value,
    hasBusiness: !!cookieStore.get('apex_business')?.value,
  })
}
