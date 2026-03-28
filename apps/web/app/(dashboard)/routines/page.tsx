import type { Metadata } from 'next'
import { Topbar } from '@/components/topbar'

export const metadata: Metadata = { title: 'Routines' }

export default function RoutinesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar title="Routines" />
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-5xl">⊞</div>
          <h2 className="mb-2 text-lg font-semibold text-[#EDE8E3]">Routines coming soon</h2>
          <p className="text-sm text-[#8A8796]">
            Group habits into ordered routines with a built-in timer.
          </p>
        </div>
      </div>
    </div>
  )
}
