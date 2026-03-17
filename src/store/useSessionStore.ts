import { create } from 'zustand/react'
import { persist } from 'zustand/middleware'
import type { DayExercise, CompletedSession, CompletedSet } from '@/types'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export interface ActiveSet {
  reps: number | 'fallo'
  weight_kg?: number
  completed: boolean
}

export interface ActiveExercise {
  name: string
  name_es?: string
  gif_url?: string
  sets: ActiveSet[]
  skipped?: boolean
}

interface ActiveSession {
  workoutName: string
  startedAt: string
  exercises: ActiveExercise[]
}

interface SessionState {
  active: ActiveSession | null
  startSession: (workoutName: string, exercises: DayExercise[]) => Promise<void>
  toggleSet: (exerciseIndex: number, setIndex: number) => void
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<Pick<ActiveSet, 'reps' | 'weight_kg'>>) => void
  skipExercise: (exerciseIndex: number) => void
  removeSet: (exerciseIndex: number) => void
  addSet: (exerciseIndex: number) => void
  finishSession: () => CompletedSession | null
  abandonSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      active: null,

      startSession: async (workoutName, exercises) => {
        const missing = exercises.filter(ex => !ex.gif_url).map(ex => ex.name)
        const gifMap: Record<string, string> = {}
        if (missing.length > 0) {
          const { data } = await supabase
            .from('exercises')
            .select('name, gif_url')
            .in('name', missing)
          if (data) {
            for (const row of data) {
              if (row.gif_url) gifMap[row.name] = row.gif_url
            }
          }
        }
        set({
          active: {
            workoutName,
            startedAt: new Date().toISOString(),
            exercises: exercises.map(ex => ({
              name: ex.name,
              name_es: ex.name_es,
              gif_url: ex.gif_url ?? gifMap[ex.name],
              sets: ex.sets.map(s => ({
                reps: s.reps,
                weight_kg: s.weight_kg,
                completed: false,
              })),
            })),
          },
        })
      },

      toggleSet: (exerciseIndex, setIndex) => set(state => {
        if (!state.active) return state
        const exercises = state.active.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex
          return {
            ...ex,
            sets: ex.sets.map((s, si) =>
              si === setIndex ? { ...s, completed: !s.completed } : s
            ),
          }
        })
        return { active: { ...state.active, exercises } }
      }),

      updateSet: (exerciseIndex, setIndex, data) => set(state => {
        if (!state.active) return state
        const exercises = state.active.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex
          return {
            ...ex,
            sets: ex.sets.map((s, si) =>
              si === setIndex ? { ...s, ...data } : s
            ),
          }
        })
        return { active: { ...state.active, exercises } }
      }),

      finishSession: () => {
        const { active } = get()
        if (!active) return null
        const durationMin = Math.round(
          (Date.now() - new Date(active.startedAt).getTime()) / 60000
        )
        const completed: CompletedSession = {
          id: generateId(),
          workoutName: active.workoutName,
          date: new Date().toISOString(),
          durationMin,
          exercises: active.exercises.map(ex => {
            const hasCompleted = ex.sets.some(s => s.completed)
            const isSkipped = ex.skipped || !hasCompleted
            return {
              name: ex.name,
              name_es: ex.name_es,
              skipped: isSkipped,
              sets: isSkipped ? [] : ex.sets
                .filter(s => s.completed)
                .map(s => ({ reps: s.reps, weight_kg: s.weight_kg } as CompletedSet)),
            }
          }),
        }
        set({ active: null })

        const userId = useAuthStore.getState().user?.id
        if (userId) {
          supabase.from('session_history').insert({
            id: completed.id,
            user_id: userId,
            workout_name: completed.workoutName,
            date: completed.date,
            duration_min: completed.durationMin,
            exercises: completed.exercises,
          }).then(({ error }) => {
            if (error) console.error('Error guardando sesión:', error.message)
          })
        }
        return completed
      },

      removeSet: (exerciseIndex) => set(state => {
        if (!state.active) return state
        const exercises = state.active.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex || ex.sets.length <= 1) return ex
          return { ...ex, sets: ex.sets.slice(0, -1) }
        })
        return { active: { ...state.active, exercises } }
      }),

      addSet: (exerciseIndex) => set(state => {
        if (!state.active) return state
        const exercises = state.active.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex
          const last = ex.sets[ex.sets.length - 1]
          return { ...ex, sets: [...ex.sets, { reps: last?.reps ?? 10, weight_kg: last?.weight_kg, completed: false }] }
        })
        return { active: { ...state.active, exercises } }
      }),

      skipExercise: (exerciseIndex) => set(state => {
        if (!state.active) return state
        const exercises = state.active.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex
          return ex.skipped
            ? { ...ex, skipped: false }
            : { ...ex, skipped: true, sets: ex.sets.map(s => ({ ...s, completed: false })) }
        })
        return { active: { ...state.active, exercises } }
      }),

      abandonSession: () => set({ active: null }),
    }),
    { name: 'session-store', partialize: (state) => ({ active: state.active }) }
  )
)
