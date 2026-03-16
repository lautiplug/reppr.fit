import { create } from 'zustand/react'
import { persist } from 'zustand/middleware'
import type { WeekSchedule, WeekDay, DaySchedule, RoutineSetupAnswers } from '@/types'
import { generateSchedule } from '@/components/routines/generateSchedule'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'

interface RoutineState {
  schedule: WeekSchedule | null
  hasRoutine: boolean
  lastAnswers: RoutineSetupAnswers | null
  selectedDay: WeekDay | null
  setSelectedDay: (day: WeekDay) => void
  generateFromAnswers: (answers: RoutineSetupAnswers) => void
  setSchedule: (schedule: WeekSchedule) => void
  updateDay: (day: WeekDay, daySchedule: DaySchedule) => void
  swapDays: (a: WeekDay, b: WeekDay) => void
  clearRoutine: () => void
  loadFromSupabase: (userId: string) => Promise<void>
}

function scheduleNeedsRegen(schedule: WeekSchedule): boolean {
  return Object.values(schedule).some(day =>
    day?.type === 'training' && day.exercises.some(e =>
      !e.muscle_group || !Array.isArray(e.sets)
    )
  )
}

async function upsertToSupabase(schedule: WeekSchedule) {
  const userId = useAuthStore.getState().user?.id
  if (!userId) return
  await supabase
    .from('user_routines')
    .upsert(
      { user_id: userId, schedule, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      schedule: null,
      hasRoutine: false,
      lastAnswers: null,
      selectedDay: null,
      setSelectedDay: (day) => set({ selectedDay: day }),

      generateFromAnswers: (answers) => {
        const schedule = generateSchedule(answers)
        set({ schedule, hasRoutine: true, lastAnswers: answers })
        upsertToSupabase(schedule)
      },

      setSchedule: (schedule) => {
        set({ schedule, hasRoutine: true })
        upsertToSupabase(schedule)
      },

      updateDay: (day, daySchedule) => {
        const current = get().schedule ?? {}
        const newSchedule = { ...current, [day]: daySchedule }
        set({ schedule: newSchedule })
        upsertToSupabase(newSchedule)
      },

      swapDays: (a, b) => {
        const current = get().schedule ?? {}
        const newSchedule = { ...current, [a]: current[b], [b]: current[a] }
        set({ schedule: newSchedule })
        upsertToSupabase(newSchedule)
      },

      clearRoutine: () => set({ schedule: null, hasRoutine: false }),

      loadFromSupabase: async (userId) => {
        const { data } = await supabase
          .from('user_routines')
          .select('schedule')
          .eq('user_id', userId)
          .single()
        if (data?.schedule) {
          set({ schedule: data.schedule as WeekSchedule, hasRoutine: true })
        }
      },
    }),
    {
      name: 'routine-store',
      version: 2,
      migrate: (persisted: unknown) => {
        const state = persisted as RoutineState
        if (state.lastAnswers && (!state.schedule || scheduleNeedsRegen(state.schedule))) {
          state.schedule = generateSchedule(state.lastAnswers)
          state.hasRoutine = true
        }
        return state
      },
    }
  )
)
