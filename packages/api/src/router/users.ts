import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const usersRouter = createTRPCRouter({
  // ── Get current user's profile ─────────────────────────────────────────
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true,
        trialEndsAt: true,
        createdAt: true,
        subscription: {
          select: { status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true },
        },
        _count: {
          select: { habits: true, tasks: true },
        },
      },
    })
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' })
    return user
  }),

  // ── Update profile ──────────────────────────────────────────────────────
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({ where: { id: ctx.userId }, data: input })
    }),

  // ── Get freeze token balance ────────────────────────────────────────────
  freezeTokenBalance: protectedProcedure.query(async ({ ctx }) => {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const used = await ctx.db.freezeToken.count({
      where: { userId: ctx.userId, usedAt: { gte: monthStart } },
    })

    const limit =
      ctx.userPlan === 'FREE' ? 1 : ctx.userPlan === 'PRO' ? 3 : 5

    return { used, limit, remaining: limit - used }
  }),

  // ── Delete account (GDPR) ───────────────────────────────────────────────
  deleteAccount: protectedProcedure
    .input(z.object({ confirmEmail: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { id: ctx.userId } })
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' })
      if (input.confirmEmail !== user.email) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email confirmation does not match.' })
      }
      await ctx.db.user.delete({ where: { id: ctx.userId } })
      return { success: true }
    }),
})
