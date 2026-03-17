import { create } from 'zustand/react'
import { persist } from 'zustand/middleware'
import type { WeekDay, RoutineSetupAnswers } from '@/types'

type PartialAnswers = Partial<RoutineSetupAnswers>

interface RoutineState {
  draftAnswers: PartialAnswers | null
  selectedDay: WeekDay | null
  setSelectedDay: (day: WeekDay) => void
  setDraftAnswers: (draft: PartialAnswers) => void
  clearDraftAnswers: () => void
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set) => ({
      draftAnswers: null,
      selectedDay: null,
      setSelectedDay: (day) => set({ selectedDay: day }),
      setDraftAnswers: (draft) => set({ draftAnswers: draft }),
      clearDraftAnswers: () => set({ draftAnswers: null }),
    }),
    {
      name: 'routine-store',
      partialize: (state) => ({
        draftAnswers: state.draftAnswers,
        selectedDay: state.selectedDay,
      }),
    }
  )
)
