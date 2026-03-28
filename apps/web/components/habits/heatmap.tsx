'use client'

import { trpc } from '@/lib/trpc'
import { cn } from '@/lib/utils'
import type { HeatmapLevel } from '@streakflow/types'

const LEVEL_CLASS: Record<HeatmapLevel, string> = {
  0: 'bg-surface-3',
  1: 'bg-flame/20',
  2: 'bg-flame/45',
  3: 'bg-flame/70',
  4: 'bg-flame shadow-[0_0_5px_rgba(255,107,26,0.4)]',
}

interface HeatmapProps {
  habitId: string
  days?: number
}

export function Heatmap({ habitId, days = 35 }: HeatmapProps) {
  const { data = [], isLoading } = trpc.habits.heatmap.useQuery({ habitId, days })

  if (isLoading) {
    return <div className="h-[80px] rounded-lg bg-surface-2 animate-pulse" />
  }

  // Group into weeks
  const weeks: typeof data[] = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  return (
    <div>
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date} — ${day.level === 0 ? 'Missed' : 'Completed'}`}
                className={cn(
                  'h-[13px] w-[13px] flex-shrink-0 cursor-pointer rounded-[3px] transition-transform hover:scale-125',
                  LEVEL_CLASS[day.level],
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
