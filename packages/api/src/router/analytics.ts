import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, proProcedure } from '../trpc'
import { startOfDay, subDays, startOfWeek, endOfWeek, format, eachWeekOfInterval } from 'date-fns'
import { PLAN_LIMITS } from '@streakflow/types'
import type { WeeklySummary } from '@streakflow/types'

export const analyticsRouter = createTRPCRouter({
  // ── Weekly summary ──────────────────────────────────────────────────────
  weeklySummary: protectedProcedure.query(async ({ ctx }) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

    const [tasksCompleted, habits] = await Promise.all([
      ctx.db.task.count({
        where: {
          userId: ctx.userId,
          completed: true,
          completedAt: { gte: weekStart, lte: weekEnd },
        },
      }),
      ctx.db.habit.findMany({
        where: { userId: ctx.userId, archived: false },
        include: {
          logs: {
            where: { date: { gte: weekStart, lte: weekEnd } },
          },
        },
      }),
    ])

    const totalHabits = habits.length
    const totalExpected = totalHabits * 7
    const totalCompleted = habits.reduce((sum, h) => sum + h.logs.length, 0)
    const completionRate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0

    // Best day of this week
    const dayCount: Record<string, number> = {}
    for (const habit of habits) {
      for (const log of habit.logs) {
        const day = format(log.date, 'EEEE')
        dayCount[day] = (dayCount[day] ?? 0) + 1
      }
    }
    const bestDay = Object.entries(dayCount).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null

    const summary: WeeklySummary = {
      weekStart,
      weekEnd,
      tasksCompleted,
      habitCompletionRate: completionRate,
      bestDay,
      totalHabitsTracked: totalHabits,
    }

    return summary
  }),

  // ── Habit-level analytics (Pro only) ───────────────────────────────────
  habitAnalytics: proProcedure
    .input(z.object({ habitId: z.string(), days: z.number().min(7).max(365).default(90) }))
    .query(async ({ ctx, input }) => {
      const limit = PLAN_LIMITS[ctx.userPlan].analyticsHistory
      const days = Math.min(input.days, limit)
      const since = subDays(startOfDay(new Date()), days)

      const logs = await ctx.db.habitLog.findMany({
        where: {
          habitId: input.habitId,
          habit: { userId: ctx.userId },
          date: { gte: since },
        },
        select: { date: true },
        orderBy: { date: 'asc' },
      })

      const logSet = new Set(logs.map((l) => format(l.date, 'yyyy-MM-dd')))

      // Day-of-week distribution
      const dayOfWeekCount = Array(7).fill(0) as number[]
      for (const log of logs) {
        const dow = new Date(log.date).getDay()
        dayOfWeekCount[dow]! += 1
      }
      const bestDayOfWeek = dayOfWeekCount.indexOf(Math.max(...dayOfWeekCount))

      // Completion rate
      const completionRate = Math.round((logs.length / days) * 100)

      // Weekly breakdown
      const weeks = eachWeekOfInterval({ start: since, end: new Date() }, { weekStartsOn: 1 })
      const weeklyData = weeks.map((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
        let completed = 0
        let total = 0
        const d = new Date(weekStart)
        while (d <= weekEnd && d <= new Date()) {
          total++
          if (logSet.has(format(d, 'yyyy-MM-dd'))) completed++
          d.setDate(d.getDate() + 1)
        }
        return {
          week: format(weekStart, 'yyyy-MM-dd'),
          completed,
          total,
          rate: total > 0 ? Math.round((completed / total) * 100) : 0,
        }
      })

      return { habitId: input.habitId, completionRate, bestDayOfWeek, weeklyData }
    }),

  // ── Overall productivity score (Pro only) ───────────────────────────────
  productivityScore: proProcedure.query(async ({ ctx }) => {
    const since = subDays(startOfDay(new Date()), 30)

    const [habits, tasksDone, tasksTotal] = await Promise.all([
      ctx.db.habit.findMany({
        where: { userId: ctx.userId, archived: false },
        include: { logs: { where: { date: { gte: since } } } },
      }),
      ctx.db.task.count({ where: { userId: ctx.userId, completed: true, completedAt: { gte: since } } }),
      ctx.db.task.count({ where: { userId: ctx.userId, createdAt: { gte: since } } }),
    ])

    const totalHabitDays = habits.length * 30
    const completedHabitDays = habits.reduce((s, h) => s + h.logs.length, 0)
    const habitScore = totalHabitDays > 0 ? (completedHabitDays / totalHabitDays) * 60 : 0
    const taskScore = tasksTotal > 0 ? (tasksDone / tasksTotal) * 40 : 0

    return {
      score: Math.round(habitScore + taskScore),
      habitCompletionRate: totalHabitDays > 0 ? Math.round((completedHabitDays / totalHabitDays) * 100) : 0,
      taskCompletionRate: tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0,
      period: '30d',
    }
  }),

  // ── Export data ─────────────────────────────────────────────────────────
  export: proProcedure
    .input(z.object({ format: z.enum(['json', 'csv']), type: z.enum(['habits', 'tasks', 'all']) }))
    .query(async ({ ctx, input }) => {
      const [habits, tasks] = await Promise.all([
        input.type !== 'tasks'
          ? ctx.db.habit.findMany({
              where: { userId: ctx.userId },
              include: { logs: true },
            })
          : Promise.resolve([]),
        input.type !== 'habits'
          ? ctx.db.task.findMany({ where: { userId: ctx.userId } })
          : Promise.resolve([]),
      ])

      return { habits, tasks, exportedAt: new Date() }
    }),
})
