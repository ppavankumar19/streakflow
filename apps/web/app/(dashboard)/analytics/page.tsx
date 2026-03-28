'use client'

import { trpc } from '@/lib/trpc'
import { Topbar } from '@/components/topbar'
import { Badge } from '@streakflow/ui'
import { cn } from '@/lib/utils'

export default function AnalyticsPage() {
  const { data: summary, isLoading: sumLoading } = trpc.analytics.weeklySummary.useQuery()
  const { data: score, isLoading: scoreLoading } = trpc.analytics.productivityScore.useQuery()
  const { data: habits = [] } = trpc.habits.list.useQuery()

  const isLoading = sumLoading || scoreLoading

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar title="Analytics" />

      <div className="flex-1 overflow-y-auto px-7 py-8">
        <div className="mx-auto max-w-4xl space-y-8">

          {/* Productivity score (Pro) */}
          {score ? (
            <div className="rounded-[14px] border border-border bg-surface p-6">
              <div className="mb-4 flex items-center gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#3C3A47]">
                  Productivity Score · 30 days
                </p>
                <Badge variant="pro">PRO</Badge>
              </div>
              <div className="flex items-end gap-6">
                <div>
                  <div className="font-display text-[72px] italic font-black leading-[0.9] text-gradient-flame glow-flame">
                    {score.score}
                  </div>
                  <p className="font-mono text-[10px] text-[#3C3A47]">out of 100</p>
                </div>
                <div className="flex gap-6 pb-3">
                  <ScoreStat label="Habit rate" value={`${score.habitCompletionRate}%`} />
                  <ScoreStat label="Task rate" value={`${score.taskCompletionRate}%`} />
                </div>
              </div>
              <ScoreBar value={score.score} />
            </div>
          ) : (
            <ProUpgradeCard feature="Productivity score, trend lines, and advanced analytics" />
          )}

          {/* Weekly summary */}
          {summary && (
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#3C3A47]">This Week</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard value={summary.tasksCompleted} label="Tasks completed" />
                <StatCard value={`${summary.habitCompletionRate}%`} label="Habit completion" />
                <StatCard value={summary.totalHabitsTracked} label="Habits tracked" />
                <StatCard value={summary.bestDay ?? '—'} label="Best day" />
              </div>
            </div>
          )}

          {/* Habit breakdown */}
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#3C3A47]">
              Habit Streaks
            </p>
            <div className="rounded-[14px] border border-border bg-surface overflow-hidden">
              {habits.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#3C3A47]">No habits yet.</p>
              ) : (
                habits.map((habit, i) => (
                  <div
                    key={habit.id}
                    className={cn(
                      'flex items-center gap-4 px-5 py-3.5',
                      i < habits.length - 1 && 'border-b border-border',
                    )}
                  >
                    <span className="text-xl">{habit.icon}</span>
                    <div className="flex-1">
                      <p className="text-[13.5px] font-medium text-[#EDE8E3]">{habit.name}</p>
                      <p className="font-mono text-[10px] text-[#3C3A47]">{habit.frequency}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[28px] italic font-black text-gradient-flame leading-none">
                        {habit.currentStreak}
                      </p>
                      <p className="font-mono text-[10px] text-[#3C3A47]">streak</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-mono text-[20px] font-medium text-[#8A8796]">{habit.longestStreak}</p>
                      <p className="font-mono text-[10px] text-[#3C3A47]">best</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-[12px] border border-border bg-surface p-4">
      <p className="font-mono text-[26px] font-medium leading-none text-[#EDE8E3]">{value}</p>
      <p className="mt-1.5 text-[12px] text-[#3C3A47]">{label}</p>
    </div>
  )
}

function ScoreStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[22px] font-medium text-[#8A8796]">{value}</p>
      <p className="text-[11px] text-[#3C3A47]">{label}</p>
    </div>
  )
}

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-surface-3">
      <div
        className="h-full rounded-full bg-flame-h shadow-[0_0_8px_rgba(255,107,26,0.3)] transition-all duration-1000"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function ProUpgradeCard({ feature }: { feature: string }) {
  return (
    <div className="rounded-[14px] border border-flame/20 bg-gradient-to-r from-flame/5 to-transparent p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-flame mb-2">Pro Feature</p>
      <p className="text-[14px] text-[#8A8796]">{feature}</p>
      <a href="/settings#billing" className="mt-3 inline-block text-sm text-flame hover:underline">
        Upgrade to Pro →
      </a>
    </div>
  )
}
