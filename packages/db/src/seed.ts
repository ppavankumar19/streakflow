import { PrismaClient, Plan, Frequency } from '@prisma/client'
import { subDays, startOfDay } from 'date-fns'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const user = await db.user.upsert({
    where: { email: 'demo@streakflow.app' },
    update: {},
    create: {
      email: 'demo@streakflow.app',
      name: 'Demo User',
      plan: Plan.PRO,
      trialEndsAt: null,
    },
  })

  console.log(`✓ Created user: ${user.email}`)

  // Create habits
  const habits = await Promise.all([
    db.habit.upsert({
      where: { id: 'habit-morning-writing' },
      update: {},
      create: {
        id: 'habit-morning-writing',
        userId: user.id,
        name: 'Morning writing',
        description: '3 pages · morning pages method',
        icon: '✍️',
        color: '#FF6B1A',
        frequency: Frequency.DAILY,
        currentStreak: 47,
        longestStreak: 47,
        lastCompletedAt: startOfDay(new Date()),
        order: 0,
      },
    }),
    db.habit.upsert({
      where: { id: 'habit-reading' },
      update: {},
      create: {
        id: 'habit-reading',
        userId: user.id,
        name: 'Read 30 min',
        description: 'Non-fiction books',
        icon: '📚',
        color: '#4FBEFF',
        frequency: Frequency.DAILY,
        currentStreak: 23,
        longestStreak: 45,
        lastCompletedAt: startOfDay(new Date()),
        order: 1,
      },
    }),
    db.habit.upsert({
      where: { id: 'habit-exercise' },
      update: {},
      create: {
        id: 'habit-exercise',
        userId: user.id,
        name: 'Exercise',
        description: '30 min minimum',
        icon: '🏃',
        color: '#2ECFA0',
        frequency: Frequency.WEEKDAYS,
        currentStreak: 12,
        longestStreak: 34,
        lastCompletedAt: subDays(startOfDay(new Date()), 1),
        order: 2,
      },
    }),
    db.habit.upsert({
      where: { id: 'habit-meditate' },
      update: {},
      create: {
        id: 'habit-meditate',
        userId: user.id,
        name: 'Meditate',
        description: '10 min · evening',
        icon: '🧘',
        color: '#F5C842',
        frequency: Frequency.DAILY,
        currentStreak: 8,
        longestStreak: 21,
        lastCompletedAt: subDays(startOfDay(new Date()), 1),
        order: 3,
      },
    }),
  ])

  console.log(`✓ Created ${habits.length} habits`)

  // Seed habit logs for the last 60 days for morning writing
  const today = startOfDay(new Date())
  const writingHabit = habits[0]!
  const missedDays = new Set([10, 22, 35]) // simulate a few misses

  for (let i = 0; i < 60; i++) {
    if (missedDays.has(i)) continue
    const date = subDays(today, i)
    await db.habitLog.upsert({
      where: { habitId_date: { habitId: writingHabit.id, date } },
      update: {},
      create: { habitId: writingHabit.id, date, completedAt: date },
    })
  }

  console.log('✓ Seeded habit logs')

  // Seed tasks for today
  const todayTasks = [
    { title: 'Ship authentication PR', completed: true, tags: ['dev', 'team'], priority: 'high' },
    { title: 'Write morning pages (3 pages)', completed: true, tags: ['writing'] },
    { title: 'Review Q1 OKR progress report', completed: true, tags: [], priority: 'high' },
    { title: 'Update Prisma schema for user preferences', completed: false, tags: ['dev'] },
    { title: "Respond to Marcus's design feedback", completed: false, tags: ['team'] },
    { title: 'Chapter 4 outline — 30 min deep work', completed: false, tags: ['writing'] },
  ]

  for (const [i, task] of todayTasks.entries()) {
    await db.task.upsert({
      where: { id: `task-seed-${i}` },
      update: {},
      create: {
        id: `task-seed-${i}`,
        userId: user.id,
        title: task.title,
        completed: task.completed,
        completedAt: task.completed ? new Date() : null,
        priority: task.priority ?? null,
        tags: task.tags,
        order: i,
      },
    })
  }

  console.log('✓ Seeded tasks')
  console.log('✅ Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
