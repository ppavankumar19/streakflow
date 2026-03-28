import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { db } from '@streakflow/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@streakflow/auth'
import type { Plan } from '@streakflow/types'

// ── Context ────────────────────────────────────────────────────────────────────

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await getServerSession(authOptions)
  return {
    db,
    session,
    headers: opts.headers,
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

// ── Init ───────────────────────────────────────────────────────────────────────

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

// ── Middleware ─────────────────────────────────────────────────────────────────

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.session.user.id as string,
      userPlan: (ctx.session.user as { plan?: Plan }).plan ?? 'FREE',
    },
  })
})

const enforcePro = t.middleware(({ ctx, next }) => {
  const plan = (ctx.session?.user as { plan?: Plan } | undefined)?.plan ?? 'FREE'
  if (plan === 'FREE') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This feature requires a Pro or Team plan.',
    })
  }
  return next({ ctx })
})

// ── Exports ────────────────────────────────────────────────────────────────────

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

/** Callable by anyone (unauthenticated OK) */
export const publicProcedure = t.procedure

/** Requires a valid session */
export const protectedProcedure = t.procedure.use(enforceAuth)

/** Requires Pro or Team plan */
export const proProcedure = t.procedure.use(enforceAuth).use(enforcePro)
