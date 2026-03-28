'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { streakToNextMilestone, pluralize } from '@/lib/utils'

export function MilestoneBanner() {
  const { data: habits = [] } = trpc.habits.list.useQuery()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Find habits that hit a milestone today
  const milestones = habits.filter((h) => {
    if (dismissed.has(h.id)) return false
    const { next } = streakToNextMilestone(h.currentStreak - 1)
    return h.currentStreak === next && h.completedToday
  })

  const top = milestones[0]
  if (!top) return null

  return (
    <div className="flex items-center gap-3.5 rounded-[12px] border border-flame/20 bg-gradient-to-r from-flame/7 to-flame-2/5 px-4 py-3.5 animate-slide-up">
      <span className="flex-shrink-0 text-[30px] animate-pulse-fire">🔥</span>
      <div className="flex-1">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-flame">Milestone unlocked</p>
        <p className="text-[13.5px] font-medium text-[#EDE8E3]">
          <strong className="text-flame">{top.name}</strong> hits{' '}
          <strong className="text-flame">{top.currentStreak} days</strong> —{' '}
          {top.currentStreak >= 100 ? "you're in the top 1%!" : top.currentStreak >= 30 ? "incredible consistency!" : "keep the momentum!"}
        </p>
      </div>
      <button
        onClick={() => setDismissed((s) => new Set([...s, top.id]))}
        className="flex-shrink-0 rounded px-2 py-1 text-lg leading-none text-[#3C3A47] transition-colors hover:text-[#8A8796]"
      >
        ×
      </button>
    </div>
  )
}
