'use client'

import { format } from 'date-fns'
import { Button } from '@streakflow/ui'
import { useCommandPalette } from '@/hooks/use-command-palette'

interface TopbarProps {
  title: string
  eyebrow?: string
  actions?: React.ReactNode
}

export function Topbar({ title, eyebrow, actions }: TopbarProps) {
  const { open } = useCommandPalette()
  const today = format(new Date(), "EEE, d MMMM yyyy").toUpperCase()

  return (
    <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-border bg-[#09090C] px-6">
      {/* Left */}
      <div className="flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#3C3A47]">
          {eyebrow ?? today}
        </p>
        <p className="text-[17px] font-semibold leading-tight tracking-tight text-[#EDE8E3]">
          {title}
        </p>
      </div>

      {/* Search */}
      <button
        onClick={open}
        className="flex w-[210px] items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-1.5 text-[12.5px] text-[#3C3A47] transition-all hover:border-border-2 hover:text-[#8A8796]"
      >
        <span>⌕</span>
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="rounded border border-border bg-[#09090C] px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions}
        <Button variant="ghost" size="icon" title="Notifications" className="text-base">
          🔔
        </Button>
      </div>
    </header>
  )
}
