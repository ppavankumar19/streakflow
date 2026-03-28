'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Topbar } from '@/components/topbar'
import { StreakCard } from '@/components/habits/streak-card'
import { HabitForm } from '@/components/habits/habit-form'
import { Button, Badge } from '@streakflow/ui'

export default function HabitsPage() {
  const { data: habits = [], isLoading } = trpc.habits.list.useQuery()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar
        title="Habits"
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            + New habit
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-7 py-8">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-[14px] bg-surface animate-pulse" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-5xl">🔥</div>
            <h2 className="mb-2 text-lg font-semibold text-[#EDE8E3]">Start your first streak</h2>
            <p className="mb-6 text-sm text-[#8A8796]">Track habits daily and watch your streaks grow.</p>
            <Button onClick={() => setFormOpen(true)}>Create a habit</Button>
          </div>
        ) : (
          <>
            {/* Summary row */}
            <div className="mb-6 flex items-center gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#3C3A47]">
                  {habits.filter((h) => h.completedToday).length} of {habits.length} done today
                </span>
              </div>
              <div className="flex gap-2 ml-auto">
                <Badge variant="flame">
                  🔥 Best: {Math.max(...habits.map((h) => h.currentStreak), 0)} days
                </Badge>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {habits.map((habit) => (
                <StreakCard key={habit.id} habit={habit} showHeatmap />
              ))}
            </div>
          </>
        )}
      </div>

      <HabitForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
