import { create } from 'zustand/react'
import * as Sentry from '@sentry/react'
import { supabase } from '@/lib/supabase'

export interface UserProfile {
  sex: 'male' | 'female' | 'other'
  birth_year: number
  weight_kg: number
  height_cm: number
}

interface ProfileState {
  profile: UserProfile | null
  hasProfile: boolean
  loadingProfile: boolean
  loadFromSupabase: (userId: string) => Promise<void>
  saveProfile: (userId: string, profile: UserProfile) => Promise<void>
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  (set) => ({
    profile: null,
    hasProfile: false,
    loadingProfile: true,

    loadFromSupabase: async (userId: string) => {
      set({ loadingProfile: true })
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error && error.code !== 'PGRST116') Sentry.captureException(error)
      if (data) {
        set({
          profile: {
            sex: data.sex,
            birth_year: data.birth_year,
            weight_kg: data.weight_kg,
            height_cm: data.height_cm,
          },
          hasProfile: true,
          loadingProfile: false,
        })
      } else {
        set({ loadingProfile: false })
      }
    },

    saveProfile: async (userId: string, profile: UserProfile) => {
      const { error } = await supabase.from('user_profiles').upsert(
        { user_id: userId, ...profile, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      if (error) throw new Error(error.message)
      set({ profile, hasProfile: true })
    },

    clearProfile: () => set({ profile: null, hasProfile: false, loadingProfile: true }),
  })
)
