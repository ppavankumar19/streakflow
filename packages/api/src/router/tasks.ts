import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { startOfDay, endOfDay } from 'date-fns'

const taskInput = z.object({
  title: z.string().min(1).max(500),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).default([]),
  recurring: z.enum(['DAILY', 'WEEKDAYS', 'WEEKENDS', 'CUSTOM']).optional(),
  customDays: z.array(z.number().min(0).max(6)).default([]),
  autoRollover: z.boolean().default(false),
  parentId: z.string().optional(),
})

export const tasksRouter = createTRPCRouter({
  // ── List tasks ─────────────────────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        completed: z.boolean().optional(),
        date: z.date().optional(), // filter to tasks due on/before this date
        parentId: z.string().nullable().optional(),
      }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const today = input?.date ?? new Date()
      return ctx.db.task.findMany({
        where: {
          userId: ctx.userId,
          completed: input?.completed,
          parentId: input?.parentId ?? null, // top-level tasks only by default
          ...(input?.date
            ? { dueDate: { lte: endOfDay(today) } }
            : {}),
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: {
          subtasks: { orderBy: { order: 'asc' } },
        },
      })
    }),

  // ── Tasks for today (due today OR overdue + recurring) ─────────────────
  today: protectedProcedure.query(async ({ ctx }) => {
    const todayStart = startOfDay(new Date())
    const todayEnd = endOfDay(new Date())

    const tasks = await ctx.db.task.findMany({
      where: {
        userId: ctx.userId,
        parentId: null,
        OR: [
          // Due today or overdue
          { dueDate: { lte: todayEnd } },
          // No due date but created today
          { dueDate: null, createdAt: { gte: todayStart } },
          // Recurring tasks
          { recurring: { not: null } },
        ],
      },
      orderBy: [{ completed: 'asc' }, { priority: 'desc' }, { order: 'asc' }],
      include: { subtasks: { orderBy: { order: 'asc' } } },
    })

    return tasks
  }),

  // ── Get a single task ──────────────────────────────────────────────────
  byId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const task = await ctx.db.task.findFirst({
      where: { id: input, userId: ctx.userId },
      include: { subtasks: { orderBy: { order: 'asc' } } },
    })
    if (!task) throw new TRPCError({ code: 'NOT_FOUND' })
    return task
  }),

  // ── Create a task ──────────────────────────────────────────────────────
  create: protectedProcedure.input(taskInput).mutation(async ({ ctx, input }) => {
    if (input.parentId) {
      const parent = await ctx.db.task.findFirst({ where: { id: input.parentId, userId: ctx.userId } })
      if (!parent) throw new TRPCError({ code: 'NOT_FOUND', message: 'Parent task not found' })
    }
    return ctx.db.task.create({ data: { ...input, userId: ctx.userId } })
  }),

  // ── Update a task ──────────────────────────────────────────────────────
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: taskInput.partial().extend({ order: z.number().optional() }) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.task.findFirst({ where: { id: input.id, userId: ctx.userId } })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })
      return ctx.db.task.update({ where: { id: input.id }, data: input.data })
    }),

  // ── Toggle completion ──────────────────────────────────────────────────
  complete: protectedProcedure
    .input(z.object({ id: z.string(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.task.findFirst({ where: { id: input.id, userId: ctx.userId } })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })

      return ctx.db.task.update({
        where: { id: input.id },
        data: {
          completed: input.completed,
          completedAt: input.completed ? new Date() : null,
        },
      })
    }),

  // ── Delete a task ──────────────────────────────────────────────────────
  delete: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.task.findFirst({ where: { id: input, userId: ctx.userId } })
    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })
    await ctx.db.task.delete({ where: { id: input } })
    return { success: true }
  }),

  // ── Reorder tasks ──────────────────────────────────────────────────────
  reorder: protectedProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number() })))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.map(({ id, order }) =>
          ctx.db.task.updateMany({ where: { id, userId: ctx.userId }, data: { order } }),
        ),
      )
      return { success: true }
    }),

  // ── Bulk delete completed tasks ────────────────────────────────────────
  clearCompleted: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await ctx.db.task.deleteMany({
      where: { userId: ctx.userId, completed: true },
    })
    return { deleted: result.count }
  }),
})
