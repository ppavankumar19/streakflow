'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { TaskItem } from './task-item'
import { Button } from '@streakflow/ui'

export function TaskList() {
  const { data: tasks = [], isLoading } = trpc.tasks.today.useQuery()
  const utils = trpc.useUtils()
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)

  const { mutate: create, isPending: creating } = trpc.tasks.create.useMutation({
    onSuccess: () => {
      setNewTitle('')
      setAdding(false)
      void utils.tasks.today.invalidate()
    },
  })

  const done = tasks.filter((t) => t.completed).length
  const total = tasks.length

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    create({ title: newTitle.trim() })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 rounded-[10px] bg-surface animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-3 flex items-baseline gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#3C3A47]">Tasks</span>
        <span className="font-mono text-[11px] text-[#3C3A47]">{done} of {total} done</span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-0.5">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>

      {/* Add task */}
      {adding ? (
        <form onSubmit={handleAddSubmit} className="mt-1.5 flex gap-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setAdding(false)}
            placeholder="Task title…"
            className="flex-1 rounded-[10px] border border-flame/40 bg-surface px-3 py-2 text-[14px] text-[#EDE8E3] placeholder-[#3C3A47] outline-none caret-flame"
          />
          <Button type="submit" size="sm" loading={creating}>Add</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-1.5 flex w-full items-center gap-2.5 rounded-[10px] border border-dashed border-border px-3 py-2.5 text-[13px] text-[#3C3A47] transition-all hover:border-border-2 hover:bg-surface hover:text-[#8A8796]"
        >
          <span className="text-base opacity-50">＋</span>
          Add a task — press{' '}
          <kbd className="rounded border border-border bg-surface-3 px-1.5 py-0.5 font-mono text-[10px]">N</kbd>
        </button>
      )}
    </div>
  )
}
