import type { Job } from 'bullmq'
import { db } from '@streakflow/db'
import { startOfWeek, endOfWeek } from 'date-fns'

export interface EmailDigestJobData {
  userId: string
}

export async function processEmailDigest(job: Job<EmailDigestJobData>) {
  const { userId } = job.data

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, plan: true },
  })

  if (!user) {
    console.warn(`[email-digest] User ${userId} not found`)
    return
  }

  // Only send digests to Pro+ users
  if (user.plan === 'FREE') return

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

  const [habits, tasksCompleted] = await Promise.all([
    db.habit.findMany({
      where: { userId, archived: false },
      include: {
        logs: { where: { date: { gte: weekStart, lte: weekEnd } } },
      },
    }),
    db.task.count({
      where: { userId, completed: true, completedAt: { gte: weekStart, lte: weekEnd } },
    }),
  ])

  const habitRate = habits.length > 0
    ? Math.round((habits.filter((h) => h.logs.length > 0).length / habits.length) * 100)
    : 0

  const topStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0)

  console.log(`[email-digest] Sending digest to ${user.email} — habits:${habitRate}% tasks:${tasksCompleted} streak:${topStreak}`)

  if (!process.env.RESEND_API_KEY) {
    console.log('[email-digest] RESEND_API_KEY not set, skipping send')
    return
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'noreply@streakflow.app',
    to: user.email,
    subject: `Your weekly StreakFlow digest 🔥`,
    html: buildDigestHTML({
      name: user.name ?? 'there',
      habitRate,
      tasksCompleted,
      topStreak,
      habitsCount: habits.length,
    }),
  })
}

function buildDigestHTML(data: {
  name: string
  habitRate: number
  tasksCompleted: number
  topStreak: number
  habitsCount: number
}) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#09090C;color:#EDE8E3;padding:32px;max-width:520px;margin:0 auto">
  <div style="margin-bottom:24px">
    <span style="background:linear-gradient(135deg,#FF6B1A,#FF3D68);border-radius:8px;padding:6px 10px;font-size:18px">🔥</span>
    <strong style="margin-left:10px;font-size:16px">StreakFlow</strong>
  </div>
  <h1 style="font-size:22px;margin:0 0 8px">Hey ${data.name},</h1>
  <p style="color:#8A8796;margin:0 0 24px">Here's your week in review.</p>
  <div style="display:flex;gap:12px;margin-bottom:24px">
    <div style="flex:1;background:#111116;border:1px solid #1B1B24;border-radius:12px;padding:16px;text-align:center">
      <div style="font-size:28px;font-weight:700;color:#FF6B1A">${data.habitRate}%</div>
      <div style="font-size:11px;color:#8A8796;margin-top:4px">Habit rate</div>
    </div>
    <div style="flex:1;background:#111116;border:1px solid #1B1B24;border-radius:12px;padding:16px;text-align:center">
      <div style="font-size:28px;font-weight:700;color:#EDE8E3">${data.tasksCompleted}</div>
      <div style="font-size:11px;color:#8A8796;margin-top:4px">Tasks done</div>
    </div>
    <div style="flex:1;background:#111116;border:1px solid #1B1B24;border-radius:12px;padding:16px;text-align:center">
      <div style="font-size:28px;font-weight:700;color:#FF6B1A">${data.topStreak}</div>
      <div style="font-size:11px;color:#8A8796;margin-top:4px">Top streak</div>
    </div>
  </div>
  <a href="${process.env.APP_URL ?? 'https://streakflow.app'}/analytics"
     style="display:block;text-align:center;background:linear-gradient(135deg,#FF6B1A,#FF3D68);color:white;border-radius:10px;padding:12px;text-decoration:none;font-weight:600">
    View full analytics →
  </a>
  <p style="color:#3C3A47;font-size:11px;margin-top:24px;text-align:center">
    You're receiving this because you're on the Pro plan. <a href="${process.env.APP_URL ?? ''}/settings" style="color:#8A8796">Manage preferences</a>
  </p>
</body>
</html>`
}
