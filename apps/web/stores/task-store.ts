import { create } from 'zustand'
import type { Task } from '@streakflow/types'

interface TaskStore {
  optimisticCompletions: Record<string, boolean>
  setOptimistic: (taskId: string, completed: boolean) => void
  clearOptimistic: (taskId: string) => void
  getEffectiveCompleted: (task: Task) => boolean
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  optimisticCompletions: {},

  setOptimistic(taskId, completed) {
    set((s) => ({ optimisticCompletions: { ...s.optimisticCompletions, [taskId]: completed } }))
  },

  clearOptimistic(taskId) {
    set((s) => {
      const next = { ...s.optimisticCompletions }
      delete next[taskId]
      return { optimisticCompletions: next }
    })
  },

  getEffectiveCompleted(task) {
    const opt = get().optimisticCompletions[task.id]
    return opt !== undefined ? opt : task.completed
  },
}))
