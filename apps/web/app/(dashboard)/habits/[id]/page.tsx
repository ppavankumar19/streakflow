'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc'
import { Topbar } from '@/components/topbar'
import { Heatmap } from '@/components/habits/heatmap'
import { HabitForm } from '@/components/habits/habit-form'
import { Button, Badge } from '@streakflow/ui'
import { cn, streakToNextMilestone } from '@/lib/utils'

export default function HabitDetailPage({ params }: { params: { id: string } }) {
  const { data: habit, isLoading } = trpc.habits.byId.useQuery(params.id)
  const [editOpen, setEditOpen] = useState(false)
  const utils = trpc.useUtils()

  const { mutate: archive } = trpc.habits.update.useMutation({
    onSuccess: () => void utils.habits.list.invalidate(),
  })

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="h-8 w-48 rounded bg-surface animate-pulse mb-4" />
        <div className="h-44 rounded-[14px] bg-surface animate-pulse" />
      </div>
    )
  }

  if (!habit) return notFound()

  const { next, daysAway } = streakToNextMilestone(habit.currentStreak)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar
        title={habit.name}
        eyebrow="Habit detail"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => archive({ id: habit.id, data: { archived: true } })}
            >
              Archive
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-7 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Streak hero */}
          <div className="rounded-[14px] border border-border bg-surface p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#3C3A47]">Current streak</p>
                <div className="font-display text-[72px] italic font-black leading-[0.88] tracking-tight text-gradient-flame glow-flame">
                  {habit.currentStreak}
                </div>
                <p className="font-mono text-[11px] text-[#3C3A47]">days</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#3C3A47]">Personal best</p>
                <p className="font-display text-[40px] italic font-black text-[#8A8796]">{habit.longestStreak}</p>
              </div>
            </div>

            <div className="h-[2px] overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-flame-h transition-all duration-700"
                style={{ width: `${Math.min((habit.currentStreak / next) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-2 font-mono text-[10px] text-[#3C3A47]">
              Next milestone: <span className="text-flame">{next} days</span> — {daysAway} away
            </p>
          </div>

          {/* Heatmap */}
          <div className="rounded-[14px] border border-border bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#3C3A47]">Last 5 weeks</p>
              <Badge variant="flame">{habit.frequency}</Badge>
            </div>
            <Heatmap habitId={habit.id} days={35} />
          </div>
        </div>
      </div>

      <HabitForm open={editOpen} onClose={() => setEditOpen(false)} habitId={habit.id} />
    </div>
  )
}
