'use client'

import Link from 'next/link'
import { cn, streakToNextMilestone } from '@/lib/utils'
import type { HabitWithLogs } from '@streakflow/types'
import { Heatmap } from './heatmap'

interface StreakCardProps {
  habit: HabitWithLogs
  showHeatmap?: boolean
}

export function StreakCard({ habit, showHeatmap = false }: StreakCardProps) {
  const { next, daysAway } = streakToNextMilestone(habit.currentStreak)
  const progress = next > 0 ? Math.min((habit.currentStreak / next) * 100, 100) : 0

  return (
    <Link
      href={`/habits/${habit.id}`}
      className="block rounded-[14px] border border-border bg-surface p-4 transition-all hover:border-flame/25 hover:bg-surface-2"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{habit.icon}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#3C3A47]">
            {habit.name}
          </span>
        </div>
        <span className={cn(
          'rounded-full px-2 py-0.5 font-mono text-[10px]',
          habit.completedToday ? 'bg-mint/10 text-mint' : 'bg-flame/10 text-flame',
        )}>
          {habit.completedToday ? 'Done' : 'Pending'}
        </span>
      </div>

      <div className="font-display text-[52px] italic font-black leading-[0.9] tracking-tight text-gradient-flame glow-flame">
        {habit.currentStreak}
      </div>
      <p className="mt-0.5 mb-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#3C3A47]">
        {habit.currentStreak === habit.longestStreak && habit.currentStreak > 0
          ? 'DAYS · PERSONAL RECORD 🏆'
          : `DAYS · BEST ${habit.longestStreak}`}
      </p>

      <div className="h-[2px] overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-flame-h shadow-[0_0_8px_rgba(255,107,26,0.3)] transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1.5 font-mono text-[10px] text-[#3C3A47]">
        Next: <span className="text-flame">{next} days</span> — {daysAway} away
      </p>

      {showHeatmap && (
        <div className="mt-4">
          <Heatmap habitId={habit.id} days={35} />
        </div>
      )}
    </Link>
  )
}
