import type { Job } from 'bullmq'
import { db } from '@streakflow/db'

export interface MilestoneJobData {
  habitId: string
  userId: string
  streak: number
}

const MILESTONE_DAYS = [7, 14, 21, 30, 50, 60, 75, 100, 150, 200, 250, 365]

export async function processMilestoneNotify(job: Job<MilestoneJobData>) {
  const { habitId, userId, streak } = job.data

  if (!MILESTONE_DAYS.includes(streak)) return

  const [habit, user] = await Promise.all([
    db.habit.findUnique({ where: { id: habitId }, select: { name: true } }),
    db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
  ])

  if (!habit || !user) return

  console.log(`[milestone] 🎉 ${user.email} — ${habit.name} hit ${streak} days!`)

  if (!process.env.RESEND_API_KEY) {
    console.log('[milestone] RESEND_API_KEY not set, skipping')
    return
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const emojis: Record<number, string> = {
    7: '🔥', 14: '⚡', 21: '🌟', 30: '💪', 50: '🏆',
    60: '🚀', 75: '💎', 100: '👑', 150: '🌠', 200: '🎯', 250: '🦅', 365: '🌏',
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'noreply@streakflow.app',
    to: user.email,
    subject: `${emojis[streak] ?? '🔥'} ${streak}-day streak unlocked — ${habit.name}`,
    html: `
<div style="font-family:system-ui,sans-serif;background:#09090C;color:#EDE8E3;padding:32px;max-width:480px;margin:0 auto">
  <div style="font-size:56px;text-align:center;margin-bottom:16px">${emojis[streak] ?? '🔥'}</div>
  <h1 style="font-size:24px;text-align:center;margin:0 0 8px">${streak} days!</h1>
  <p style="color:#8A8796;text-align:center;margin:0 0 24px">
    You've kept up <strong style="color:#FF6B1A">${habit.name}</strong> for ${streak} consecutive days.
    ${streak >= 100 ? "You're in the top 1% of users!" : streak >= 30 ? "That's incredible consistency!" : "Keep the momentum!"}
  </p>
  <a href="${process.env.APP_URL ?? 'https://streakflow.app'}/habits"
     style="display:block;text-align:center;background:linear-gradient(135deg,#FF6B1A,#FF3D68);color:white;border-radius:10px;padding:12px;text-decoration:none;font-weight:600">
    View your streaks →
  </a>
</div>`,
  })
}
