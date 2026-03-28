import { createTRPCRouter } from '../trpc'
import { habitsRouter } from './habits'
import { tasksRouter } from './tasks'
import { analyticsRouter } from './analytics'
import { usersRouter } from './users'

export const appRouter = createTRPCRouter({
  habits: habitsRouter,
  tasks: tasksRouter,
  analytics: analyticsRouter,
  users: usersRouter,
})

export type AppRouter = typeof appRouter
