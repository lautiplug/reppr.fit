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
  rir?: number        // 0 | 1 | 2 | 3 — Reps In Reserve (opcional)
  restSeconds?: number
}

export interface ActiveExercise {
  name: string
  name_es?: string
  gif_url?: string
  sets: ActiveSet[]
  skipped?: boolean
  swappedFrom?: string // nombre original si fue swap mid-sesión
}

interface ActiveSession {
  workoutName: string
  startedAt: string
  exercises: ActiveExercise[]
  // Timer de descanso activo: qué set está descansando y cuándo empezó
  restTimer?: {
    exerciseIndex: number
    setIndex: number
    startedAt: string  // ISO timestamp
    totalSeconds: number
  }
}

interface SessionState {
  active: ActiveSession | null
  currentExerciseIndex: number

  startSession: (workoutName: string, exercises: DayExercise[]) => Promise<void>
  toggleSet: (exerciseIndex: number, setIndex: number) => void
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<Pick<ActiveSet, 'reps' | 'weight_kg' | 'rir' | 'restSeconds'>>) => void
  skipExercise: (exerciseIndex: number) => void
  removeSet: (exerciseIndex: number) => void
  addSet: (exerciseIndex: number) => void
  swapExercise: (exerciseIndex: number, replacement: Pick<ActiveExercise, 'name' | 'name_es' | 'gif_url'>) => void
  goToExercise: (index: number) => void
  nextExercise: () => void
  prevExercise: () => void
  startRestTimer: (exerciseIndex: number, setIndex: number, totalSeconds: number) => void
  clearRestTimer: () => void
  finishSession: () => CompletedSession | null
  abandonSession: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      active: null,
      currentExerciseIndex: 0,

      goToExercise: (index) => set(state => {
        if (!state.active) return state
        const clamped = Math.max(0, Math.min(index, state.active.exercises.length - 1))
        return { currentExerciseIndex: clamped }
      }),

      nextExercise: () => set(state => {
        if (!state.active) return state
        const next = Math.min(state.currentExerciseIndex + 1, state.active.exercises.length - 1)
        return { currentExerciseIndex: next }
      }),

      prevExercise: () => set(state => {
        if (!state.active) return state
        const prev = Math.max(state.currentExerciseIndex - 1, 0)
        return { currentExerciseIndex: prev }
      }),

      swapExercise: (exerciseIndex, replacement) => set(state => {
        if (!state.active) return state
        const exercises = state.active.exercises.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex
          return {
            ...ex,
            swappedFrom: ex.swappedFrom ?? ex.name,
            name: replacement.name,
            name_es: replacement.name_es,
            gif_url: replacement.gif_url,
          }
        })
        return { active: { ...state.active, exercises } }
      }),

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
          currentExerciseIndex: 0,
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
              swappedFrom: ex.swappedFrom,
              sets: isSkipped ? [] : ex.sets
                .filter(s => s.completed)
                .map(s => ({
                  reps: s.reps,
                  weight_kg: s.weight_kg,
                  rir: s.rir,
                  restSeconds: s.restSeconds,
                } as CompletedSet)),
            }
          }),
        }
        set({ active: null, currentExerciseIndex: 0 })

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

      startRestTimer: (exerciseIndex, setIndex, totalSeconds) => set(state => {
        if (!state.active) return state
        return {
          active: {
            ...state.active,
            restTimer: { exerciseIndex, setIndex, startedAt: new Date().toISOString(), totalSeconds },
          },
        }
      }),

      clearRestTimer: () => set(state => {
        if (!state.active) return state
        return { active: { ...state.active, restTimer: undefined } }
      }),

      abandonSession: () => set({ active: null, currentExerciseIndex: 0 }),
    }),
    { name: 'session-store', partialize: (state) => ({ active: state.active, currentExerciseIndex: state.currentExerciseIndex }) }
  )
)
