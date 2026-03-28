'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc'
import { HabitRow } from './habit-row'

export function HabitList() {
  const { data: habits = [], isLoading } = trpc.habits.list.useQuery()

  const done = habits.filter((h) => h.completedToday).length
  const total = habits.length

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 rounded-[10px] bg-surface animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#3C3A47]">Habits Today</span>
        <span className="font-mono text-[11px] text-[#3C3A47]">{done} of {total} done</span>
        <Link href="/habits" className="ml-auto rounded px-2 py-1 text-[12px] text-[#3C3A47] transition-colors hover:bg-surface-2 hover:text-[#8A8796]">
          All habits →
        </Link>
      </div>

      {habits.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-border p-6 text-center">
          <p className="text-sm text-[#3C3A47]">No habits yet.</p>
          <Link href="/habits?new=1" className="mt-2 block text-sm text-flame hover:underline">
            Add your first habit →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {habits.map((habit) => (
            <HabitRow key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  )
}
