import 'dotenv/config'
import { Worker, QueueScheduler } from 'bullmq'
import { redis } from './redis.js'
import { QUEUE_NAMES } from './queues/index.js'
import { processStreakRecalc } from './jobs/streak-calculator.js'
import { processEmailDigest } from './jobs/email-digest.js'
import { processMilestoneNotify } from './jobs/milestone-notifier.js'
import { streakQueue, emailQueue } from './queues/index.js'

console.log('🚀 StreakFlow worker starting…')

// ── Workers ────────────────────────────────────────────────────────────────────

const streakWorker = new Worker(
  QUEUE_NAMES.STREAK,
  async (job) => processStreakRecalc(job),
  { connection: redis, concurrency: 5 },
)

const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job) => processEmailDigest(job),
  { connection: redis, concurrency: 3 },
)

const milestoneWorker = new Worker(
  QUEUE_NAMES.MILESTONE,
  async (job) => processMilestoneNotify(job),
  { connection: redis, concurrency: 5 },
)

// ── Error handling ─────────────────────────────────────────────────────────────

for (const worker of [streakWorker, emailWorker, milestoneWorker]) {
  worker.on('failed', (job, err) => {
    console.error(`[worker] Job ${job?.id} failed:`, err.message)
  })
  worker.on('completed', (job) => {
    console.log(`[worker] Job ${job.id} (${job.name}) completed`)
  })
}

// ── Scheduled jobs ─────────────────────────────────────────────────────────────

async function scheduleRecurringJobs() {
  // Nightly streak recalc — runs at 00:05 every day
  await streakQueue.add(
    'nightly-recalc',
    { userId: undefined, habitId: undefined },
    {
      repeat: { pattern: '5 0 * * *' },
      removeOnComplete: 10,
      removeOnFail: 5,
    },
  )

  // Weekly digest — runs Monday 08:00
  const { db } = await import('@streakflow/db')
  const proUsers = await db.user.findMany({
    where: { plan: { in: ['PRO', 'TEAM'] } },
    select: { id: true },
  })

  for (const user of proUsers) {
    await emailQueue.add(
      `digest-${user.id}`,
      { userId: user.id },
      {
        repeat: { pattern: '0 8 * * 1' }, // Monday 08:00
        removeOnComplete: 5,
        removeOnFail: 3,
      },
    )
  }

  console.log(`[scheduler] Scheduled nightly recalc + ${proUsers.length} digests`)
}

scheduleRecurringJobs().catch(console.error)

// ── Graceful shutdown ──────────────────────────────────────────────────────────

async function shutdown(signal: string) {
  console.log(`[worker] ${signal} received, shutting down…`)
  await Promise.all([streakWorker.close(), emailWorker.close(), milestoneWorker.close()])
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

console.log('✅ Worker ready — listening for jobs')
