import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure, proProcedure } from '../trpc'
import { startOfDay, subDays, format } from 'date-fns'
import { PLAN_LIMITS } from '@streakflow/types'
import type { HeatmapDay, HeatmapLevel } from '@streakflow/types'

const habitInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#FF6B1A'),
  icon: z.string().max(4).default('🔥'),
  frequency: z.enum(['DAILY', 'WEEKDAYS', 'WEEKENDS', 'CUSTOM']).default('DAILY'),
  customDays: z.array(z.number().min(0).max(6)).default([]),
})

export const habitsRouter = createTRPCRouter({
  // ── List all habits for the current user ──────────────────────────────
  list: protectedProcedure
    .input(z.object({ includeArchived: z.boolean().default(false) }).optional())
    .query(async ({ ctx, input }) => {
      const habits = await ctx.db.habit.findMany({
        where: {
          userId: ctx.userId,
          archived: input?.includeArchived ? undefined : false,
        },
        orderBy: { order: 'asc' },
        include: {
          logs: {
            where: { date: { gte: subDays(startOfDay(new Date()), 7) } },
            orderBy: { date: 'desc' },
          },
        },
      })

      const today = startOfDay(new Date())
      return habits.map((h) => ({
        ...h,
        completedToday: h.logs.some(
          (l) => format(l.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
        ),
      }))
    }),

  // ── Get a single habit with analytics ────────────────────────────────
  byId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const habit = await ctx.db.habit.findFirst({
      where: { id: input, userId: ctx.userId },
      include: { logs: { orderBy: { date: 'desc' }, take: 365 } },
    })
    if (!habit) throw new TRPCError({ code: 'NOT_FOUND' })
    return habit
  }),

  // ── Create a new habit ────────────────────────────────────────────────
  create: protectedProcedure.input(habitInput).mutation(async ({ ctx, input }) => {
    const count = await ctx.db.habit.count({
      where: { userId: ctx.userId, archived: false },
    })
    const limit = PLAN_LIMITS[ctx.userPlan].maxHabits
    if (count >= limit) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Free plan is limited to ${limit} habits. Upgrade to Pro for unlimited habits.`,
      })
    }
    return ctx.db.habit.create({ data: { ...input, userId: ctx.userId } })
  }),

  // ── Update a habit ────────────────────────────────────────────────────
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: habitInput.partial().extend({ archived: z.boolean().optional(), order: z.number().optional() }) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.habit.findFirst({ where: { id: input.id, userId: ctx.userId } })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })
      return ctx.db.habit.update({ where: { id: input.id }, data: input.data })
    }),

  // ── Delete a habit ────────────────────────────────────────────────────
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.habit.findFirst({ where: { id: input, userId: ctx.userId } })
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })
    await ctx.db.habit.delete({ where: { id: input } })
    return { success: true }
  }),

  // ── Log a habit completion ────────────────────────────────────────────
  complete: protectedProcedure
    .input(z.object({ habitId: z.string(), date: z.date().optional(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const date = startOfDay(input.date ?? new Date())
      const habit = await ctx.db.habit.findFirst({ where: { id: input.habitId, userId: ctx.userId } })
      if (!habit) throw new TRPCError({ code: 'NOT_FOUND' })

      // Upsert the log
      await ctx.db.habitLog.upsert({
        where: { habitId_date: { habitId: input.habitId, date } },
        update: { note: input.note },
        create: { habitId: input.habitId, date, note: input.note },
      })

      // Recalculate streak
      const newStreak = await recalcStreak(ctx.db, input.habitId)
      return { streak: newStreak }
    }),

  // ── Undo a habit completion ───────────────────────────────────────────
  uncomplete: protectedProcedure
    .input(z.object({ habitId: z.string(), date: z.date().optional() }))
    .mutation(async ({ ctx, input }) => {
      const date = startOfDay(input.date ?? new Date())
      const habit = await ctx.db.habit.findFirst({ where: { id: input.habitId, userId: ctx.userId } })
      if (!habit) throw new TRPCError({ code: 'NOT_FOUND' })

      await ctx.db.habitLog.deleteMany({ where: { habitId: input.habitId, date } })
      const newStreak = await recalcStreak(ctx.db, input.habitId)
      return { streak: newStreak }
    }),

  // ── Get heatmap data ──────────────────────────────────────────────────
  heatmap: protectedProcedure
    .input(z.object({ habitId: z.string(), days: z.number().min(30).max(365).default(30) }))
    .query(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findFirst({ where: { id: input.habitId, userId: ctx.userId } })
      if (!habit) throw new TRPCError({ code: 'NOT_FOUND' })

      const limit = PLAN_LIMITS[ctx.userPlan].heatmapDays
      const days = Math.min(input.days, limit)
      const since = subDays(startOfDay(new Date()), days)

      const logs = await ctx.db.habitLog.findMany({
        where: { habitId: input.habitId, date: { gte: since } },
        select: { date: true },
      })

      const logSet = new Set(logs.map((l) => format(l.date, 'yyyy-MM-dd')))
      const result: HeatmapDay[] = []

      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i)
        const key = format(d, 'yyyy-MM-dd')
        const completed = logSet.has(key)
        result.push({ date: key, level: (completed ? 4 : 0) as HeatmapLevel, count: completed ? 1 : 0 })
      }

      return result
    }),

  // ── Use a freeze token ────────────────────────────────────────────────
  freeze: protectedProcedure
    .input(z.object({ habitId: z.string(), targetDate: z.date() }))
    .mutation(async ({ ctx, input }) => {
      const date = startOfDay(input.targetDate)
      const habit = await ctx.db.habit.findFirst({ where: { id: input.habitId, userId: ctx.userId } })
      if (!habit) throw new TRPCError({ code: 'NOT_FOUND' })

      // Check monthly token budget
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const usedThisMonth = await ctx.db.freezeToken.count({
        where: { userId: ctx.userId, usedAt: { gte: monthStart } },
      })

      const allowed = PLAN_LIMITS[ctx.userPlan].freezeTokensPerMonth
      if (usedThisMonth >= allowed) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You've used all ${allowed} freeze tokens for this month.`,
        })
      }

      await ctx.db.freezeToken.create({
        data: { userId: ctx.userId, habitId: input.habitId, targetDate: date },
      })

      return { success: true, tokensRemaining: allowed - usedThisMonth - 1 }
    }),

  // ── Reorder habits ────────────────────────────────────────────────────
  reorder: protectedProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number() })))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.map(({ id, order }) =>
          ctx.db.habit.updateMany({ where: { id, userId: ctx.userId }, data: { order } }),
        ),
      )
      return { success: true }
    }),
})

// ── Helpers ────────────────────────────────────────────────────────────────────

async function recalcStreak(
  db: TRPCContext['db'],
  habitId: string,
): Promise<number> {
  const logs = await db.habitLog.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
    select: { date: true },
  })

  if (logs.length === 0) {
    await db.habit.update({ where: { id: habitId }, data: { currentStreak: 0 } })
    return 0
  }

  let streak = 0
  let expected = startOfDay(new Date())

  for (const log of logs) {
    const logDate = startOfDay(log.date)
    const diff = Math.round((expected.getTime() - logDate.getTime()) / 86_400_000)
    if (diff === 0 || diff === 1) {
      streak++
      expected = logDate
    } else {
      break
    }
  }

  const habit = await db.habit.findUnique({ where: { id: habitId }, select: { longestStreak: true } })
  await db.habit.update({
    where: { id: habitId },
    data: {
      currentStreak: streak,
      longestStreak: Math.max(streak, habit?.longestStreak ?? 0),
      lastCompletedAt: logs[0] ? startOfDay(logs[0].date) : null,
    },
  })

  return streak
}

type TRPCContext = Awaited<ReturnType<typeof import('../trpc').createTRPCContext>>
