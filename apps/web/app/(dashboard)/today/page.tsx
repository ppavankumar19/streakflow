import type { Metadata } from 'next'
import { format } from 'date-fns'
import { Topbar } from '@/components/topbar'
import { TaskList } from '@/components/today/task-list'
import { HabitList } from '@/components/today/habit-list'
import { MilestoneBanner } from '@/components/today/milestone-banner'
import { StreakPanel } from '@/components/today/streak-panel'

export const metadata: Metadata = { title: 'Today' }
export const dynamic = 'force-dynamic'

export default function TodayPage() {
  const dayName = format(new Date(), 'EEEE')

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar title="Today" />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Feed */}
        <div className="flex min-w-0 flex-1 flex-col gap-8 overflow-y-auto border-r border-border px-7 py-8">
          <MilestoneBanner />
          <TaskList />
          <HabitList />
        </div>

        {/* Right panel */}
        <aside className="w-[296px] flex-shrink-0 overflow-y-auto bg-[#09090C] px-5 py-8">
          <StreakPanel />
        </aside>
      </div>
    </div>
  )
}
