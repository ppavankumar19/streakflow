import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@streakflow/auth'
import { Sidebar } from '@/components/sidebar'
import { CommandPalette } from '@/components/command-palette'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090C]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <CommandPalette />
    </div>
  )
}
