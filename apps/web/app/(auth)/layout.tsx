import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@streakflow/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Sign in' }

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (session) redirect('/today')

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090C] px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* radial glow behind the form */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-flame/5 blur-[120px]" />
      </div>
      {children}
    </div>
  )
}
