import { create } from 'zustand/react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  loading: boolean
  init: () => Promise<void>
  setUser: (user: User | null) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, loading: false })
  },

  setUser: (user) => set({ user }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
