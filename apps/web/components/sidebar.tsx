'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn, getInitials } from '@/lib/utils'
import { NAV_ITEMS, NAV_WORKSPACE } from '@/lib/constants'
import { Badge } from '@streakflow/ui'

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  return (
    <aside className="flex w-[220px] flex-shrink-0 flex-col border-r border-border bg-[#09090C]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-border px-[18px] py-5">
        <div className="flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-[8px] bg-flame-gradient text-sm shadow-flame">
          🔥
        </div>
        <span className="text-[14.5px] font-bold tracking-tight text-[#EDE8E3]">StreakFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} />
        ))}

        <p className="mt-5 px-2.5 pb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#3C3A47]">
          Workspace
        </p>

        {NAV_WORKSPACE.map((item) => (
          <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} />
        ))}

        <p className="mt-5 px-2.5 pb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#3C3A47]">
          Account
        </p>

        <NavItem href="/settings" label="Settings" icon="◁" active={pathname.startsWith('/settings')} />
      </nav>

      {/* User */}
      <div className="border-t border-border p-2.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 transition-colors hover:bg-surface-2"
        >
          <div className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-flame-gradient text-[11px] font-bold text-white shadow-flame-sm">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-[#EDE8E3]">
              {user?.name ?? user?.email?.split('@')[0]}
            </p>
            <p className="font-mono text-[10px] text-flame">
              {(user as { plan?: string } | undefined)?.plan ?? 'FREE'} plan
            </p>
          </div>
        </Link>
      </div>
    </aside>
  )
}

function NavItem({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string
  label: string
  icon: string
  active: boolean
  badge?: number
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium transition-all',
        active
          ? 'bg-flame/10 text-flame'
          : 'text-[#8A8796] hover:bg-surface-2 hover:text-[#EDE8E3]',
      )}
    >
      {active && (
        <span className="absolute inset-y-0 left-0 my-auto h-4 w-[3px] rounded-r-full bg-flame-gradient shadow-flame-sm" />
      )}
      <span className={cn('flex w-5 items-center justify-center text-[13px]', active && 'drop-shadow-[0_0_6px_rgba(255,107,26,0.5)]')}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge != null && (
        <Badge variant="flame" className="text-[10px]">
          {badge}
        </Badge>
      )}
    </Link>
  )
}
