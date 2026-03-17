import { create } from 'zustand/react'
import { persist } from 'zustand/middleware'
import type { WeekSchedule, WeekDay, DaySchedule, RoutineSetupAnswers } from '@/types'
import { generateSchedule } from '@/components/routines/generateSchedule'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'

type PartialAnswers = Partial<RoutineSetupAnswers>

interface RoutineState {
  schedule: WeekSchedule | null
  hasRoutine: boolean
  lastAnswers: RoutineSetupAnswers | null
  draftAnswers: PartialAnswers | null
  loadingRoutine: boolean
  selectedDay: WeekDay | null
  setSelectedDay: (day: WeekDay) => void
  setDraftAnswers: (draft: PartialAnswers) => void
  clearDraftAnswers: () => void
  generateFromAnswers: (answers: RoutineSetupAnswers) => void
  setSchedule: (schedule: WeekSchedule) => void
  updateDay: (day: WeekDay, daySchedule: DaySchedule) => void
  swapDays: (a: WeekDay, b: WeekDay) => void
  clearRoutine: () => void
  loadFromSupabase: (userId: string) => Promise<void>
}

async function upsertToSupabase(schedule: WeekSchedule, lastAnswers: RoutineSetupAnswers | null) {
  const userId = useAuthStore.getState().user?.id
  if (!userId) return
  await supabase
    .from('user_routines')
    .upsert(
      { user_id: userId, schedule, last_answers: lastAnswers, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      schedule: null,
      hasRoutine: false,
      lastAnswers: null,
      draftAnswers: null,
      loadingRoutine: true,
      selectedDay: null,
      setSelectedDay: (day) => set({ selectedDay: day }),
      setDraftAnswers: (draft) => set({ draftAnswers: draft }),
      clearDraftAnswers: () => set({ draftAnswers: null }),

      generateFromAnswers: (answers) => {
        const schedule = generateSchedule(answers)
        set({ schedule, hasRoutine: true, lastAnswers: answers, draftAnswers: null })
        upsertToSupabase(schedule, answers)
      },

      setSchedule: (schedule) => {
        const { lastAnswers } = get()
        set({ schedule, hasRoutine: true })
        upsertToSupabase(schedule, lastAnswers)
      },

      updateDay: (day, daySchedule) => {
        const { lastAnswers } = get()
        const current = get().schedule ?? {}
        const newSchedule = { ...current, [day]: daySchedule }
        set({ schedule: newSchedule })
        upsertToSupabase(newSchedule, lastAnswers)
      },

      swapDays: (a, b) => {
        const { lastAnswers } = get()
        const current = get().schedule ?? {}
        const newSchedule = { ...current, [a]: current[b], [b]: current[a] }
        set({ schedule: newSchedule })
        upsertToSupabase(newSchedule, lastAnswers)
      },

      clearRoutine: () => set({ schedule: null, hasRoutine: false, lastAnswers: null }),

      loadFromSupabase: async (userId) => {
        set({ loadingRoutine: true })
        const { data, error } = await supabase
          .from('user_routines')
          .select('schedule, last_answers')
          .eq('user_id', userId)
          .single()
        if (error && error.code !== 'PGRST116') console.error('Error cargando rutina:', error.message)
        if (data?.schedule) {
          set({
            schedule: data.schedule as WeekSchedule,
            hasRoutine: true,
            lastAnswers: (data.last_answers as RoutineSetupAnswers) ?? null,
            loadingRoutine: false,
          })
        } else {
          set({ loadingRoutine: false })
        }
      },
    }),
    {
      name: 'routine-store',
      // Only persist draft (quiz in progress) and selectedDay — everything else lives in Supabase
      partialize: (state) => ({
        draftAnswers: state.draftAnswers,
        selectedDay: state.selectedDay,
      }),
    }
  )
)
