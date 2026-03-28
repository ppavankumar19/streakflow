import type { Job } from 'bullmq'
import { db } from '@streakflow/db'
import { startOfDay, subDays, format, isWeekend } from 'date-fns'

export interface StreakRecalcJobData {
  userId?: string // if omitted, recalc ALL users
  habitId?: string // if provided, recalc a single habit
}

export async function processStreakRecalc(job: Job<StreakRecalcJobData>) {
  const { userId, habitId } = job.data

  console.log(`[streak] Starting recalc — userId:${userId ?? 'all'} habitId:${habitId ?? 'all'}`)

  const habits = await db.habit.findMany({
    where: {
      archived: false,
      ...(userId ? { userId } : {}),
      ...(habitId ? { id: habitId } : {}),
    },
    include: {
      logs: {
        orderBy: { date: 'desc' },
        select: { date: true },
      },
    },
  })

  let updated = 0

  for (const habit of habits) {
    const streak = calcStreak(habit)
    await db.habit.update({
      where: { id: habit.id },
      data: {
        currentStreak: streak,
        longestStreak: Math.max(streak, habit.longestStreak),
        lastCompletedAt: habit.logs[0] ? startOfDay(habit.logs[0].date) : null,
      },
    })
    updated++
  }

  console.log(`[streak] Recalculated ${updated} habits`)
  return { updated }
}

function calcStreak(habit: { frequency: string; logs: { date: Date }[] }): number {
  if (habit.logs.length === 0) return 0

  const logs = habit.logs.map((l) => startOfDay(l.date))
  const logSet = new Set(logs.map((d) => format(d, 'yyyy-MM-dd')))

  let streak = 0
  let current = startOfDay(new Date())

  while (true) {
    const key = format(current, 'yyyy-MM-dd')

    // Skip days not in the habit's schedule
    if (habit.frequency === 'WEEKDAYS' && isWeekend(current)) {
      current = subDays(current, 1)
      continue
    }
    if (habit.frequency === 'WEEKENDS' && !isWeekend(current)) {
      current = subDays(current, 1)
      continue
    }

    if (logSet.has(key)) {
      streak++
      current = subDays(current, 1)
    } else if (format(current, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
      // Allow missing today (streak isn't broken until tomorrow)
      current = subDays(current, 1)
    } else {
      break
    }

    if (streak > 3650) break // safety cap
  }

  return streak
}
