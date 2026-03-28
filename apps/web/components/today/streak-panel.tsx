'use client'

import { trpc } from '@/lib/trpc'
import { streakToNextMilestone } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function StreakPanel() {
  const { data: habits = [], isLoading } = trpc.habits.list.useQuery()
  const { data: summary } = trpc.analytics.weeklySummary.useQuery()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-40 rounded-[14px] bg-surface animate-pulse" />
        <div className="h-24 rounded-[14px] bg-surface animate-pulse" />
      </div>
    )
  }

  const sorted = [...habits].sort((a, b) => b.currentStreak - a.currentStreak)
  const top = sorted[0]

  return (
    <div className="flex flex-col gap-4">
      {/* Top streak card */}
      {top && <TopStreakCard habit={top} />}

      {/* Mini cards */}
      {sorted.length > 1 && (
        <div className="flex gap-2">
          {sorted.slice(1, 4).map((h) => (
            <MiniStreakCard key={h.id} habit={h} />
          ))}
        </div>
      )}

      {/* Weekly stats */}
      {summary && (
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#3C3A47]">This Week</p>
          <div className="flex gap-2">
            <StatBox value={summary.tasksCompleted} label="Tasks done" delta="+4 vs last wk" />
            <StatBox value={`${summary.habitCompletionRate}%`} label="Habit rate" delta="+6% vs last wk" />
          </div>
        </div>
      )}
    </div>
  )
}

function TopStreakCard({ habit }: { habit: ReturnType<typeof trpc.habits.list.useQuery>['data'] extends (infer T)[] | undefined ? T : never }) {
  const { next, daysAway } = streakToNextMilestone(habit.currentStreak)
  const progress = habit.longestStreak > 0 ? Math.min((habit.currentStreak / next) * 100, 100) : 0

  return (
    <div className="cursor-pointer rounded-[14px] border border-border bg-surface p-4 transition-all hover:border-flame/25 hover:bg-surface-2">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#3C3A47]">
          {habit.name}
        </span>
        <span className={cn(
          'rounded-full px-2 py-0.5 font-mono text-[10px]',
          habit.completedToday ? 'bg-mint/10 text-mint' : 'bg-flame/10 text-flame',
        )}>
          {habit.completedToday ? 'Done today' : 'Pending'}
        </span>
      </div>

      {/* Big streak number */}
      <div className="font-display text-[60px] italic font-black leading-[0.88] tracking-tight text-gradient-flame glow-flame">
        {habit.currentStreak}
      </div>
      <p className="mt-1 mb-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#3C3A47]">
        DAYS{habit.currentStreak >= habit.longestStreak && habit.currentStreak > 0 ? ' · PERSONAL RECORD 🏆' : ''}
      </p>

      <div className="h-[2px] overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-flame-h shadow-[0_0_8px_rgba(255,107,26,0.35)] transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-[10px] text-[#3C3A47]">
        Next: <span className="text-flame">{next} days</span> — {daysAway} {daysAway === 1 ? 'day' : 'days'} away
      </p>
    </div>
  )
}

function MiniStreakCard({ habit }: { habit: { name: string; currentStreak: number; completedToday: boolean } }) {
  return (
    <div className="flex-1 cursor-pointer rounded-[10px] border border-border bg-surface p-3 transition-all hover:border-flame/20">
      <p className="mb-1.5 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.08em] text-[#3C3A47]">
        {habit.name}
      </p>
      <p className="font-display text-[30px] italic font-black leading-none tracking-tight text-gradient-flame">
        {habit.currentStreak}
      </p>
      <p className="mt-1 font-mono text-[9px] text-[#3C3A47]">
        {habit.completedToday ? '🔥 done' : '⚡ pending'}
      </p>
    </div>
  )
}

function StatBox({ value, label, delta }: { value: string | number; label: string; delta: string }) {
  return (
    <div className="flex-1 rounded-[10px] border border-border bg-surface p-3">
      <p className="font-mono text-[24px] font-medium leading-none text-[#EDE8E3]">{value}</p>
      <p className="mt-1 text-[11px] text-[#3C3A47]">{label}</p>
      <p className="mt-0.5 font-mono text-[10px] text-mint">{delta}</p>
    </div>
  )
}
