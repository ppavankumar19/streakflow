import { Queue } from 'bullmq'
import { redis } from '../redis.js'

export const streakQueue = new Queue('streak-recalc', { connection: redis })
export const emailQueue = new Queue('email-digest', { connection: redis })
export const milestoneQueue = new Queue('milestone-notify', { connection: redis })

export const QUEUE_NAMES = {
  STREAK: 'streak-recalc',
  EMAIL: 'email-digest',
  MILESTONE: 'milestone-notify',
} as const

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]
