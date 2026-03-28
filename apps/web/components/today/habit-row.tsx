'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc'
import { useHabitStore } from '@/stores/habit-store'
import type { HabitWithLogs } from '@streakflow/types'

interface HabitRowProps {
  habit: HabitWithLogs
}

export function HabitRow({ habit }: HabitRowProps) {
  const utils = trpc.useUtils()
  const { setOptimistic, clearOptimistic, getEffectiveCompleted } = useHabitStore()
  const completed = getEffectiveCompleted(habit.id, habit.completedToday)

  const { mutate: complete } = trpc.habits.complete.useMutation({
    onMutate: () => setOptimistic(habit.id, true),
    onError: () => clearOptimistic(habit.id),
    onSettled: () => { clearOptimistic(habit.id); void utils.habits.list.invalidate() },
  })

  const { mutate: uncomplete } = trpc.habits.uncomplete.useMutation({
    onMutate: () => setOptimistic(habit.id, false),
    onError: () => clearOptimistic(habit.id),
    onSettled: () => { clearOptimistic(habit.id); void utils.habits.list.invalidate() },
  })

  const toggle = useCallback(() => {
    if (completed) uncomplete({ habitId: habit.id })
    else complete({ habitId: habit.id })
  }, [complete, uncomplete, habit.id, completed])

  // Last 5 days dots
  const today = new Date()
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (4 - i))
    const key = d.toISOString().split('T')[0]!
    const isToday = i === 4
    const filled = isToday
      ? completed
      : habit.logs.some((l) => l.date.toString().startsWith(key))
    return { key, isToday, filled }
  })

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-[10px] border border-transparent px-3 py-2.5',
        'transition-all duration-150 hover:border-border hover:bg-surface',
      )}
      onClick={toggle}
    >
      {/* Ring */}
      <div
        className={cn(
          'relative flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 overflow-hidden',
          'transition-all duration-250',
          completed
            ? 'border-flame shadow-flame-sm'
            : 'border-border-2 group-hover:border-[#3C3A47]',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-flame-gradient transition-transform duration-250',
            completed ? 'scale-100' : 'scale-0',
          )}
        />
        <span className={cn('relative z-10 text-[11px] text-white transition-opacity duration-200', completed ? 'opacity-100' : 'opacity-0')}>
          ✓
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium text-[#EDE8E3]">{habit.name}</p>
        {habit.description && (
          <p className="text-[11.5px] text-[#8A8796]">{habit.description}</p>
        )}
      </div>

      {/* Pip dots */}
      <div className="flex items-center gap-[3px]">
        {days.map((d) => (
          <div
            key={d.key}
            className={cn(
              'rounded-full transition-colors',
              d.isToday ? 'h-2 w-2' : 'h-1.5 w-1.5',
              d.filled ? 'bg-flame' : 'bg-surface-3',
            )}
          />
        ))}
      </div>

      {/* Streak */}
      <span className={cn('min-w-[40px] text-right font-mono text-[12px] transition-colors', completed ? 'text-flame' : 'text-[#3C3A47]')}>
        🔥 {habit.currentStreak}
      </span>
    </div>
  )
}
