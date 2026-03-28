import Redis from 'ioredis'

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required')
}

export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
})

redis.on('error', (err) => console.error('[redis] error:', err))
redis.on('connect', () => console.log('[redis] connected'))
