import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { useRoutineStore } from '@/store/useRoutineStore'
import { useSessionStore } from '@/store/useSessionStore'
import type { WeekSchedule, RoutineSetupAnswers, CompletedSession, DayExercise } from '@/types'
import { generateSchedule } from '@/components/routines/generateSchedule'

// --- Query keys ---

export const queryKeys = {
  routine: (userId: string) => ['routine', userId] as const,
  sessionHistory: (userId: string) => ['sessionHistory', userId] as const,
  profile: (userId: string) => ['profile', userId] as const,
}

// --- Routine ---

export function useRoutineQuery() {
  const userId = useAuthStore(s => s.user?.id)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user_routines_sync_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_routines',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.routine(userId) })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])

  return useQuery({
    queryKey: queryKeys.routine(userId ?? ''),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_routines')
        .select('schedule, last_answers')
        .eq('user_id', userId!)
        .single()
      if (error && error.code !== 'PGRST116') throw new Error(error.message)
      return data ?? null
    },
    select: (data) => ({
      schedule: (data?.schedule as WeekSchedule) ?? null,
      lastAnswers: (data?.last_answers as RoutineSetupAnswers) ?? null,
    }),
  })
}

export function useSaveRoutineMutation() {
  const userId = useAuthStore(s => s.user?.id)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ schedule, lastAnswers }: { schedule: WeekSchedule; lastAnswers: RoutineSetupAnswers | null }) => {
      if (!userId) throw new Error('No user')
      const { error } = await supabase
        .from('user_routines')
        .upsert(
          { user_id: userId, schedule, last_answers: lastAnswers, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      if (error) throw new Error(error.message)
      return { schedule, lastAnswers }
    },
    onSuccess: ({ schedule, lastAnswers }) => {
      queryClient.setQueryData(queryKeys.routine(userId!), { schedule, last_answers: lastAnswers })
    },
  })
}

export function useGenerateRoutineMutation() {
  const saveRoutine = useSaveRoutineMutation()
  const { clearDraftAnswers } = useRoutineStore()

  return useMutation({
    mutationFn: async (answers: RoutineSetupAnswers) => {
      const schedule = generateSchedule(answers)
      await saveRoutine.mutateAsync({ schedule, lastAnswers: answers })
      clearDraftAnswers()
      return { schedule, lastAnswers: answers }
    },
  })
}

export function useClearRoutineMutation() {
  const userId = useAuthStore(s => s.user?.id)
  const queryClient = useQueryClient()
  const { clearDraftAnswers } = useRoutineStore()

  return useMutation({
    mutationFn: async () => {
      if (!userId) return
      const { error } = await supabase
        .from('user_routines')
        .delete()
        .eq('user_id', userId)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.routine(userId!), null)
      clearDraftAnswers()
    },
  })
}

// --- Session history ---

export function useSessionHistoryQuery() {
  const userId = useAuthStore(s => s.user?.id)

  return useQuery({
    queryKey: queryKeys.sessionHistory(userId ?? ''),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_history')
        .select('*')
        .eq('user_id', userId!)
        .order('date', { ascending: false })
      if (error) throw new Error(error.message)
      return (data ?? []).map(row => ({
        id: row.id,
        workoutName: row.workout_name,
        date: row.date,
        durationMin: row.duration_min,
        exercises: row.exercises,
      })) as CompletedSession[]
    },
  })
}

export function useFinishSessionMutation() {
  const userId = useAuthStore(s => s.user?.id)
  const queryClient = useQueryClient()
  const { finishSession } = useSessionStore()

  return useMutation({
    mutationFn: async (exercises: DayExercise[]) => {
      finishSession()
      // The store already did the optimistic insert to Supabase
      // We just need to invalidate so the query refetches
      return exercises
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.sessionHistory(userId) })
      }
    },
  })
}

// --- Profile ---

export function useProfileQuery() {
  const userId = useAuthStore(s => s.user?.id)

  return useQuery({
    queryKey: queryKeys.profile(userId ?? ''),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId!)
        .single()
      if (error && error.code !== 'PGRST116') throw new Error(error.message)
      return data ?? null
    },
  })
}
