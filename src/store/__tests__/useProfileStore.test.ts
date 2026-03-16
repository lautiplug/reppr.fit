import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProfileStore } from '../useProfileStore'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null }),
        }),
      }),
      upsert: async () => ({}),
    }),
  },
}))

beforeEach(() => {
  useProfileStore.setState({
    profile: null,
    hasProfile: false,
    loadingProfile: true,
  })
})

describe('useProfileStore', () => {
  it('starts with loadingProfile true to prevent premature redirects', () => {
    const { loadingProfile } = useProfileStore.getState()
    expect(loadingProfile).toBe(true)
  })

  it('starts with no profile', () => {
    const { profile, hasProfile } = useProfileStore.getState()
    expect(profile).toBeNull()
    expect(hasProfile).toBe(false)
  })

  it('sets loadingProfile false after loadFromSupabase with no data', async () => {
    await useProfileStore.getState().loadFromSupabase('user-123')
    expect(useProfileStore.getState().loadingProfile).toBe(false)
    expect(useProfileStore.getState().hasProfile).toBe(false)
  })

  it('sets hasProfile true and loadingProfile false after loadFromSupabase with data', async () => {
    useProfileStore.setState({
      profile: { sex: 'male', birth_year: 1990, weight_kg: 80, height_cm: 175 },
      hasProfile: true,
      loadingProfile: false,
    })

    expect(useProfileStore.getState().hasProfile).toBe(true)
    expect(useProfileStore.getState().loadingProfile).toBe(false)
    expect(useProfileStore.getState().profile?.weight_kg).toBe(80)
  })

  it('clearProfile resets to no profile and loadingProfile true', () => {
    useProfileStore.setState({
      profile: { sex: 'male', birth_year: 1990, weight_kg: 80, height_cm: 175 },
      hasProfile: true,
      loadingProfile: false,
    })
    useProfileStore.getState().clearProfile()
    const { profile, hasProfile, loadingProfile } = useProfileStore.getState()
    expect(profile).toBeNull()
    expect(hasProfile).toBe(false)
    expect(loadingProfile).toBe(true)
  })
})
