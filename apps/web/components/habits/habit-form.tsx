'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '@streakflow/ui'
import { HABIT_ICONS, HABIT_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { CreateHabitInput } from '@streakflow/types'

interface HabitFormProps {
  open: boolean
  onClose: () => void
  habitId?: string // if provided, edit mode
}

export function HabitForm({ open, onClose, habitId }: HabitFormProps) {
  const utils = trpc.useUtils()
  const isEdit = !!habitId

  const [form, setForm] = useState<CreateHabitInput>({
    name: '',
    description: '',
    icon: '🔥',
    color: '#FF6B1A',
    frequency: 'DAILY',
    customDays: [],
  })

  const { mutate: create, isPending: creating } = trpc.habits.create.useMutation({
    onSuccess: () => { void utils.habits.list.invalidate(); onClose() },
  })

  const { mutate: update, isPending: updating } = trpc.habits.update.useMutation({
    onSuccess: () => { void utils.habits.list.invalidate(); onClose() },
  })

  const pending = creating || updating

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (isEdit && habitId) {
      update({ id: habitId, data: form })
    } else {
      create(form)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit habit' : 'New habit'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Icon picker */}
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#3C3A47]">Icon</p>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, icon }))}
                  className={cn(
                    'rounded-lg p-2 text-xl transition-all',
                    form.icon === icon
                      ? 'bg-flame/15 ring-2 ring-flame/40'
                      : 'bg-surface-3 hover:bg-surface-2',
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#3C3A47]">Color</p>
            <div className="flex gap-2">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className={cn(
                    'h-7 w-7 rounded-full transition-transform hover:scale-110',
                    form.color === color && 'ring-2 ring-offset-2 ring-offset-surface-2 ring-white/40',
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Input
            label="Habit name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Morning writing"
            required
          />

          <Input
            label="Description (optional)"
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="e.g. 3 pages daily"
          />

          {/* Frequency */}
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#3C3A47]">Frequency</p>
            <div className="flex gap-2">
              {(['DAILY', 'WEEKDAYS', 'WEEKENDS'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, frequency: freq }))}
                  className={cn(
                    'flex-1 rounded-[8px] py-2 text-xs font-medium transition-all',
                    form.frequency === freq
                      ? 'bg-flame/15 text-flame ring-1 ring-flame/30'
                      : 'bg-surface-3 text-[#8A8796] hover:bg-surface-2',
                  )}
                >
                  {freq === 'DAILY' ? 'Daily' : freq === 'WEEKDAYS' ? 'Weekdays' : 'Weekends'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={pending}>
              {isEdit ? 'Save changes' : 'Create habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
