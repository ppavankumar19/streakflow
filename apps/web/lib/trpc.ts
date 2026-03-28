import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@streakflow/api'

export const trpc = createTRPCReact<AppRouter>()
