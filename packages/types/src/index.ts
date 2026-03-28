// ── Enums ─────────────────────────────────────────────────────────────────────

export type Plan = 'FREE' | 'PRO' | 'TEAM'

export type Frequency = 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'CUSTOM'

export type Priority = 'low' | 'medium' | 'high'

export type SpaceRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELED'
  | 'PAST_DUE'
  | 'TRIALING'
  | 'INCOMPLETE'

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4

// ── Core models ───────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  plan: Plan
  trialEndsAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Habit {
  id: string
  userId: string
  name: string
  description: string | null
  color: string
  icon: string
  frequency: Frequency
  customDays: number[]
  archived: boolean
  order: number
  currentStreak: number
  longestStreak: number
  lastCompletedAt: Date | null
  spaceId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[]
  completedToday: boolean
}

export interface HabitLog {
  id: string
  habitId: string
  date: Date
  completedAt: Date
  note: string | null
}

export interface Task {
  id: string
  userId: string
  title: string
  completed: boolean
  completedAt: Date | null
  dueDate: Date | null
  priority: Priority | null
  tags: string[]
  recurring: Frequency | null
  customDays: number[]
  autoRollover: boolean
  parentId: string | null
  order: number
  subtasks?: Task[]
  createdAt: Date
  updatedAt: Date
}

export interface FreezeToken {
  id: string
  userId: string
  habitId: string
  usedAt: Date
  targetDate: Date
}

export interface Subscription {
  id: string
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  status: SubscriptionStatus
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

export interface Space {
  id: string
  name: string
  description: string | null
  ownerId: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export interface SpaceMember {
  id: string
  spaceId: string
  userId: string
  role: SpaceRole
  joinedAt: Date
}

// ── Plan limits ───────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  FREE: {
    maxHabits: 5,
    heatmapDays: 30,
    freezeTokensPerMonth: 1,
    analyticsHistory: 30,
  },
  PRO: {
    maxHabits: Infinity,
    heatmapDays: 365,
    freezeTokensPerMonth: 3,
    analyticsHistory: 365,
  },
  TEAM: {
    maxHabits: Infinity,
    heatmapDays: 365,
    freezeTokensPerMonth: 5,
    analyticsHistory: 365,
  },
} as const satisfies Record<Plan, { maxHabits: number; heatmapDays: number; freezeTokensPerMonth: number; analyticsHistory: number }>

// ── Analytics types ────────────────────────────────────────────────────────────

export interface WeeklySummary {
  weekStart: Date
  weekEnd: Date
  tasksCompleted: number
  habitCompletionRate: number
  bestDay: string | null
  totalHabitsTracked: number
}

export interface HabitAnalytics {
  habitId: string
  completionRate: number
  bestDayOfWeek: number | null
  averageCompletionTime: number | null
  heatmapData: HeatmapDay[]
  weeklyData: WeeklyHabitData[]
}

export interface HeatmapDay {
  date: string // ISO date string YYYY-MM-DD
  level: HeatmapLevel
  count: number
}

export interface WeeklyHabitData {
  week: string
  completed: number
  total: number
  rate: number
}

// ── API input types ────────────────────────────────────────────────────────────

export interface CreateHabitInput {
  name: string
  description?: string
  color?: string
  icon?: string
  frequency: Frequency
  customDays?: number[]
}

export interface UpdateHabitInput extends Partial<CreateHabitInput> {
  archived?: boolean
  order?: number
}

export interface CreateTaskInput {
  title: string
  dueDate?: Date
  priority?: Priority
  tags?: string[]
  recurring?: Frequency
  customDays?: number[]
  autoRollover?: boolean
  parentId?: string
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  completed?: boolean
  order?: number
}

// ── Session / auth types ───────────────────────────────────────────────────────

export interface SessionUser {
  id: string
  email: string
  name: string | null
  image: string | null
  plan: Plan
}
