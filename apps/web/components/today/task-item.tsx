'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc'
import { useTaskStore } from '@/stores/task-store'
import type { Task } from '@streakflow/types'
import { PRIORITY_LABELS } from '@/lib/constants'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const utils = trpc.useUtils()
  const { setOptimistic, clearOptimistic, getEffectiveCompleted } = useTaskStore()
  const completed = getEffectiveCompleted(task)

  const { mutate: complete } = trpc.tasks.complete.useMutation({
    onMutate: ({ completed }) => setOptimistic(task.id, completed),
    onError: () => clearOptimistic(task.id),
    onSettled: () => {
      clearOptimistic(task.id)
      void utils.tasks.today.invalidate()
    },
  })

  const toggle = useCallback(() => {
    complete({ id: task.id, completed: !completed })
  }, [complete, task.id, completed])

  const priority = task.priority ? PRIORITY_LABELS[task.priority] : null

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-start gap-3 rounded-[10px] border border-transparent px-3 py-2.5',
        'transition-all duration-150 hover:border-border hover:bg-surface',
        completed && 'opacity-45',
      )}
      onClick={toggle}
    >
      {/* Checkbox */}
      <div
        className={cn(
          'mt-0.5 flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center rounded-[4px]',
          'border transition-all duration-200',
          completed
            ? 'border-mint bg-mint'
            : 'border-border-2 bg-transparent group-hover:border-[#3C3A47]',
        )}
      >
        {completed && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.2 5.7L8 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn('text-[14px] text-[#EDE8E3] leading-[1.45]', completed && 'line-through text-[#8A8796]')}>
          {task.title}
        </p>
        {(task.tags.length > 0 || task.priority || task.dueDate) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {priority && (
              <span className={cn('font-mono text-[10px]', priority.color)}>{priority.label}</span>
            )}
            {task.tags.map((tag) => (
              <span key={tag} className="rounded px-1.5 py-0.5 font-mono text-[10px] bg-surface-3 text-[#3C3A47]">
                {tag}
              </span>
            ))}
            {task.dueDate && (
              <span className="font-mono text-[10px] text-[#3C3A47]">
                · {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
