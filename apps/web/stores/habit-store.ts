import { create } from 'zustand'

interface HabitStore {
  optimisticCompletions: Record<string, boolean>
  setOptimistic: (habitId: string, completed: boolean) => void
  clearOptimistic: (habitId: string) => void
  getEffectiveCompleted: (habitId: string, serverCompleted: boolean) => boolean
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  optimisticCompletions: {},

  setOptimistic(habitId, completed) {
    set((s) => ({ optimisticCompletions: { ...s.optimisticCompletions, [habitId]: completed } }))
  },

  clearOptimistic(habitId) {
    set((s) => {
      const next = { ...s.optimisticCompletions }
      delete next[habitId]
      return { optimisticCompletions: next }
    })
  },

  getEffectiveCompleted(habitId, serverCompleted) {
    const opt = get().optimisticCompletions[habitId]
    return opt !== undefined ? opt : serverCompleted
  },
}))
